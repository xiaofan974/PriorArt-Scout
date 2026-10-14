import { describe, expect, it } from 'vitest';
import { createDemoInvestigationResult } from '../data/demoResult';
import { createIdleInvestigationState } from './investigationState';
import { resolveStartAction } from './startAction';

const example = createDemoInvestigationResult().invention.description;

describe('resolveStartAction', () => {
  it('starts the helmet demonstration from the example text without live extraction', () => {
    expect(resolveStartAction(example, example, false)).toBe('demo');
    expect(resolveStartAction(example, example, true)).toBe('demo');
  });

  it('routes custom text to live extraction only when advertised', () => {
    const custom = `${example} with an extra custom clause about a radio beacon.`;
    expect(resolveStartAction(custom, example, true)).toBe('live');
    expect(resolveStartAction(custom, example, false)).toBe('unavailable');
  });

  it('rejects short input', () => {
    expect(resolveStartAction('too short', example, true)).toBe('too_short');
  });
});

describe('createIdleInvestigationState', () => {
  it('clears live extraction state as well as demonstration state', () => {
    const idle = createIdleInvestigationState();
    expect(idle.result).toBeNull();
    expect(idle.status).toBe('idle');
    expect(idle.submittedDescription).toBe('');
  });
});
