import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react-native';
import { useTwoStepConfirmation } from '../../src/hooks/useTwoStepConfirmation';

interface Options {
  canClose: boolean;
}

async function setup(initialProps: Options = { canClose: true }) {
  const { result, rerender } = await renderHook(
    (props: Options) => useTwoStepConfirmation(props),
    { initialProps },
  );
  return { result, rerender };
}

describe('useTwoStepConfirmation', () => {
  it('opens the first step', async () => {
    const { result } = await setup();

    await act(() => result.current.open());

    expect(result.current.firstVisible).toBe(true);
    expect(result.current.secondVisible).toBe(false);
  });

  it('advances to the second step while keeping the first mounted', async () => {
    const { result } = await setup();

    await act(() => result.current.open());
    await act(() => result.current.advance());

    expect(result.current.firstVisible).toBe(true);
    expect(result.current.secondVisible).toBe(true);
  });

  it('closes only the first step', async () => {
    const { result } = await setup();

    await act(() => result.current.open());
    await act(() => result.current.cancelFirst());

    expect(result.current.firstVisible).toBe(false);
    expect(result.current.secondVisible).toBe(false);
  });

  it('updates the typed text', async () => {
    const { result } = await setup();

    await act(() => result.current.setText('DELETE'));

    expect(result.current.text).toBe('DELETE');
  });

  it('blocks the second-step cancel while closing is disabled', async () => {
    const { result, rerender } = await setup({ canClose: true });

    await act(() => result.current.open());
    await act(() => result.current.advance());
    await act(() => result.current.setText('DELETE'));
    await act(async () => {
      rerender({ canClose: false });
    });
    await act(() => result.current.cancelSecond());

    expect(result.current.firstVisible).toBe(true);
    expect(result.current.secondVisible).toBe(true);
    expect(result.current.text).toBe('DELETE');
  });

  it('resets both steps and text when the second-step cancel is allowed', async () => {
    const { result } = await setup();

    await act(() => result.current.open());
    await act(() => result.current.advance());
    await act(() => result.current.setText('DELETE'));
    await act(() => result.current.cancelSecond());

    expect(result.current.firstVisible).toBe(false);
    expect(result.current.secondVisible).toBe(false);
    expect(result.current.text).toBe('');
  });

  it('resets both steps and text unconditionally', async () => {
    const { result } = await setup({ canClose: false });

    await act(() => result.current.open());
    await act(() => result.current.advance());
    await act(() => result.current.setText('DELETE'));
    await act(() => result.current.reset());

    expect(result.current.firstVisible).toBe(false);
    expect(result.current.secondVisible).toBe(false);
    expect(result.current.text).toBe('');
  });
});
