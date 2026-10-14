import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requestFeatureExtraction, ExtractionApiError } from '../api/extractFeaturesClient';
import { PatentSearchApiError, requestPatentSearch } from '../api/searchPatentsClient';
import { isLiveEpoAdvertised } from '../config/liveEpo';
import type { EpoSearchPayload } from '../epo/contract';
import { isLiveExtractionAdvertised } from '../config/liveExtraction';
import { createDemoInvestigationResult } from '../data/demoResult';
import { createHelmetAssessmentResult } from '../assessment/helmetAssessment';
import { validateCuratedAssessment } from '../assessment/validateAssessment';
import { createCuratedResearchResult } from '../data/curatedResult';
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
  startCurated: () => void;
  startCuratedAssessment: () => void;
  startEpoSearch: (query: string) => void;
  liveEpoAdvertised: boolean;
  epoSearch: EpoSearchPayload | null;
  epoQuery: string;
  epoError: string | null;
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
  const [epoSearch, setEpoSearch] = useState<EpoSearchPayload | null>(null);
  const [epoError, setEpoError] = useState<string | null>(null);
  const [epoQuery, setEpoQuery] = useState('');
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

  const availability = useMemo(() => investigationAvailability(status, result), [status, result]);

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

  const startCurated = useCallback(() => {
    const trimmed = description.trim();
    if (!trimmed || trimmed === exampleDescription) return;
    extractAbort.current?.abort();
    setExtractionError(null);
    setSubmittedDescription(trimmed);
    const curated = createCuratedResearchResult(trimmed);
    setResult(curated);
    setCompletedSteps(curated.traceSteps.length);
    setStatus('retrieved');
    setView('workspace');
  }, [description, exampleDescription]);

  const startCuratedAssessment = useCallback(() => {
    if (description.trim() !== exampleDescription) return;
    extractAbort.current?.abort();
    setExtractionError(null);
    const assessed = createHelmetAssessmentResult();
    const validation = validateCuratedAssessment(assessed);
    setSubmittedDescription(exampleDescription);
    setResult(assessed);
    setCompletedSteps(assessed.traceSteps.length);
    setStatus(validation.ok ? 'assessed' : 'retrieved');
    setView('workspace');
  }, [description, exampleDescription]);

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

  const startEpoSearch = useCallback((query: string) => {
    extractAbort.current?.abort();
    const controller = new AbortController();
    extractAbort.current = controller;
    setResult(null);
    setExtractionError(null);
    setEpoSearch(null);
    setEpoError(null);
    setEpoQuery(query);
    setCompletedSteps(0);
    setStatus('epo_searching');
    setView('workspace');
    void requestPatentSearch(query, controller.signal)
      .then((payload) => {
        if (controller.signal.aborted) return;
        setEpoSearch(payload);
        setStatus('epo_ready');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof PatentSearchApiError
          ? error.message
          : 'EPO OPS search could not be completed.';
        setEpoError(message);
        setStatus('epo_failed');
      });
  }, []);

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
    setEpoSearch(null);
    setEpoError(null);
    setEpoQuery('');
    setView(next.view);
  }, []);

  const title =
  status === 'idle' ?
  'New investigation' :
  result?.mode === 'demonstration' ?
  result.invention.title :
  result?.mode === 'curated' ?
  result.invention.title :
  status === 'epo_searching' || status === 'epo_ready' || status === 'epo_failed' ?
  'Live EPO Search' :
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
    startCurated,
    startCuratedAssessment,
    startEpoSearch,
    liveEpoAdvertised: isLiveEpoAdvertised(),
    epoSearch,
    epoQuery,
    epoError,
    retryExtraction,
    navigate,
    returnView,
    returnFromGuide,
    startNew
  };
}
