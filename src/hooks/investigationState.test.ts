import { describe, expect, it } from 'vitest';
import { createIdleInvestigationState } from './investigationState';
import { createDemoInvestigationResult } from '../data/demoResult';

describe('createIdleInvestigationState', () => {
  it('clears the active result and returns the new-investigation screen', () => {
    const idle = createIdleInvestigationState();
    expect(idle.view).toBe('new');
    expect(idle.description).toBe('');
    expect(idle.submittedDescription).toBe('');
    expect(idle.status).toBe('idle');
    expect(idle.completedSteps).toBe(0);
    expect(idle.returnView).toBe('new');
    expect(idle.result).toBeNull();
  });

  it('is distinct from a loaded demonstration result', () => {
    const demo = createDemoInvestigationResult();
    const idle = createIdleInvestigationState();
    expect(idle.result).not.toEqual(demo);
    expect(idle.status).not.toBe('running');
    expect(idle.status).not.toBe('complete');
  });
});
