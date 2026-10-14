import React, { forwardRef } from 'react';
import { XIcon } from 'lucide-react';
import { locatePhrase, segmentDescription } from '../../utils/sourcePhrase';
import type { TechnicalFeature } from '../../types/investigation';

interface InventionDescriptionProps {
  description: string;
  features: TechnicalFeature[];
  activeFeatureId: string | null;
  showPhrases: boolean;
  onClear: () => void;
}

export const InventionDescription = forwardRef<HTMLElement, InventionDescriptionProps>(function InventionDescription(
{ description, features, activeFeatureId, showPhrases, onClear },
ref)
{
  const segments = segmentDescription(description, showPhrases ? features : []);
  const activeFeature = features.find((f) => f.id === activeFeatureId) ?? null;
  const activeMissing = activeFeature !== null && locatePhrase(description, activeFeature.sourcePhrase) === null;

  return (
    <section
      ref={ref}
      className="mt-6 scroll-mt-6 rounded-xl border border-line bg-white px-4 py-3.5 sm:px-5"
      aria-label="Invention description">
      
      <div className="flex min-h-[22px] flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-ink-3">Invention description</p>
        {activeFeature &&
        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft py-0.5 pl-2 pr-1 text-[11px] font-medium text-accent-ink">
            Source of {activeFeature.id}
            <button
            type="button"
            onClick={onClear}
            className="rounded p-0.5 transition-colors duration-150 hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Clear source highlight">
            
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        }
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink" aria-live="polite">
        {segments.map((seg, i) => {
          if (!seg.featureId) return <React.Fragment key={i}>{seg.text}</React.Fragment>;
          const active = seg.featureId === activeFeatureId;
          return (
            <mark
              key={i}
              data-feature={seg.featureId}
              className={`rounded-[3px] text-ink transition-colors duration-150 ${
              active ?
              'bg-accent-soft px-0.5 text-accent-ink shadow-[0_0_0_1px_rgba(15,118,110,0.3)]' :
              'bg-transparent underline decoration-line-strong decoration-dotted underline-offset-4'}`
              }>
              
              {seg.text}
              {active && <span className="sr-only"> (source phrase for {seg.featureId})</span>}
            </mark>);

        })}
      </p>
      {activeMissing &&
      <p className="mt-2 text-xs text-partial">
          This phrase does not appear in the submitted description and is not shown as a source quotation.
        </p>
      }
    </section>);

});