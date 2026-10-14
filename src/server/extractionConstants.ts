import { MAX_DESCRIPTION_LENGTH, MAX_FEATURES, MIN_DESCRIPTION_LENGTH } from '../config/limits.js';

export { MAX_DESCRIPTION_LENGTH, MAX_FEATURES, MIN_DESCRIPTION_LENGTH };

export const MAX_BODY_BYTES = 16 * 1024;
/** Vercel function maxDuration for POST /api/extract-features. */
export const FUNCTION_MAX_DURATION_MS = 30_000;
/** Wall-clock budget covering the first model call and one source-phrase retry. */
export const EXTRACTION_BUDGET_MS = 25_000;
/** Cap for a single model attempt. Combined attempts use EXTRACTION_BUDGET_MS. */
export const EXTRACTION_TIMEOUT_MS = 20_000;
export const MAX_OUTPUT_TOKENS = 1200;
export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

export type ExtractionErrorCode =
  | 'INVALID_INPUT'
  | 'METHOD_NOT_ALLOWED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'EXTRACTION_FAILED'
  | 'EXTRACTION_TIMEOUT'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE';

export interface ExtractionErrorBody {
  error: {
    code: ExtractionErrorCode;
    message: string;
  };
}

export const ERROR_MESSAGES: Record<ExtractionErrorCode, string> = {
  INVALID_INPUT: 'The invention description is missing or invalid.',
  METHOD_NOT_ALLOWED: 'This endpoint only accepts POST requests.',
  UNSUPPORTED_MEDIA_TYPE: 'Request content type must be application/json.',
  EXTRACTION_FAILED: 'Feature extraction could not be completed. Please try again.',
  EXTRACTION_TIMEOUT: 'Feature extraction timed out. Please try again.',
  RATE_LIMITED: 'Too many requests. Please wait and try again.',
  SERVICE_UNAVAILABLE: 'Live feature extraction is not available.'
};

export function errorBody(code: ExtractionErrorCode, message?: string): ExtractionErrorBody {
  return { error: { code, message: message ?? ERROR_MESSAGES[code] } };
}

export function isLiveExtractionEnabled(env: NodeJS.Dict<string> = process.env): boolean {
  return env.LIVE_EXTRACTION_ENABLED === 'true';
}
