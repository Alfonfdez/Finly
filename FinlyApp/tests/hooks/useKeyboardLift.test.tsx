import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { KEYBOARD_LIFT_RELEASE_MS, useKeyboardLift } from '../../src/hooks/useKeyboardInset';

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
  const waitForRelease = () => new Promise(resolve => setTimeout(resolve, KEYBOARD_LIFT_RELEASE_MS + 30));

  it('lifts while the keyboard is shown and releases it shortly after the keyboard hides', async () => {
    const { result } = await renderHook(() => useKeyboardLift(true));
    expect(result.current).toBe(0);

    await emit('keyboardDidShow', { endCoordinates: { height: 300 } });
    expect(result.current).toBe(300);

    // The lift is held briefly so a button tap can finish, then released.
    await emit('keyboardDidHide', {});
    expect(result.current).toBe(300);
    await act(async () => { await waitForRelease(); });
    expect(result.current).toBe(0);
  });

  it('keeps the lift if the keyboard returns before the release delay', async () => {
    const { result } = await renderHook(() => useKeyboardLift(true));
    await emit('keyboardDidShow', { endCoordinates: { height: 300 } });
    await emit('keyboardDidHide', {});
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 80)); });

    await emit('keyboardDidShow', { endCoordinates: { height: 320 } });
    await act(async () => { await waitForRelease(); });
    expect(result.current).toBe(320);
  });

  it('ignores a keyboard that was already open when the modal opens', async () => {
    let visible = false;
    const { result, rerender } = await renderHook(() => useKeyboardLift(visible));

    await emit('keyboardDidShow', { endCoordinates: { height: 300 } });
    expect(result.current).toBe(0);

    visible = true;
    await act(async () => { rerender(undefined); });
    expect(result.current).toBe(0);

    await emit('keyboardDidHide', {});
    await act(async () => { await waitForRelease(); });
    expect(result.current).toBe(0);

    await emit('keyboardDidShow', { endCoordinates: { height: 280 } });
    expect(result.current).toBe(280);
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

  it('ignores keyboard events while the modal is hidden', async () => {
    let visible = false;
    const { result, rerender } = await renderHook(() => useKeyboardLift(visible));

    await emit('keyboardDidShow', { endCoordinates: { height: 300 } });
    expect(result.current).toBe(0);
    await emit('keyboardDidHide', {});

    visible = true;
    await act(async () => { rerender(undefined); });
    expect(result.current).toBe(0);

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
