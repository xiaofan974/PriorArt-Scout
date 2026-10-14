import { locatePhrase } from '../utils/sourcePhrase';
import type { TechnicalFeature } from '../types/investigation';
import { MAX_FEATURES } from './extractionConstants';

export interface RawFeature {
  label: string;
  detail: string;
  sourcePhrase: string;
}

export function assignFeatureIds(features: Omit<TechnicalFeature, 'id'>[]): TechnicalFeature[] {
  return features.map((feature, index) => ({
    ...feature,
    id: `F${String(index + 1).padStart(2, '0')}`
  }));
}

/**
 * Validates source phrases against the original description and assigns F01… IDs.
 * Does not rewrite phrases. Invalid phrases cause the whole set to be rejected.
 */
export function normalizeFeatures(
  raw: RawFeature[],
  description: string
): {ok: true;features: TechnicalFeature[];} | {ok: false;invalidPhrases: string[];} {
  const limited = raw.slice(0, MAX_FEATURES);
  const invalidPhrases: string[] = [];
  const prepared: Omit<TechnicalFeature, 'id'>[] = [];

  for (const item of limited) {
    const label = item.label?.trim() ?? '';
    const detail = item.detail?.trim() ?? '';
    const sourcePhrase = item.sourcePhrase ?? '';
    if (!label || !detail || !sourcePhrase.trim() || locatePhrase(description, sourcePhrase) === null) {
      invalidPhrases.push(sourcePhrase || '(empty)');
      continue;
    }
    prepared.push({ label, detail, sourcePhrase });
  }

  if (invalidPhrases.length > 0) {
    return { ok: false, invalidPhrases };
  }

  return { ok: true, features: assignFeatureIds(prepared) };
}
