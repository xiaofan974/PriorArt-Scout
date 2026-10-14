import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requestFeatureExtraction, ExtractionApiError } from '../api/extractFeaturesClient';
import { isLiveExtractionAdvertised } from '../config/liveExtraction';
import { createDemoInvestigationResult } from '../data/demoResult';
import { createLiveExtractionPendingResult, createLiveExtractionResult } from '../data/liveResult';
import { deriveTitle } from '../utils/deriveTitle';
import { investigationAvailability } from './investigationAvailability';
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
  result: InvestigationResult | null;
  extractionError: string | null;
  liveExtractionEnabled: boolean;
  exampleDescription: string;
  availability: Record<InvestigationView, boolean>;
  setDescription: (value: string) => void;
  applyExample: () => void;
  startDemo: () => void;
  startLive: () => void;
  retryExtraction: () => void;
  navigate: (view: InvestigationView) => void;
  /** The workflow screen the user came from before opening the Research Guide. */
  returnView: WorkflowView;
  returnFromGuide: () => void;
  startNew: () => void;
}

export function useInvestigation(): InvestigationState {
  const exampleDescription = createDemoInvestigationResult().invention.description;
  const liveExtractionEnabled = isLiveExtractionAdvertised();
  const [view, setView] = useState<InvestigationView>('new');
  const [description, setDescription] = useState('');
  const [submittedDescription, setSubmittedDescription] = useState('');
  const [status, setStatus] = useState<InvestigationStatus>('idle');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [returnView, setReturnView] = useState<WorkflowView>('new');
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const extractAbort = useRef<AbortController | null>(null);

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

  const availability = useMemo(() => investigationAvailability(status), [status]);

  const applyExample = useCallback(() => {
    setDescription(exampleDescription);
  }, [exampleDescription]);

  const startDemo = useCallback(() => {
    extractAbort.current?.abort();
    setExtractionError(null);
    setSubmittedDescription(exampleDescription);
    setDescription(exampleDescription);
    setResult(createDemoInvestigationResult());
    setCompletedSteps(0);
    setStatus('running');
    setView('workspace');
  }, [exampleDescription]);

  const runLiveExtraction = useCallback(async (text: string) => {
    extractAbort.current?.abort();
    const controller = new AbortController();
    extractAbort.current = controller;
    setExtractionError(null);
    setSubmittedDescription(text);
    setResult(createLiveExtractionPendingResult(text));
    setCompletedSteps(1);
    setStatus('extracting');
    setView('workspace');
    try {
      const features = await requestFeatureExtraction(text, controller.signal);
      if (controller.signal.aborted) return;
      const live = createLiveExtractionResult(text, features);
      setResult(live);
      setCompletedSteps(live.traceSteps.length);
      setStatus('extracted');
    } catch (error) {
      if (controller.signal.aborted) return;
      const message =
      error instanceof ExtractionApiError ?
      error.message :
      'Feature extraction could not be completed. Please try again.';
      setExtractionError(message);
      setStatus('extraction_failed');
    }
  }, []);

  const startLive = useCallback(() => {
    const trimmed = description.trim();
    if (!trimmed) return;
    void runLiveExtraction(trimmed);
  }, [description, runLiveExtraction]);

  const retryExtraction = useCallback(() => {
    if (!submittedDescription) return;
    void runLiveExtraction(submittedDescription);
  }, [runLiveExtraction, submittedDescription]);

  const navigate = useCallback(
    (next: InvestigationView) => {
      if (!availability[next]) return;
      if (next === 'guide' && view !== 'guide') setReturnView(view);
      setView(next);
    },
    [availability, view]
  );

  const returnFromGuide = useCallback(() => {
    setView(availability[returnView] ? returnView : 'new');
  }, [availability, returnView]);

  const startNew = useCallback(() => {
    extractAbort.current?.abort();
    const next = createIdleInvestigationState();
    setDescription(next.description);
    setSubmittedDescription(next.submittedDescription);
    setCompletedSteps(next.completedSteps);
    setStatus(next.status);
    setReturnView(next.returnView);
    setResult(next.result);
    setExtractionError(null);
    setView(next.view);
  }, []);

  const title =
  status === 'idle' ?
  'New investigation' :
  result?.mode === 'demonstration' ?
  result.invention.title :
  deriveTitle(submittedDescription || description);

  return {
    view,
    description,
    submittedDescription,
    status,
    completedSteps,
    totalSteps: traceSteps.length,
    title,
    result,
    extractionError,
    liveExtractionEnabled,
    exampleDescription,
    availability,
    setDescription,
    applyExample,
    startDemo,
    startLive,
    retryExtraction,
    navigate,
    returnView,
    returnFromGuide,
    startNew
  };
}
