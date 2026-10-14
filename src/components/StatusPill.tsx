import React from 'react';
import { Loader2Icon } from 'lucide-react';
import type { InvestigationStatus } from '../types/investigation';

interface StatusPillProps {
  status: InvestigationStatus;
  completedSteps: number;
  totalSteps: number;
}

export function StatusPill({ status, completedSteps, totalSteps }: StatusPillProps) {
  if (status === 'running') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-ink">
        <Loader2Icon className="h-3 w-3 animate-spin" aria-hidden="true" />
        Investigating
        <span className="font-mono text-[11px] text-accent">
          {completedSteps}/{totalSteps}
        </span>
      </span>);

  }
  if (status === 'complete') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-2 py-0.5 text-xs font-medium text-ink-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        Complete
      </span>);

  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-2 py-0.5 text-xs font-medium text-ink-3">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-4" aria-hidden="true" />
      Draft
    </span>);

}