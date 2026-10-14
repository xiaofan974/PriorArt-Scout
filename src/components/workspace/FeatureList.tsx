import { motion } from 'framer-motion';
import { features } from '../../data/demoInvestigation';
import { locatePhrase } from '../../utils/sourcePhrase';

interface FeatureListProps {
  description: string;
  activeFeatureId: string | null;
  onSelectFeature: (featureId: string) => void;
}

export function FeatureList({ description, activeFeatureId, onSelectFeature }: FeatureListProps) {
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
      {features.map((f, i) => {
        const active = activeFeatureId === f.id;
        const inDescription = locatePhrase(description, f.sourcePhrase) !== null;
        return (
          <motion.li
            key={f.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}>
            
            <button
              type="button"
              onClick={() => onSelectFeature(f.id)}
              aria-pressed={active}
              aria-label={`${f.id} ${f.label}. ${active ? 'Hide' : 'Show'} source phrase in description.`}
              className={`grid w-full gap-x-4 gap-y-1 px-4 py-3 text-left transition-[background-color,box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:grid-cols-[44px_minmax(0,1fr)_minmax(0,0.8fr)] ${
              active ? 'bg-accent-soft/60 shadow-[inset_2px_0_0_#0F766E]' : 'hover:bg-canvas'}`
              }>
              
              <span className="font-mono text-xs font-medium text-accent sm:pt-0.5">{f.id}</span>
              <span className="block min-w-0">
                <span className="block text-sm font-medium text-ink">{f.label}</span>
                <span className="mt-0.5 block text-[13px] text-ink-3">{f.detail}</span>
              </span>
              <span className="block text-xs leading-snug text-ink-3 sm:pt-0.5">
                <span className="text-ink-4">{inDescription ? 'From description: ' : 'From example description: '}</span>
                <span className={active ? 'text-accent-ink' : 'text-ink-2'}>“{f.sourcePhrase}”</span>
              </span>
            </button>
          </motion.li>);

      })}
    </ol>);

}