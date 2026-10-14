import type { TechnicalFeature } from '../types/investigation';

export class ExtractionApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ExtractionApiError';
    this.code = code;
    this.status = status;
  }
}

interface ErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface SuccessResponse {
  mode: 'live';
  features: TechnicalFeature[];
}

export async function requestFeatureExtraction(
  description: string,
  signal?: AbortSignal
): Promise<TechnicalFeature[]> {
  const response = await fetch('/api/extract-features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
    signal
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = (payload as ErrorResponse | null)?.error;
    throw new ExtractionApiError(
      error?.code ?? 'EXTRACTION_FAILED',
      error?.message ?? 'Feature extraction could not be completed. Please try again.',
      response.status
    );
  }

  const body = payload as SuccessResponse;
  if (!body || body.mode !== 'live' || !Array.isArray(body.features)) {
    throw new ExtractionApiError('EXTRACTION_FAILED', 'Feature extraction could not be completed. Please try again.', 502);
  }
  return body.features;
}
