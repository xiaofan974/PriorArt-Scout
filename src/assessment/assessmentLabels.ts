import type { AssessmentLabel } from '../types/investigation';
import type { StatusStyle } from '../utils/matchStatus';

export const assessmentStyles: Record<AssessmentLabel, StatusStyle> = {
  explicit_overlap: {
    label: 'Explicit overlap',
    text: 'text-accent-ink',
    bg: 'bg-accent-soft',
    border: 'border-accent/25',
    hover: 'hover:border-accent/60'
  },
  partial_overlap: {
    label: 'Partial overlap',
    text: 'text-partial',
    bg: 'bg-partial-soft',
    border: 'border-partial-line',
    hover: 'hover:border-partial/60'
  },
  insufficient_evidence: {
    label: 'Insufficient evidence',
    text: 'text-ink-3',
    bg: 'bg-white',
    border: 'border-line',
    hover: 'hover:border-ink-4'
  }
};

export const NO_CITATION_LABEL = 'No citation';
