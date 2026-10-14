export type InvestigationView = 'new' | 'workspace' | 'report' | 'guide';

/** Views that belong to the investigation workflow (excludes reference pages such as the guide). */
export type WorkflowView = Exclude<InvestigationView, 'guide'>;

export type InvestigationStatus = 'idle' | 'running' | 'complete';

export type MatchStatus = 'supported' | 'partial' | 'not_established';

export type RelevanceLevel = 'high' | 'medium' | 'low';

export interface Invention {
  id: string;
  title: string;
  description: string;
}

export interface TechnicalFeature {
  id: string;
  label: string;
  detail: string;
  /** Exact phrase from the invention description the feature was derived from. */
  sourcePhrase: string;
}

export interface SearchQuery {
  id: string;
  concept: string;
  terms: string[];
  featureIds: string[];
  retrievedDocumentIds: string[];
}

export interface SourcePassage {
  id: string;
  section: 'Abstract' | 'Summary' | 'Description';
  text: string;
}

export interface CandidateDocument {
  id: string;
  rank: number;
  title: string;
  abstract: string;
  concepts: string[];
  relevance: RelevanceLevel;
  summary: string;
  passages: SourcePassage[];
}

interface EvidenceMatchBase {
  featureId: string;
  documentId: string;
  explanation: string;
  limitations: string[];
}

/** Supported or partial matches must always reference a stored source passage. */
export interface CitedEvidenceMatch extends EvidenceMatchBase {
  status: 'supported' | 'partial';
  passageId: string;
}

export interface UnestablishedEvidenceMatch extends EvidenceMatchBase {
  status: 'not_established';
}

export type EvidenceMatch = CitedEvidenceMatch | UnestablishedEvidenceMatch;

export interface TraceStep {
  id: string;
  label: string;
  tool: string;
  result: string;
  simulatedMs: number;
}

export interface FeatureGapNote {
  featureId: string;
  note: string;
}

export interface NextStep {
  title: string;
  detail: string;
}

export interface ResearchGaps {
  featureNotes: FeatureGapNote[];
  ambiguities: string[];
  coverageLimitations: string[];
  nextSteps: NextStep[];
}

export interface MatrixSelection {
  featureId: string;
  documentId: string;
}