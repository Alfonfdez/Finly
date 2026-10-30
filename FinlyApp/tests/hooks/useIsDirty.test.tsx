import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useIsDirty } from '../../src/hooks/useIsDirty';

interface Snapshot {
  a: number;
}

describe('useIsDirty', () => {
  it('is false while the baseline is unknown', async () => {
    const { result } = await renderHook(() => useIsDirty<Snapshot>(null, { a: 1 }));

    expect(result.current.isDirty).toBe(false);
  });

  it('compares by value, so returning to the original clears it again', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: number }) => useIsDirty<Snapshot>({ a: 1 }, { a: value }),
      { initialProps: { value: 1 } },
    );

    expect(result.current.isDirty).toBe(false);

    await act(async () => { rerender({ value: 2 }); });
    expect(result.current.isDirty).toBe(true);

    await act(async () => { rerender({ value: 1 }); });
    expect(result.current.isDirty).toBe(false);
  });

  it('can adopt a new baseline after an untouched external refresh', async () => {
    const { result, rerender } = await renderHook(
      ({ baseline, value }: { baseline: number; value: number }) =>
        useIsDirty<Snapshot>({ a: baseline }, { a: value }),
      { initialProps: { baseline: 1, value: 1 } },
    );

    await act(async () => { rerender({ baseline: 5, value: 5 }); });
    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      result.current.resetBaseline({ a: 5 });
      rerender({ baseline: 5, value: 5 });
    });
    expect(result.current.isDirty).toBe(false);
  });

  it('keeps the first captured baseline when it changes later', async () => {
    const { result, rerender } = await renderHook(
      ({ baseline, value }: { baseline: number; value: number }) =>
        useIsDirty<Snapshot>({ a: baseline }, { a: value }),
      { initialProps: { baseline: 1, value: 1 } },
    );

    // The entity was refetched with a different value: the baseline must not move.
    await act(async () => { rerender({ baseline: 5, value: 1 }); });
    expect(result.current.isDirty).toBe(false);

    await act(async () => { rerender({ baseline: 5, value: 5 }); });
    expect(result.current.isDirty).toBe(true);
  });
});
