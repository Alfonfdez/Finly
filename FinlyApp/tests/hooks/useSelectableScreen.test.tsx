import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useSelectableScreen } from '../../src/hooks/useSelectableScreen';

const mockSetOptions = vi.fn();
const headerRight = vi.fn(() => null);

interface SetupOptions {
  hasItems?: boolean;
  showHeader?: boolean;
}

function setup(overrides: SetupOptions = {}) {
  return renderHook(() =>
    useSelectableScreen<number>({
      navigation: { setOptions: mockSetOptions },
      hasItems: overrides.hasItems ?? true,
      showHeader: overrides.showHeader ?? true,
      headerRight,
    })
  );
}

describe('useSelectableScreen', () => {
  beforeEach(() => {
    mockSetOptions.mockClear();
    headerRight.mockClear();
  });

  it('delegates the select and search state to useSelectAndSearch', async () => {
    const { result } = await setup({ hasItems: false });
    expect(result.current.searchActive).toBe(false);
    expect(result.current.searchText).toBe('');
    expect(result.current.selectMode).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.hasItems).toBe(false);
  });

  it('registers no header right when showHeader is false', async () => {
    await setup({ showHeader: false });
    expect(mockSetOptions).toHaveBeenCalledWith({ headerRight: null });
  });

  it('registers the header right renderer when showHeader is true', async () => {
    const { result } = await setup({ showHeader: true });
    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({ headerRight: expect.any(Function) })
    );

    const opts = mockSetOptions.mock.calls[0][0] as { headerRight: () => unknown };
    expect(opts.headerRight()).toBeNull();
    expect(headerRight).toHaveBeenCalled();
    expect(result.current.selectMode).toBe(false);
  });

  it('re-registers the header right when select mode toggles', async () => {
    const { result } = await setup();
    expect(mockSetOptions).toHaveBeenCalledTimes(1);

    await act(() => result.current.toggleSelectMode());
    expect(mockSetOptions).toHaveBeenCalledTimes(2);

    await act(() => result.current.toggleSelectMode());
    expect(mockSetOptions).toHaveBeenCalledTimes(3);
  });

  it('forwards select and search actions to the underlying hook', async () => {
    const { result } = await setup();

    await act(() => result.current.toggleItem(5));
    await act(() => result.current.toggleItem(5));
    expect(result.current.selectedIds.size).toBe(0);

    await act(() => result.current.toggleSearch());
    expect(result.current.searchActive).toBe(true);

    await act(() => result.current.toggleSelectMode());
    expect(result.current.selectMode).toBe(true);
  });
});