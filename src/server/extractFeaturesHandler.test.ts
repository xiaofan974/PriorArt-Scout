import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { EXTRACTION_BUDGET_MS, EXTRACTION_TIMEOUT_MS, FUNCTION_MAX_DURATION_MS } from './extractionConstants';
import { handleExtractFeaturesRequest } from './extractFeaturesHandler';
import type { RawFeature } from './normalizeFeatures';

const VALID_DESCRIPTION =
'A bicycle helmet equipped with an accelerometer and gyroscope that detects collisions and sends an emergency notification with GPS coordinates through a connected smartphone.';

const VALID_FEATURES: RawFeature[] = [
{
  label: 'Protective bicycle helmet',
  detail: 'A helmet form factor for cycling.',
  sourcePhrase: 'A bicycle helmet'
},
{
  label: 'Inertial collision sensing',
  detail: 'Collision detection from accelerometer and gyroscope signals.',
  sourcePhrase: 'an accelerometer and gyroscope that detects collisions'
}];


const ENABLED_ENV = {
  LIVE_EXTRACTION_ENABLED: 'true',
  OPENAI_API_KEY: 'sk-test-not-a-real-key'
};

function request(
  overrides: Partial<Parameters<typeof handleExtractFeaturesRequest>[0]> = {}
) {
  return handleExtractFeaturesRequest({
    method: 'POST',
    contentType: 'application/json',
    rawBody: JSON.stringify({ description: VALID_DESCRIPTION }),
    env: ENABLED_ENV,
    extractFromModel: vi.fn(async () => VALID_FEATURES),
    ...overrides
  });
}

describe('handleExtractFeaturesRequest', () => {
  it('does not statically import the OpenAI adapter', () => {
    const source = readFileSync(new URL('./extractFeaturesHandler.ts', import.meta.url), 'utf8');
    expect(source).toMatch(/await import\(['"]\.\/openaiExtract\.js['"]\)/);
    expect(source).not.toMatch(/^import \{[^}]*extractFeaturesFromModel[^}]*\} from ['"].\/openaiExtract/m);
  });

  it('returns METHOD_NOT_ALLOWED for GET without loading a model adapter', async () => {
    const result = await handleExtractFeaturesRequest({
      method: 'GET',
      contentType: 'application/json',
      rawBody: '',
      env: {}
    });
    expect(result.status).toBe(405);
    expect(result.body).toMatchObject({ error: { code: 'METHOD_NOT_ALLOWED' } });
  });

  it('returns SERVICE_UNAVAILABLE for a valid POST when the production gate is off, without a model adapter', async () => {
    const result = await handleExtractFeaturesRequest({
      method: 'POST',
      contentType: 'application/json',
      rawBody: JSON.stringify({ description: VALID_DESCRIPTION }),
      env: {}
    });
    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({ error: { code: 'SERVICE_UNAVAILABLE' } });
  });

  it('keeps the OpenAI retry budget below the serverless maxDuration', () => {
    expect(EXTRACTION_BUDGET_MS).toBeLessThan(FUNCTION_MAX_DURATION_MS);
    expect(EXTRACTION_TIMEOUT_MS).toBeLessThanOrEqual(EXTRACTION_BUDGET_MS);
  });

  it('returns validated live features for a valid request', async () => {
    const result = await request();
    expect(result.status).toBe(200);
    if (result.status !== 200) throw new Error('expected success');
    expect(result.body.mode).toBe('live');
    expect(result.body.features.map((f) => f.id)).toEqual(['F01', 'F02']);
    expect(result.body.features[0].sourcePhrase).toBe('A bicycle helmet');
  });

  it('rejects unsupported methods', async () => {
    const result = await request({ method: 'GET' });
    expect(result.status).toBe(405);
    expect(result.body).toMatchObject({ error: { code: 'METHOD_NOT_ALLOWED' } });
  });

  it('rejects unsupported content types', async () => {
    const result = await request({ contentType: 'text/plain' });
    expect(result.status).toBe(415);
    expect(result.body).toMatchObject({ error: { code: 'UNSUPPORTED_MEDIA_TYPE' } });
  });

  it('rejects a missing description', async () => {
    const result = await request({ rawBody: JSON.stringify({}) });
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ error: { code: 'INVALID_INPUT' } });
  });

  it('rejects a description below the minimum length', async () => {
    const result = await request({ rawBody: JSON.stringify({ description: 'Too short' }) });
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ error: { code: 'INVALID_INPUT' } });
  });

  it('rejects a description above the maximum length', async () => {
    const result = await request({ rawBody: JSON.stringify({ description: 'A'.repeat(5001) }) });
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ error: { code: 'INVALID_INPUT' } });
  });

  it('rejects malformed JSON', async () => {
    const result = await request({ rawBody: '{not json' });
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ error: { code: 'INVALID_INPUT' } });
  });

  it('rejects oversized request bodies', async () => {
    const result = await request({ contentLength: 20_000 });
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ error: { code: 'INVALID_INPUT' } });
  });

  it('returns SERVICE_UNAVAILABLE when the production feature gate is off', async () => {
    const extractFromModel = vi.fn(async () => VALID_FEATURES);
    const result = await request({
      env: { OPENAI_API_KEY: 'sk-test' },
      extractFromModel
    });
    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({ error: { code: 'SERVICE_UNAVAILABLE' } });
    expect(extractFromModel).not.toHaveBeenCalled();
  });

  it('returns SERVICE_UNAVAILABLE when the API key is missing', async () => {
    const result = await request({
      env: { LIVE_EXTRACTION_ENABLED: 'true' }
    });
    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({ error: { code: 'SERVICE_UNAVAILABLE' } });
  });

  it('maps a provider 429 to RATE_LIMITED', async () => {
    const result = await request({
      extractFromModel: vi.fn(async () => {
        const error = new Error('rate limited') as Error & {status: number;};
        error.status = 429;
        throw error;
      })
    });
    expect(result.status).toBe(429);
    expect(result.body).toMatchObject({ error: { code: 'RATE_LIMITED' } });
  });

  it('maps an abort to EXTRACTION_TIMEOUT', async () => {
    const result = await request({
      extractFromModel: vi.fn(async () => {
        const error = new Error('aborted');
        error.name = 'AbortError';
        throw error;
      })
    });
    expect(result.status).toBe(504);
    expect(result.body).toMatchObject({ error: { code: 'EXTRACTION_TIMEOUT' } });
  });

  it('maps invalid structured output to EXTRACTION_FAILED', async () => {
    const result = await request({
      extractFromModel: vi.fn(async () => {
        throw new Error('empty_structured_output');
      })
    });
    expect(result.status).toBe(502);
    expect(result.body).toMatchObject({ error: { code: 'EXTRACTION_FAILED' } });
  });

  it('retries once for an invalid source phrase, then fails without rewriting it', async () => {
    const extractFromModel = vi.fn(async (_description: string, options: {invalidPhrases?: string[];}) => {
      if (!options.invalidPhrases) {
        return [{ label: 'Invented', detail: 'Not in the text', sourcePhrase: 'quantum flux capacitor' }];
      }
      return [{ label: 'Invented again', detail: 'Still wrong', sourcePhrase: 'hoverboard module' }];
    });
    const result = await request({ extractFromModel });
    expect(extractFromModel).toHaveBeenCalledTimes(2);
    expect(result.status).toBe(502);
    expect(result.body).toMatchObject({ error: { code: 'EXTRACTION_FAILED' } });
  });

  it('accepts a retry that supplies verbatim source phrases', async () => {
    const extractFromModel = vi.fn(async (_description: string, options: {invalidPhrases?: string[];}) => {
      if (!options.invalidPhrases) {
        return [{ label: 'Bad', detail: 'Bad', sourcePhrase: 'not in the source' }];
      }
      return VALID_FEATURES;
    });
    const result = await request({ extractFromModel });
    expect(extractFromModel).toHaveBeenCalledTimes(2);
    expect(result.status).toBe(200);
  });

  it('accepts an empty feature list when the model finds none', async () => {
    const result = await request({ extractFromModel: vi.fn(async () => []) });
    expect(result.status).toBe(200);
    if (result.status !== 200) throw new Error('expected success');
    expect(result.body.features).toEqual([]);
  });

  it('maps a provider 5xx error to SERVICE_UNAVAILABLE', async () => {
    const result = await request({
      extractFromModel: vi.fn(async () => {
        const error = new Error('upstream') as Error & {status: number;};
        error.status = 500;
        throw error;
      })
    });
    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({ error: { code: 'SERVICE_UNAVAILABLE' } });
  });

  it('treats LIVE_EXTRACTION_ENABLED values other than true as gated off', async () => {
    const result = await request({
      env: { LIVE_EXTRACTION_ENABLED: 'TRUE', OPENAI_API_KEY: 'sk-test' }
    });
    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({ error: { code: 'SERVICE_UNAVAILABLE' } });
  });

  it('does not enable the API from VITE_LIVE_EXTRACTION_ENABLED alone', async () => {
    const extractFromModel = vi.fn(async () => VALID_FEATURES);
    const result = await request({
      env: {
        VITE_LIVE_EXTRACTION_ENABLED: 'true',
        OPENAI_API_KEY: 'sk-test-not-a-real-key'
      },
      extractFromModel
    });
    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({ error: { code: 'SERVICE_UNAVAILABLE' } });
    expect(extractFromModel).not.toHaveBeenCalled();
  });

  it('keeps the server gate independent when both flags are present', async () => {
    const extractFromModel = vi.fn(async () => VALID_FEATURES);
    const enabled = await request({
      env: {
        LIVE_EXTRACTION_ENABLED: 'true',
        VITE_LIVE_EXTRACTION_ENABLED: 'false',
        OPENAI_API_KEY: 'sk-test-not-a-real-key'
      },
      extractFromModel
    });
    expect(enabled.status).toBe(200);
    expect(extractFromModel).toHaveBeenCalledTimes(1);

    extractFromModel.mockClear();
    const disabled = await request({
      env: {
        LIVE_EXTRACTION_ENABLED: 'false',
        VITE_LIVE_EXTRACTION_ENABLED: 'true',
        OPENAI_API_KEY: 'sk-test-not-a-real-key'
      },
      extractFromModel
    });
    expect(disabled.status).toBe(503);
    expect(extractFromModel).not.toHaveBeenCalled();
  });

  it('does not start a second model call after the extraction budget elapses', async () => {
    const extractFromModel = vi.fn(async () => [
      { label: 'Bad', detail: 'Bad', sourcePhrase: 'not in the source' }
    ]);
    const timestamps = [0, 0, EXTRACTION_BUDGET_MS];
    let index = 0;
    const result = await request({
      extractFromModel,
      now: () => timestamps[Math.min(index++, timestamps.length - 1)]
    });
    expect(extractFromModel).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(504);
    expect(result.body).toMatchObject({ error: { code: 'EXTRACTION_TIMEOUT' } });
  });
});
