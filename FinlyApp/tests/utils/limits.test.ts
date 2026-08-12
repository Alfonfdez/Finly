import { describe, it, expect } from 'vitest';
import { countAtLimit } from '../../src/utils/limits';

describe('countAtLimit', () => {
  it('returns false when the current count is below the max', () => {
    expect(countAtLimit(0, 30)).toBe(false);
    expect(countAtLimit(29, 30)).toBe(false);
    expect(countAtLimit(49, 50)).toBe(false);
  });

  it('returns true when the current count equals the max', () => {
    expect(countAtLimit(30, 30)).toBe(true);
    expect(countAtLimit(50, 50)).toBe(true);
  });

  it('returns true when the current count exceeds the max', () => {
    expect(countAtLimit(31, 30)).toBe(true);
    expect(countAtLimit(51, 50)).toBe(true);
  });
});
