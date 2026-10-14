import { describe, expect, it } from 'vitest';
import { createDemoInvestigationResult } from './demoResult';
import { curatedCorpus, validateCuratedCorpus } from './curatedCorpus';

describe('curated corpus', () => {
  it('has required metadata on every publication and passage', () => {
    expect(validateCuratedCorpus()).toEqual([]);
    expect(curatedCorpus.publications.length).toBeGreaterThanOrEqual(3);
    expect(curatedCorpus.publications.length).toBeLessThanOrEqual(5);
    expect(curatedCorpus.passages.length).toBeGreaterThan(0);
  });

  it('stays separate from the synthetic helmet dataset', () => {
    const demo = createDemoInvestigationResult();
    const curatedIds = new Set([
      ...curatedCorpus.publications.map((publication) => publication.id),
      ...curatedCorpus.passages.map((passage) => passage.id)
    ]);
    for (const document of demo.documents) {
      expect(curatedIds.has(document.id)).toBe(false);
      for (const passage of document.passages) expect(curatedIds.has(passage.id)).toBe(false);
    }
    expect(demo.mode).toBe('demonstration');
  });
});
