import { describe, expect, it } from 'vitest';
import { curatedCorpus } from '../data/curatedCorpus';
import { features } from '../data/demoInvestigation';
import { retrieveCuratedPassages } from '../retrieval/curatedRetrieve';
import { EVAL_LABEL_STATUS, HELMET_EVAL_DATASET_ID, helmetEvalCases } from './helmetEvalDataset';
import { scoreHelmetEvaluation } from './scoreHelmetEval';

const passageIds = new Set(curatedCorpus.passages.map((passage) => passage.id));

describe('helmet evaluation dataset', () => {
  it('covers six feature queries and sixteen relevant pairs in the eight-passage corpus', () => {
    expect(HELMET_EVAL_DATASET_ID).toBe('curated-helmet-eval-v1');
    expect(EVAL_LABEL_STATUS).toContain('not had an independent human review');
    expect(helmetEvalCases.map((evalCase) => evalCase.featureId)).toEqual(['F01', 'F02', 'F03', 'F04', 'F05', 'F06']);
    expect(helmetEvalCases.map((evalCase) => evalCase.featureId)).toEqual(features.map((feature) => feature.id));
    const relevantPairs = helmetEvalCases.flatMap((evalCase) =>
      evalCase.relevantPassageIds.map((passageId) => `${evalCase.featureId}:${passageId}`)
    );
    expect(relevantPairs).toHaveLength(16);
    expect(new Set(relevantPairs).size).toBe(16);
    expect(curatedCorpus.passages).toHaveLength(8);
    for (const evalCase of helmetEvalCases) {
      expect(evalCase.relevantPassageIds.length).toBeGreaterThan(0);
      expect(evalCase.irrelevantPassageIds.length).toBeGreaterThan(0);
      expect(evalCase.expectedDetails.length).toBeGreaterThan(0);
      expect(evalCase.missingDetails.length).toBeGreaterThan(0);
      expect(evalCase.rationale.trim().length).toBeGreaterThan(0);
      const overlap = evalCase.relevantPassageIds.filter((id) => evalCase.irrelevantPassageIds.includes(id));
      expect(overlap).toEqual([]);
      for (const id of [...evalCase.relevantPassageIds, ...evalCase.irrelevantPassageIds]) {
        expect(passageIds.has(id)).toBe(true);
      }
    }
  });
});

describe('helmet evaluation score', () => {
  const report = scoreHelmetEvaluation();

  it('is deterministic', () => {
    expect(scoreHelmetEvaluation()).toEqual(report);
  });

  it('separates structural citation, exact quotes, and fixture agreement from retrieval', () => {
    expect(report.labelStatus).toBe(EVAL_LABEL_STATUS);
    expect(report.semanticGrounding.independentlyReviewed).toBe(false);
    expect(report.structuralCitation).toEqual({ ok: true, issues: [] });
    expect(report.exactQuoteChecks).toEqual({ ok: true, issues: [] });
    expect(report.fixtureAgreement).toEqual({ ok: true, issues: [] });
    expect(report.retrieval.microRecall).toBeCloseTo(3 / 16);
  });

  it('records the production keyword retriever against the draft relevant set', () => {
    const byFeature = Object.fromEntries(report.retrieval.perFeature.map((row) => [row.featureId, row]));
    expect(byFeature.F01.truePositiveIds).toEqual(['US10897947B2-C1', 'US10897947B2-C6', 'US10897947B2-D-GPS']);
    expect(byFeature.F01.missedRelevantIds).toEqual(['US11406152B2-C1', 'US11406152B2-D-DROP']);
    expect(byFeature.F01.precision).toBe(1);
    expect(byFeature.F01.recall).toBeCloseTo(0.6);
    expect(byFeature.F02.retrievedPassageIds).toEqual([]);
    expect(byFeature.F02.recall).toBe(0);
    expect(byFeature.F03.retrievedPassageIds).toEqual([]);
    expect(byFeature.F03.recall).toBe(0);
    expect(byFeature.F04.retrievedPassageIds).toEqual([]);
    expect(byFeature.F04.recall).toBe(0);
    expect(byFeature.F05.retrievedPassageIds).toEqual([]);
    expect(byFeature.F05.recall).toBe(0);
    expect(byFeature.F06.retrievedPassageIds).toEqual([]);
    expect(byFeature.F06.recall).toBe(0);
    expect(report.retrieval.microPrecision).toBe(1);
    expect(report.retrieval.microRecall).toBeCloseTo(3 / 16);
    expect(report.retrieval.macroPrecision).toBe(1);
    expect(report.retrieval.macroRecall).toBeCloseTo(0.1);
    expect(report.retrieval.featuresWithDefinedPrecision).toEqual(['F01']);
    expect(report.retrieval.featuresWithNoHits).toEqual(['F02', 'F03', 'F04', 'F05', 'F06']);
    for (const row of report.retrieval.perFeature) {
      expect(row.retrievedIrrelevantIds).toEqual([]);
    }
    const queries = Object.fromEntries(
      retrieveCuratedPassages(features).map((row) => [row.featureId, row.queryTerms])
    );
    expect(queries).toEqual({
      F01: ['smart', 'bicycle', 'helmet'],
      F02: ['detects', 'collisions', 'accelerometer', 'gyroscope', 'data'],
      F03: ['distinguishes', 'genuine', 'accidents', 'normal', 'movements', 'accidental', 'drops'],
      F04: ['automatically', 'sends', 'emergency', 'notification', 'designated', 'contact'],
      F05: ['gps', 'coordinates', 'transmitted', 'through', 'connected', 'smartphone'],
      F06: ['cancel', 'emergency', 'alert', 'seconds']
    });
  });
});
