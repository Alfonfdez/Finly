import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { useKeyboardLift } from '../../src/hooks/useKeyboardInset';

describe('useKeyboardLift', () => {
  let handlers: Record<string, ((e: unknown) => void)[]>;

  beforeEach(() => {
    handlers = {};
    vi.spyOn(Keyboard, 'addListener').mockImplementation(((
      type: string,
      handler: (e: unknown) => void,
    ) => {
      (handlers[type] ??= []).push(handler);
      return { remove: vi.fn() };
    }) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const emit = (type: string, event: unknown) =>
    act(async () => { handlers[type]?.forEach(h => h(event)); });

  it('lifts while the keyboard is shown and holds it when the keyboard hides', async () => {
    const { result } = await renderHook(() => useKeyboardLift(true));
    expect(result.current).toBe(0);

    await emit('keyboardDidShow', { endCoordinates: { height: 300 } });
    expect(result.current).toBe(300);

    // The keyboard hiding (e.g. tapping a button) must not drop the lift.
    await emit('keyboardDidHide', {});
    expect(result.current).toBe(300);
  });

  it('resets the lift when the modal becomes hidden', async () => {
    let visible = true;
    const { result, rerender } = await renderHook(() => useKeyboardLift(visible));
    await emit('keyboardDidShow', { endCoordinates: { height: 300 } });
    expect(result.current).toBe(300);

    visible = false;
    await act(async () => { rerender(undefined); });
    expect(result.current).toBe(0);
  });

  it('keeps the tallest lift seen while open', async () => {
    const { result } = await renderHook(() => useKeyboardLift(true));
    await emit('keyboardDidShow', { endCoordinates: { height: 250 } });
    expect(result.current).toBe(250);
    await emit('keyboardDidShow', { endCoordinates: { height: 310 } });
    expect(result.current).toBe(310);
    await emit('keyboardDidShow', { endCoordinates: { height: 200 } });
    expect(result.current).toBe(310);
  });
});
