import { evidenceMatches } from './demoEvidence';
import {
  documents,
  exampleInvention,
  features,
  revealAfterStep,
  searchQueries,
  traceSteps } from
'./demoInvestigation';
import { researchGaps } from './researchGaps';
import type { InvestigationResult } from '../types/investigation';

/**
 * Assembles the synthetic helmet dataset into a single InvestigationResult.
 * Milestone 2 can replace `createDemoInvestigationResult()` with an API response
 * of the same shape without changing rendering components.
 */
export function createDemoInvestigationResult(): InvestigationResult {
  return {
    invention: exampleInvention,
    mode: 'demonstration',
    features,
    searchQueries,
    documents,
    evidenceMatches,
    researchGaps,
    traceSteps,
    revealAfterStep: {
      features: revealAfterStep.features,
      queries: revealAfterStep.queries,
      documents: revealAfterStep.documents,
      comparison: revealAfterStep.comparison
    }
  };
}
