import { describe, expect, it } from 'vitest';
import { createDemoInvestigationResult } from '../data/demoResult';
import { resolveEvidence, validateEvidence } from './evidence';
import type { CitedEvidenceMatch, InvestigationResult } from '../types/investigation';

function withMatches(
  result: InvestigationResult,
  evidenceMatches: InvestigationResult['evidenceMatches']
): InvestigationResult {
  return { ...result, evidenceMatches };
}

describe('resolveEvidence', () => {
  const demo = createDemoInvestigationResult();

  it('returns the stored passage for a valid cited match', () => {
    const resolved = resolveEvidence(demo, 'F01', 'DEMO-PAT-001');
    expect(resolved).not.toBeNull();
    expect(resolved?.integrityIssue).toBe(false);
    expect(resolved?.status).toBe('supported');
    expect(resolved?.passage?.id).toBe('P1');
    expect(resolved?.passage?.text).toContain('protective headgear');
  });

  it('does not invent a passage for an unestablished match', () => {
    const resolved = resolveEvidence(demo, 'F01', 'DEMO-PAT-003');
    expect(resolved?.status).toBe('not_established');
    expect(resolved?.passage).toBeNull();
    expect(resolved?.integrityIssue).toBe(false);
  });

  it('returns null when no match exists', () => {
    expect(resolveEvidence(demo, 'F99', 'DEMO-PAT-001')).toBeNull();
  });

  it('withholds a cited status when the passage id is missing from the document', () => {
    const brokenMatch: CitedEvidenceMatch = {
      featureId: 'F01',
      documentId: 'DEMO-PAT-001',
      status: 'supported',
      passageId: 'P-MISSING',
      explanation: 'This citation does not exist in stored text.',
      limitations: []
    };
    const broken = withMatches(
      demo,
      demo.evidenceMatches.map((m) => m.featureId === 'F01' && m.documentId === 'DEMO-PAT-001' ? brokenMatch : m)
    );

    const resolved = resolveEvidence(broken, 'F01', 'DEMO-PAT-001');
    expect(resolved?.status).toBe('not_established');
    expect(resolved?.passage).toBeNull();
    expect(resolved?.integrityIssue).toBe(true);

    const validity = validateEvidence(broken);
    const demoValidity = validateEvidence(demo);
    expect(validity.cited).toBe(demoValidity.cited);
    expect(validity.verified).toBe(demoValidity.verified - 1);
  });
});
