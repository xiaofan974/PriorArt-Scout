import { relevanceLabels } from '../utils/matchStatus';
import type { RelevanceLevel } from '../types/investigation';

export function RelevanceMeter({ level }: {level: RelevanceLevel;}) {
  const { label, filled } = relevanceLabels[level];
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-ink-2">
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) =>
        <span key={i} className={`h-2.5 w-1.5 rounded-sm ${i < filled ? 'bg-accent' : 'bg-line'}`} />
        )}
      </span>
      {label}
    </span>);

}