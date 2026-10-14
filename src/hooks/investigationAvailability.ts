import { validateCuratedAssessment } from '../assessment/validateAssessment';
import type { InvestigationResult, InvestigationStatus, InvestigationView } from '../types/investigation';

/**
 * The evidence report unlocks for a finished synthetic demonstration, or for a curated
 * assessment whose citations have been validated. Retrieval and live extraction stay locked.
 */
export function investigationAvailability(
  status: InvestigationStatus,
  result?: InvestigationResult | null
): Record<InvestigationView, boolean> {
  const assessed =
    status === 'assessed' &&
    result != null &&
    validateCuratedAssessment(result).ok;
  return {
    new: true,
    workspace: status !== 'idle',
    report: status === 'complete' || assessed,
    guide: true
  };
}
