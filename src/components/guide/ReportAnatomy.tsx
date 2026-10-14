import React from 'react';
import { StatusGlyph } from '../StatusGlyph';
import { reportElements } from '../../data/researchGuide';
import { statusStyles } from '../../utils/matchStatus';
import type { MatchStatus } from '../../types/investigation';

const sampleGrid: MatchStatus[][] = [
['supported', 'partial', 'not_established'],
['supported', 'partial', 'not_established'],
['partial', 'supported', 'not_established'],
['partial', 'partial', 'partial']];


function Marker({ n, className = '' }: {n: number;className?: string;}) {
  return (
    <span
      className={`absolute flex h-5 w-5 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-medium text-white ring-2 ring-canvas ${className}`}>
      
      {n}
    </span>);

}

/** Low-fidelity schematic of the Evidence Report with numbered annotations. Decorative; content is in the list. */
function Schematic() {
  return (
    <div className="relative rounded-xl border border-line bg-canvas p-4" aria-hidden="true">
      <div className="flex gap-3">
        {/* Matrix */}
        <div className="relative flex-1 rounded-lg border border-line bg-white p-2">
          <Marker n={1} className="-left-2 -top-2" />
          <div className="mb-1.5 grid grid-cols-[1fr_repeat(3,22px)] gap-1.5">
            <span className="h-1.5 w-10 self-center rounded bg-line" />
            {[0, 1, 2].map((i) =>
            <span key={i} className="h-1.5 rounded bg-line" />
            )}
          </div>
          {sampleGrid.map((row, r) =>
          <div
            key={r}
            className={`grid grid-cols-[1fr_repeat(3,22px)] items-center gap-1.5 py-1 ${r === 1 ? 'rounded bg-canvas' : ''}`}>
            
              <span className="h-1.5 rounded bg-subtle" style={{ width: `${80 - r * 10}%` }} />
              {row.map((s, c) =>
            <span
              key={c}
              className={`flex h-5 items-center justify-center rounded border ${statusStyles[s].bg} ${statusStyles[s].border} ${statusStyles[s].text} ${
              r === 1 && c === 0 ? 'ring-2 ring-ink ring-offset-1' : ''}`
              }>
              
                  <StatusGlyph status={s} className="h-2.5 w-2.5" />
                </span>
            )}
            </div>
          )}
        </div>

        {/* Inspector */}
        <div className="relative w-[44%] rounded-lg border border-line bg-white p-2.5">
          <Marker n={2} className="-right-2 -top-2" />
          <span className="block h-1.5 w-14 rounded bg-line" />
          <div className="relative mt-3 rounded border border-line bg-canvas p-1.5">
            <Marker n={3} className="-left-3.5 top-1" />
            <span className="block h-1 w-full rounded bg-line-strong" />
            <span className="mt-1 block h-1 w-4/5 rounded bg-line-strong" />
          </div>
          <div className="relative mt-3">
            <Marker n={4} className="-left-3.5 -top-1" />
            <span className="block h-1 w-full rounded bg-line" />
            <span className="mt-1 block h-1 w-3/5 rounded bg-line" />
          </div>
          <div className="relative mt-3">
            <Marker n={5} className="-left-3.5 -top-1" />
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-partial" />
              <span className="h-1 w-4/5 rounded bg-line" />
            </span>
          </div>
        </div>
      </div>

      {/* Trace */}
      <div className="relative mt-3 flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2">
        <Marker n={6} className="-left-2 -top-2" />
        {Array.from({ length: 7 }).map((_, i) =>
        <React.Fragment key={i}>
            <span className="h-2 w-2 rounded-full bg-accent" />
            {i < 6 && <span className="h-px flex-1 bg-accent/40" />}
          </React.Fragment>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-ink-4">Trace appears in the Investigation Workspace</p>
    </div>);

}

export function ReportAnatomy() {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:items-start">
      <div className="md:sticky md:top-8">
        <Schematic />
      </div>
      <ol className="space-y-4">
        {reportElements.map((el) =>
        <li key={el.key} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
            <span className="mt-px flex h-5 w-5 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-medium text-white">
              {el.key}
            </span>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">{el.title}</h3>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{el.text}</p>
              {el.note && <p className="mt-1.5 text-xs leading-relaxed text-ink-3">{el.note}</p>}
            </div>
          </li>
        )}
      </ol>
    </div>);

}