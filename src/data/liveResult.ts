import { deriveTitle } from '../utils/deriveTitle';
import type { InvestigationResult, ResearchGaps, TechnicalFeature } from '../types/investigation';

export const EMPTY_RESEARCH_GAPS: ResearchGaps = {
  featureNotes: [],
  ambiguities: [],
  coverageLimitations: [],
  nextSteps: []
};

const NOT_PERFORMED_STEP = 100;

export function createLiveExtractionPendingResult(description: string): InvestigationResult {
  return {
    invention: {
      id: 'live-extraction',
      title: deriveTitle(description),
      description
    },
    mode: 'live',
    features: [],
    searchQueries: [],
    documents: [],
    evidenceMatches: [],
    researchGaps: EMPTY_RESEARCH_GAPS,
    traceSteps: [
    {
      id: 'T1',
      label: 'Invention description received',
      tool: 'intake.receive',
      result: 'Plain-language description accepted for analysis.',
      simulatedMs: 0
    },
    {
      id: 'T2',
      label: 'Extracting technical features',
      tool: 'features.extract',
      result: '',
      simulatedMs: 0
    }],

    revealAfterStep: {
      features: NOT_PERFORMED_STEP,
      queries: NOT_PERFORMED_STEP,
      documents: NOT_PERFORMED_STEP,
      comparison: NOT_PERFORMED_STEP
    }
  };
}

export function createLiveExtractionResult(
  description: string,
  features: TechnicalFeature[]
): InvestigationResult {
  const range =
  features.length === 0 ? 'No discrete technical features identified.' : `${features[0].id}–${features[features.length - 1].id} identified, each linked to an exact source phrase.`;
  return {
    invention: {
      id: 'live-extraction',
      title: deriveTitle(description),
      description
    },
    mode: 'live',
    features,
    searchQueries: [],
    documents: [],
    evidenceMatches: [],
    researchGaps: EMPTY_RESEARCH_GAPS,
    traceSteps: [
    {
      id: 'T1',
      label: 'Invention description received',
      tool: 'intake.receive',
      result: 'Plain-language description accepted for analysis.',
      simulatedMs: 0
    },
    {
      id: 'T2',
      label:
      features.length === 1 ?
      'One technical feature extracted' :
      `${features.length} technical features extracted`,
      tool: 'features.extract',
      result: range,
      simulatedMs: 0
    }],

    revealAfterStep: {
      features: 2,
      queries: NOT_PERFORMED_STEP,
      documents: NOT_PERFORMED_STEP,
      comparison: NOT_PERFORMED_STEP
    }
  };
}
