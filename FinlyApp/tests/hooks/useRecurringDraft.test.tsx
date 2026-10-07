import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useRecurringDraft } from '../../src/hooks/useRecurringDraft';

const base = { day: new Date(2026, 1, 2), ruleMode: true };

describe('useRecurringDraft', () => {
  it('flags a required name error when empty', async () => {
    const { result } = await renderHook(() => useRecurringDraft({ ...base, initialRepeatName: '' }));
    expect(result.current.repeatNameError).toBe('required');
  });

  it('flags a taken name error (case-insensitive)', async () => {
    const { result } = await renderHook(() =>
      useRecurringDraft({ ...base, initialRepeatName: 'rent', existingRepeatNames: ['Rent'] }),
    );
    expect(result.current.repeatNameError).toBe('taken');
  });

  it('has no name error for a unique name', async () => {
    const { result } = await renderHook(() =>
      useRecurringDraft({ ...base, initialRepeatName: 'Rent', existingRepeatNames: ['Groceries'] }),
    );
    expect(result.current.repeatNameError).toBeNull();
  });

  it('sets the end-date minimum to the day after the start', async () => {
    const { result } = await renderHook(() => useRecurringDraft({ ...base, day: new Date(2026, 1, 2) }));
    expect(result.current.repeatMinDate.getDate()).toBe(3);
  });

  it('builds a recurrence draft from the current values', async () => {
    const { result } = await renderHook(() =>
      useRecurringDraft({ ...base, initialRepeatName: '  Rent  ', initialRepeatFrequency: 'monthly', initialRepeatInterval: 2 }),
    );
    expect(result.current.buildRecurrence()).toEqual({
      name: 'Rent',
      frequency: 'monthly',
      interval: 2,
      endDate: null,
      skipFirst: false,
    });
  });
});
