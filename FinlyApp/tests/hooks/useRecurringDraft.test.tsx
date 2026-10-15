import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useRecurringDraft } from '../../src/hooks/useRecurringDraft';

const base = { day: new Date(2026, 1, 2), ruleMode: true };

describe('useRecurringDraft', () => {
  it('flags a required name error when empty, but holds the message until the field is touched', async () => {
    const { result } = await renderHook(() => useRecurringDraft({ ...base, initialRepeatName: '' }));
    expect(result.current.repeatNameError).toBe('required');
    expect(result.current.repeatNameErrorDisplay).toBeNull();

    await act(async () => { result.current.markNameTouched(); });
    expect(result.current.repeatNameErrorDisplay).toBe('required');
  });

  it('shows a taken name error before the field is touched', async () => {
    const { result } = await renderHook(() =>
      useRecurringDraft({ ...base, initialRepeatName: 'rent', existingRepeatNames: ['Rent'] }),
    );
    expect(result.current.repeatNameError).toBe('taken');
    expect(result.current.repeatNameErrorDisplay).toBe('taken');
  });

  it('has no name error for a unique name', async () => {
    const { result } = await renderHook(() =>
      useRecurringDraft({ ...base, initialRepeatName: 'Rent', existingRepeatNames: ['Groceries'] }),
    );
    expect(result.current.repeatNameError).toBeNull();
    expect(result.current.repeatNameErrorDisplay).toBeNull();
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
      lastDay: false,
    });
  });

  it('anchors a last-day rule on the last day of the start month', async () => {
    const { result } = await renderHook(() =>
      useRecurringDraft({ ...base, day: new Date(2026, 0, 15), initialRepeatFrequency: 'monthly', initialRepeatLastDay: true }),
    );
    expect(result.current.buildRecurrence()).toMatchObject({ lastDay: true });
    // End-date minimum = the day after the last day of the start month (31 Jan → 1 Feb).
    expect(result.current.repeatMinDate.getDate()).toBe(1);
    expect(result.current.repeatMinDate.getMonth()).toBe(1);
  });
});
