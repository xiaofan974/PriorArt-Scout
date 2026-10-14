import React from 'react';
import type { MatchStatus } from '../types/investigation';

interface StatusGlyphProps {
  status: MatchStatus;
  className?: string;
}

export function StatusGlyph({ status, className = 'h-3.5 w-3.5' }: StatusGlyphProps) {
  if (status === 'supported') {
    return (
      <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path d="M5 8.2l2 2 4-4.2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>);

  }
  if (status === 'partial') {
    return (
      <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
      </svg>);

  }
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.4 2.2" />
    </svg>);

}