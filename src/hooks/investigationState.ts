import type {
  InvestigationResult,
  InvestigationStatus,
  InvestigationView,
  WorkflowView } from
'../types/investigation';

/** Serializable slice of investigation lifecycle state (excludes callbacks). */
export interface InvestigationSnapshot {
  view: InvestigationView;
  description: string;
  submittedDescription: string;
  status: InvestigationStatus;
  completedSteps: number;
  returnView: WorkflowView;
  result: InvestigationResult | null;
}

export function createIdleInvestigationState(): InvestigationSnapshot {
  return {
    view: 'new',
    description: '',
    submittedDescription: '',
    status: 'idle',
    completedSteps: 0,
    returnView: 'new',
    result: null
  };
}
