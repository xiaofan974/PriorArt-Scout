import type {
  CandidateDocument,
  EvidenceMatch,
  InvestigationResult,
  MatchStatus,
  SourcePassage,
  TechnicalFeature } from
'../types/investigation';

export interface ResolvedEvidence {
  match: EvidenceMatch;
  /** Status after integrity checks — a cited status without a stored passage is withheld. */
  status: MatchStatus;
  passage: SourcePassage | null;
  integrityIssue: boolean;
}

export function getFeature(result: InvestigationResult, id: string): TechnicalFeature | undefined {
  return result.features.find((f) => f.id === id);
}

export function getDocument(result: InvestigationResult, id: string): CandidateDocument | undefined {
  return result.documents.find((d) => d.id === id);
}

export function findMatch(
  result: InvestigationResult,
  featureId: string,
  documentId: string
): EvidenceMatch | undefined {
  return result.evidenceMatches.find((m) => m.featureId === featureId && m.documentId === documentId);
}

/**
 * Resolves a match to its stored source passage. If a supported / partial match
 * cannot be traced to a passage, the status is downgraded so no claim is shown without evidence.
 */
export function resolveEvidence(
  result: InvestigationResult,
  featureId: string,
  documentId: string
): ResolvedEvidence | null {
  const match = findMatch(result, featureId, documentId);
  if (!match) return null;
  if (match.status === 'not_established') {
    return { match, status: 'not_established', passage: null, integrityIssue: false };
  }
  const passage = getDocument(result, documentId)?.passages.find((p) => p.id === match.passageId) ?? null;
  if (!passage) {
    return { match, status: 'not_established', passage: null, integrityIssue: true };
  }
  return { match, status: match.status, passage, integrityIssue: false };
}

export function validateEvidence(result: InvestigationResult): {cited: number;verified: number;} {
  let cited = 0;
  let verified = 0;
  for (const m of result.evidenceMatches) {
    if (m.status === 'not_established') continue;
    cited += 1;
    const resolved = resolveEvidence(result, m.featureId, m.documentId);
    if (resolved && !resolved.integrityIssue) verified += 1;
  }
  return { cited, verified };
}

export interface Coverage {
  supported: number;
  partial: number;
  notEstablished: number;
}

export function featureCoverage(result: InvestigationResult, featureId: string): Coverage {
  return result.documents.reduce<Coverage>(
    (acc, d) => {
      const status = resolveEvidence(result, featureId, d.id)?.status ?? 'not_established';
      if (status === 'supported') acc.supported += 1;else
      if (status === 'partial') acc.partial += 1;else
      acc.notEstablished += 1;
      return acc;
    },
    { supported: 0, partial: 0, notEstablished: 0 }
  );
}

export function documentCoverage(result: InvestigationResult, documentId: string): Coverage {
  return result.features.reduce<Coverage>(
    (acc, f) => {
      const status = resolveEvidence(result, f.id, documentId)?.status ?? 'not_established';
      if (status === 'supported') acc.supported += 1;else
      if (status === 'partial') acc.partial += 1;else
      acc.notEstablished += 1;
      return acc;
    },
    { supported: 0, partial: 0, notEstablished: 0 }
  );
}

/** Features that no document fully supports. */
export function featuresNeedingInvestigation(result: InvestigationResult): TechnicalFeature[] {
  return result.features.filter((f) => featureCoverage(result, f.id).supported === 0);
}

/** Cited (supported / partial) matches for a document, used to show which features a passage evidences. */
export function citationsForDocument(result: InvestigationResult, documentId: string): ResolvedEvidence[] {
  return result.features.
  map((f) => resolveEvidence(result, f.id, documentId)).
  filter((r): r is ResolvedEvidence => !!r && r.passage !== null);
}
