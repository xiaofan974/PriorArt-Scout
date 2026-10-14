export type InvestigationView = 'new' | 'workspace' | 'report' | 'guide';

/** Views that belong to the investigation workflow (excludes reference pages such as the guide). */
export type WorkflowView = Exclude<InvestigationView, 'guide'>;

export type InvestigationStatus =
  | 'idle'
  | 'running'
  | 'complete'
  | 'extracting'
  | 'extracted'
  | 'extraction_failed'
  | 'retrieved'
  | 'assessed'
  | 'epo_searching'
  | 'epo_ready'
  | 'epo_failed';

export type MatchStatus = 'supported' | 'partial' | 'not_established';

/** Relationship between one invention feature and one stored corpus passage. */
export type AssessmentLabel = 'explicit_overlap' | 'partial_overlap' | 'insufficient_evidence';

export interface EvidenceAssessment {
  featureId: string;
  publicationId: string;
  passageId: string;
  assessment: AssessmentLabel;
  explanation: string;
  unresolvedDifferences: string[];
  provenance: string;
}

/** A feature and publication pair with no relevant stored passage. */
export interface AssessmentGap {
  featureId: string;
  publicationId: string;
  note: string;
}

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
  section: 'Abstract' | 'Summary' | 'Description' | 'Claim';
  text: string;
  /** Section or claim label for a curated patent passage. */
  reference?: string;
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

/** Whether an investigation payload is synthetic demonstration data or a live result. */
export type InvestigationDataMode = 'demonstration' | 'live' | 'curated';

/** Trace step counts after which each workspace section becomes available during replay. */
export interface RevealAfterStep {
  features: number;
  queries: number;
  documents: number;
  comparison: number;
}

/**
 * One complete investigation payload. UI screens render from this object;
 * a future `/api/investigate` response should return the same shape.
 */
export interface InvestigationResult {
  invention: Invention;
  mode: InvestigationDataMode;
  features: TechnicalFeature[];
  searchQueries: SearchQuery[];
  documents: CandidateDocument[];
  evidenceMatches: EvidenceMatch[];
  /** Present only after a reviewed curated assessment. Absent for demonstration and retrieval. */
  assessments?: EvidenceAssessment[];
  /** Feature and publication pairs that have no cited passage. */
  assessmentGaps?: AssessmentGap[];
  researchGaps: ResearchGaps;
  traceSteps: TraceStep[];
  revealAfterStep: RevealAfterStep;
}