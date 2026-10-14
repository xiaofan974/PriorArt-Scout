import { documents, features } from '../data/demoInvestigation';
import { evidenceMatches } from '../data/demoEvidence';
import type {
  CandidateDocument,
  EvidenceMatch,
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

export function getFeature(id: string): TechnicalFeature | undefined {
  return features.find((f) => f.id === id);
}

export function getDocument(id: string): CandidateDocument | undefined {
  return documents.find((d) => d.id === id);
}

export function findMatch(featureId: string, documentId: string): EvidenceMatch | undefined {
  return evidenceMatches.find((m) => m.featureId === featureId && m.documentId === documentId);
}

/**
 * Resolves a match to its stored source passage. If a supported / partial match
 * cannot be traced to a passage, the status is downgraded so no claim is shown without evidence.
 */
export function resolveEvidence(featureId: string, documentId: string): ResolvedEvidence | null {
  const match = findMatch(featureId, documentId);
  if (!match) return null;
  if (match.status === 'not_established') {
    return { match, status: 'not_established', passage: null, integrityIssue: false };
  }
  const passage = getDocument(documentId)?.passages.find((p) => p.id === match.passageId) ?? null;
  if (!passage) {
    return { match, status: 'not_established', passage: null, integrityIssue: true };
  }
  return { match, status: match.status, passage, integrityIssue: false };
}

export function validateEvidence(): {cited: number;verified: number;} {
  let cited = 0;
  let verified = 0;
  for (const m of evidenceMatches) {
    if (m.status === 'not_established') continue;
    cited += 1;
    const resolved = resolveEvidence(m.featureId, m.documentId);
    if (resolved && !resolved.integrityIssue) verified += 1;
  }
  return { cited, verified };
}

export interface Coverage {
  supported: number;
  partial: number;
  notEstablished: number;
}

export function featureCoverage(featureId: string): Coverage {
  return documents.reduce<Coverage>(
    (acc, d) => {
      const status = resolveEvidence(featureId, d.id)?.status ?? 'not_established';
      if (status === 'supported') acc.supported += 1;else
      if (status === 'partial') acc.partial += 1;else
      acc.notEstablished += 1;
      return acc;
    },
    { supported: 0, partial: 0, notEstablished: 0 }
  );
}

export function documentCoverage(documentId: string): Coverage {
  return features.reduce<Coverage>(
    (acc, f) => {
      const status = resolveEvidence(f.id, documentId)?.status ?? 'not_established';
      if (status === 'supported') acc.supported += 1;else
      if (status === 'partial') acc.partial += 1;else
      acc.notEstablished += 1;
      return acc;
    },
    { supported: 0, partial: 0, notEstablished: 0 }
  );
}

/** Features that no document fully supports. */
export function featuresNeedingInvestigation(): TechnicalFeature[] {
  return features.filter((f) => featureCoverage(f.id).supported === 0);
}

/** Cited (supported / partial) matches for a document, used to show which features a passage evidences. */
export function citationsForDocument(documentId: string): ResolvedEvidence[] {
  return features.
  map((f) => resolveEvidence(f.id, documentId)).
  filter((r): r is ResolvedEvidence => !!r && r.passage !== null);
}