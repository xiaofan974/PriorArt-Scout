import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon, XIcon } from 'lucide-react';
import { StatusGlyph } from '../StatusGlyph';
import { getDocument, getFeature, resolveEvidence } from '../../utils/evidence';
import { statusStyles } from '../../utils/matchStatus';
import type { InvestigationResult, MatrixSelection } from '../../types/investigation';

interface EvidenceInspectorProps {
  result: InvestigationResult;
  selection: MatrixSelection | null;
  onSelect: (selection: MatrixSelection) => void;
  onClose: () => void;
}

export function EvidenceInspector({ result, selection, onSelect, onClose }: EvidenceInspectorProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = selection !== null;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {selection &&
      <div className="fixed inset-0 z-50">
          <motion.div
          className="absolute inset-0 bg-ink/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose} />
        
          <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspector-title"
          className="absolute inset-y-0 right-0 flex w-full max-w-[540px] flex-col border-l border-line bg-white shadow-[0_0_40px_rgba(23,33,43,0.12)]"
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 32, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}>
          
            <InspectorBody result={result} selection={selection} onSelect={onSelect} onClose={onClose} closeRef={closeRef} />
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}

interface InspectorBodyProps {
  result: InvestigationResult;
  selection: MatrixSelection;
  onSelect: (selection: MatrixSelection) => void;
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement>;
}

function InspectorBody({ result, selection, onSelect, onClose, closeRef }: InspectorBodyProps) {
  const { features, documents } = result;
  const feature = getFeature(result, selection.featureId);
  const document = getDocument(result, selection.documentId);
  const resolved = resolveEvidence(result, selection.featureId, selection.documentId);
  const featureIndex = features.findIndex((f) => f.id === selection.featureId);
  const prevFeature = features[featureIndex - 1];
  const nextFeature = features[featureIndex + 1];

  if (!feature || !document || !resolved) return null;
  const style = statusStyles[resolved.status];

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 id="inspector-title" className="text-sm font-semibold text-ink">
          Evidence inspector
        </h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-ink-3 transition-colors duration-150 hover:bg-subtle hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Close evidence inspector">
          
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <section aria-label="Selected invention feature">
          <p className="text-xs font-medium text-ink-3">Invention feature</p>
          <p className="mt-1.5 flex gap-2.5 text-[15px] font-semibold leading-snug text-ink">
            <span className="pt-0.5 font-mono text-xs font-medium text-accent">{feature.id}</span>
            {feature.label}
          </p>
          <p className="mt-1 text-[13px] text-ink-3">{feature.detail}</p>
        </section>

        <section className="mt-5" aria-label="Selected demonstration document">
          <p className="text-xs font-medium text-ink-3">Compared against</p>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-subtle p-1" role="tablist" aria-label="Documents">
            {documents.map((d) => {
              const s = resolveEvidence(result, feature.id, d.id)?.status ?? 'not_established';
              const active = d.id === document.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelect({ featureId: feature.id, documentId: d.id })}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-[11px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active ? 'bg-white text-ink shadow-[0_0_0_1px_#E7E5E0]' : 'text-ink-3 hover:text-ink'}`
                  }>
                  
                  <span className={statusStyles[s].text}>
                    <StatusGlyph status={s} className="h-3 w-3" />
                  </span>
                  <span className="whitespace-nowrap">{d.id.replace('DEMO-PAT-', 'PAT-')}</span>
                </button>);

            })}
          </div>
          <p className="mt-2.5 text-sm font-medium text-ink">{document.title}</p>
          <p className="font-mono text-[11px] text-ink-3">{document.id} · Synthetic demonstration document</p>
        </section>

        <div className={`mt-5 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] font-semibold ${style.bg} ${style.border} ${style.text}`}>
          <StatusGlyph status={resolved.status} className="h-4 w-4" />
          {style.label}
        </div>

        <section className="mt-5" aria-labelledby="excerpt-heading">
          <h3 id="excerpt-heading" className="text-xs font-medium text-ink-3">
            Source excerpt
          </h3>
          {resolved.passage ?
          <figure className="mt-2 rounded-lg border border-line bg-canvas px-4 py-3.5">
              <blockquote className="text-[14px] leading-relaxed text-ink">“{resolved.passage.text}”</blockquote>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
                <span className="font-mono text-[11px] text-ink-3">
                  {document.id} · Passage {resolved.passage.id} · {resolved.passage.section}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                  <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Matches stored source text
                </span>
              </figcaption>
            </figure> :

          <div className="mt-2 rounded-lg border border-dashed border-line-strong px-4 py-3.5">
              <p className="text-[13px] text-ink-2">
                {resolved.integrityIssue ?
              'A cited passage could not be traced to the stored document, so the status has been withheld.' :
              'No passage in the stored demonstration text addresses this feature, so no excerpt is cited.'}
              </p>
            </div>
          }
        </section>

        <section className="mt-5" aria-labelledby="explanation-heading">
          <h3 id="explanation-heading" className="text-xs font-medium text-ink-3">
            Comparison
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{resolved.match.explanation}</p>
        </section>

        <section className="mt-5" aria-labelledby="limitations-heading">
          <h3 id="limitations-heading" className="text-xs font-medium text-ink-3">
            Evidence limitations
          </h3>
          <ul className="mt-1.5 space-y-1.5">
            {resolved.match.limitations.map((l) =>
            <li key={l} className="flex gap-2 text-[13px] leading-relaxed text-ink-2">
                <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-partial" aria-hidden="true" />
                {l}
              </li>
            )}
            <li className="flex gap-2 text-[13px] leading-relaxed text-ink-2">
              <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-partial" aria-hidden="true" />
              Based on stored excerpts from a synthetic document, not a full-text reading of a real patent.
            </li>
          </ul>
        </section>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-5 py-3">
        <button
          type="button"
          disabled={!prevFeature}
          onClick={() => prevFeature && onSelect({ featureId: prevFeature.id, documentId: document.id })}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:text-ink-4 disabled:hover:bg-transparent">
          
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          {prevFeature ? prevFeature.id : 'Previous'}
        </button>
        <span className="font-mono text-[11px] text-ink-3">
          Feature {featureIndex + 1} of {features.length}
        </span>
        <button
          type="button"
          disabled={!nextFeature}
          onClick={() => nextFeature && onSelect({ featureId: nextFeature.id, documentId: document.id })}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:text-ink-4 disabled:hover:bg-transparent">
          
          {nextFeature ? nextFeature.id : 'Next'}
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </>);

}