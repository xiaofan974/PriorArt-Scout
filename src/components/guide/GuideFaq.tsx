import React from 'react';
import { faqs } from '../../data/researchGuide';

export function GuideFaq() {
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
      {faqs.map((item) =>
      <div key={item.question} className="grid gap-x-6 gap-y-1 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <dt className="text-[13px] font-semibold leading-snug text-ink">{item.question}</dt>
          <dd className="text-[13px] leading-relaxed text-ink-2">{item.answer}</dd>
        </div>
      )}
    </dl>);

}