import { describe, expect, it } from 'vitest';
import { createDemoInvestigationResult } from './demoResult';
import { validateEvidence } from '../utils/evidence';
import { validateSourcePhrases } from '../utils/sourcePhrase';

describe('createDemoInvestigationResult', () => {
  const result = createDemoInvestigationResult();

  it('wraps the helmet demonstration dataset as one InvestigationResult', () => {
    expect(result.mode).toBe('demonstration');
    expect(result.invention.id).toBe('demo-inv-helmet');
    expect(result.features.map((f) => f.id)).toEqual(['F01', 'F02', 'F03', 'F04', 'F05', 'F06']);
    expect(result.documents.map((d) => d.id)).toEqual(['DEMO-PAT-001', 'DEMO-PAT-002', 'DEMO-PAT-003']);
    expect(result.searchQueries.map((q) => q.id)).toEqual(['Q1', 'Q2', 'Q3']);
    expect(result.traceSteps).toHaveLength(7);
    expect(result.evidenceMatches).toHaveLength(18);
  });

  it('keeps referential integrity across features, documents, passages, and matches', () => {
    const featureIds = new Set(result.features.map((f) => f.id));
    const documentIds = new Set(result.documents.map((d) => d.id));

    for (const match of result.evidenceMatches) {
      expect(featureIds.has(match.featureId)).toBe(true);
      expect(documentIds.has(match.documentId)).toBe(true);
      if (match.status !== 'not_established') {
        const doc = result.documents.find((d) => d.id === match.documentId);
        expect(doc?.passages.some((p) => p.id === match.passageId)).toBe(true);
      }
    }

    for (const query of result.searchQueries) {
      for (const featureId of query.featureIds) expect(featureIds.has(featureId)).toBe(true);
      for (const documentId of query.retrievedDocumentIds) expect(documentIds.has(documentId)).toBe(true);
    }

    for (const note of result.researchGaps.featureNotes) {
      expect(featureIds.has(note.featureId)).toBe(true);
    }
  });

  it('has a complete feature–document comparison grid', () => {
    const pairs = new Set(result.evidenceMatches.map((m) => `${m.featureId}:${m.documentId}`));
    for (const feature of result.features) {
      for (const document of result.documents) {
        expect(pairs.has(`${feature.id}:${document.id}`)).toBe(true);
      }
    }
  });

  it('verifies source phrases and cited excerpts against stored text', () => {
    const phrases = validateSourcePhrases(result.invention.description, result.features);
    expect(phrases).toEqual({ total: 6, verified: 6 });
    const evidence = validateEvidence(result);
    expect(evidence.verified).toBe(evidence.cited);
    expect(evidence.cited).toBeGreaterThan(0);
  });
});
