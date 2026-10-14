import { describe, expect, it } from 'vitest';
import { locatePhrase, validateSourcePhrases } from './sourcePhrase';

const description =
  'A bicycle helmet equipped with an accelerometer and gyroscope that detects collisions.';

describe('locatePhrase', () => {
  it('accepts an exact contiguous substring', () => {
    expect(locatePhrase(description, 'A bicycle helmet')).toEqual({ start: 0, end: 16 });
  });

  it('rejects paraphrases and non-contiguous text', () => {
    expect(locatePhrase(description, 'protective cycling headgear')).toBeNull();
    expect(locatePhrase(description, 'bicycle gyroscope')).toBeNull();
  });
});

describe('validateSourcePhrases', () => {
  it('counts only verbatim source phrases as verified', () => {
    expect(
      validateSourcePhrases(description, [
        { id: 'F01', label: 'Helmet', detail: 'A helmet.', sourcePhrase: 'A bicycle helmet' },
        { id: 'F02', label: 'Invented', detail: 'Not in the text.', sourcePhrase: 'quantum flux capacitor' }
      ])
    ).toEqual({ total: 2, verified: 1 });
  });
});
