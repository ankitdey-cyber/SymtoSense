import type { AnalyzeRequestPayload, RawAnalysisResult } from '../types';
import { AnalysisResultSchema } from './schema';

export class AnalysisApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AnalysisApiError';
    this.status = status;
  }
}

async function requestAnalysisOnce(payload: AnalyzeRequestPayload): Promise<unknown> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const serverMessage =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Unable to analyse symptoms right now. Please try again shortly.';
    throw new AnalysisApiError(serverMessage, response.status);
  }

  return data;
}

/**
 * Single API client entry point for symptom analysis.
 * Calls the backend /api/analyze endpoint, validates the returned JSON with Zod,
 * and retries once if the JSON structure fails validation.
 */
export async function analyzeSymptoms(
  payload: AnalyzeRequestPayload
): Promise<RawAnalysisResult> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await requestAnalysisOnce(payload);
      const parsed = AnalysisResultSchema.safeParse(raw);
      if (parsed.success) {
        return parsed.data;
      }
      lastError = new AnalysisApiError(
        'Received an unexpected response format while analysing your symptoms. Please try again.'
      );
    } catch (error) {
      lastError = error;
      // Do not retry client errors or key/quota configuration issues
      if (error instanceof AnalysisApiError && error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new AnalysisApiError(
    'Unable to complete the symptom analysis right now. Please check your connection and try again.'
  );
}
