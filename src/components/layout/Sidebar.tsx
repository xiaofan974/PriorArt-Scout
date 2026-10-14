import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenIcon, FileCheck2Icon, FilePlus2Icon, LockIcon, ScanSearchIcon, WorkflowIcon, XIcon } from 'lucide-react';
import { StatusPill } from '../StatusPill';
import type { InvestigationStatus, InvestigationView } from '../../types/investigation';

interface SidebarProps {
  view: InvestigationView;
  availability: Record<InvestigationView, boolean>;
  title: string;
  status: InvestigationStatus;
  completedSteps: number;
  totalSteps: number;
  mobileOpen: boolean;
  onNavigate: (view: InvestigationView) => void;
  onCloseMobile: () => void;
}

interface NavItem {
  view: InvestigationView;
  label: string;
  icon: typeof FilePlus2Icon;
  lockedHint: string;
}

const navItems: NavItem[] = [
{ view: 'new', label: 'New investigation', icon: FilePlus2Icon, lockedHint: '' },
{ view: 'workspace', label: 'Workspace', icon: WorkflowIcon, lockedHint: 'Start an investigation first' },
{ view: 'report', label: 'Evidence report', icon: FileCheck2Icon, lockedHint: 'Available when the investigation completes' }];


const guideItem: NavItem = { view: 'guide', label: 'Research Guide', icon: BookOpenIcon, lockedHint: '' };

function NavButton({ item, active, enabled, onClick }: {item: NavItem;active: boolean;enabled: boolean;onClick: () => void;}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      disabled={!enabled}
      title={enabled ? undefined : item.lockedHint}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
      active ?
      'bg-white font-medium text-ink shadow-[0_0_0_1px_#E7E5E0]' :
      enabled ?
      'text-ink-2 hover:bg-subtle hover:text-ink' :
      'cursor-not-allowed text-ink-4'}`
      }>
      
      <Icon className={`h-4 w-4 ${active ? 'text-accent' : ''}`} aria-hidden="true" />
      <span className="flex-1 whitespace-nowrap">{item.label}</span>
      {!enabled && <LockIcon className="h-3 w-3" aria-hidden="true" />}
    </button>);

}

export function Sidebar(props: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-line bg-canvas lg:flex">
        <SidebarContent {...props} />
      </aside>
      <AnimatePresence>
        {props.mobileOpen &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
            className="absolute inset-0 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={props.onCloseMobile} />
          
            <motion.aside
            className="relative flex h-full w-64 border-r border-line bg-canvas shadow-xl"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            aria-label="Navigation">
            
              <button
              type="button"
              onClick={props.onCloseMobile}
              className="absolute right-3 top-4 rounded-md p-1 text-ink-3 transition-colors duration-150 hover:bg-subtle hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close navigation">
              
                <XIcon className="h-4 w-4" />
              </button>
              <SidebarContent {...props} />
            </motion.aside>
          </div>
        }
      </AnimatePresence>
    </>);

}

function SidebarContent({ view, availability, title, status, completedSteps, totalSteps, onNavigate, onCloseMobile }: SidebarProps) {
  return (
    <div className="flex w-full flex-col px-3 py-4">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
          <ScanSearchIcon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-ink">PriorArt Scout</p>
          <p className="whitespace-nowrap text-[11px] leading-tight text-ink-3">Evidence-first patent research</p>
        </div>
      </div>

      <nav className="mt-7" aria-label="Primary">
        <ul className="space-y-0.5">
          {navItems.map((item) =>
          <li key={item.view}>
              <NavButton
              item={item}
              active={view === item.view}
              enabled={availability[item.view]}
              onClick={() => {
                onNavigate(item.view);
                onCloseMobile();
              }} />
            
            </li>
          )}
        </ul>
        <div className="mx-2 my-3 h-px bg-line" aria-hidden="true" />
        <ul>
          <li>
            <NavButton
              item={guideItem}
              active={view === 'guide'}
              enabled
              onClick={() => {
                onNavigate('guide');
                onCloseMobile();
              }} />
            
          </li>
        </ul>
      </nav>

      {status !== 'idle' &&
      <div className="mt-7 px-2">
          <p className="text-[11px] font-medium text-ink-3">Current investigation</p>
          <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-ink">{title}</p>
          <div className="mt-2">
            <StatusPill status={status} completedSteps={completedSteps} totalSteps={totalSteps} />
          </div>
        </div>
      }

      <div className="mt-auto rounded-lg border border-line bg-white px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-partial" aria-hidden="true" />
          <p className="text-xs font-medium text-ink">Demo mode</p>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-ink-3">Synthetic data only. No live AI or patent database calls.</p>
      </div>
    </div>);

}