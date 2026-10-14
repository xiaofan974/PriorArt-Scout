import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftIcon, CheckIcon, DownloadIcon, PlusIcon, ScaleIcon } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { ReportSummary } from '../components/report/ReportSummary';
import { EvidenceMatrix } from '../components/report/EvidenceMatrix';
import { EvidenceInspector } from '../components/report/EvidenceInspector';
import { CuratedEvidenceMatrix } from '../components/report/CuratedEvidenceMatrix';
import { CuratedInspector } from '../components/report/CuratedInspector';
import { RankedDocuments } from '../components/report/RankedDocuments';
import { ResearchGaps } from '../components/report/ResearchGaps';
import { CURATED_ASSESSMENT_NOTICE, downloadReport, LIMITATIONS_NOTICE } from '../utils/reportExport';
import type { InvestigationResult, MatrixSelection } from '../types/investigation';

interface EvidenceReportProps {
  result: InvestigationResult;
  submittedDescription: string;
  onBack: () => void;
  onStartNew: () => void;
}

export function EvidenceReport({ result, submittedDescription, onBack, onStartNew }: EvidenceReportProps) {
  const [selection, setSelection] = useState<MatrixSelection | null>(null);
  const closeInspector = useCallback(() => setSelection(null), []);
  const [exportState, setExportState] = useState<'idle' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (exportState === 'idle') return;
    const timer = window.setTimeout(() => setExportState('idle'), 2500);
    return () => window.clearTimeout(timer);
  }, [exportState]);

  const curatedAssessment = Boolean(result.assessments?.length);

  const handleExport = () => {
    try {
      downloadReport(result, submittedDescription);
      setExportState('done');
    } catch {
      setExportState('error');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <p className="font-mono text-[11px] text-ink-3">
            {curatedAssessment ?
            'Curated evidence assessment — limited patent corpus.' :
            result.mode === 'demonstration' ?
            'Report · Demonstration corpus' :
            'Report · Investigation corpus'}
          </p>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.01em] text-ink">
            {curatedAssessment ? 'Curated evidence assessment — limited patent corpus.' : 'Preliminary Prior Art Investigation'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-2">
            {curatedAssessment ?
            'Reviewed against stored passages from three patent publications. This is not a model-generated assessment.' :
            'Evidence-backed technical comparison based on a limited demonstration corpus.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Back to investigation
          </button>
          <button
            type="button"
            onClick={handleExport}
            title="Download this report as a Markdown (.md) file"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            
            {exportState === 'done' ?
            <CheckIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> :

            <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
            }
            {exportState === 'done' ? 'Downloaded .md' : exportState === 'error' ? 'Export failed — retry' : 'Export report'}
          </button>
          <span className="sr-only" aria-live="polite">
            {exportState === 'done' ? 'Report downloaded as priorart-scout-demo-report.md' : ''}
          </span>
          <button
            type="button"
            onClick={onStartNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[13px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-[#0E161E] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            
            <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Start new investigation
          </button>
        </div>
      </header>

      <div className="mt-6">
        <ReportSummary result={result} />
      </div>

      <aside
        role="note"
        aria-label="Investigation limitations"
        className="mt-5 flex gap-3 rounded-xl border border-partial-line bg-partial-soft px-4 py-3.5">
        
        <ScaleIcon className="mt-0.5 h-4 w-4 shrink-0 text-partial" aria-hidden="true" />
        <div>
          <p className="text-[13px] font-semibold text-ink">Investigation limitations</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">
            {curatedAssessment ? CURATED_ASSESSMENT_NOTICE : LIMITATIONS_NOTICE}
          </p>
        </div>
      </aside>

      <section className="mt-10" aria-labelledby="matrix-heading">
        <SectionHeader
          id="matrix-heading"
          title="Feature-to-evidence matrix"
          description={
          curatedAssessment ?
          'Each cell is a reviewed assessment of stored passages, or a research gap when no relevant passage is in the corpus.' :
          'How each invention feature compares with each demonstration document. Every supported or partial status cites a source passage.'
          } />
        
        {curatedAssessment ?
        <CuratedEvidenceMatrix result={result} selection={selection} onSelect={setSelection} /> :
        <EvidenceMatrix result={result} selection={selection} onSelect={setSelection} />}
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section aria-labelledby="ranked-heading">
          <SectionHeader
            id="ranked-heading"
          title={curatedAssessment ? 'Curated publications' : 'Candidate documents'}
          description={
          curatedAssessment ?
          'The three publications in the limited corpus. Opening one shows its assessed passages.' :
          'Ranked by feature overlap. Expand a document to see its cited passages.'
          } />
          
          {curatedAssessment ?
          <ul className="divide-y divide-line rounded-xl border border-line bg-white">
              {result.documents.map((document) =>
              <li key={document.id} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelection({ featureId: result.features[0].id, documentId: document.id })}
                    className="text-left font-mono text-[13px] font-medium text-accent hover:text-accent-hover focus:outline-none focus-visible:underline">
                    {document.id}
                  </button>
                  <p className="mt-1 text-[13px] text-ink">{document.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-3">{document.summary}</p>
                </li>
              )}
            </ul> :
          <RankedDocuments result={result} onInspect={setSelection} />}
        </section>
        <section aria-labelledby="gaps-heading">
          <SectionHeader
            id="gaps-heading"
            title="Research gaps"
            description={
          curatedAssessment ?
          'Feature and publication pairs with no relevant stored passage, and details the cited passages do not state.' :
          'What this investigation could not establish, and where to look next.'
          } />
          
          <ResearchGaps result={result} onInspect={setSelection} />
        </section>
      </div>

      {curatedAssessment ?
      <CuratedInspector result={result} selection={selection} onSelect={setSelection} onClose={closeInspector} /> :
      <EvidenceInspector result={result} selection={selection} onSelect={setSelection} onClose={closeInspector} />}
    </div>);

}