import { useCallback, useEffect, useMemo, useState } from 'react';
import { exampleInvention, traceSteps } from '../data/demoInvestigation';
import type { InvestigationStatus, InvestigationView, WorkflowView } from '../types/investigation';

export interface InvestigationState {
  view: InvestigationView;
  description: string;
  submittedDescription: string;
  status: InvestigationStatus;
  completedSteps: number;
  totalSteps: number;
  title: string;
  isCustomInput: boolean;
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
 * Owns the investigation lifecycle. In production, `start` would call the backend
 * and stream trace steps; here it replays the synthetic trace with simulated timings.
 */
export function useInvestigation(): InvestigationState {
  const [view, setView] = useState<InvestigationView>('new');
  const [description, setDescription] = useState('');
  const [submittedDescription, setSubmittedDescription] = useState('');
  const [status, setStatus] = useState<InvestigationStatus>('idle');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [returnView, setReturnView] = useState<WorkflowView>('new');

  useEffect(() => {
    if (status !== 'running') return;
    if (completedSteps >= traceSteps.length) {
      setStatus('complete');
      return;
    }
    const timer = window.setTimeout(
      () => setCompletedSteps((n) => n + 1),
      traceSteps[completedSteps].simulatedMs
    );
    return () => window.clearTimeout(timer);
  }, [status, completedSteps]);

  const availability = useMemo<Record<InvestigationView, boolean>>(
    () => ({ new: true, workspace: status !== 'idle', report: status === 'complete', guide: true }),
    [status]
  );

  const applyExample = useCallback(() => setDescription(exampleInvention.description), []);

  const start = useCallback(() => {
    const trimmed = description.trim();
    if (!trimmed) return;
    setSubmittedDescription(trimmed);
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
    setDescription('');
    setSubmittedDescription('');
    setCompletedSteps(0);
    setStatus('idle');
    setReturnView('new');
    setView('new');
  }, []);

  const isCustomInput = submittedDescription !== '' && submittedDescription !== exampleInvention.description;
  const title =
  status === 'idle' ?
  'New investigation' :
  isCustomInput ?
  deriveTitle(submittedDescription) :
  exampleInvention.title;

  return {
    view,
    description,
    submittedDescription,
    status,
    completedSteps,
    totalSteps: traceSteps.length,
    title,
    isCustomInput,
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