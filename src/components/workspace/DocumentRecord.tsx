import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { RelevanceMeter } from '../RelevanceMeter';
import { StatusGlyph } from '../StatusGlyph';
import { citationsForDocument } from '../../utils/evidence';
import { statusStyles } from '../../utils/matchStatus';
import type { CandidateDocument } from '../../types/investigation';

interface DocumentRecordProps {
  document: CandidateDocument;
  comparisonReady: boolean;
  expanded: boolean;
  onToggle: () => void;
}

export function DocumentRecord({ document, comparisonReady, expanded, onToggle }: DocumentRecordProps) {
  const citations = citationsForDocument(document.id);
  const panelId = `${document.id}-evidence`;

  return (
    <article className="rounded-xl border border-line bg-white">
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-xs font-medium text-ink-2">{document.id}</span>
          <span className="rounded border border-line px-1.5 py-px text-[10px] font-medium text-ink-3">Synthetic</span>
          <span className="ml-auto">
            <RelevanceMeter level={document.relevance} />
          </span>
        </div>
        <h3 className="mt-2 text-[15px] font-semibold text-ink">{document.title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{document.abstract}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <ul className="flex flex-wrap gap-1.5" aria-label="Relevant technical concepts">
            {document.concepts.map((c) =>
            <li key={c} className="rounded-md bg-subtle px-2 py-0.5 text-xs text-ink-2">
                {c}
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={onToggle}
            disabled={!comparisonReady}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:text-ink-4">
            
            {comparisonReady ? 'Inspect evidence' : 'Comparing…'}
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true" />
            
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded &&
        <motion.div
          id={panelId}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden">
          
            <div className="border-t border-line bg-canvas px-4 py-4 sm:px-5">
              <p className="text-xs font-medium text-ink-3">
                {citations.length} cited passage{citations.length === 1 ? '' : 's'} from this document
              </p>
              <ul className="mt-3 space-y-3">
                {citations.map(({ match, status, passage }) =>
              passage ?
              <li key={match.featureId} className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                      <div className={`flex items-start gap-1.5 text-xs font-medium ${statusStyles[status].text}`}>
                        <StatusGlyph status={status} className="mt-px h-3.5 w-3.5" />
                        <span>
                          {match.featureId} · {statusStyles[status].label}
                        </span>
                      </div>
                      <blockquote className="border-l-2 border-line-strong pl-3 text-[13px] leading-relaxed text-ink">
                        “{passage.text}”
                        <span className="mt-1 block font-mono text-[11px] text-ink-3">
                          Passage {passage.id} · {passage.section}
                        </span>
                      </blockquote>
                    </li> :
              null
              )}
              </ul>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </article>);

}