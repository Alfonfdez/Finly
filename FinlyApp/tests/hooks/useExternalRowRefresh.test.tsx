import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useExternalRowRefresh } from '../../src/hooks/useExternalRowRefresh';

type Props = { updatedAt: string | null | undefined };

const use = (props: Props, options?: { warnWhenDirty?: boolean }) =>
  useExternalRowRefresh(props.updatedAt, options);

describe('useExternalRowRefresh', () => {
  it('does nothing while the row has not loaded (undefined)', async () => {
    const { result, rerender } = await renderHook(use, { initialProps: { updatedAt: undefined } as Props });
    expect(result.current.formKey).toBe(0);
    expect(result.current.updated).toBe(false);

    // Loading a row without a timestamp is still just the first sync.
    await act(async () => { rerender({ updatedAt: null }); });
    expect(result.current.formKey).toBe(0);
    expect(result.current.updated).toBe(false);
  });

  it('records the first loaded value without remounting', async () => {
    const { result } = await renderHook(use, { initialProps: { updatedAt: '2026-10-14 10:00:00' } });
    await act(async () => {});
    expect(result.current.formKey).toBe(0);
    expect(result.current.updated).toBe(false);
  });

  it('remounts an untouched form when the row changes', async () => {
    const { result, rerender } = await renderHook(use, { initialProps: { updatedAt: '2026-10-14 10:00:00' } });
    await act(async () => {});
    await act(async () => { rerender({ updatedAt: '2026-10-14 10:05:00' }); });
    expect(result.current.formKey).toBe(1);
    expect(result.current.updated).toBe(false);
  });

  it('warns a dirty form instead of remounting it', async () => {
    const { result, rerender } = await renderHook(use, { initialProps: { updatedAt: '2026-10-14 10:00:00' } });
    await act(async () => {});
    await act(async () => { result.current.onDirtyChange(true); });
    await act(async () => { rerender({ updatedAt: '2026-10-14 10:05:00' }); });
    expect(result.current.updated).toBe(true);
    expect(result.current.formKey).toBe(0);
  });

  it('adopts the row values and clears the warning', async () => {
    const { result, rerender } = await renderHook(use, { initialProps: { updatedAt: '2026-10-14 10:00:00' } });
    await act(async () => {});
    await act(async () => { result.current.onDirtyChange(true); });
    await act(async () => { rerender({ updatedAt: '2026-10-14 10:05:00' }); });
    expect(result.current.updated).toBe(true);

    await act(async () => { result.current.adopt(); });
    expect(result.current.formKey).toBe(1);
    expect(result.current.updated).toBe(false);
  });

  it('adopts a dirty form when warnings are disabled', async () => {
    const { result, rerender } = await renderHook(
      (props: Props) => useExternalRowRefresh(props.updatedAt, { warnWhenDirty: false }),
      { initialProps: { updatedAt: '2026-10-14 10:00:00' } },
    );
    await act(async () => {});
    await act(async () => { result.current.onDirtyChange(true); });
    await act(async () => { rerender({ updatedAt: '2026-10-14 10:05:00' }); });
    expect(result.current.formKey).toBe(1);
    expect(result.current.updated).toBe(false);
  });

  it('ignores an unchanged updatedAt', async () => {
    const { result, rerender } = await renderHook(use, { initialProps: { updatedAt: '2026-10-14 10:00:00' } });
    await act(async () => {});
    await act(async () => { rerender({ updatedAt: '2026-10-14 10:00:00' }); });
    expect(result.current.formKey).toBe(0);
    expect(result.current.updated).toBe(false);
  });
});
