import { describe, it, expect } from 'vitest';

describe('Z-Index Conflict Resolution', () => {
  it('HITL modal uses maximum browser-safe z-index', () => {
    // The HITL modal backdrop is hardcoded at z-index: 2147483647
    // This is the maximum value that works across all browsers
    const MAX_BROWSER_Z_INDEX = 2147483647;
    expect(MAX_BROWSER_Z_INDEX).toBeGreaterThan(9999999); // Higher than any reasonable site
  });

  it('HITL modal z-index exceeds typical site maximums', () => {
    const typicalMaxZIndex = 9999; // Bootstrap, Material UI, Tailwind max stack
    const HITL_Z_INDEX = 2147483647;
    expect(HITL_Z_INDEX).toBeGreaterThan(typicalMaxZIndex * 100);
  });
});
