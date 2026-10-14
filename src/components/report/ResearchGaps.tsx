import React from 'react';
import { researchGaps } from '../../data/researchGaps';
import { featuresNeedingInvestigation, resolveEvidence } from '../../utils/evidence';
import type { MatrixSelection } from '../../types/investigation';
import { documents } from '../../data/demoInvestigation';

interface ResearchGapsProps {
  onInspect: (selection: MatrixSelection) => void;
}

export function ResearchGaps({ onInspect }: ResearchGapsProps) {
  const incomplete = featuresNeedingInvestigation();

  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-white">
      <GapGroup title="Features with incomplete supporting evidence">
        <ul className="space-y-3">
          {incomplete.map((f) => {
            const note = researchGaps.featureNotes.find((n) => n.featureId === f.id)?.note;
            return (
              <li key={f.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[13px] font-medium text-ink">
                    <span className="mr-2 font-mono text-xs text-partial">{f.id}</span>
                    {f.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const firstCited =
                      documents.find((d) => resolveEvidence(f.id, d.id)?.passage) ?? documents[0];
                      onInspect({ featureId: f.id, documentId: firstCited.id });
                    }}
                    className="text-xs font-medium text-accent transition-colors duration-150 hover:text-accent-hover focus:outline-none focus-visible:underline">
                    
                    Inspect evidence
                  </button>
                </div>
                {note && <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{note}</p>}
              </li>);

          })}
        </ul>
      </GapGroup>

      <GapGroup title="Ambiguities in the invention description">
        <BulletList items={researchGaps.ambiguities} />
      </GapGroup>

      <GapGroup title="Search coverage limitations">
        <BulletList items={researchGaps.coverageLimitations} />
      </GapGroup>

      <GapGroup title="Recommended next research steps">
        <ol className="space-y-2.5">
          {researchGaps.nextSteps.map((step, i) =>
          <li key={step.title} className="grid grid-cols-[20px_minmax(0,1fr)] gap-2">
              <span className="pt-px font-mono text-xs text-accent">{i + 1}</span>
              <p className="text-[13px] leading-relaxed text-ink-2">
                <span className="font-medium text-ink">{step.title}. </span>
                {step.detail}
              </p>
            </li>
          )}
        </ol>
      </GapGroup>
    </div>);

}

function GapGroup({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section className="px-4 py-4 sm:px-5">
      <h3 className="mb-2.5 text-xs font-semibold text-ink">{title}</h3>
      {children}
    </section>);

}

function BulletList({ items }: {items: string[];}) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) =>
      <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-2">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink-4" aria-hidden="true" />
          {item}
        </li>
      )}
    </ul>);

}