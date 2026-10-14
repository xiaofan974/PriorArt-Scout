import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { StatusGlyph } from '../StatusGlyph';
import { statusDefinitions } from '../../data/researchGuide';
import { statusStyles } from '../../utils/matchStatus';

export function StatusDefinitions() {
  return (
    <>
      <ul className="space-y-3">
        {statusDefinitions.map((def) => {
          const style = statusStyles[def.status];
          return (
            <li
              key={def.status}
              className="grid overflow-hidden rounded-xl border border-line bg-white md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              
              <div className="px-4 py-4 sm:px-5">
                <span
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[13px] font-semibold ${style.bg} ${style.border} ${style.text}`}>
                  
                  <StatusGlyph status={def.status} className="h-4 w-4" />
                  {style.label}
                </span>
                <p className="mt-3 text-[13px] leading-relaxed text-ink">{def.definition}</p>
                {def.caution &&
                <p className="mt-3 flex gap-2 text-xs leading-relaxed text-ink-2">
                    <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-partial" aria-hidden="true" />
                    <span>
                      <span className="font-medium text-ink">Important: </span>
                      {def.caution}
                    </span>
                  </p>
                }
              </div>

              <dl className="border-t border-line bg-canvas px-4 py-4 text-[13px] sm:px-5 md:border-l md:border-t-0">
                <p className="mb-2.5 text-[11px] font-medium text-ink-3">Illustrative example</p>
                <div>
                  <dt className="text-xs text-ink-3">Invention feature</dt>
                  <dd className="mt-0.5 text-ink">“{def.example.feature}”</dd>
                </div>
                <div className="mt-2.5">
                  <dt className="text-xs text-ink-3">{def.example.passageLabel}</dt>
                  <dd className={`mt-0.5 ${def.example.passageIsQuote ? 'border-l-2 border-line-strong pl-2.5 text-ink' : 'text-ink-2'}`}>
                    {def.example.passageIsQuote ? `“${def.example.passage}”` : def.example.passage}
                  </dd>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <dt className="text-xs text-ink-3">Status</dt>
                  <dd className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
                    <StatusGlyph status={def.status} className="h-3 w-3" />
                    {style.label}
                  </dd>
                </div>
                {def.example.note && <p className="mt-2 text-xs leading-relaxed text-ink-2">{def.example.note}</p>}
              </dl>
            </li>);

        })}
      </ul>
      <p className="mt-2 text-[11px] text-ink-3">
        Examples are written for this guide and are not taken from the demonstration dataset.
      </p>
    </>);

}