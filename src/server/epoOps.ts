import {
  EPO_MAX_RECORDS,
  espacenetUrl,
  type EpoPatentRecord,
  type EpoSearchPayload
} from '../epo/contract.js';

export const EPO_TOKEN_URL = 'https://ops.epo.org/3.2/auth/accesstoken';
export const EPO_SEARCH_URL = 'https://ops.epo.org/3.2/rest-services/published-data/search/biblio';
export const EPO_TOKEN_TIMEOUT_MS = 10_000;
export const EPO_SEARCH_TIMEOUT_MS = 15_000;

export type { EpoPatentRecord, EpoSearchPayload };

export interface EpoObservation {
  phase: 'token' | 'search';
  status: number;
  responseBytes: number;
  latencyMs: number;
  resultCount?: number;
}

export function isLiveEpoEnabled(env: NodeJS.Dict<string> = process.env): boolean {
  return env.LIVE_EPO_ENABLED === 'true';
}

/** Status, size, latency, and count only. Never include credentials, tokens, or query text. */
export function logEpoObservation(observation: EpoObservation): void {
  console.info(JSON.stringify({ event: 'epo_ops', ...observation }));
}

function limitations(totalResultCount: number | null, returned: number): string[] {
  const notes = [
    'Live patent discovery — no evidence assessment performed.',
    `At most ${EPO_MAX_RECORDS} publication records are returned from the first OPS range.`,
    'Titles, dates, applicants, and abstracts are included only when OPS returned them.',
    'This is not a comprehensive prior-art search or a legal opinion.'
  ];
  if (totalResultCount !== null && totalResultCount > returned) {
    notes.push(
      `OPS reported ${totalResultCount} matches. This response contains ${returned} deduplicated records.`
    );
  }
  return notes;
}

interface FetchResult {
  status: number;
  body: string;
  bytes: number;
}

async function fetchText(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  fetchImpl: typeof fetch
): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { ...init, signal: controller.signal });
    const body = await response.text();
    return { status: response.status, body, bytes: Buffer.byteLength(body, 'utf8') };
  } finally {
    clearTimeout(timer);
  }
}

export class EpoOpsError extends Error {
  readonly status: number;
  readonly code: 'EPO_AUTH_FAILED' | 'EPO_RATE_LIMITED' | 'EPO_TIMEOUT' | 'EPO_UPSTREAM';

  constructor(
    status: number,
    code: 'EPO_AUTH_FAILED' | 'EPO_RATE_LIMITED' | 'EPO_TIMEOUT' | 'EPO_UPSTREAM',
    message: string
  ) {
    super(message);
    this.name = 'EpoOpsError';
    this.status = status;
    this.code = code;
  }
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'AbortError'
  );
}

async function accessToken(
  key: string,
  secret: string,
  fetchImpl: typeof fetch
): Promise<string> {
  const started = Date.now();
  let result: FetchResult;
  try {
    const basic = Buffer.from(`${key}:${secret}`, 'utf8').toString('base64');
    result = await fetchText(
      EPO_TOKEN_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: 'grant_type=client_credentials'
      },
      EPO_TOKEN_TIMEOUT_MS,
      fetchImpl
    );
  } catch (error) {
    if (isAbortError(error)) throw new EpoOpsError(504, 'EPO_TIMEOUT', 'EPO OPS authentication timed out.');
    throw new EpoOpsError(502, 'EPO_UPSTREAM', 'EPO OPS authentication could not be completed.');
  }
  logEpoObservation({
    phase: 'token',
    status: result.status,
    responseBytes: result.bytes,
    latencyMs: Date.now() - started
  });
  if (result.status === 403) {
    throw new EpoOpsError(429, 'EPO_RATE_LIMITED', 'EPO OPS rejected the request because a quota was reached.');
  }
  if (result.status === 400 || result.status === 401) {
    throw new EpoOpsError(502, 'EPO_AUTH_FAILED', 'Authentication with EPO OPS failed.');
  }
  if (result.status < 200 || result.status >= 300) {
    throw new EpoOpsError(502, 'EPO_UPSTREAM', 'EPO OPS authentication could not be completed.');
  }
  let token = '';
  try {
    const parsed = JSON.parse(result.body) as { access_token?: unknown };
    if (typeof parsed.access_token === 'string') token = parsed.access_token;
  } catch {
    token = '';
  }
  if (!token) throw new EpoOpsError(502, 'EPO_AUTH_FAILED', 'Authentication with EPO OPS failed.');
  return token;
}

export async function searchEpoPublications(
  query: string,
  env: NodeJS.Dict<string>,
  fetchImpl: typeof fetch = fetch
): Promise<EpoSearchPayload> {
  const key = env.EPO_CONSUMER_KEY ?? '';
  const secret = env.EPO_CONSUMER_SECRET ?? '';
  if (!key || !secret) {
    throw new EpoOpsError(503, 'EPO_UPSTREAM', 'Live EPO search is not available.');
  }
  const token = await accessToken(key, secret, fetchImpl);
  const started = Date.now();
  const url = `${EPO_SEARCH_URL}?q=${encodeURIComponent(query)}&Range=1-${EPO_MAX_RECORDS}`;
  let result: FetchResult;
  try {
    result = await fetchText(
      url,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/xml',
          'X-OPS-Range': `1-${EPO_MAX_RECORDS}`
        }
      },
      EPO_SEARCH_TIMEOUT_MS,
      fetchImpl
    );
  } catch (error) {
    if (isAbortError(error)) throw new EpoOpsError(504, 'EPO_TIMEOUT', 'EPO OPS search timed out.');
    throw new EpoOpsError(502, 'EPO_UPSTREAM', 'EPO OPS search could not be completed.');
  }
  const parsed = parseEpoSearchXml(result.body);
  logEpoObservation({
    phase: 'search',
    status: result.status,
    responseBytes: result.bytes,
    latencyMs: Date.now() - started,
    resultCount: result.status === 200 ? parsed.records.length : 0
  });
  if (result.status === 403) {
    throw new EpoOpsError(429, 'EPO_RATE_LIMITED', 'EPO OPS rejected the request because a quota was reached.');
  }
  if (result.status === 400 || result.status === 401) {
    throw new EpoOpsError(502, 'EPO_AUTH_FAILED', 'Authentication with EPO OPS failed.');
  }
  if (result.status < 200 || result.status >= 300) {
    throw new EpoOpsError(502, 'EPO_UPSTREAM', 'EPO OPS search could not be completed.');
  }
  return {
    source: 'EPO OPS',
    query,
    records: parsed.records,
    resultCount: parsed.records.length,
    totalResultCount: parsed.totalResultCount,
    limitations: limitations(parsed.totalResultCount, parsed.records.length)
  };
}

export function parseEpoSearchXml(xml: string): { records: EpoPatentRecord[]; totalResultCount: number | null } {
  const totalMatch = xml.match(/total-result-count="(\d+)"/);
  const totalResultCount = totalMatch ? Number(totalMatch[1]) : null;
  const documents = [...xml.matchAll(/<exchange-document\b[\s\S]*?<\/exchange-document>/g)].map((match) => match[0]);
  const blocks = documents.length > 0 ? documents : [...xml.matchAll(/<publication-reference\b[\s\S]*?<\/publication-reference>/g)].map((match) => match[0]);
  const byId = new Map<string, EpoPatentRecord>();
  for (const block of blocks) {
    const record = recordFromBlock(block);
    if (!record) continue;
    const existing = byId.get(record.publicationId);
    if (!existing || recordScore(record) > recordScore(existing)) byId.set(record.publicationId, record);
  }
  return { records: [...byId.values()].slice(0, EPO_MAX_RECORDS), totalResultCount };
}

function recordScore(record: EpoPatentRecord): number {
  return (record.title ? 4 : 0) + (record.abstract ? 2 : 0) + record.applicants.length + (record.publicationDate ? 1 : 0);
}

function recordFromBlock(block: string): EpoPatentRecord | null {
  const publication = publicationIdentity(block);
  if (!publication) return null;
  const title = preferredText(block, 'invention-title');
  const abstract = abstractText(block);
  const applicants = uniqueNames(block);
  const publicationDate = formatDate(publication.date);
  return {
    publicationId: publication.publicationId,
    country: publication.country,
    docNumber: publication.docNumber,
    kind: publication.kind,
    title,
    publicationDate,
    applicants,
    abstract,
    sourceUrl: espacenetUrl(publication.publicationId)
  };
}

function publicationIdentity(block: string): { publicationId: string; country: string; docNumber: string; kind: string; date: string | null } | null {
  const references = [...block.matchAll(/<document-id\b([^>]*)>([\s\S]*?)<\/document-id>/g)];
  const parsed = references.map((match) => ({
    type: attribute(match[1], 'document-id-type'),
    country: elementText(match[2], 'country'),
    docNumber: elementText(match[2], 'doc-number'),
    kind: elementText(match[2], 'kind'),
    date: elementText(match[2], 'date')
  }));
  const docdb = parsed.find((item) => item.type === 'docdb' && item.docNumber);
  const epodoc = parsed.find((item) => item.type === 'epodoc' && item.docNumber);
  const chosen = docdb ?? epodoc ?? parsed.find((item) => item.docNumber);
  if (!chosen?.docNumber) return null;
  const country = (chosen.country ?? epodocCountry(epodoc?.docNumber) ?? attribute(block, 'country') ?? '').toUpperCase();
  const docNumber = normalizeDocNumber(chosen.docNumber, country);
  const kind = (chosen.kind ?? attribute(block, 'kind') ?? '').toUpperCase();
  if (!country || !docNumber) return null;
  return {
    publicationId: `${country}${docNumber}${kind}`,
    country,
    docNumber,
    kind,
    date: chosen.date ?? docdb?.date ?? epodoc?.date ?? null
  };
}

function epodocCountry(docNumber: string | null | undefined): string | null {
  const match = docNumber?.match(/^([A-Za-z]{2})/);
  return match ? match[1].toUpperCase() : null;
}

function normalizeDocNumber(value: string, country: string): string {
  let compact = value.replace(/\s+/g, '').toUpperCase();
  if (country && compact.startsWith(country)) compact = compact.slice(country.length);
  compact = compact.replace(/^0+(?=\d)/, '');
  return compact || '0';
}

function preferredText(block: string, tag: string): string | null {
  const matches = [...block.matchAll(new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'g'))];
  if (matches.length === 0) return null;
  const english = matches.find((match) => attribute(match[1], 'lang') === 'en');
  const raw = (english ?? matches[0])[2];
  const text = decodeXml(raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  return text ? text.slice(0, 500) : null;
}

function abstractText(block: string): string | null {
  const abstract = block.match(/<abstract\b[^>]*>([\s\S]*?)<\/abstract>/);
  if (!abstract) return null;
  const paragraphs = [...abstract[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((match) => match[1]);
  const raw = (paragraphs.length > 0 ? paragraphs.join(' ') : abstract[1]).replace(/<[^>]+>/g, ' ');
  const text = decodeXml(raw.replace(/\s+/g, ' ').trim());
  return text ? text.slice(0, 4000) : null;
}

function uniqueNames(block: string): string[] {
  const names = [...block.matchAll(/<applicant-name\b[^>]*>([\s\S]*?)<\/applicant-name>/g)]
    .map((match) => decodeXml(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()))
    .filter((name) => name.length > 0);
  return [...new Set(names)].slice(0, 8);
}

function elementText(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) return null;
  const text = decodeXml(match[1].replace(/<[^>]+>/g, '').trim());
  return text || null;
}

function attribute(opening: string, name: string): string | null {
  const match = opening.match(new RegExp(`${name}="([^"]*)"`));
  return match ? decodeXml(match[1]) : null;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
