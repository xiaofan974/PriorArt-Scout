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
 * Live extraction returns the same InvestigationResult shape with mode: 'live'
 * and empty search/document/evidence arrays.
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
