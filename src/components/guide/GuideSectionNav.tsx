import type { GuideSectionLink } from '../../types/guide';

interface GuideSectionNavProps {
  sections: GuideSectionLink[];
  activeId: string;
  orientation: 'vertical' | 'horizontal';
  onJump: (id: string) => void;
}

export function GuideSectionNav({ sections, activeId, orientation, onJump }: GuideSectionNavProps) {
  if (orientation === 'horizontal') {
    return (
      <nav aria-label="Guide sections" className="overflow-x-auto">
        <ul className="flex gap-1">
          {sections.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onJump(s.id)}
                  aria-current={active ? 'location' : undefined}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active ? 'bg-white font-medium text-ink shadow-[0_0_0_1px_#E7E5E0]' : 'text-ink-3 hover:bg-subtle hover:text-ink'}`
                  }>
                  
                  {s.label}
                </button>
              </li>);

          })}
        </ul>
      </nav>);

  }

  return (
    <nav aria-label="Guide sections">
      <p className="px-3 text-[11px] font-medium text-ink-3">On this page</p>
      <ul className="mt-2 border-l border-line">
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onJump(s.id)}
                aria-current={active ? 'location' : undefined}
                className={`-ml-px block w-full border-l py-1.5 pl-3 pr-2 text-left text-[13px] leading-snug transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                active ? 'border-accent font-medium text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`
                }>
                
                {s.label}
              </button>
            </li>);

        })}
      </ul>
    </nav>);

}