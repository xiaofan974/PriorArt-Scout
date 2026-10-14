import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { curatedCorpus } from '../../data/curatedCorpus';
import { assessmentStyles } from '../../assessment/assessmentLabels';
import { assessmentsFor, gapFor, storedPassageText } from '../../assessment/validateAssessment';
import { getDocument, getFeature } from '../../utils/evidence';
import type { InvestigationResult, MatrixSelection } from '../../types/investigation';

interface CuratedInspectorProps {
  result: InvestigationResult;
  selection: MatrixSelection | null;
  onSelect: (selection: MatrixSelection) => void;
  onClose: () => void;
}

export function CuratedInspector({ result, selection, onSelect, onClose }: CuratedInspectorProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = selection !== null;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
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
            <CuratedInspectorBody
              result={result}
              selection={selection}
              onSelect={onSelect}
              onClose={onClose}
              closeRef={closeRef} />
          </motion.aside>
        </div>
      }
    </AnimatePresence>
  );
}

interface BodyProps {
  result: InvestigationResult;
  selection: MatrixSelection;
  onSelect: (selection: MatrixSelection) => void;
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement>;
}

export function CuratedInspectorBody({ result, selection, onSelect, onClose, closeRef }: BodyProps) {
  const feature = getFeature(result, selection.featureId);
  const document = getDocument(result, selection.documentId);
  const featureIndex = result.features.findIndex((item) => item.id === selection.featureId);
  const prevFeature = result.features[featureIndex - 1];
  const nextFeature = result.features[featureIndex + 1];
  if (!feature || !document) return null;

  const assessments = assessmentsFor(result, feature.id, document.id);
  const gap = gapFor(result, feature.id, document.id);
  const publication = curatedCorpus.publications.find((item) => item.id === document.id);

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 id="inspector-title" className="text-sm font-semibold text-ink">Evidence inspector</h2>
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
          <p className="text-xs font-medium text-ink-3">Technical feature</p>
          <p className="mt-1.5 flex gap-2.5 text-[15px] font-semibold leading-snug text-ink">
            <span className="pt-0.5 font-mono text-xs font-medium text-accent">{feature.id}</span>
            {feature.label}
          </p>
        </section>

        <section className="mt-5" aria-label="Selected publication">
          <p className="text-xs font-medium text-ink-3">Patent publication</p>
          <p className="mt-1.5 font-mono text-sm font-medium text-ink">{document.id}</p>
          <p className="mt-1 text-sm text-ink">{document.title}</p>
          {publication &&
          <a
            href={publication.sourceUrl}
            className="mt-1 inline-block text-[13px] font-medium text-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer">
            {publication.sourceUrl}
          </a>}
        </section>

        {assessments.length === 0 &&
        <section className="mt-5" aria-label="Research gap">
            <p className="text-xs font-medium text-ink-3">Research gap</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{gap?.note ?? 'No stored passage was assessed for this feature and publication.'}</p>
            <p className="mt-2 text-[13px] text-ink-2">No passage is cited.</p>
          </section>
        }

        {assessments.map((assessment) => {
          const passage = document.passages.find((item) => item.id === assessment.passageId);
          const text = storedPassageText(result, assessment);
          const style = assessmentStyles[assessment.assessment];
          return (
            <section key={assessment.passageId} className="mt-5 border-t border-line pt-5" aria-label={assessment.passageId}>
              <p className="font-mono text-[11px] text-ink-3">
                {document.id} · {passage?.reference ?? passage?.section} · {assessment.passageId}
              </p>
              <div className={`mt-2 inline-flex rounded-md border px-2.5 py-1.5 text-[13px] font-semibold ${style.bg} ${style.border} ${style.text}`}>
                {style.label}
              </div>
              <h3 className="mt-4 text-xs font-medium text-ink-3">Stored passage</h3>
              {text && passage ?
              <figure className="mt-2 rounded-lg border border-line bg-canvas px-4 py-3.5">
                  <blockquote className="text-[14px] leading-relaxed text-ink">“{passage.text}”</blockquote>
                </figure> :
              <p className="mt-2 text-[13px] text-ink-2">The cited passage could not be traced to the stored corpus, so the source text is withheld.</p>}
              <h3 className="mt-4 text-xs font-medium text-ink-3">Assessment explanation</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{assessment.explanation}</p>
              <h3 className="mt-4 text-xs font-medium text-ink-3">Unresolved technical differences</h3>
              <ul className="mt-1.5 space-y-1.5">
                {assessment.unresolvedDifferences.map((difference) =>
                <li key={difference} className="flex gap-2 text-[13px] leading-relaxed text-ink-2">
                    <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-partial" aria-hidden="true" />
                    {difference}
                  </li>
                )}
              </ul>
              <p className="mt-3 font-mono text-[11px] text-ink-3">Provenance {assessment.provenance}</p>
            </section>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-5 py-3">
        <button
          type="button"
          disabled={!prevFeature}
          onClick={() => prevFeature && onSelect({ featureId: prevFeature.id, documentId: document.id })}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:text-ink-4">
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          {prevFeature ? prevFeature.id : 'Previous'}
        </button>
        <span className="font-mono text-[11px] text-ink-3">Feature {featureIndex + 1} of {result.features.length}</span>
        <button
          type="button"
          disabled={!nextFeature}
          onClick={() => nextFeature && onSelect({ featureId: nextFeature.id, documentId: document.id })}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:text-ink-4">
          {nextFeature ? nextFeature.id : 'Next'}
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
