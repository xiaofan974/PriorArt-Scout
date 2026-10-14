import React from 'react';

interface GuideSectionProps {
  id: string;
  title: string;
  /** Optional short label shown above a heading that differs from the section-nav label. */
  kicker?: string;
  intro?: string;
  children: React.ReactNode;
}

export function GuideSection({ id, title, kicker, intro, children }: GuideSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-16 lg:scroll-mt-8">
      {kicker && <p className="text-xs font-medium text-accent">{kicker}</p>}
      <h2 id={`${id}-heading`} className={`text-xl font-semibold tracking-[-0.01em] text-ink ${kicker ? 'mt-1' : ''}`}>
        {title}
      </h2>
      {intro && <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>);

}