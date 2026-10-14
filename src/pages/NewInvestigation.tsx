import { ArrowRightIcon, InfoIcon, SparklesIcon } from 'lucide-react';
import { MIN_DESCRIPTION_LENGTH } from '../config/limits';
import { resolveStartAction } from '../hooks/startAction';

interface NewInvestigationProps {
  description: string;
  exampleDescription: string;
  liveExtractionEnabled: boolean;
  hasOpenInvestigation: boolean;
  onDescriptionChange: (value: string) => void;
  onTryExample: () => void;
  onStartDemo: () => void;
  onStartLive: () => void;
  onStartCurated: () => void;
  onResume: () => void;
}

const workflow = [
{ title: 'Extract features', text: 'Break the description into discrete technical features.' },
{ title: 'Search patents', text: 'Plan queries and retrieve candidate documents.' },
{ title: 'Compare evidence', text: 'Match each feature to cited source passages.' },
{ title: 'Review findings', text: 'Inspect support, gaps, and open questions.' }];


export function NewInvestigation({
  description,
  exampleDescription,
  liveExtractionEnabled,
  hasOpenInvestigation,
  onDescriptionChange,
  onTryExample,
  onStartDemo,
  onStartLive,
  onStartCurated,
  onResume
}: NewInvestigationProps) {
  const length = description.trim().length;
  const action = resolveStartAction(description, exampleDescription, liveExtractionEnabled);
  const canSubmit = action === 'demo' || action === 'live' || action === 'curated';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
      {hasOpenInvestigation &&
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white px-4 py-3 text-[13px]">
          <p className="text-ink-2">You have an open investigation. Starting a new one will replace it.</p>
          <button
          type="button"
          onClick={onResume}
          className="font-medium text-accent transition-colors duration-150 hover:text-accent-hover focus:outline-none focus-visible:underline">
          
            Return to workspace
          </button>
        </div>
      }

      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">
        What would you like to investigate?
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">
        Describe an invention in plain English. The helmet example runs the full synthetic demonstration. Other
        descriptions can search a small curated patent corpus, or extract features when live extraction is enabled.
      </p>

      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (action === 'demo') onStartDemo();
          if (action === 'live') onStartLive();
          if (action === 'curated') onStartCurated();
        }}>
        
        <div className="rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(23,33,43,0.04)] transition-[border-color,box-shadow] duration-150 focus-within:border-accent/50 focus-within:shadow-[0_0_0_3px_rgba(15,118,110,0.12)]">
          <label htmlFor="invention-description" className="sr-only">
            Invention description
          </label>
          <textarea
            id="invention-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
                if (action === 'demo') onStartDemo();
                if (action === 'live') onStartLive();
                if (action === 'curated') onStartCurated();
              }
            }}
            rows={8}
            placeholder="e.g. A device that… using… and automatically…"
            className="block min-h-[220px] w-full resize-y rounded-t-xl bg-transparent px-5 py-4 text-[15px] leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none"
            aria-describedby="description-hint" />
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2.5">
            <button
              type="button"
              onClick={onTryExample}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-subtle hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              
              <SparklesIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              Try example
              <span className="hidden font-normal text-ink-3 sm:inline">· Helmet demonstration</span>
            </button>
            <div className="flex items-center gap-3">
              <span id="description-hint" className="hidden text-xs text-ink-3 sm:inline">
                {action === 'too_short' ?
                `${Math.max(MIN_DESCRIPTION_LENGTH - length, 0)} more characters needed` :
                action === 'demo' ?
                'Runs the synthetic demonstration' :
                action === 'live' ?
                'Extracts features only · no patent search' :
                action === 'curated' ?
                'Curated Research · limited patent corpus' :
                'Live extraction is not available'}
              </span>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-[#0E161E] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-ink-4">
                
                {action === 'live' ?
                'Extract technical features' :
                action === 'curated' ?
                'Search curated corpus' :
                'Start demonstration'}
                <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {action === 'live' &&
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white px-4 py-3">
          <p className="text-[13px] leading-relaxed text-ink-2">
            Curated Research searches a limited, preselected patent corpus. It does not call a model and does not
            assess whether a feature is disclosed.
          </p>
          <button
            type="button"
            onClick={onStartCurated}
            className="font-medium text-accent transition-colors duration-150 hover:text-accent-hover focus:outline-none focus-visible:underline">
            Search curated corpus
          </button>
        </div>
      }

      {action === 'unavailable' &&
      <div className="mt-4 flex gap-2.5 rounded-lg border border-partial-line bg-partial-soft px-4 py-3">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-partial" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-ink-2">
            Live feature extraction is not enabled in this deployment. Use Try example to run the complete helmet
            demonstration, which does not require an API key.
          </p>
        </div>
      }

      <section className="mt-12" aria-labelledby="workflow-heading">
        <h2 id="workflow-heading" className="text-[13px] font-medium text-ink-3">
          How an investigation works
        </h2>
        <ol className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-4">
          {workflow.map((step, i) =>
          <li key={step.title} className="relative border-t border-line-strong pt-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-accent">{i + 1}</span>
                <p className="whitespace-nowrap text-[13px] font-semibold text-ink">{step.title}</p>
                {i < workflow.length - 1 &&
              <ArrowRightIcon className="ml-auto hidden h-3.5 w-3.5 text-ink-4 sm:block" aria-hidden="true" />
              }
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-ink-3">{step.text}</p>
            </li>
          )}
        </ol>
      </section>

      <div className="mt-10 flex gap-2.5 rounded-lg bg-subtle px-4 py-3">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-ink-2">
          The helmet demonstration uses a synthetic document corpus. Curated Research searches only a few preselected
          patent passages and does not provide comprehensive prior-art coverage. Neither workflow assesses novelty,
          patentability, infringement, or freedom to operate.
        </p>
      </div>
    </div>);

}
