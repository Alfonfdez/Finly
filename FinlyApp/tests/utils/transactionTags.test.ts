import { describe, it, expect } from 'vitest';
import { buildTagsByTransactionMap } from '../../src/utils/transactionTags';

describe('buildTagsByTransactionMap', () => {
  it('returns an empty map for no links', () => {
    expect(buildTagsByTransactionMap([])).toEqual(new Map());
  });

  it('groups tags by transaction id preserving order', () => {
    const map = buildTagsByTransactionMap([
      { transaction_id: 1, tag_id: 1, name: 'work' },
      { transaction_id: 1, tag_id: 2, name: 'food' },
      { transaction_id: 2, tag_id: 1, name: 'work' },
    ]);

    expect(map.get(1)).toEqual([
      { tag_id: 1, name: 'work' },
      { tag_id: 2, name: 'food' },
    ]);
    expect(map.get(2)).toEqual([{ tag_id: 1, name: 'work' }]);
  });
});
