import React from 'react';
import { featuresNeedingInvestigation } from '../../utils/evidence';
import type { InvestigationResult } from '../../types/investigation';

export function ReportSummary({ result }: {result: InvestigationResult;}) {
  const { features, documents } = result;
  const needing = featuresNeedingInvestigation(result).length;
  const items: {value: React.ReactNode;label: string;}[] = [
  { value: features.length, label: 'invention features analysed' },
  { value: documents.length, label: 'candidate documents reviewed' },
  { value: needing, label: 'features requiring further investigation' },
  {
    value:
    <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-partial" aria-hidden="true" />
          Preliminary
        </span>,

    label: 'research status'
  }];


  return (
    <div>
      <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-white md:grid-cols-4">
        {items.map((item, i) =>
        <div
          key={item.label}
          className={`px-4 py-3.5 sm:px-5 ${i % 2 === 1 ? 'border-l border-line' : ''} ${i >= 2 ? 'border-t border-line md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''}`}>
          
            <dd className="text-xl font-semibold tracking-tight text-ink">{item.value}</dd>
            <dt className="mt-0.5 text-xs text-ink-3">{item.label}</dt>
          </div>
        )}
      </dl>
      <p className="mt-2 text-[11px] text-ink-3">
        Illustrative demonstration values. They are not the results of a real patent analysis.
      </p>
    </div>);

}