import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, CheckCircle2Icon, ChevronDownIcon, CircleIcon, Loader2Icon } from 'lucide-react';
import { validateEvidence } from '../../utils/evidence';
import { validateSourcePhrases } from '../../utils/sourcePhrase';
import type { InvestigationResult, InvestigationStatus } from '../../types/investigation';

interface InvestigationTraceProps {
  result: InvestigationResult;
  status: InvestigationStatus;
  completedSteps: number;
  onViewReport: () => void;
}

export function InvestigationTrace({ result, status, completedSteps, onViewReport }: InvestigationTraceProps) {
  const [collapsed, setCollapsed] = useState(false);
  const complete = status === 'complete';
  const assessed = status === 'assessed' && Boolean(result.assessments?.length);
  const liveDone = status === 'extracted';
  const inProgress = status === 'running' || status === 'extracting';
  const live = result.mode === 'live';
  const curated = result.mode === 'curated';

  // Always expanded while the investigation runs.
  useEffect(() => {
    if (inProgress) setCollapsed(false);
  }, [inProgress]);

  const { features, searchQueries, documents, traceSteps, revealAfterStep } = result;
  const elapsedMs = traceSteps.slice(0, completedSteps).reduce((sum, s) => sum + s.simulatedMs, 0);
  const evidence = validateEvidence(result);
  const phrases = validateSourcePhrases(result.invention.description, features);
  const isCollapsed = (complete || liveDone) && collapsed;
  const finished = complete || liveDone;

  const summary: {label: string;value: string;}[] = [
  { label: 'Elapsed', value: `${(elapsedMs / 1000).toFixed(1)}s` },
  { label: 'Tool calls', value: `${completedSteps} of ${traceSteps.length}` },
  { label: 'Features', value: completedSteps >= revealAfterStep.features ? String(features.length) : '—' },
  { label: 'Queries', value: live ? 'Not performed' : curated || completedSteps >= revealAfterStep.queries ? String(searchQueries.length) : '—' },
  { label: 'Documents', value: live ? 'Not performed' : curated || completedSteps >= revealAfterStep.documents ? String(documents.length) : '—' },
  {
    label: assessed ? 'Assessments' : 'Comparisons',
    value: assessed ? String(result.assessments?.length ?? 0) : live || curated ? 'Not performed' : completedSteps >= revealAfterStep.comparison ? String(features.length * documents.length) : '—'
  },
  { label: 'Source phrases', value: finished ? `${phrases.verified} of ${phrases.total}` : '—' },
  { label: 'Excerpts verified', value: live ? 'Not performed' : complete ? `${evidence.verified} of ${evidence.cited}` : '—' }];


  const headingContent =
  <>
      <h2 id="trace-heading" className="text-sm font-semibold text-ink">
        Investigation trace
      </h2>
      <span className="ml-auto font-mono text-[11px] text-ink-3">
        {completedSteps}/{traceSteps.length} steps
      </span>
    </>;


  return (
    <section aria-labelledby="trace-heading" className="rounded-xl border border-line bg-white">
      {complete || liveDone ?
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!isCollapsed}
        aria-controls="trace-body"
        className={`flex w-full items-center gap-2 rounded-t-xl px-4 py-3 text-left transition-colors duration-150 hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
        isCollapsed ? '' : 'border-b border-line'}`
        }>
        
          {headingContent}
          <ChevronDownIcon
          className={`h-4 w-4 text-ink-3 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
          aria-hidden="true" />
        
          <span className="sr-only">{isCollapsed ? 'Expand trace' : 'Collapse trace'}</span>
        </button> :

      <div className="flex items-center gap-2 border-b border-line px-4 py-3">{headingContent}</div>
      }

      {isCollapsed &&
      <p className="flex items-center gap-2 border-t border-line px-4 py-3 text-xs text-ink-2">
          <CheckCircle2Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          All {traceSteps.length} steps completed in {(elapsedMs / 1000).toFixed(1)}s · {evidence.verified} of{' '}
          {evidence.cited} excerpts verified
        </p>
      }

      <AnimatePresence initial={false}>
        {!isCollapsed &&
        <motion.div
          id="trace-body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden">
          
            <ol className="px-4 py-4" aria-live="polite">
              {traceSteps.map((step, i) => {
              const state =
              i < completedSteps ? 'done' : i === completedSteps && inProgress ? 'active' : 'pending';
              const isLast = i === traceSteps.length - 1;
              return (
                <li key={step.id} className={`relative flex gap-3 ${isLast ? '' : 'pb-4'}`}>
                    {!isLast &&
                  <span
                    className={`absolute bottom-0 left-[8.5px] top-5 w-px ${state === 'done' ? 'bg-accent/40' : 'bg-line'}`}
                    aria-hidden="true" />

                  }
                    <span className="relative mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center bg-white">
                      {state === 'done' && <CheckCircle2Icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />}
                      {state === 'active' && <Loader2Icon className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />}
                      {state === 'pending' && <CircleIcon className="h-4 w-4 text-ink-4" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-[13px] font-medium ${state === 'pending' ? 'text-ink-3' : 'text-ink'}`}>
                          {step.label}
                        </p>
                        {state === 'done' && step.simulatedMs > 0 &&
                      <span className="shrink-0 font-mono text-[11px] text-ink-3">
                            {(step.simulatedMs / 1000).toFixed(1)}s
                          </span>
                      }
                      </div>
                      <p className="font-mono text-[11px] text-ink-3">{step.tool}</p>
                      {state === 'done' && <p className="mt-1 text-xs leading-snug text-ink-2">{step.result}</p>}
                      {state === 'active' && <p className="mt-1 text-xs text-accent">Running…</p>}
                      <span className="sr-only">
                        {state === 'done' ? 'Completed' : state === 'active' ? 'In progress' : 'Pending'}
                      </span>
                    </div>
                  </li>);

            })}
            </ol>

            <div className="border-t border-line px-4 py-3">
              <h3 className="text-xs font-medium text-ink-3">Execution summary</h3>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {summary.map((row) =>
              <div key={row.label} className="flex items-baseline justify-between gap-2">
                    <dt className="text-xs text-ink-3">{row.label}</dt>
                    <dd className="font-mono text-xs text-ink">{row.value}</dd>
                  </div>
              )}
              </dl>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <div className="border-t border-line px-4 py-4">
        <button
          type="button"
          onClick={onViewReport}
          disabled={!complete && !assessed}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-ink-4">
          
          {complete || assessed ? 'View evidence report' : live || curated ? 'Evidence report unavailable' : 'Investigation in progress…'}
          {(complete || assessed) && <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
        <p className="mt-3 text-[11px] leading-snug text-ink-3">
          {assessed ?
          'Curated evidence assessment — limited patent corpus. Not a comprehensive prior-art search or a legal opinion.' :
          curated ?
          'Keyword overlap in a preselected corpus. Not a disclosure finding or a full prior-art search.' :
          live ?
          'Records feature extraction only. Patent search and comparison were not run.' :
          'Shows observable tool actions and their results. Timings are simulated; no live AI or patent database calls are made.'}
        </p>
      </div>
    </section>);

}