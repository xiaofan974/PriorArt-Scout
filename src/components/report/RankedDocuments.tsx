import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { StatusGlyph } from '../StatusGlyph';
import { RelevanceMeter } from '../RelevanceMeter';
import { documents, features } from '../../data/demoInvestigation';
import { citationsForDocument, documentCoverage, resolveEvidence } from '../../utils/evidence';
import { statusStyles } from '../../utils/matchStatus';
import type { MatrixSelection } from '../../types/investigation';

interface RankedDocumentsProps {
  onInspect: (selection: MatrixSelection) => void;
}

export function RankedDocuments({ onInspect }: RankedDocumentsProps) {
  const [expanded, setExpanded] = useState<string | null>(documents[0]?.id ?? null);

  return (
    <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
      {documents.map((doc) => {
        const open = expanded === doc.id;
        const coverage = documentCoverage(doc.id);
        const panelId = `ranked-${doc.id}`;
        return (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() => setExpanded(open ? null : doc.id)}
              aria-expanded={open}
              aria-controls={panelId}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-canvas focus:outline-none focus-visible:bg-canvas focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
              
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-subtle font-mono text-[11px] font-medium text-ink-2">
                {doc.rank}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] text-ink-3">{doc.id}</span>
                <span className="mt-0.5 block text-[13px] font-semibold leading-snug text-ink">{doc.title}</span>
                <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="flex items-center gap-1" aria-label={`${coverage.supported} supported, ${coverage.partial} partially supported`}>
                    {features.map((f) => {
                      const s = resolveEvidence(f.id, doc.id)?.status ?? 'not_established';
                      return (
                        <span key={f.id} className={statusStyles[s].text} title={`${f.id}: ${statusStyles[s].label}`}>
                          <StatusGlyph status={s} className="h-3 w-3" />
                        </span>);

                    })}
                  </span>
                  <RelevanceMeter level={doc.relevance} />
                </span>
              </span>
              <ChevronDownIcon
                className={`mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                aria-hidden="true" />
              
            </button>
            <AnimatePresence initial={false}>
              {open &&
              <motion.div
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden">
                
                  <div className="px-4 pb-4 pl-12">
                    <p className="text-[13px] leading-relaxed text-ink-2">{doc.summary}</p>
                    <ul className="mt-3 space-y-1">
                      {citationsForDocument(doc.id).map(({ match, status, passage }) =>
                    <li key={match.featureId}>
                          <button
                        type="button"
                        onClick={() => onInspect({ featureId: match.featureId, documentId: doc.id })}
                        className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        
                            <span className={statusStyles[status].text}>
                              <StatusGlyph status={status} className="h-3 w-3" />
                            </span>
                            <span className="font-mono text-ink-2">{match.featureId}</span>
                            <span className="text-ink-3">cited in passage {passage?.id}</span>
                            <span className="ml-auto font-medium text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                              Inspect
                            </span>
                          </button>
                        </li>
                    )}
                    </ul>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </li>);

      })}
    </ol>);

}