import React from 'react';
import { ArrowRightIcon, FileCheck2Icon, FilePlus2Icon, WorkflowIcon } from 'lucide-react';
import { screenGuides, workflowSteps } from '../../data/researchGuide';
import type { InvestigationView, WorkflowView } from '../../types/investigation';

interface WorkflowOverviewProps {
  availability: Record<InvestigationView, boolean>;
  onNavigate: (view: InvestigationView) => void;
}

const screenIcons: Record<WorkflowView, typeof FilePlus2Icon> = {
  new: FilePlus2Icon,
  workspace: WorkflowIcon,
  report: FileCheck2Icon
};

const lockedHints: Record<WorkflowView, string> = {
  new: '',
  workspace: 'Available after you start an investigation',
  report: 'Available when an investigation completes'
};

export function WorkflowOverview({ availability, onNavigate }: WorkflowOverviewProps) {
  return (
    <>
      <ol className="grid gap-x-5 gap-y-5 sm:grid-cols-2 md:grid-cols-5">
        {workflowSteps.map((step) =>
        <li key={step.number} className="border-t border-line-strong pt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] text-accent">{step.number}</span>
              <p className="text-[13px] font-semibold text-ink">{step.title}</p>
            </div>
            <p className="mt-1.5 text-[13px] leading-snug text-ink-2">{step.text}</p>
          </li>
        )}
      </ol>

      <div className="mt-8">
        <h3 className="text-[13px] font-semibold text-ink">The three application screens</h3>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {screenGuides.map((screen) => {
            const Icon = screenIcons[screen.view];
            const enabled = availability[screen.view];
            return (
              <li key={screen.view} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap">
                <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink">{screen.name}</p>
                  <p className="text-[13px] text-ink-3">{screen.text}</p>
                </div>
                {enabled ?
                <button
                  type="button"
                  onClick={() => onNavigate(screen.view)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors duration-150 hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  
                    Open
                    <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
                  </button> :

                <span className="shrink-0 text-[11px] text-ink-4">{lockedHints[screen.view]}</span>
                }
              </li>);

          })}
        </ul>
      </div>
    </>);

}