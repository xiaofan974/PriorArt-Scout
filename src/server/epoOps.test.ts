import { describe, expect, it, vi } from 'vitest';
import { HELMET_COLLISION_QUERY } from '../epo/contract';
import { parseEpoSearchXml, searchEpoPublications } from './epoOps';

const FIXTURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<ops:world-patent-data xmlns:ops="http://ops.epo.org" xmlns="http://www.epo.org/exchange" total-result-count="3">
  <exchange-documents>
    <exchange-document country="EP" doc-number="1000000" kind="A1">
      <bibliographic-data>
        <publication-reference>
          <document-id document-id-type="docdb">
            <country>EP</country>
            <doc-number>1000000</doc-number>
            <kind>A1</kind>
            <date>20000517</date>
          </document-id>
          <document-id document-id-type="epodoc">
            <doc-number>EP1000000</doc-number>
            <date>20000517</date>
          </document-id>
        </publication-reference>
        <parties>
          <applicants>
            <applicant>
              <applicant-name><name>EXAMPLE APPLICANT</name></applicant-name>
            </applicant>
          </applicants>
        </parties>
        <invention-title lang="de">Deutscher Titel</invention-title>
        <invention-title lang="en">Parser fixture title</invention-title>
      </bibliographic-data>
      <abstract lang="en"><p>Parser fixture abstract.</p></abstract>
    </exchange-document>
    <exchange-document country="EP" doc-number="1000000" kind="A1">
      <bibliographic-data>
        <publication-reference>
          <document-id document-id-type="docdb">
            <country>EP</country>
            <doc-number>01000000</doc-number>
            <kind>A1</kind>
            <date>20000517</date>
          </document-id>
        </publication-reference>
      </bibliographic-data>
    </exchange-document>
    <exchange-document country="US" doc-number="0000123" kind="A1">
      <bibliographic-data>
        <publication-reference>
          <document-id document-id-type="docdb">
            <country>US</country>
            <doc-number>0000123</doc-number>
            <kind>A1</kind>
          </document-id>
        </publication-reference>
      </bibliographic-data>
    </exchange-document>
  </exchange-documents>
</ops:world-patent-data>`;

describe('EPO OPS XML normalization', () => {
  it('parses a documented-shaped fixture, fills missing metadata, and deduplicates', () => {
    const parsed = parseEpoSearchXml(FIXTURE_XML);
    expect(parsed.totalResultCount).toBe(3);
    expect(parsed.records.map((record) => record.publicationId)).toEqual(['EP1000000A1', 'US123A1']);
    const first = parsed.records[0];
    expect(first.title).toBe('Parser fixture title');
    expect(first.publicationDate).toBe('2000-05-17');
    expect(first.applicants).toEqual(['EXAMPLE APPLICANT']);
    expect(first.abstract).toBe('Parser fixture abstract.');
    expect(first.sourceUrl).toBe('https://worldwide.espacenet.com/patent/search?q=EP1000000A1');
    const sparse = parsed.records[1];
    expect(sparse.title).toBeNull();
    expect(sparse.abstract).toBeNull();
    expect(sparse.publicationDate).toBeNull();
    expect(sparse.applicants).toEqual([]);
  });

  it('keeps the helmet example query inside the endpoint limit', () => {
    expect(HELMET_COLLISION_QUERY.length).toBeLessThanOrEqual(200);
  });
});

describe('EPO OPS requests', () => {
  it('does not search when authentication fails', async () => {
    const fetchImpl = vi.fn(async () => new Response(
      '<error><code>401</code><message>Client identifier is required</message></error>',
      { status: 401, headers: { 'content-type': 'application/xml' } }
    ));
    await expect(searchEpoPublications('ta=helmet', {
      EPO_CONSUMER_KEY: 'key',
      EPO_CONSUMER_SECRET: 'secret'
    }, fetchImpl)).rejects.toMatchObject({ code: 'EPO_AUTH_FAILED' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const calledUrl = String((fetchImpl.mock.calls as unknown[][])[0]?.[0]);
    expect(calledUrl).toContain('/auth/accesstoken');
  });

  it('maps a quota response without returning records', async () => {
    const fetchImpl = vi.fn(async () => new Response(
      '<error><code>403</code><message>Fair Use policy</message></error>',
      { status: 403 }
    ));
    await expect(searchEpoPublications('ta=helmet', {
      EPO_CONSUMER_KEY: 'key',
      EPO_CONSUMER_SECRET: 'secret'
    }, fetchImpl)).rejects.toMatchObject({ code: 'EPO_RATE_LIMITED', status: 429 });
  });

  it('maps an aborted token request to a timeout', async () => {
    const fetchImpl = vi.fn(async () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    });
    await expect(searchEpoPublications('ta=helmet', {
      EPO_CONSUMER_KEY: 'key',
      EPO_CONSUMER_SECRET: 'secret'
    }, fetchImpl)).rejects.toMatchObject({ code: 'EPO_TIMEOUT', status: 504 });
  });
});
