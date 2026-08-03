import { describe, it, expect } from 'vitest';
import { isTotalAccount, buildUpdateQuery, buildNameExistsQuery } from '../../src/database/helpers';

describe('isTotalAccount', () => {
  it('returns true only for the total pseudo-account', () => {
    expect(isTotalAccount({ is_total: 1 })).toBe(true);
    expect(isTotalAccount({ is_total: 0 })).toBe(false);
    expect(isTotalAccount({})).toBe(false);
  });
});

describe('buildUpdateQuery', () => {
  it('builds a single-column SET clause', () => {
    expect(buildUpdateQuery({ name: 'Cash' }, ['name'])).toEqual({
      sets: 'name = ?',
      values: ['Cash'],
    });
  });

  it('builds a multi-column SET clause in column order', () => {
    expect(buildUpdateQuery({ name: 'Cash', icon: 'wallet' }, ['name', 'icon'])).toEqual({
      sets: 'name = ?, icon = ?',
      values: ['Cash', 'wallet'],
    });
  });

  it('skips columns that are not present in the data', () => {
    expect(buildUpdateQuery({ name: 'Cash' }, ['name', 'color'])).toEqual({
      sets: 'name = ?',
      values: ['Cash'],
    });
  });

  it('returns null when no columns are present', () => {
    expect(buildUpdateQuery({}, ['name'])).toBeNull();
  });
});

describe('buildNameExistsQuery', () => {
  it('builds a query without filters', () => {
    const { sql, params } = buildNameExistsQuery('accounts', 'Cash');
    expect(sql).toBe('SELECT COUNT(*) as count FROM accounts WHERE LOWER(name) = LOWER(?)');
    expect(params).toEqual(['Cash']);
  });

  it('adds user and exclude filters when provided', () => {
    const { sql, params } = buildNameExistsQuery('accounts', 'Cash', { userId: 1, excludeId: 5 });
    expect(sql).toBe('SELECT COUNT(*) as count FROM accounts WHERE LOWER(name) = LOWER(?) AND user_id = ? AND id != ?');
    expect(params).toEqual(['Cash', 1, 5]);
  });
});
