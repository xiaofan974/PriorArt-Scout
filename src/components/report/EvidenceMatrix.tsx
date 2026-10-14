import { StatusGlyph } from '../StatusGlyph';
import { featureCoverage, resolveEvidence } from '../../utils/evidence';
import { statusStyles } from '../../utils/matchStatus';
import type { InvestigationResult, MatchStatus, MatrixSelection } from '../../types/investigation';

interface EvidenceMatrixProps {
  result: InvestigationResult;
  selection: MatrixSelection | null;
  onSelect: (selection: MatrixSelection) => void;
}

const legendOrder: MatchStatus[] = ['supported', 'partial', 'not_established'];

export function EvidenceMatrix({ result, selection, onSelect }: EvidenceMatrixProps) {
  const { features, documents } = result;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legend">
        {legendOrder.map((s) =>
        <span key={s} className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusStyles[s].text}`}>
            <StatusGlyph status={s} />
            {statusStyles[s].label}
          </span>
        )}
        <span className="text-xs text-ink-3 sm:ml-auto">
          Select any cell to inspect its evidence
          <span className="xl:hidden"> · scroll sideways for all documents</span>
        </span>
      </div>

      <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-line bg-white">
        <table className="w-full min-w-[880px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Feature-to-evidence matrix comparing invention features with demonstration documents</caption>
          <thead>
            <tr className="bg-canvas">
              <th
                scope="col"
                className="sticky left-0 z-20 w-[200px] min-w-[200px] border-b border-r border-line bg-canvas px-4 py-3 text-left text-xs font-medium text-ink-3 sm:w-[280px] sm:min-w-[280px]">
                
                Invention feature
              </th>
              {documents.map((d) =>
              <th key={d.id} scope="col" className="min-w-[170px] border-b border-line px-2 py-3 text-left align-bottom">
                  <span className="block px-1 font-mono text-[11px] font-medium text-ink-2">{d.id}</span>
                  <span className="mt-0.5 block truncate px-1 text-[11px] font-normal text-ink-3" title={d.title}>
                    {d.title}
                  </span>
                </th>
              )}
              <th scope="col" className="w-[160px] min-w-[160px] border-b border-line px-4 py-3 text-left text-xs font-medium text-ink-3">
                Coverage
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, rowIndex) => {
              const coverage = featureCoverage(result, f.id);
              const needsInvestigation = coverage.supported === 0;
              const rowSelected = selection?.featureId === f.id;
              const rowBorder = rowIndex < features.length - 1 ? 'border-b border-line' : '';
              return (
                <tr key={f.id} className={rowSelected ? 'bg-canvas' : ''}>
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 border-r border-line px-4 py-2.5 text-left font-normal ${rowBorder} ${rowSelected ? 'bg-canvas' : 'bg-white'}`}>
                    
                    <div className="flex gap-3">
                      <span className="pt-px font-mono text-xs font-medium text-accent">{f.id}</span>
                      <span className="text-[13px] font-medium leading-snug text-ink">{f.label}</span>
                    </div>
                  </th>
                  {documents.map((d) => {
                    const resolved = resolveEvidence(result, f.id, d.id);
                    const status: MatchStatus = resolved?.status ?? 'not_established';
                    const style = statusStyles[status];
                    const selected = rowSelected && selection?.documentId === d.id;
                    return (
                      <td key={d.id} className={`px-2 py-2 ${rowBorder}`}>
                        <button
                          type="button"
                          onClick={() => onSelect({ featureId: f.id, documentId: d.id })}
                          aria-pressed={selected}
                          aria-label={`${f.id} ${f.label} against ${d.id}: ${style.label}. Inspect evidence.`}
                          className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs font-medium transition-[border-color,box-shadow,background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${style.bg} ${style.border} ${style.hover} ${style.text} ${
                          selected ? 'ring-2 ring-ink ring-offset-1' : ''}`
                          }>
                          
                          <StatusGlyph status={status} />
                          <span className="whitespace-nowrap">{style.label}</span>
                          {resolved?.passage &&
                          <span className="ml-auto font-mono text-[10px] font-normal opacity-70">{resolved.passage.id}</span>
                          }
                        </button>
                      </td>);

                  })}
                  <td className={`px-4 py-2.5 ${rowBorder}`}>
                    {needsInvestigation ?
                    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-partial-soft px-2 py-1 text-[11px] font-medium text-partial">
                        Needs investigation
                      </span> :

                    <span className="whitespace-nowrap text-xs text-ink-2">
                        Supported in {coverage.supported} of {documents.length}
                      </span>
                    }
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}