export const EPO_MAX_RECORDS = 10;
export const EPO_QUERY_MAX_LENGTH = 200;

/** Bounded CQL for the helmet collision-detection example. Not an invention description. */
export const HELMET_COLLISION_QUERY =
  'ta=helmet AND ta=collision AND (ta=accelerometer OR ta=gyroscope)';

export interface EpoPatentRecord {
  publicationId: string;
  country: string;
  docNumber: string;
  kind: string;
  title: string | null;
  publicationDate: string | null;
  applicants: string[];
  abstract: string | null;
  sourceUrl: string;
}

export interface EpoSearchPayload {
  source: 'EPO OPS';
  query: string;
  records: EpoPatentRecord[];
  resultCount: number;
  totalResultCount: number | null;
  limitations: string[];
}

export function espacenetUrl(publicationId: string): string {
  return `https://worldwide.espacenet.com/patent/search?q=${encodeURIComponent(publicationId)}`;
}
