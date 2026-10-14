import { assessmentStyles, NO_CITATION_LABEL } from '../../assessment/assessmentLabels';
import { assessmentsFor } from '../../assessment/validateAssessment';
import type { AssessmentLabel, EvidenceAssessment, InvestigationResult, MatrixSelection } from '../../types/investigation';

interface CuratedEvidenceMatrixProps {
  result: InvestigationResult;
  selection: MatrixSelection | null;
  onSelect: (selection: MatrixSelection) => void;
}

const legend: AssessmentLabel[] = ['explicit_overlap', 'partial_overlap', 'insufficient_evidence'];

function primaryAssessment(assessments: EvidenceAssessment[]): AssessmentLabel | null {
  if (assessments.some((assessment) => assessment.assessment === 'explicit_overlap')) return 'explicit_overlap';
  if (assessments.some((assessment) => assessment.assessment === 'partial_overlap')) return 'partial_overlap';
  if (assessments.some((assessment) => assessment.assessment === 'insufficient_evidence')) return 'insufficient_evidence';
  return null;
}

export function CuratedEvidenceMatrix({ result, selection, onSelect }: CuratedEvidenceMatrixProps) {
  const { features, documents } = result;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legend">
        {legend.map((label) =>
        <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-medium ${assessmentStyles[label].text}`}>
            {assessmentStyles[label].label}
          </span>
        )}
        <span className="text-xs font-medium text-ink-3">{NO_CITATION_LABEL}</span>
        <span className="text-xs text-ink-3 sm:ml-auto">Select a cell to read the stored passage</span>
      </div>

      <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-line bg-white">
        <table className="w-full min-w-[880px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Feature-to-patent matrix for the curated evidence assessment</caption>
          <thead>
            <tr className="bg-canvas">
              <th
                scope="col"
                className="sticky left-0 z-20 w-[200px] min-w-[200px] border-b border-r border-line bg-canvas px-4 py-3 text-left text-xs font-medium text-ink-3 sm:w-[280px] sm:min-w-[280px]">
                Technical feature
              </th>
              {documents.map((document) =>
              <th key={document.id} scope="col" className="min-w-[180px] border-b border-line px-2 py-3 text-left align-bottom">
                  <span className="block px-1 font-mono text-[11px] font-medium text-ink-2">{document.id}</span>
                  <span className="mt-0.5 block truncate px-1 text-[11px] font-normal text-ink-3" title={document.title}>
                    {document.title}
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, rowIndex) => {
              const rowSelected = selection?.featureId === feature.id;
              const rowBorder = rowIndex < features.length - 1 ? 'border-b border-line' : '';
              return (
                <tr key={feature.id} className={rowSelected ? 'bg-canvas' : ''}>
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 border-r border-line px-4 py-2.5 text-left font-normal ${rowBorder} ${rowSelected ? 'bg-canvas' : 'bg-white'}`}>
                    <div className="flex gap-3">
                      <span className="pt-px font-mono text-xs font-medium text-accent">{feature.id}</span>
                      <span className="text-[13px] font-medium leading-snug text-ink">{feature.label}</span>
                    </div>
                  </th>
                  {documents.map((document) => {
                    const assessments = assessmentsFor(result, feature.id, document.id);
                    const primary = primaryAssessment(assessments);
                    const label = primary ? assessmentStyles[primary].label : NO_CITATION_LABEL;
                    const style = primary ? assessmentStyles[primary] : null;
                    const selected = rowSelected && selection?.documentId === document.id;
                    const passageIds = assessments.map((assessment) => assessment.passageId).join(', ');
                    return (
                      <td key={document.id} className={`px-2 py-2 ${rowBorder}`}>
                        <button
                          type="button"
                          onClick={() => onSelect({ featureId: feature.id, documentId: document.id })}
                          aria-pressed={selected}
                          aria-label={`${feature.id} against ${document.id}: ${label}. Inspect evidence.`}
                          className={`flex w-full flex-col items-start gap-1 rounded-md border px-2.5 py-2 text-left text-xs font-medium transition-[border-color,box-shadow,background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            style ? `${style.bg} ${style.border} ${style.hover} ${style.text}` : 'border-dashed border-line bg-white text-ink-3 hover:border-ink-4'
                          } ${selected ? 'ring-2 ring-ink ring-offset-1' : ''}`}>
                          <span>{label}</span>
                          {passageIds ?
                          <span className="font-mono text-[10px] font-normal opacity-80">{passageIds}</span> :
                          <span className="text-[10px] font-normal">Research gap</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
