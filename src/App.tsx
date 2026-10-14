import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { NewInvestigation } from './pages/NewInvestigation';
import { InvestigationWorkspace } from './pages/InvestigationWorkspace';
import { EvidenceReport } from './pages/EvidenceReport';
import { ResearchGuide } from './pages/ResearchGuide';
import { useInvestigation } from './hooks/useInvestigation';
import type { InvestigationView, WorkflowView } from './types/investigation';

const returnLabels: Record<WorkflowView, string> = {
  new: 'Back to new investigation',
  workspace: 'Back to workspace',
  report: 'Back to evidence report'
};

export function App() {
  const inv = useInvestigation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef<Partial<Record<InvestigationView, number>>>({});
  const previousView = useRef<InvestigationView>(inv.view);

  // Start each screen at the top, except when returning from the guide, where the reading position is restored.
  useEffect(() => {
    const cameFromGuide = previousView.current === 'guide';
    const top = cameFromGuide ? scrollPositions.current[inv.view] ?? 0 : 0;
    scrollRef.current?.scrollTo({ top });
    previousView.current = inv.view;
  }, [inv.view]);

  const returnLabel = returnLabels[inv.availability[inv.returnView] ? inv.returnView : 'new'];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen w-full bg-canvas font-sans text-ink">
        <Sidebar
          view={inv.view}
          availability={inv.availability}
          title={inv.title}
          status={inv.status}
          completedSteps={inv.completedSteps}
          totalSteps={inv.totalSteps}
          mobileOpen={mobileNavOpen}
          onNavigate={inv.navigate}
          onCloseMobile={() => setMobileNavOpen(false)} />
        
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            view={inv.view}
            availability={inv.availability}
            title={inv.title}
            status={inv.status}
            completedSteps={inv.completedSteps}
            totalSteps={inv.totalSteps}
            onNavigate={inv.navigate}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            returnLabel={returnLabel}
            onReturn={inv.returnFromGuide} />
          
          <main
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            onScroll={(e) => {
              scrollPositions.current[inv.view] = e.currentTarget.scrollTop;
            }}>
            
            {inv.view === 'new' &&
            <NewInvestigation
              description={inv.description}
              exampleDescription={inv.exampleDescription}
              liveExtractionEnabled={inv.liveExtractionEnabled}
              hasOpenInvestigation={inv.status !== 'idle'}
              onDescriptionChange={inv.setDescription}
              onTryExample={inv.applyExample}
              onStartDemo={inv.startDemo}
              onStartLive={inv.startLive}
              onStartCurated={inv.startCurated}
              onStartCuratedAssessment={inv.startCuratedAssessment}
              onResume={() => inv.navigate('workspace')} />

            }
            {inv.view === 'workspace' && inv.result &&
            <InvestigationWorkspace
              result={inv.result}
              submittedDescription={inv.submittedDescription}
              status={inv.status}
              completedSteps={inv.completedSteps}
              extractionError={inv.extractionError}
              onViewReport={() => inv.navigate('report')}
              onStartNew={inv.startNew}
              onRetry={inv.retryExtraction} />

            }
            {inv.view === 'report' && inv.result &&
            <EvidenceReport
              result={inv.result}
              submittedDescription={inv.submittedDescription}
              onBack={() => inv.navigate('workspace')}
              onStartNew={inv.startNew} />

            }
            {inv.view === 'guide' &&
            <ResearchGuide
              returnLabel={returnLabel}
              availability={inv.availability}
              onReturn={inv.returnFromGuide}
              onNavigate={inv.navigate} />

            }
          </main>
        </div>
      </div>
    </MotionConfig>);

}