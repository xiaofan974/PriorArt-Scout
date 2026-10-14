import type { EpoSearchPayload } from '../epo/contract';

export class PatentSearchApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'PatentSearchApiError';
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

export async function requestPatentSearch(query: string, signal?: AbortSignal): Promise<EpoSearchPayload> {
  const response = await fetch('/api/search-patents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal
  });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const error = payload as ErrorResponse | null;
    throw new PatentSearchApiError(
      error?.error?.code ?? 'EPO_UPSTREAM',
      error?.error?.message ?? 'EPO OPS search could not be completed.',
      response.status
    );
  }
  return payload as EpoSearchPayload;
}
