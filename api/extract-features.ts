import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleExtractFeaturesRequest } from '../src/server/extractFeaturesHandler';

export const config = {
  maxDuration: 30
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const result = await handleExtractFeaturesRequest({
    method: req.method,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    rawBody: req.body
  });
  res.status(result.status).json(result.body);
}
