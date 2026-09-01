import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useSelectAndSearch } from '../../src/hooks/useSelectAndSearch';

async function setup(overrides: { hasItems?: boolean } = {}) {
  const { result } = await renderHook(() => useSelectAndSearch({ hasItems: overrides.hasItems ?? true }));
  return { result };
}

describe('useSelectAndSearch', () => {
  it('starts in the default state', async () => {
    const { result } = await setup({ hasItems: false });
    expect(result.current.searchActive).toBe(false);
    expect(result.current.searchText).toBe('');
    expect(result.current.selectMode).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.deleteModalVisible).toBe(false);
    expect(result.current.hasItems).toBe(false);
  });

  it('toggles a selected id on and off', async () => {
    const { result } = await setup();

    await act(() => result.current.toggleItem(5));
    expect(result.current.selectedIds.has(5)).toBe(true);

    await act(() => result.current.toggleItem(5));
    expect(result.current.selectedIds.has(5)).toBe(false);
  });

  it('toggles multiple ids independently', async () => {
    const { result } = await setup();

    await act(() => result.current.toggleItem(1));
    await act(() => result.current.toggleItem(2));
    expect(result.current.selectedIds.size).toBe(2);
    expect(result.current.selectedIds.has(1)).toBe(true);
    expect(result.current.selectedIds.has(2)).toBe(true);
  });

  it('toggles select mode on, preserving the selection', async () => {
    const { result } = await setup();

    await act(() => result.current.toggleItem(3));
    await act(() => result.current.toggleSelectMode());
    expect(result.current.selectMode).toBe(true);
    expect(result.current.selectedIds.has(3)).toBe(true);
  });

  it('clears the selection when turning select mode off', async () => {
    const { result } = await setup();

    await act(() => result.current.toggleSelectMode());
    await act(() => result.current.toggleItem(9));
    expect(result.current.selectedIds.has(9)).toBe(true);

    await act(() => result.current.toggleSelectMode());
    expect(result.current.selectMode).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('exitSelectMode clears the selection and leaves select mode', async () => {
    const { result } = await setup();

    await act(() => result.current.toggleSelectMode());
    await act(() => result.current.toggleItem(4));
    await act(() => result.current.exitSelectMode());

    expect(result.current.selectMode).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('toggleSearch flips searchActive and resets the text', async () => {
    const { result } = await setup();

    await act(() => result.current.toggleSearch());
    expect(result.current.searchActive).toBe(true);

    await act(() => result.current.setSearchText('abc'));
    await act(() => result.current.toggleSearch());
    expect(result.current.searchActive).toBe(false);
    expect(result.current.searchText).toBe('');
  });

  it('closeSearch deactivates search and clears the text', async () => {
    const { result } = await setup();

    await act(() => result.current.toggleSearch());
    await act(() => result.current.setSearchText('foo'));
    await act(() => result.current.closeSearch());

    expect(result.current.searchActive).toBe(false);
    expect(result.current.searchText).toBe('');
  });
});
