import { z } from 'zod';
import {
  EXTRACTION_BUDGET_MS,
  EXTRACTION_TIMEOUT_MS,
  MAX_BODY_BYTES,
  MAX_DESCRIPTION_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  errorBody,
  isLiveExtractionEnabled,
  type ExtractionErrorBody } from
'./extractionConstants';
import { extractFeaturesFromModel } from './openaiExtract';
import { normalizeFeatures, type RawFeature } from './normalizeFeatures';
import type { TechnicalFeature } from '../types/investigation';

export const extractRequestSchema = z.object({
  description: z.string().trim().min(MIN_DESCRIPTION_LENGTH).max(MAX_DESCRIPTION_LENGTH)
});

export interface ExtractHandlerInput {
  method?: string;
  contentType?: string | string[];
  contentLength?: string | number;
  rawBody: unknown;
  env?: NodeJS.Dict<string>;
  extractFromModel?: typeof extractFeaturesFromModel;
  now?: () => number;
}

export type ExtractHandlerResult =
  | {status: 200;body: {mode: 'live';features: TechnicalFeature[];};}
  | {status: 400 | 405 | 415 | 429 | 502 | 503 | 504;body: ExtractionErrorBody;};

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseJsonBody(rawBody: unknown): {ok: true;value: unknown;} | {ok: false;} {
  if (rawBody === undefined || rawBody === null || rawBody === '') return { ok: false };
  if (typeof rawBody === 'object') return { ok: true, value: rawBody };
  if (typeof rawBody !== 'string') return { ok: false };
  try {
    return { ok: true, value: JSON.parse(rawBody) };
  } catch {
    return { ok: false };
  }
}

function bodyByteLength(rawBody: unknown, contentLength?: string | number): number {
  if (typeof contentLength === 'number' && Number.isFinite(contentLength)) return contentLength;
  if (typeof contentLength === 'string' && contentLength.trim() !== '') {
    const parsed = Number(contentLength);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (typeof rawBody === 'string') return Buffer.byteLength(rawBody, 'utf8');
  if (rawBody === undefined || rawBody === null) return 0;
  return Buffer.byteLength(JSON.stringify(rawBody), 'utf8');
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as {name: string;}).name === 'AbortError');

}

function providerStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as {status?: unknown;}).status;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

function mapProviderError(error: unknown): ExtractHandlerResult {
  if (isAbortError(error)) {
    return { status: 504, body: errorBody('EXTRACTION_TIMEOUT') };
  }
  const status = providerStatus(error);
  if (status === 429) return { status: 429, body: errorBody('RATE_LIMITED') };
  if (status && status >= 500) return { status: 503, body: errorBody('SERVICE_UNAVAILABLE') };
  return { status: 502, body: errorBody('EXTRACTION_FAILED') };
}

async function extractWithValidation(
  description: string,
  extractFromModel: typeof extractFeaturesFromModel,
  env: NodeJS.Dict<string>,
  now: () => number
): Promise<TechnicalFeature[]> {
  const apiKey = env.OPENAI_API_KEY ?? '';
  const model = env.OPENAI_MODEL;
  const startedAt = now();
  const remainingMs = (): number =>
    Math.min(EXTRACTION_TIMEOUT_MS, EXTRACTION_BUDGET_MS - (now() - startedAt));

  const run = async (invalidPhrases?: string[]): Promise<RawFeature[]> => {
    const timeoutMs = remainingMs();
    if (timeoutMs <= 0) {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await extractFromModel(description, {
        apiKey,
        model,
        signal: controller.signal,
        timeoutMs,
        invalidPhrases
      });
    } finally {
      clearTimeout(timer);
    }
  };

  const first = await run();
  const firstNorm = normalizeFeatures(first, description);
  if (firstNorm.ok) return firstNorm.features;

  const second = await run(firstNorm.invalidPhrases);
  const secondNorm = normalizeFeatures(second, description);
  if (secondNorm.ok) return secondNorm.features;

  throw new Error('invalid_source_phrases');
}

export async function handleExtractFeaturesRequest(
  input: ExtractHandlerInput
): Promise<ExtractHandlerResult> {
  const env = input.env ?? process.env;
  const method = (input.method ?? 'GET').toUpperCase();
  if (method !== 'POST') {
    return { status: 405, body: errorBody('METHOD_NOT_ALLOWED') };
  }

  const contentType = headerValue(input.contentType).toLowerCase();
  if (!contentType.includes('application/json')) {
    return { status: 415, body: errorBody('UNSUPPORTED_MEDIA_TYPE') };
  }

  if (bodyByteLength(input.rawBody, input.contentLength) > MAX_BODY_BYTES) {
    return { status: 400, body: errorBody('INVALID_INPUT', 'Request body is too large.') };
  }

  const parsed = parseJsonBody(input.rawBody);
  if (!parsed.ok || typeof parsed.value !== 'object' || parsed.value === null || Array.isArray(parsed.value)) {
    return { status: 400, body: errorBody('INVALID_INPUT') };
  }

  const parsedInput = extractRequestSchema.safeParse(parsed.value);
  if (!parsedInput.success) {
    const lengthIssue = parsedInput.error.issues.some((issue) => issue.code === 'too_small' || issue.code === 'too_big');
    return {
      status: 400,
      body: errorBody(
        'INVALID_INPUT',
        lengthIssue
          ? `Description must be between ${MIN_DESCRIPTION_LENGTH} and ${MAX_DESCRIPTION_LENGTH} characters.`
          : undefined
      )
    };
  }
  const description = parsedInput.data.description;

  if (!isLiveExtractionEnabled(env)) {
    return { status: 503, body: errorBody('SERVICE_UNAVAILABLE') };
  }

  if (!env.OPENAI_API_KEY) {
    return { status: 503, body: errorBody('SERVICE_UNAVAILABLE') };
  }

  try {
    const extractFromModel = input.extractFromModel ?? extractFeaturesFromModel;
    const features = await extractWithValidation(description, extractFromModel, env, input.now ?? Date.now);
    return { status: 200, body: { mode: 'live', features } };
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid_source_phrases') {
      return { status: 502, body: errorBody('EXTRACTION_FAILED') };
    }
    if (error instanceof Error && error.message === 'empty_structured_output') {
      return { status: 502, body: errorBody('EXTRACTION_FAILED') };
    }
    return mapProviderError(error);
  }
}
