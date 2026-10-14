import type { InvestigationStatus, InvestigationView } from '../types/investigation';

/** Report unlocks only after a complete demonstration investigation, never after live extraction. */
export function investigationAvailability(
  status: InvestigationStatus
): Record<InvestigationView, boolean> {
  return {
    new: true,
    workspace: status !== 'idle',
    report: status === 'complete',
    guide: true
  };
}
