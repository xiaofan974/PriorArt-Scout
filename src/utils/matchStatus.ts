import type { MatchStatus, RelevanceLevel } from '../types/investigation';

export interface StatusStyle {
  label: string;
  text: string;
  bg: string;
  border: string;
  hover: string;
}

export const statusStyles: Record<MatchStatus, StatusStyle> = {
  supported: {
    label: 'Supported',
    text: 'text-accent-ink',
    bg: 'bg-accent-soft',
    border: 'border-accent/25',
    hover: 'hover:border-accent/60'
  },
  partial: {
    label: 'Partially supported',
    text: 'text-partial',
    bg: 'bg-partial-soft',
    border: 'border-partial-line',
    hover: 'hover:border-partial/60'
  },
  not_established: {
    label: 'Not established',
    text: 'text-ink-3',
    bg: 'bg-white',
    border: 'border-line',
    hover: 'hover:border-ink-4'
  }
};

export const relevanceLabels: Record<RelevanceLevel, {label: string;filled: number;}> = {
  high: { label: 'High relevance', filled: 3 },
  medium: { label: 'Medium relevance', filled: 2 },
  low: { label: 'Low relevance', filled: 1 }
};