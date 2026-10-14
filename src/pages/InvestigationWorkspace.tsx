import { useRef, useState } from 'react';
import { ArrowRightIcon, InfoIcon, RotateCcwIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../components/SectionHeader';
import { PendingRows } from '../components/PendingRows';
import { FeatureList } from '../components/workspace/FeatureList';
import { SearchStrategy } from '../components/workspace/SearchStrategy';
import { DocumentRecord } from '../components/workspace/DocumentRecord';
import { InvestigationTrace } from '../components/workspace/InvestigationTrace';
import { InventionDescription } from '../components/workspace/InventionDescription';
import { NotPerformed } from '../components/workspace/NotPerformed';
import type { InvestigationResult, InvestigationStatus } from '../types/investigation';

interface InvestigationWorkspaceProps {
  result: InvestigationResult;
  submittedDescription: string;
  status: InvestigationStatus;
  completedSteps: number;
  extractionError: string | null;
  onViewReport: () => void;
  onStartNew: () => void;
  onRetry: () => void;
}

export function InvestigationWorkspace({
  result,
  submittedDescription,
  status,
  completedSteps,
  extractionError,
  onViewReport,
  onStartNew,
  onRetry
}: InvestigationWorkspaceProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLElement>(null);

  const selectFeature = (featureId: string) => {
    const next = activeFeatureId === featureId ? null : featureId;
    setActiveFeatureId(next);
    const el = descriptionRef.current;
    // 72px ≈ top bar height plus breathing room; scroll only if the description is out of view.
    if (next && el && el.getBoundingClientRect().top < 72) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const { features, searchQueries, documents, traceSteps, revealAfterStep, mode } = result;
  const live = mode === 'live';
  const complete = status === 'complete';
  const extracted = status === 'extracted';
  const failed = status === 'extraction_failed';
  const showFeatures = live ? extracted : completedSteps >= revealAfterStep.features;
  const showQueries = !live && completedSteps >= revealAfterStep.queries;
  const showDocuments = !live && completedSteps >= revealAfterStep.documents;
  const comparisonReady = !live && completedSteps >= revealAfterStep.comparison;
  const currentStep = traceSteps[completedSteps];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="min-w-0">
          <header>
            <h1 className="text-2xl font-semibold tracking-[-0.01em] text-ink">
              {live && failed ?
              'Feature extraction' :
              live && extracted ?
              'Technical features' :
              live ?
              'Extracting technical features' :
              'Investigating your invention'}
            </h1>
            <p className="mt-1.5 text-sm text-ink-2" aria-live="polite">
              {complete ?
              `Investigation complete. ${documents.length} candidate documents are ready for review.` :
              extracted ?
              'Feature extraction complete. Patent search and evidence comparison were not performed.' :
              failed ?
              'Feature extraction could not be completed.' :
              `Working on: ${currentStep?.label.toLowerCase() ?? 'finishing up'}…`}
            </p>
          </header>

          <InventionDescription
            ref={descriptionRef}
            description={submittedDescription}
            features={features}
            activeFeatureId={activeFeatureId}
            showPhrases={showFeatures}
            onClear={() => setActiveFeatureId(null)} />
          

          {live &&
          <div className="mt-3 flex gap-2.5 rounded-lg border border-partial-line bg-partial-soft px-4 py-3">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-partial" aria-hidden="true" />
              <p className="text-[13px] leading-relaxed text-ink-2">
                Live workflow: technical feature extraction only. Patent search, document retrieval, and evidence
                comparison were not performed. This is not a novelty or patentability assessment.
              </p>
            </div>
          }

          {failed && extractionError &&
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-partial-line bg-partial-soft px-4 py-3">
              <p className="text-[13px] leading-relaxed text-ink-2">{extractionError}</p>
              <button
              type="button"
              onClick={onRetry}
              className="font-medium text-accent transition-colors duration-150 hover:text-accent-hover focus:outline-none focus-visible:underline">
              
                Retry extraction
              </button>
            </div>
          }

          <section className="mt-9" aria-labelledby="features-heading">
            <SectionHeader
              id="features-heading"
              title="Extracted technical features"
              description="Select a feature to highlight the exact phrase it was derived from."
              meta={showFeatures ? `${features.length} features` : undefined} />
            
            {showFeatures ?
            <FeatureList
              features={features}
              description={submittedDescription}
              activeFeatureId={activeFeatureId}
              onSelectFeature={selectFeature} /> :


            <PendingRows rows={4} label="Waiting for feature extraction…" />
            }
          </section>

          <section className="mt-9" aria-labelledby="strategy-heading">
            <SectionHeader
              id="strategy-heading"
              title="Search strategy"
              description={live ? 'Patent search was not performed.' : 'Generated search concepts and the features each one targets.'}
              meta={showQueries ? `${searchQueries.length} queries` : undefined} />
            
            {live ?
            <NotPerformed label="Patent search is not part of live feature extraction." /> :
            showQueries ?
            <SearchStrategy queries={searchQueries} showResults={completedSteps >= revealAfterStep.documents} /> :

            <PendingRows rows={3} label="Search concepts will appear after features are extracted." />
            }
          </section>

          <section className="mt-9" aria-labelledby="documents-heading">
            <SectionHeader
              id="documents-heading"
              title="Candidate documents"
              description={live ? 'Document retrieval was not performed.' : 'Synthetic demonstration records, ranked by feature overlap.'}
              meta={showDocuments ? `${documents.length} retrieved` : undefined} />
            
            {live ?
            <NotPerformed label="No patent documents were retrieved for this description." /> :
            showDocuments ?
            <div className="space-y-3">
                {documents.map((doc, i) =>
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}>
                
                    <DocumentRecord
                  result={result}
                  document={doc}
                  comparisonReady={comparisonReady}
                  expanded={expandedDoc === doc.id}
                  onToggle={() => setExpandedDoc((cur) => cur === doc.id ? null : doc.id)} />
                
                  </motion.div>
              )}
              </div> :

            <PendingRows rows={3} label="Documents will appear once the corpus has been searched." />
            }
          </section>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={onStartNew}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-subtle hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              
              <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Start new investigation
            </button>
            <button
              type="button"
              onClick={onViewReport}
              disabled={!complete}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-ink-4">
              
              {live ? 'Evidence report unavailable' : 'View evidence report'}
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <InvestigationTrace
            result={result}
            status={status}
            completedSteps={completedSteps}
            onViewReport={onViewReport} />
        </aside>
      </div>
    </div>);

}