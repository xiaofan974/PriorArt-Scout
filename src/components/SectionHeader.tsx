import React from 'react';

interface SectionHeaderProps {
  id: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
}

export function SectionHeader({ id, title, description, meta }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
      </div>
      {meta && <div className="text-xs text-ink-3">{meta}</div>}
    </div>);

}