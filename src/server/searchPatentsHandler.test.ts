import { describe, expect, it, vi } from 'vitest';
import { handleSearchPatentsRequest } from './searchPatentsHandler';

const enabled = {
  LIVE_EPO_ENABLED: 'true',
  EPO_CONSUMER_KEY: 'key',
  EPO_CONSUMER_SECRET: 'secret'
};

function json(body: unknown) {
  return {
    method: 'POST',
    contentType: 'application/json',
    rawBody: body
  };
}

describe('POST /api/search-patents', () => {
  it('rejects invalid queries before calling EPO', async () => {
    const fetchImpl = vi.fn();
    const empty = await handleSearchPatentsRequest({ ...json({ query: '   ' }), env: enabled, fetchImpl });
    const long = await handleSearchPatentsRequest({
      ...json({ query: 'a'.repeat(201) }),
      env: enabled,
      fetchImpl
    });
    expect(empty.status).toBe(400);
    expect(long.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('stays unavailable when the production gate is off', async () => {
    const fetchImpl = vi.fn();
    const result = await handleSearchPatentsRequest({
      ...json({ query: 'ta=helmet' }),
      env: { LIVE_EPO_ENABLED: 'false', EPO_CONSUMER_KEY: 'key', EPO_CONSUMER_SECRET: 'secret' },
      fetchImpl
    });
    expect(result.status).toBe(503);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns normalized records from a mocked search', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'token-not-for-the-browser' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(
        `<ops:world-patent-data total-result-count="1"><exchange-documents>
          <exchange-document><bibliographic-data><publication-reference>
            <document-id document-id-type="docdb"><country>EP</country><doc-number>1000000</doc-number><kind>A1</kind><date>20000517</date></document-id>
          </publication-reference><invention-title lang="en">Parser fixture title</invention-title></bibliographic-data></exchange-document>
        </exchange-documents></ops:world-patent-data>`,
        { status: 200 }
      ));
    const result = await handleSearchPatentsRequest({
      ...json({ query: 'ta=helmet' }),
      env: enabled,
      fetchImpl
    });
    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.body.source).toBe('EPO OPS');
    expect(result.body.query).toBe('ta=helmet');
    expect(result.body.records[0].publicationId).toBe('EP1000000A1');
    expect(result.body.limitations[0]).toMatch(/no evidence assessment/i);
    expect(JSON.stringify(result.body)).not.toContain('token-not-for-the-browser');
    expect(JSON.stringify(result.body)).not.toContain('secret');
  });

  it('maps authentication failure, quota, and timeout', async () => {
    const auth = await handleSearchPatentsRequest({
      ...json({ query: 'ta=helmet' }),
      env: enabled,
      fetchImpl: vi.fn(async () => new Response('<error><message>invalid_client</message></error>', { status: 401 }))
    });
    expect(auth.status).toBe(502);
    if (auth.status === 200) return;
    expect(auth.body.error.code).toBe('EPO_AUTH_FAILED');

    const quota = await handleSearchPatentsRequest({
      ...json({ query: 'ta=helmet' }),
      env: enabled,
      fetchImpl: vi.fn(async () => new Response('<error><message>Fair Use</message></error>', { status: 403 }))
    });
    expect(quota.status).toBe(429);

    const timeout = await handleSearchPatentsRequest({
      ...json({ query: 'ta=helmet' }),
      env: enabled,
      fetchImpl: vi.fn(async () => {
        const error = new Error('aborted');
        error.name = 'AbortError';
        throw error;
      })
    });
    expect(timeout.status).toBe(504);
  });
});
