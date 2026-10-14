import { describe, expect, it } from 'vitest';
import { features } from '../data/demoInvestigation';
import { MIN_KEYWORD_OVERLAP } from '../retrieval/curatedRetrieve';
import { EXPERIMENT_MIN_KEYWORD_OVERLAP, retrieveWithOneKeywordOverlap } from './experimentalRetrieve';
import { scoreHelmetEvaluation } from './scoreHelmetEval';

describe('one-keyword retrieval experiment', () => {
  const baseline = scoreHelmetEvaluation();
  const candidate = scoreHelmetEvaluation(retrieveWithOneKeywordOverlap);

  it('leaves the production threshold at two shared terms', () => {
    expect(MIN_KEYWORD_OVERLAP).toBe(2);
    expect(EXPERIMENT_MIN_KEYWORD_OVERLAP).toBe(1);
    expect(baseline.retrieval.microRecall).toBeCloseTo(3 / 16);
    expect(baseline.retrieval.microPrecision).toBe(1);
    expect(baseline.retrieval.featuresWithNoHits).toEqual(['F02', 'F03', 'F04', 'F05', 'F06']);
  });

  it('scores the unchanged draft labels at one shared term', () => {
    expect(candidate.retrieval.microRecall).toBeCloseTo(8 / 16);
    expect(candidate.retrieval.microPrecision).toBeCloseTo(8 / 13);
    expect(candidate.retrieval.macroRecall).toBeCloseTo(22 / 45);
    expect(candidate.retrieval.macroPrecision).toBeCloseTo(2 / 3);
    expect(candidate.retrieval.featuresWithNoHits).toEqual(['F03']);
    const byFeature = Object.fromEntries(candidate.retrieval.perFeature.map((row) => [row.featureId, row]));
    expect(byFeature.F02.truePositiveIds).toEqual(['US8860570B2-C1']);
    expect(byFeature.F04.truePositiveIds).toEqual(['US10897947B2-C1', 'US10897947B2-D-GPS']);
    expect(byFeature.F04.falsePositiveIds).toEqual(['US10897947B2-C6']);
    expect(byFeature.F05.truePositiveIds).toEqual(['US10897947B2-D-GPS']);
    expect(byFeature.F05.falsePositiveIds).toEqual(['US11406152B2-C1', 'US8860570B2-C1']);
    expect(byFeature.F06.truePositiveIds).toEqual(['US10897947B2-C6']);
    expect(byFeature.F06.falsePositiveIds).toEqual(['US10897947B2-C1', 'US10897947B2-D-GPS']);
    expect(byFeature.F03.retrievedPassageIds).toEqual([]);
  });

  it('records the single terms that produced the new hits', () => {
    const hits = Object.fromEntries(
      retrieveWithOneKeywordOverlap(features).map((row) => [
        row.featureId,
        row.matches.map((match) => [match.passageId, match.matchedTerms])
      ])
    );
    expect(hits.F02).toEqual([['US8860570B2-C1', ['data']]]);
    expect(hits.F04).toEqual([
      ['US10897947B2-C1', ['emergency']],
      ['US10897947B2-C6', ['emergency']],
      ['US10897947B2-D-GPS', ['emergency']]
    ]);
    expect(hits.F05).toEqual([
      ['US10897947B2-D-GPS', ['gps']],
      ['US11406152B2-C1', ['connected']],
      ['US8860570B2-C1', ['connected']]
    ]);
    expect(hits.F06).toEqual([
      ['US10897947B2-C1', ['emergency']],
      ['US10897947B2-C6', ['emergency']],
      ['US10897947B2-D-GPS', ['emergency']]
    ]);
  });
});
