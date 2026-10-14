import { describe, expect, it } from 'vitest';
import { createDemoInvestigationResult } from './demoResult';
import { createLiveExtractionResult } from './liveResult';
import { investigationAvailability } from '../hooks/investigationAvailability';

describe('createLiveExtractionResult', () => {
  const features = [
  {
    id: 'F01',
    label: 'Protective bicycle helmet',
    detail: 'A helmet for cycling.',
    sourcePhrase: 'A bicycle helmet'
  }];

  const description =
  'A bicycle helmet equipped with an accelerometer and gyroscope that detects collisions.';
  const result = createLiveExtractionResult(description, features);

  it('builds a live InvestigationResult without synthetic evidence', () => {
    expect(result.mode).toBe('live');
    expect(result.invention.description).toBe(description);
    expect(result.features).toEqual(features);
    expect(result.searchQueries).toEqual([]);
    expect(result.documents).toEqual([]);
    expect(result.evidenceMatches).toEqual([]);
    expect(result.researchGaps).toEqual({
      featureNotes: [],
      ambiguities: [],
      coverageLimitations: [],
      nextSteps: []
    });
    expect(result.documents.some((doc) => doc.id.startsWith('DEMO-PAT'))).toBe(false);
    expect(result.traceSteps.every((step) => !step.tool.includes('corpus') && !step.tool.includes('evidence.compare'))).
    toBe(true);
  });

  it('does not unlock the evidence report', () => {
    expect(investigationAvailability('extracted').report).toBe(false);
    expect(investigationAvailability('extracting').report).toBe(false);
    expect(investigationAvailability('extraction_failed').report).toBe(false);
    expect(investigationAvailability('complete').report).toBe(true);
  });
});

describe('demonstration dataset', () => {
  it('is unchanged by the live extraction adapter', () => {
    const demo = createDemoInvestigationResult();
    expect(demo.mode).toBe('demonstration');
    expect(demo.features).toHaveLength(6);
    expect(demo.documents).toHaveLength(3);
    expect(demo.evidenceMatches).toHaveLength(18);
  });
});
