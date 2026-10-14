import { z } from 'zod';
import { EPO_QUERY_MAX_LENGTH, type EpoSearchPayload } from '../epo/contract.js';
import { EpoOpsError, isLiveEpoEnabled, searchEpoPublications } from './epoOps.js';

export const searchRequestSchema = z.object({
  query: z.string().trim().min(1).max(EPO_QUERY_MAX_LENGTH)
});

export interface SearchHandlerInput {
  method?: string;
  contentType?: string | string[];
  contentLength?: string | number;
  rawBody: unknown;
  env?: NodeJS.Dict<string>;
  fetchImpl?: typeof fetch;
}

export interface SearchErrorBody {
  error: {
    code:
      | 'INVALID_INPUT'
      | 'METHOD_NOT_ALLOWED'
      | 'UNSUPPORTED_MEDIA_TYPE'
      | 'EPO_AUTH_FAILED'
      | 'EPO_RATE_LIMITED'
      | 'EPO_TIMEOUT'
      | 'EPO_UPSTREAM'
      | 'SERVICE_UNAVAILABLE';
    message: string;
  };
}

export type SearchHandlerResult =
  | { status: 200; body: EpoSearchPayload }
  | { status: 400 | 405 | 415 | 429 | 502 | 503 | 504; body: SearchErrorBody };

const MESSAGES: Record<SearchErrorBody['error']['code'], string> = {
  INVALID_INPUT: `Search query must be between 1 and ${EPO_QUERY_MAX_LENGTH} characters.`,
  METHOD_NOT_ALLOWED: 'This endpoint only accepts POST requests.',
  UNSUPPORTED_MEDIA_TYPE: 'Request content type must be application/json.',
  EPO_AUTH_FAILED: 'Authentication with EPO OPS failed.',
  EPO_RATE_LIMITED: 'EPO OPS rejected the request because a quota was reached.',
  EPO_TIMEOUT: 'EPO OPS search timed out. Please try again.',
  EPO_UPSTREAM: 'EPO OPS search could not be completed.',
  SERVICE_UNAVAILABLE: 'Live EPO search is not available.'
};

function errorBody(code: SearchErrorBody['error']['code'], message?: string): SearchErrorBody {
  return { error: { code, message: message ?? MESSAGES[code] } };
}

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseJsonBody(rawBody: unknown): { ok: true; value: unknown } | { ok: false } {
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

export async function handleSearchPatentsRequest(input: SearchHandlerInput): Promise<SearchHandlerResult> {
  const env = input.env ?? process.env;
  const method = (input.method ?? 'GET').toUpperCase();
  if (method !== 'POST') return { status: 405, body: errorBody('METHOD_NOT_ALLOWED') };

  const contentType = headerValue(input.contentType).toLowerCase();
  if (!contentType.includes('application/json')) {
    return { status: 415, body: errorBody('UNSUPPORTED_MEDIA_TYPE') };
  }
  if (bodyByteLength(input.rawBody, input.contentLength) > 8 * 1024) {
    return { status: 400, body: errorBody('INVALID_INPUT', 'Request body is too large.') };
  }
  const parsed = parseJsonBody(input.rawBody);
  if (!parsed.ok || typeof parsed.value !== 'object' || parsed.value === null || Array.isArray(parsed.value)) {
    return { status: 400, body: errorBody('INVALID_INPUT') };
  }
  const query = searchRequestSchema.safeParse(parsed.value);
  if (!query.success) return { status: 400, body: errorBody('INVALID_INPUT') };

  if (!isLiveEpoEnabled(env)) return { status: 503, body: errorBody('SERVICE_UNAVAILABLE') };
  if (!env.EPO_CONSUMER_KEY || !env.EPO_CONSUMER_SECRET) {
    return { status: 503, body: errorBody('SERVICE_UNAVAILABLE') };
  }

  try {
    const body = await searchEpoPublications(query.data.query, env, input.fetchImpl);
    return { status: 200, body };
  } catch (error) {
    if (error instanceof EpoOpsError) {
      if (error.code === 'EPO_RATE_LIMITED') return { status: 429, body: errorBody('EPO_RATE_LIMITED') };
      if (error.code === 'EPO_TIMEOUT') return { status: 504, body: errorBody('EPO_TIMEOUT') };
      if (error.code === 'EPO_AUTH_FAILED') return { status: 502, body: errorBody('EPO_AUTH_FAILED') };
      if (error.status === 503) return { status: 503, body: errorBody('SERVICE_UNAVAILABLE') };
      return { status: 502, body: errorBody('EPO_UPSTREAM') };
    }
    return { status: 502, body: errorBody('EPO_UPSTREAM') };
  }
}
