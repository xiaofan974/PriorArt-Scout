import type { TechnicalFeature } from '../types/investigation';

export interface DescriptionSegment {
  text: string;
  featureId: string | null;
}

/** Returns the exact location of a phrase in a description, or null if it does not appear verbatim. */
export function locatePhrase(description: string, phrase: string): {start: number;end: number;} | null {
  const start = description.indexOf(phrase);
  return start === -1 ? null : { start, end: start + phrase.length };
}

/** Splits a description into plain segments and segments that are the exact source phrase of a feature. */
export function segmentDescription(description: string, items: TechnicalFeature[]): DescriptionSegment[] {
  const ranges = items.
  map((f) => ({ featureId: f.id, range: locatePhrase(description, f.sourcePhrase) })).
  filter((r): r is {featureId: string;range: {start: number;end: number;};} => r.range !== null).
  sort((a, b) => a.range.start - b.range.start);

  const segments: DescriptionSegment[] = [];
  let cursor = 0;
  for (const { featureId, range } of ranges) {
    if (range.start < cursor) continue; // skip overlaps
    if (range.start > cursor) segments.push({ text: description.slice(cursor, range.start), featureId: null });
    segments.push({ text: description.slice(range.start, range.end), featureId });
    cursor = range.end;
  }
  if (cursor < description.length) segments.push({ text: description.slice(cursor), featureId: null });
  return segments;
}

/** Counts how many features quote an exact substring of the given description. */
export function validateSourcePhrases(
  description: string,
  features: TechnicalFeature[]
): {total: number;verified: number;} {
  const verified = features.filter((f) => locatePhrase(description, f.sourcePhrase) !== null).length;
  return { total: features.length, verified };
}