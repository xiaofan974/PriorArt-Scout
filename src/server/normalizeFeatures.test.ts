import { describe, expect, it } from 'vitest';
import { assignFeatureIds, normalizeFeatures } from './normalizeFeatures';

const description =
'A bicycle helmet equipped with an accelerometer and gyroscope that detects collisions.';

describe('normalizeFeatures', () => {
  it('assigns sequential F01 IDs', () => {
    const ids = assignFeatureIds([
    { label: 'Helmet', detail: 'A helmet.', sourcePhrase: 'A bicycle helmet' },
    { label: 'Sensors', detail: 'Inertial sensors.', sourcePhrase: 'an accelerometer and gyroscope' }]).
    map((f) => f.id);
    expect(ids).toEqual(['F01', 'F02']);
  });

  it('accepts exact source phrases and rejects paraphrases', () => {
    const ok = normalizeFeatures(
      [{ label: 'Helmet', detail: 'A helmet.', sourcePhrase: 'A bicycle helmet' }],
      description
    );
    expect(ok.ok).toBe(true);

    const bad = normalizeFeatures(
      [{ label: 'Helmet', detail: 'A helmet.', sourcePhrase: 'protective cycling headgear' }],
      description
    );
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.invalidPhrases).toContain('protective cycling headgear');
  });

  it('rejects whitespace-only source phrases without rewriting them', () => {
    const bad = normalizeFeatures(
      [{ label: 'Helmet', detail: 'A helmet.', sourcePhrase: '   ' }],
      description
    );
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.invalidPhrases).toEqual(['   ']);
  });

  it('caps features at 10', () => {
    const raw = Array.from({ length: 12 }, () => ({
      label: 'Helmet',
      detail: 'A helmet.',
      sourcePhrase: 'A bicycle helmet'
    }));
    const result = normalizeFeatures(raw, description);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.features).toHaveLength(10);
  });
});
