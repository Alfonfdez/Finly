import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { Keyboard, type ScrollView } from 'react-native';
import { useKeyboardReveal } from '../../src/hooks/useKeyboardReveal';

type MockRef = { current: { scrollToEnd: ReturnType<typeof vi.fn> } };

const wait = () => new Promise(resolve => setTimeout(resolve, 350));
const makeRef = (): MockRef => ({ current: { scrollToEnd: vi.fn() } });
const useReveal = (ref: MockRef) =>
  useKeyboardReveal(ref as unknown as { current: ScrollView | null });

describe('useKeyboardReveal', () => {
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

  it('reveals (scrolls to end) when a bottom field is focused', async () => {
    const ref = makeRef();
    const { result } = await renderHook(() => useReveal(ref));
    await act(async () => { result.current.onBottomFieldFocus(); });
    await wait();
    expect(ref.current.scrollToEnd).toHaveBeenCalledWith({ animated: true });
  });

  it('does not reveal on layout while no bottom field is focused', async () => {
    const ref = makeRef();
    const { result } = await renderHook(() => useReveal(ref));
    await act(async () => { result.current.onScrollLayout(); });
    await wait();
    expect(ref.current.scrollToEnd).not.toHaveBeenCalled();
  });

  it('cancels a pending reveal when the field blurs before the timer fires', async () => {
    const ref = makeRef();
    const { result } = await renderHook(() => useReveal(ref));

    await act(async () => { result.current.onBottomFieldFocus(); });
    await act(async () => { result.current.onBottomFieldBlur(); });
    await wait();

    expect(ref.current.scrollToEnd).not.toHaveBeenCalled();
  });

  it('does not re-reveal on layout after blur', async () => {
    const ref = makeRef();
    const { result } = await renderHook(() => useReveal(ref));
    await act(async () => { result.current.onBottomFieldFocus(); });
    await act(async () => { result.current.onBottomFieldBlur(); });
    await act(async () => { result.current.onScrollLayout(); });
    await wait();

    expect(ref.current.scrollToEnd).not.toHaveBeenCalled();
  });

  it('re-reveals on layout while a bottom field is focused', async () => {
    const ref = makeRef();
    const { result } = await renderHook(() => useReveal(ref));
    await act(async () => { result.current.onBottomFieldFocus(); });
    await wait();
    ref.current.scrollToEnd.mockClear();

    await act(async () => { result.current.onScrollLayout(); });
    await wait();
    expect(ref.current.scrollToEnd).toHaveBeenCalledTimes(1);
  });

  it('reveals on keyboardDidShow while focused, and stops after blur', async () => {
    const ref = makeRef();
    const { result } = await renderHook(() => useReveal(ref));
    await act(async () => { result.current.onBottomFieldFocus(); });
    await wait();
    ref.current.scrollToEnd.mockClear();

    act(() => { handlers.keyboardDidShow?.forEach(h => h({ endCoordinates: { height: 300 } })); });
    await wait();
    expect(ref.current.scrollToEnd).toHaveBeenCalledTimes(1);
    ref.current.scrollToEnd.mockClear();

    await act(async () => { result.current.onBottomFieldBlur(); });
    act(() => { handlers.keyboardDidShow?.forEach(h => h({ endCoordinates: { height: 300 } })); });
    await wait();
    expect(ref.current.scrollToEnd).not.toHaveBeenCalled();
  });
});
