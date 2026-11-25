import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, type Schema } from '@google/genai';
import { z } from 'zod';
import { buildSystemInstruction, buildUserPrompt } from './src/ai/prompt.ts';
import { AnalysisResultSchema, GEMINI_RESPONSE_SCHEMA } from './src/ai/schema.ts';
import { checkRedFlags } from './src/safety/redFlags.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

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

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/analyze', async (req, res) => {
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

    const ai = createGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'Symptom analysis service is not configured yet. Please ensure GEMINI_API_KEY is set in Settings > Secrets.',
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

        const response = await ai.models.generateContent({
          model: MODEL_NAME,
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

        lastValidationError = 'Structured response validation failed.';
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        const statusCode =
          typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number'
            ? err.status
            : undefined;

        if (
          statusCode === 400 ||
          statusCode === 401 ||
          statusCode === 403 ||
          message.includes('API_KEY_INVALID') ||
          message.includes('PERMISSION_DENIED')
        ) {
          return res.status(403).json({
            error:
              'Unable to authenticate with the Gemini API. Please check your API key in Settings > Secrets.',
          });
        }

        if (statusCode === 429 || message.includes('RESOURCE_EXHAUSTED')) {
          return res.status(429).json({
            error: 'The service is temporarily busy. Please wait a moment and try again.',
          });
        }

        lastValidationError = message;
      }
    }

    return res.status(502).json({
      error:
        'We could not generate a valid structured summary right now. Please try again in a moment.',
      detail: process.env.NODE_ENV === 'development' ? lastValidationError : undefined,
    });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
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
        res.status(404).send('App build not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SymptoSense server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SymptoSense server:', err);
  process.exit(1);
});
