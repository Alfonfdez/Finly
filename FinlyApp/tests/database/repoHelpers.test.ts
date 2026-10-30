import { describe, expect, it, vi } from 'vitest';
import { pickDefined } from '../../src/database/repositories/repoHelpers';

vi.mock('../../src/database/drizzle/engine', () => ({
  getDrizzle: vi.fn(),
}));

describe('pickDefined', () => {
  it('keeps only the selected fields that are defined', () => {
    const data = {
      name: 'Cash',
      icon: undefined,
      color: '#22D3EE',
      description: null,
    };

    expect(pickDefined(data, ['name', 'icon', 'color', 'description'])).toEqual({
      name: 'Cash',
      color: '#22D3EE',
      description: null,
    });
  });

  it('preserves false, zero, empty strings and null', () => {
    const data = {
      active: false,
      amount: 0,
      description: '',
      end_date: null,
    };

    expect(pickDefined(data, ['active', 'amount', 'description', 'end_date'])).toEqual(data);
  });

  it('ignores fields outside the selected keys', () => {
    const data = {
      id: 7,
      user_id: 1,
      name: 'Cash',
    };

    expect(pickDefined(data, ['name'])).toEqual({ name: 'Cash' });
  });

  it('returns an empty object when every selected field is undefined', () => {
    const data = {
      name: undefined,
      icon: undefined,
    };

    expect(pickDefined(data, ['name', 'icon'])).toEqual({});
    expect(pickDefined(data, [])).toEqual({});
  });

  it('does not mutate the source object', () => {
    const data = { name: 'Cash', icon: undefined };
    const before = { ...data };

    pickDefined(data, ['name', 'icon']);

    expect(data).toEqual(before);
  });
});
