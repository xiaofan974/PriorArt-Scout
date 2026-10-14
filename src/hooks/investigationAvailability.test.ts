import { describe, expect, it } from 'vitest';
import { investigationAvailability } from './investigationAvailability';

describe('investigationAvailability', () => {
  it('unlocks the evidence report only after a complete demonstration', () => {
    expect(investigationAvailability('complete').report).toBe(true);
    expect(investigationAvailability('running').report).toBe(false);
    expect(investigationAvailability('idle').report).toBe(false);
  });

  it('does not unlock the evidence report for live extraction states', () => {
    expect(investigationAvailability('extracting').report).toBe(false);
    expect(investigationAvailability('extracted').report).toBe(false);
    expect(investigationAvailability('extraction_failed').report).toBe(false);
  });

  it('keeps workspace available during live extraction', () => {
    expect(investigationAvailability('extracting').workspace).toBe(true);
    expect(investigationAvailability('extracted').workspace).toBe(true);
    expect(investigationAvailability('extraction_failed').workspace).toBe(true);
    expect(investigationAvailability('idle').workspace).toBe(false);
  });
});
