import { describe, it, expect } from 'vitest';
import { isTotalAccount } from '../../src/database/helpers';

describe('isTotalAccount', () => {
  it('returns true only for the total pseudo-account', () => {
    expect(isTotalAccount({ is_total: 1 })).toBe(true);
    expect(isTotalAccount({ is_total: 0 })).toBe(false);
    expect(isTotalAccount({})).toBe(false);
  });
});
