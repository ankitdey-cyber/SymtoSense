import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, type GenerateContentParameters, type GenerateContentResponse, type Schema } from '@google/genai';
import { z } from 'zod';
import { buildSystemInstruction, buildUserPrompt } from './src/ai/prompt.ts';
import { AnalysisResultSchema, GEMINI_RESPONSE_SCHEMA } from './src/ai/schema.ts';
import { checkRedFlags } from './src/safety/redFlags.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first (higher precedence), then .env (override: false) and track key source
let apiKeySource: 'process.env' | '.env.local' | '.env' | 'none' = process.env.GEMINI_API_KEY
  ? 'process.env'
  : 'none';

const envLocalPath = path.resolve(__dirname, '.env.local');
const envPath = path.resolve(__dirname, '.env');

dotenv.config({ path: envLocalPath, override: false });
if (apiKeySource === 'none' && process.env.GEMINI_API_KEY) {
  apiKeySource = '.env.local';
}

dotenv.config({ path: envPath, override: false });
if (apiKeySource === 'none' && process.env.GEMINI_API_KEY) {
  apiKeySource = '.env';
}

const PLACEHOLDER_KEYS = new Set(['MY_GEMINI_API_KEY', 'YOUR_KEY_HERE', 'YOUR_API_KEY']);

function normalizeApiKey(raw: string | undefined): string {
  if (!raw) return '';
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

function getApiKey(): string {
  return normalizeApiKey(process.env.GEMINI_API_KEY);
}

function isPlaceholderOrEmptyKey(key: string): boolean {
  return !key || PLACEHOLDER_KEYS.has(key.toUpperCase());
}

function maskApiKey(key: string): string {
  if (!key) return '(empty)';
  if (key.length <= 10) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

function redactApiKey(text: string): string {
  const key = getApiKey();
  let safe = text;
  if (key && key.length >= 8) {
    safe = safe.split(key).join('[REDACTED_API_KEY]');
  }
  safe = safe.replace(/([?&]key=)[^&\s"']+/gi, '$1[REDACTED_API_KEY]');
  return safe;
}

const PORT = Number(process.env.PORT) || 3000;

let activePrimaryModel = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';
let activeFallbackModel = process.env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-3.5-flash-lite';
const configuredPrimaryModel = activePrimaryModel;
const configuredFallbackModel = activeFallbackModel;

class HttpError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (isPlaceholderOrEmptyKey(apiKey)) {
    throw new HttpError(
      500,
      'GEMINI_API_KEY is not set. Add it to .env and restart the server.',
      'Missing or placeholder GEMINI_API_KEY'
    );
  }
  return new GoogleGenAI({
    apiKey,
  });
}

function supportsGenerateContent(model: {
  name?: string;
  supportedActions?: string[];
  supportedGenerationMethods?: string[];
}): boolean {
  const actions = model.supportedActions || model.supportedGenerationMethods;
  if (Array.isArray(actions) && actions.length > 0) {
    return actions.some((a) => a.toLowerCase().includes('generatecontent'));
  }
  return true;
}

interface GeminiErrorRecord {
  ts: string;
  model: string;
  attempt: number;
  statusCode?: number;
  summary: string;
}

const recentGeminiErrors: GeminiErrorRecord[] = [];

function recordGeminiError(entry: GeminiErrorRecord) {
  recentGeminiErrors.unshift(entry);
  if (recentGeminiErrors.length > 20) {
    recentGeminiErrors.length = 20;
  }
}

function getErrorStatusCode(err: unknown): number | undefined {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

function summarizeUpstreamError(err: unknown, maxLen = 600): string {
  const raw = err instanceof Error ? err.message : String(err);
  return redactApiKey(raw.replace(/\s+/g, ' ')).slice(0, maxLen);
}

function isQuotaError(err: unknown): boolean {
  const status = getErrorStatusCode(err);
  const msg = err instanceof Error ? err.message : String(err);
  return status === 429 || msg.includes('RESOURCE_EXHAUSTED') || /\b429\b/.test(msg);
}

function isApiNotEnabledOrRestrictedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('API_KEY_HTTP_REFERRER_BLOCKED') ||
    msg.includes('API_KEY_IP_ADDRESS_BLOCKED') ||
    msg.includes('API_KEY_SERVICE_BLOCKED') ||
    msg.includes('SERVICE_DISABLED') ||
    /has not been used in project/i.test(msg) ||
    /requests from referer/i.test(msg) ||
    /referrer/i.test(msg) ||
    /api.*not enabled/i.test(msg)
  );
}

function isInvalidApiKeyError(err: unknown): boolean {
  const status = getErrorStatusCode(err);
  const msg = err instanceof Error ? err.message : String(err);
  return (
    status === 401 ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('UNAUTHENTICATED') ||
    /api key not valid/i.test(msg) ||
    /invalid authentication credentials/i.test(msg)
  );
}

function isModelAccessOrNotFoundError(err: unknown): boolean {
  const status = getErrorStatusCode(err);
  const msg = err instanceof Error ? err.message : String(err);
  if (isInvalidApiKeyError(err) || isApiNotEnabledOrRestrictedError(err)) {
    return false;
  }
  return (
    status === 404 ||
    status === 403 ||
    msg.includes('NOT_FOUND') ||
    /\b404\b/.test(msg) ||
    msg.includes('PERMISSION_DENIED') ||
    /\b403\b/.test(msg)
  );
}

function isTransient503Error(err: unknown): boolean {
  const status = getErrorStatusCode(err);
  const msg = err instanceof Error ? err.message : String(err);
  return (
    status === 503 ||
    msg.includes('UNAVAILABLE') ||
    /\b503\b/.test(msg) ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('fetch failed')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveStartupModels(): Promise<void> {
  const apiKey = getApiKey();
  if (isPlaceholderOrEmptyKey(apiKey)) {
    console.warn(
      '========================================================================\n' +
        `[SymptoSense WARNING] GEMINI_API_KEY is ${apiKey ? 'still a placeholder value ("MY_GEMINI_API_KEY")' : 'EMPTY'} (source: ${apiKeySource}).\n` +
        'Add a valid key from https://aistudio.google.com/apikey to .env and restart.\n' +
        '========================================================================'
    );
    return;
  }

  console.log(`[SymptoSense Config] GEMINI_API_KEY loaded from ${apiKeySource}: ${maskApiKey(apiKey)}`);

  try {
    const ai = getGeminiClient();
    const pager = await ai.models.list({ config: { pageSize: 100 } });
    const available: string[] = [];
    for await (const m of pager) {
      if (!m.name) continue;
      if (
        !supportsGenerateContent(
          m as { name?: string; supportedActions?: string[]; supportedGenerationMethods?: string[] }
        )
      ) {
        continue;
      }
      available.push(m.name.replace(/^models\//, ''));
      if (available.length >= 200) break;
    }

    if (available.length === 0) {
      console.warn(
        `[SymptoSense Models] ai.models.list() returned 0 generateContent models; keeping configured models (${activePrimaryModel}, ${activeFallbackModel}).`
      );
      return;
    }

    const pickFlash = (exclude?: string): string | undefined =>
      available.find(
        (m) =>
          m !== exclude &&
          m.includes('gemini') &&
          m.includes('flash') &&
          !m.includes('lite') &&
          !m.includes('image') &&
          !m.includes('audio') &&
          !m.includes('tts') &&
          !m.includes('thinking')
      ) ||
      available.find(
        (m) =>
          m !== exclude &&
          m.includes('gemini') &&
          m.includes('flash') &&
          !m.includes('image') &&
          !m.includes('audio') &&
          !m.includes('tts')
      ) ||
      available.find((m) => m !== exclude && m.includes('gemini'));

    const pickFlashLite = (exclude?: string): string | undefined =>
      available.find(
        (m) =>
          m !== exclude &&
          m.includes('gemini') &&
          m.includes('flash-lite') &&
          !m.includes('audio') &&
          !m.includes('tts')
      ) ||
      available.find(
        (m) =>
          m !== exclude &&
          m.includes('gemini') &&
          m.includes('flash') &&
          !m.includes('image') &&
          !m.includes('audio') &&
          !m.includes('tts')
      ) ||
      available.find((m) => m !== exclude && m.includes('gemini'));

    if (!available.includes(activePrimaryModel)) {
      const autoPrimary = pickFlash();
      if (autoPrimary) {
        console.warn(
          `[SymptoSense Models] Configured primary model "${activePrimaryModel}" is not available for this key; auto-selected "${autoPrimary}".`
        );
        activePrimaryModel = autoPrimary;
      }
    }

    if (!available.includes(activeFallbackModel) || activeFallbackModel === activePrimaryModel) {
      const autoFallback = pickFlashLite(activePrimaryModel) || pickFlashLite();
      if (autoFallback) {
        console.warn(
          `[SymptoSense Models] Configured fallback model "${activeFallbackModel}" is not available for this key; auto-selected "${autoFallback}".`
        );
        activeFallbackModel = autoFallback;
      }
    }

    console.log(
      `[SymptoSense Models] Active models (${available.length} listed): primary="${activePrimaryModel}", fallback="${activeFallbackModel}"`
    );
  } catch (err) {
    console.warn(
      `[SymptoSense Models] Startup model check failed (${summarizeUpstreamError(err)}); keeping primary="${activePrimaryModel}", fallback="${activeFallbackModel}".`
    );
  }
}

async function generateWithFallback(
  ai: GoogleGenAI,
  params: Omit<GenerateContentParameters, 'model'>
): Promise<{ response: GenerateContentResponse; modelUsed: string }> {
  const models =
    activePrimaryModel === activeFallbackModel
      ? [activePrimaryModel]
      : [activePrimaryModel, activeFallbackModel];
  const attemptSummaries: string[] = [];
  const failedModels: string[] = [];
  let lastError: unknown;

  for (const model of models) {
    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return { response, modelUsed: model };
      } catch (err) {
        lastError = err;
        const summary = summarizeUpstreamError(err);
        const statusCode = getErrorStatusCode(err);
        attemptSummaries.push(`${model}#${attempt + 1}: ${summary}`);
        if (!failedModels.includes(model)) {
          failedModels.push(model);
        }
        recordGeminiError({
          ts: new Date().toISOString(),
          model,
          attempt: attempt + 1,
          statusCode,
          summary,
        });
        console.warn(`[SymptoSense Gemini] ${model} attempt ${attempt + 1} failed: ${summary}`);

        if (isQuotaError(err) || isModelAccessOrNotFoundError(err)) {
          // Immediately switch to fallback model on 429, 404 NOT_FOUND, or model-level 403 PERMISSION_DENIED
          break;
        }
        if (!isTransient503Error(err)) {
          if (err && typeof err === 'object') {
            (err as { attemptSummary?: string; failedModels?: string[] }).attemptSummary =
              attemptSummaries.join(' | ');
            (err as { attemptSummary?: string; failedModels?: string[] }).failedModels =
              failedModels;
          }
          throw err;
        }
        if (attempt < maxAttempts - 1) {
          const baseDelayMs = 1000 * Math.pow(2, attempt);
          const jitterMs = Math.floor(Math.random() * 350);
          await sleep(baseDelayMs + jitterMs);
        }
      }
    }
  }

  if (lastError && typeof lastError === 'object') {
    (lastError as { attemptSummary?: string; failedModels?: string[] }).attemptSummary =
      attemptSummaries.join(' | ');
    (lastError as { attemptSummary?: string; failedModels?: string[] }).failedModels =
      failedModels;
  }
  throw lastError;
}

function mapGeminiError(err: unknown): {
  status: number;
  message: string;
  detail?: string;
} {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      message: err.message,
      detail: err.detail ? redactApiKey(err.detail) : undefined,
    };
  }

  const errObj = err as {
    status?: number;
    message?: string;
    attemptSummary?: string;
    failedModels?: string[];
  } | null;

  const rawMsg = err instanceof Error ? err.message : String(err);
  const fullDetail = redactApiKey(
    errObj?.attemptSummary ? errObj.attemptSummary : rawMsg.replace(/\s+/g, ' ')
  ).slice(0, 1200);
  const combinedText = `${fullDetail} ${rawMsg}`;
  const sawQuota = combinedText.includes('RESOURCE_EXHAUSTED') || /\b429\b/.test(combinedText);
  const saw503 = rawMsg.includes('UNAVAILABLE') || /\b503\b/.test(rawMsg);
  const failedModelLabel =
    errObj?.failedModels && errObj.failedModels.length > 0
      ? errObj.failedModels.join(' / ')
      : `${activePrimaryModel} / ${activeFallbackModel}`;

  if (isApiNotEnabledOrRestrictedError(err)) {
    return {
      status: 403,
      message:
        'Your Gemini API key is blocked by API/referrer/IP restrictions or the Generative Language API is not enabled on its Google Cloud project. Remove HTTP referrer restrictions (this server calls Gemini from Node.js) or create a new unrestricted key at aistudio.google.com/apikey, put it in .env, and restart.',
      detail: fullDetail,
    };
  }
  if (isInvalidApiKeyError(err)) {
    return {
      status: 401,
      message:
        'Your Gemini API key was rejected. Create a new key at aistudio.google.com/apikey, put it in .env, and restart.',
      detail: fullDetail,
    };
  }
  if (isModelAccessOrNotFoundError(err)) {
    return {
      status: getErrorStatusCode(err) === 403 ? 403 : 404,
      message: `This key cannot use model ${failedModelLabel}. Set GEMINI_MODEL in .env.`,
      detail: fullDetail,
    };
  }
  if (sawQuota) {
    return {
      status: 429,
      message: 'Free-tier limit reached, wait a minute and retry.',
      detail: fullDetail,
    };
  }
  if (saw503) {
    return {
      status: 503,
      message:
        'Gemini AI servers are temporarily overloaded (503) even after automatic retries. Wait a few seconds and try again.',
      detail: fullDetail,
    };
  }

  console.warn('[SymptoSense Upstream Error]:', fullDetail);
  return {
    status: 500,
    message: 'Upstream Gemini request failed. Please try again shortly.',
    detail: fullDetail,
  };
}

const AnalyzeRequestSchema = z.object({
  language: z.enum(['en', 'bn', 'hi']).default('en'),
  symptoms: z.object({
    notes: z.string().max(4000),
    selectedSymptoms: z.array(z.string().max(120)).max(50),
    duration: z.enum(['today', '1_3_days', '4_7_days', 'over_a_week']),
    severity: z.enum(['mild', 'moderate', 'severe']),
  }),
  patient: z.object({
    age: z.union([z.number().min(0).max(125), z.literal('')]),
    isInfantUnder3Months: z.boolean(),
    sex: z.enum(['female', 'male', 'other']),
    pregnantOrBreastfeeding: z.boolean(),
    allergies: z.array(z.string().max(120)).max(30),
    otherAllergies: z.string().max(500),
    existingConditions: z.array(z.string().max(120)).max(30),
    otherConditions: z.string().max(500),
    currentMedicines: z.string().max(1000),
    consentAccepted: z.boolean(),
  }),
});

async function startServer() {
  await resolveStartupModels();

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (req: Request, res: Response) => {
    const apiKey = getApiKey();
    const basePayload = {
      ok: true,
      configured: !isPlaceholderOrEmptyKey(apiKey),
      keySource: apiKeySource,
      maskedKey: maskApiKey(apiKey),
      model: activePrimaryModel,
      fallbackModel: activeFallbackModel,
      configuredModel: configuredPrimaryModel,
      configuredFallbackModel: configuredFallbackModel,
    };

    if (req.query.diag !== '1') {
      res.json(basePayload);
      return;
    }

    let listedModels: string[] = [];
    let listError: string | null = null;
    try {
      const ai = getGeminiClient();
      const pager = await ai.models.list({ config: { pageSize: 100 } });
      for await (const m of pager) {
        if (m.name) {
          listedModels.push(m.name.replace(/^models\//, ''));
        }
        if (listedModels.length >= 200) break;
      }
    } catch (err) {
      listError = summarizeUpstreamError(err);
    }

    res.json({
      ...basePayload,
      primaryModelListed: listedModels.includes(activePrimaryModel),
      fallbackModelListed: listedModels.includes(activeFallbackModel),
      listedModelsCount: listedModels.length,
      sampleListedModels: listedModels.slice(0, 50),
      listError,
      recentErrors: recentGeminiErrors.slice(0, 10),
    });
  });

  app.post('/api/analyze', async (req: Request, res: Response) => {
    const parsedReq = AnalyzeRequestSchema.safeParse(req.body);
    if (!parsedReq.success) {
      return res.status(400).json({
        error: 'Please check your symptom and patient details and try again.',
      });
    }

    const payload = parsedReq.data;

    if (!payload.patient.consentAccepted) {
      return res.status(400).json({
        error: 'Please confirm that you understand this is not medical advice before continuing.',
      });
    }

    if (!payload.symptoms.notes.trim() && payload.symptoms.selectedSymptoms.length === 0) {
      return res.status(400).json({
        error: 'Please describe your symptoms or select at least one symptom chip.',
      });
    }

    // Belt-and-suspenders server-side red-flag check (never calls AI for medicines on red flags)
    const redFlagResult = checkRedFlags(payload.symptoms, payload.patient);
    if (redFlagResult.triggered) {
      return res.json({
        emergency: true,
        urgency: 'emergency',
        urgency_title: 'Emergency',
        urgency_summary: redFlagResult.reason,
        emergency_reason: redFlagResult.reason,
        possible_conditions: [
          {
            name: 'Urgent medical evaluation required',
            likelihood: 'high',
            reason: redFlagResult.reason,
          },
        ],
        self_care_steps: [],
        otc_options: [],
        avoid: ['Do not delay seeking emergency medical care.'],
        see_doctor_if: ['Call 112 or go to the nearest emergency hospital immediately.'],
        suggested_specialist: 'Emergency Medicine',
        specialist_reason: 'Immediate emergency hospital care is required.',
        follow_up_questions: [],
        disclaimer: 'SymptoSense gives information, not a diagnosis. In an emergency call 112.',
      });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err) {
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({
        error: mapped.message,
        detail: mapped.detail,
      });
    }

    const systemInstruction = buildSystemInstruction(payload.language);
    const userPrompt = buildUserPrompt(payload);

    let lastValidationError: string | null = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const promptText =
          attempt === 1
            ? userPrompt
            : `${userPrompt}\n\nIMPORTANT: Your previous output did not strictly match the required JSON schema. Return ONLY a valid JSON object matching every required field.`;

        const { response } = await generateWithFallback(ai, {
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: GEMINI_RESPONSE_SCHEMA as unknown as Schema,
          },
        });

        const rawText = (response.text ?? '').trim();
        if (!rawText) {
          lastValidationError = 'Empty response received from model.';
          continue;
        }

        const parsedJson = JSON.parse(rawText);
        const validated = AnalysisResultSchema.safeParse(parsedJson);

        if (validated.success) {
          return res.json(validated.data);
        }

        lastValidationError = `Structured response validation failed: ${validated.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`;
      } catch (err: unknown) {
        if (err instanceof SyntaxError) {
          lastValidationError = `Model returned invalid JSON: ${err.message}`;
          continue;
        }
        const mapped = mapGeminiError(err);
        return res.status(mapped.status).json({
          error: mapped.message,
          detail: mapped.detail,
        });
      }
    }

    return res.status(502).json({
      error:
        'We could not generate a valid structured summary right now. Please try again in a moment.',
      detail: lastValidationError ? redactApiKey(lastValidationError) : undefined,
    });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('App build not found. Run `npm run build` first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SymptoSense server running on http://localhost:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SymptoSense server:', err);
  process.exit(1);
});
