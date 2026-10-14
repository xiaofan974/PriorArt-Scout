import { motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';
import { searchQueries } from '../../data/demoInvestigation';

interface SearchStrategyProps {
  showResults: boolean;
}

export function SearchStrategy({ showResults }: SearchStrategyProps) {
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {searchQueries.map((q, i) =>
      <motion.li
        key={q.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col rounded-xl border border-line bg-white px-4 py-3.5">
        
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-mono">{q.id}</span>
          </div>
          <p className="mt-2 text-sm font-medium leading-snug text-ink">{q.concept}</p>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-3">{q.terms.join(' · ')}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <div className="flex flex-wrap gap-1">
              {q.featureIds.map((id) =>
            <span key={id} className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-ink-2">
                  {id}
                </span>
            )}
            </div>
            <span className="whitespace-nowrap text-[11px] text-ink-3">
              {showResults ? `${q.retrievedDocumentIds.length} hits` : 'Queued'}
            </span>
          </div>
        </motion.li>
      )}
    </ul>);

}