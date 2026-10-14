import React from 'react';
import { ArrowLeftIcon, ShieldOffIcon } from 'lucide-react';
import { GuideSection } from '../components/guide/GuideSection';
import { GuideSectionNav } from '../components/guide/GuideSectionNav';
import { WorkflowOverview } from '../components/guide/WorkflowOverview';
import { StatusDefinitions } from '../components/guide/StatusDefinitions';
import { ReportAnatomy } from '../components/guide/ReportAnatomy';
import { GuideFaq } from '../components/guide/GuideFaq';
import { useActiveSection } from '../hooks/useActiveSection';
import { demoModeNote, guideSections, overviewParagraphs } from '../data/researchGuide';
import type { InvestigationView } from '../types/investigation';

interface ResearchGuideProps {
  returnLabel: string;
  availability: Record<InvestigationView, boolean>;
  onReturn: () => void;
  onNavigate: (view: InvestigationView) => void;
}

const sectionIds = guideSections.map((s) => s.id);

export function ResearchGuide({ returnLabel, availability, onReturn, onNavigate }: ResearchGuideProps) {
  const activeId = useActiveSection(sectionIds);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.01em] text-ink">Research Guide</h1>
          <p className="mt-1.5 text-sm text-ink-2">
            Understand the workflow, evidence methodology, and terminology behind PriorArt Scout.
          </p>
        </div>
        <button
          type="button"
          onClick={onReturn}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          
          <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {returnLabel}
        </button>
      </header>

      <div role="note" className="mt-5 flex gap-2.5 rounded-lg border border-line bg-white px-4 py-3">
        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-partial" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-ink-2">{demoModeNote}</p>
      </div>

      <div className="sticky top-0 z-10 -mx-4 mt-6 border-b border-line bg-canvas px-4 py-2 sm:-mx-6 sm:px-6 lg:hidden">
        <GuideSectionNav sections={guideSections} activeId={activeId} orientation="horizontal" onJump={jumpTo} />
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <GuideSectionNav sections={guideSections} activeId={activeId} orientation="vertical" onJump={jumpTo} />
          </div>
        </aside>

        <div className="min-w-0 max-w-[860px] space-y-14">
          <GuideSection
            id="guide-overview"
            kicker="What is PriorArt Scout?"
            title="Preliminary patent research, made more transparent">
            
            <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-start">
              <div className="space-y-3">
                {overviewParagraphs.map((p) =>
                <p key={p} className="text-sm leading-relaxed text-ink-2">
                    {p}
                  </p>
                )}
              </div>
              <aside className="rounded-xl border border-partial-line bg-partial-soft px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <ShieldOffIcon className="h-4 w-4 text-partial" aria-hidden="true" />
                  <p className="text-[13px] font-semibold text-ink">What PriorArt Scout does not determine</p>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                  It does not establish novelty, patentability, infringement, or freedom to operate.
                </p>
              </aside>
            </div>
          </GuideSection>

          <GuideSection
            id="guide-workflow"
            title="How an investigation works"
            intro="Each investigation moves through five stages, spread across three screens.">
            
            <WorkflowOverview availability={availability} onNavigate={onNavigate} />
          </GuideSection>

          <GuideSection
            id="guide-statuses"
            title="Understanding evidence statuses"
            intro="Every feature–document pair in the Evidence Report receives one of three statuses.">
            
            <StatusDefinitions />
          </GuideSection>

          <GuideSection
            id="guide-report"
            title="Reading the Evidence Report"
            intro="The report is built so that every status can be traced back to a stored passage.">
            
            <ReportAnatomy />
          </GuideSection>

          <GuideSection id="guide-limitations" title="Reliability, methodology, and limitations">
            <GuideFaq />
          </GuideSection>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <p className="text-xs text-ink-3">Your current investigation is kept while you read this guide.</p>
            <button
              type="button"
              onClick={onReturn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[13px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-[#0E161E] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              
              <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {returnLabel}
            </button>
          </div>
        </div>
      </div>
    </div>);

}