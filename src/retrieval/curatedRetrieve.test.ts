import { describe, expect, it } from 'vitest';
import { curatedCorpus } from '../data/curatedCorpus';
import {
  MAX_MATCHES_PER_FEATURE,
  retrieveCuratedPassages,
  type FeatureRetrieval
} from './curatedRetrieve';
import type { CuratedCorpus } from '../data/curatedCorpus';
import type { TechnicalFeature } from '../types/investigation';

function feature(id: string, text: string): TechnicalFeature {
  return { id, label: text, detail: '', sourcePhrase: text };
}

function ids(row: FeatureRetrieval): string[] {
  return row.matches.map((match) => match.passageId);
}

describe('retrieveCuratedPassages', () => {
  const helmet = feature(
    'F01',
    'A bicycle helmet that uses an accelerometer and gyroscope to detect a collision and send an emergency notification with GPS through a smartphone, unless the rider cancels the alert.'
  );

  it('returns exact stored text, ranked stably, and capped per feature', () => {
    const first = retrieveCuratedPassages([helmet]);
    const second = retrieveCuratedPassages([helmet]);
    expect(first).toEqual(second);
    expect(first[0].noMatch).toBe(false);
    expect(first[0].matches.length).toBeLessThanOrEqual(MAX_MATCHES_PER_FEATURE);
    expect(ids(first[0])).toEqual(ids(second[0]));
    const scores = first[0].matches.map((match) => match.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    for (const match of first[0].matches) {
      const stored = curatedCorpus.passages.find((passage) => passage.id === match.passageId);
      expect(stored?.text).toBe(match.text);
      expect(match.basis).toBe('keyword_overlap');
    }
  });

  it('deduplicates a repeated passage and enforces the result limit', () => {
    const passage = curatedCorpus.passages[0];
    const corpus: CuratedCorpus = {
      ...curatedCorpus,
      passages: Array.from({ length: 6 }, () => ({ ...passage }))
    };
    const result = retrieveCuratedPassages(
      [feature('F01', 'angular velocity collision notification communication device sensor module')],
      corpus
    );
    expect(result[0].matches).toHaveLength(1);
    expect(result[0].matches[0].text).toBe(passage.text);

    const many: CuratedCorpus = {
      ...curatedCorpus,
      passages: Array.from({ length: 5 }, (_, index) => ({
        ...passage,
        id: `LIMIT-${index + 1}`,
        text: `${passage.text} marker ${index + 1}`
      }))
    };
    const limited = retrieveCuratedPassages(
      [feature('F02', 'angular velocity collision notification communication device sensor module')],
      many
    );
    expect(limited[0].matches).toHaveLength(MAX_MATCHES_PER_FEATURE);
    expect(new Set(limited[0].matches.map((match) => match.passageId)).size).toBe(MAX_MATCHES_PER_FEATURE);
  });

  it('reports an explicit no-match when keywords do not overlap', () => {
    const result = retrieveCuratedPassages([
      feature('F09', 'underwater welding electrode flux coating for ship hull repair')
    ]);
    expect(result[0].noMatch).toBe(true);
    expect(result[0].matches).toEqual([]);
  });
});
