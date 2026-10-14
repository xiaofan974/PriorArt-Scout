import { describe, expect, it } from 'vitest';
import { createDemoInvestigationResult } from './demoResult';
import { createCuratedResearchResult } from './curatedResult';
import { investigationAvailability } from '../hooks/investigationAvailability';
import { curatedCorpus } from './curatedCorpus';

describe('createCuratedResearchResult', () => {
  const description =
    'A bicycle helmet detects collisions with an accelerometer and sends an emergency GPS message through a mobile phone unless the rider cancels the alert.';
  const result = createCuratedResearchResult(description);

  it('does not copy the synthetic demonstration or invent evidence citations', () => {
    const demo = createDemoInvestigationResult();
    expect(result.mode).toBe('curated');
    expect(result.evidenceMatches).toEqual([]);
    expect(result.documents.every((document) => curatedCorpus.publications.some((publication) => publication.id === document.id))).toBe(true);
    expect(result.documents.some((document) => demo.documents.some((synthetic) => synthetic.id === document.id))).toBe(false);
    for (const document of result.documents) {
      for (const passage of document.passages) {
        const stored = curatedCorpus.passages.find((item) => item.id === passage.id);
        expect(stored?.text).toBe(passage.text);
      }
    }
  });

  it('keeps the evidence report locked', () => {
    expect(investigationAvailability('retrieved').report).toBe(false);
    expect(investigationAvailability('retrieved').workspace).toBe(true);
    expect(investigationAvailability('complete').report).toBe(true);
  });
});
