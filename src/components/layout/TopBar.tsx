import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, MenuIcon } from 'lucide-react';
import { StatusPill } from '../StatusPill';
import type { InvestigationStatus, InvestigationView } from '../../types/investigation';

interface TopBarProps {
  view: InvestigationView;
  availability: Record<InvestigationView, boolean>;
  title: string;
  status: InvestigationStatus;
  completedSteps: number;
  totalSteps: number;
  onNavigate: (view: InvestigationView) => void;
  onOpenMobileNav: () => void;
  returnLabel: string;
  onReturn: () => void;
}

const steps: {view: InvestigationView;label: string;}[] = [
{ view: 'new', label: 'Describe' },
{ view: 'workspace', label: 'Investigate' },
{ view: 'report', label: 'Report' }];


export function TopBar({
  view,
  availability,
  title,
  status,
  completedSteps,
  totalSteps,
  onNavigate,
  onOpenMobileNav,
  returnLabel,
  onReturn
}: TopBarProps) {
  const currentIndex = steps.findIndex((s) => s.view === view);
  const doneThrough =
  status === 'complete' ? 1 : status === 'running' || status === 'extracting' || status === 'extracted' || status === 'extraction_failed' ? 0 : -1;

  return (
    <header className="relative flex h-14 shrink-0 items-center gap-3 border-b border-line bg-canvas px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="-ml-1 rounded-md p-1.5 text-ink-2 transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
        aria-label="Open navigation">
        
        <MenuIcon className="h-4 w-4" />
      </button>

      {view === 'guide' ?
      <>
          <div className="flex min-w-0 items-center gap-2 text-[13px]">
            <span className="hidden text-ink-3 sm:inline">Help</span>
            <ChevronRightIcon className="hidden h-3.5 w-3.5 text-ink-4 sm:block" aria-hidden="true" />
            <span className="truncate font-medium text-ink">Research Guide</span>
          </div>
          <button
          type="button"
          onClick={onReturn}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-2 transition-colors duration-150 hover:bg-subtle hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="whitespace-nowrap">{returnLabel}</span>
          </button>
        </> :

      <div className="flex min-w-0 items-center gap-2 text-[13px]">
          <span className="hidden text-ink-3 sm:inline">Investigations</span>
          <ChevronRightIcon className="hidden h-3.5 w-3.5 text-ink-4 sm:block" aria-hidden="true" />
          <span className="truncate font-medium text-ink">{title}</span>
          <StatusPill status={status} completedSteps={completedSteps} totalSteps={totalSteps} />
        </div>
      }

      <nav className={`ml-auto hidden items-center ${view === 'guide' ? '' : 'md:flex'}`} aria-label="Investigation steps">
        <ol className="flex items-center gap-1">
          {steps.map((step, i) => {
            const active = i === currentIndex;
            const enabled = availability[step.view];
            const done = i <= doneThrough && !active;
            return (
              <li key={step.view} className="flex items-center gap-1">
                {i > 0 && <span className="h-px w-4 bg-line-strong" aria-hidden="true" />}
                <button
                  type="button"
                  disabled={!enabled}
                  onClick={() => onNavigate(step.view)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active ?
                  'bg-white font-medium text-ink shadow-[0_0_0_1px_#E7E5E0]' :
                  enabled ?
                  'text-ink-2 hover:bg-subtle' :
                  'cursor-not-allowed text-ink-4'}`
                  }>
                  
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold ${
                    done ? 'bg-accent text-white' : active ? 'bg-ink text-white' : 'border border-line-strong text-ink-3'}`
                    }
                    aria-hidden="true">
                    
                    {done ? <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {step.label}
                </button>
              </li>);

          })}
        </ol>
      </nav>

      {(status === 'running' || status === 'extracting') &&
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-line" aria-hidden="true">
          <div
          className="h-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${totalSteps === 0 ? 0 : completedSteps / totalSteps * 100}%` }} />
        
        </div>
      }
    </header>);

}