import { useCallback, useEffect, useMemo, useState } from 'react';
import { createDemoInvestigationResult } from '../data/demoResult';
import { createIdleInvestigationState } from './investigationState';
import type {
  InvestigationResult,
  InvestigationStatus,
  InvestigationView,
  WorkflowView } from
'../types/investigation';

export interface InvestigationState {
  view: InvestigationView;
  description: string;
  submittedDescription: string;
  status: InvestigationStatus;
  completedSteps: number;
  totalSteps: number;
  title: string;
  isCustomInput: boolean;
  result: InvestigationResult | null;
  availability: Record<InvestigationView, boolean>;
  setDescription: (value: string) => void;
  applyExample: () => void;
  start: () => void;
  navigate: (view: InvestigationView) => void;
  /** The workflow screen the user came from before opening the Research Guide. */
  returnView: WorkflowView;
  returnFromGuide: () => void;
  startNew: () => void;
}

/**
 * Owns the investigation lifecycle and the active InvestigationResult.
 * Milestone 2 can replace the demo adapter call in `start` with a backend request
 * that returns the same InvestigationResult shape; the UI replay stays the same.
 */
export function useInvestigation(): InvestigationState {
  const [view, setView] = useState<InvestigationView>('new');
  const [description, setDescription] = useState('');
  const [submittedDescription, setSubmittedDescription] = useState('');
  const [status, setStatus] = useState<InvestigationStatus>('idle');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [returnView, setReturnView] = useState<WorkflowView>('new');
  const [result, setResult] = useState<InvestigationResult | null>(null);

  const traceSteps = result?.traceSteps ?? [];

  useEffect(() => {
    if (status !== 'running' || !result) return;
    if (completedSteps >= result.traceSteps.length) {
      setStatus('complete');
      return;
    }
    const timer = window.setTimeout(
      () => setCompletedSteps((n) => n + 1),
      result.traceSteps[completedSteps].simulatedMs
    );
    return () => window.clearTimeout(timer);
  }, [status, completedSteps, result]);

  const availability = useMemo<Record<InvestigationView, boolean>>(
    () => ({ new: true, workspace: status !== 'idle', report: status === 'complete', guide: true }),
    [status]
  );

  const applyExample = useCallback(() => {
    setDescription(createDemoInvestigationResult().invention.description);
  }, []);

  const start = useCallback(() => {
    const trimmed = description.trim();
    if (!trimmed) return;
    // Milestone 1 always loads the demonstration payload. Custom text is stored
    // but not analysed; the workspace banner discloses this.
    setSubmittedDescription(trimmed);
    setResult(createDemoInvestigationResult());
    setCompletedSteps(0);
    setStatus('running');
    setView('workspace');
  }, [description]);

  const navigate = useCallback(
    (next: InvestigationView) => {
      if (!availability[next]) return;
      // Remember where the user came from so the guide can send them back without touching investigation state.
      if (next === 'guide' && view !== 'guide') setReturnView(view);
      setView(next);
    },
    [availability, view]
  );

  const returnFromGuide = useCallback(() => {
    setView(availability[returnView] ? returnView : 'new');
  }, [availability, returnView]);

  const startNew = useCallback(() => {
    const next = createIdleInvestigationState();
    setDescription(next.description);
    setSubmittedDescription(next.submittedDescription);
    setCompletedSteps(next.completedSteps);
    setStatus(next.status);
    setReturnView(next.returnView);
    setResult(next.result);
    setView(next.view);
  }, []);

  const isCustomInput =
  submittedDescription !== '' && result !== null && submittedDescription !== result.invention.description;
  const title =
  status === 'idle' ?
  'New investigation' :
  isCustomInput ?
  deriveTitle(submittedDescription) :
  result?.invention.title ?? deriveTitle(submittedDescription);

  return {
    view,
    description,
    submittedDescription,
    status,
    completedSteps,
    totalSteps: traceSteps.length,
    title,
    isCustomInput,
    result,
    availability,
    setDescription,
    applyExample,
    start,
    navigate,
    returnView,
    returnFromGuide,
    startNew
  };
}

function deriveTitle(text: string): string {
  const words = text.replace(/\s+/g, ' ').split(' ');
  const head = words.slice(0, 7).join(' ').replace(/[.,;:]$/, '');
  return words.length > 7 ? `${head}…` : head;
}
