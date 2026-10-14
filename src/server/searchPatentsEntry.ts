import { handleSearchPatentsRequest } from './searchPatentsHandler.js';

export const config = {
  maxDuration: 30
};

interface FunctionRequest {
  method?: string;
  headers: { [key: string]: string | string[] | undefined };
  body?: unknown;
}

interface FunctionResponse {
  status: (code: number) => FunctionResponse;
  json: (body: unknown) => void;
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function handler(req: FunctionRequest, res: FunctionResponse): Promise<void> {
  const result = await handleSearchPatentsRequest({
    method: req.method,
    contentType: headerValue(req.headers['content-type']),
    contentLength: headerValue(req.headers['content-length']),
    rawBody: req.body
  });
  res.status(result.status).json(result.body);
}
