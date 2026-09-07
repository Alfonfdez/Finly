import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useSelectableScreen } from '../../src/hooks/useSelectableScreen';

const mockSetOptions = vi.fn();
const headerRight = vi.fn(() => null);

interface Props {
  showHeader: boolean;
  selectMode: boolean;
}

function useHook({ showHeader, selectMode }: Props) {
  useSelectableScreen({
    navigation: { setOptions: mockSetOptions },
    showHeader,
    selectMode,
    headerRight,
  });
}

const DEFAULT_PROPS: Props = { showHeader: true, selectMode: false };

describe('useSelectableScreen', () => {
  beforeEach(() => {
    mockSetOptions.mockClear();
    headerRight.mockClear();
  });

  it('registers no header right when showHeader is false', async () => {
    await renderHook(useHook, { initialProps: { ...DEFAULT_PROPS, showHeader: false } });
    expect(mockSetOptions).toHaveBeenCalledWith({ headerRight: null });
  });

  it('registers the header right renderer when showHeader is true', async () => {
    await renderHook(useHook, { initialProps: DEFAULT_PROPS });
    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({ headerRight: expect.any(Function) })
    );

    const opts = mockSetOptions.mock.calls[0][0] as { headerRight: () => unknown };
    expect(opts.headerRight()).toBeNull();
    expect(headerRight).toHaveBeenCalled();
  });

  it('re-registers the header when select mode toggles', async () => {
    const { rerender } = await renderHook(useHook, { initialProps: DEFAULT_PROPS });
    expect(mockSetOptions).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender({ showHeader: true, selectMode: true });
    });
    expect(mockSetOptions).toHaveBeenCalledTimes(2);
  });

  it('clears the header right when showHeader flips to false', async () => {
    const { rerender } = await renderHook(useHook, { initialProps: DEFAULT_PROPS });
    expect(mockSetOptions).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender({ showHeader: false, selectMode: false });
    });
    expect(mockSetOptions).toHaveBeenCalledTimes(2);
    expect(mockSetOptions).toHaveBeenLastCalledWith({ headerRight: null });
  });
});