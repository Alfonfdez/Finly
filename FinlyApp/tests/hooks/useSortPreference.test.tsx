import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useSortPreference } from '../../src/hooks/useSortPreference';
import { SORT_DIRECTIONS } from '../../src/constants/types';

const defaultDirection = (field: 'name' | 'usage') =>
  field === 'usage' ? SORT_DIRECTIONS.desc : SORT_DIRECTIONS.asc;

describe('useSortPreference', () => {
  it('switches to another field with its natural default direction', async () => {
    const onChange = vi.fn();
    const { result } = await renderHook(() => useSortPreference<'name' | 'usage'>({
      sortBy: 'name',
      sortDirection: SORT_DIRECTIONS.asc,
      defaultDirection,
      onChange,
    }));

    await act(async () => { result.current.handleToggleSort('usage'); });
    expect(onChange).toHaveBeenCalledWith({ by: 'usage', direction: SORT_DIRECTIONS.desc });
  });

  it('flips the direction when the active field is tapped', async () => {
    const onChange = vi.fn();
    const { result } = await renderHook(() => useSortPreference<'name' | 'usage'>({
      sortBy: 'name',
      sortDirection: SORT_DIRECTIONS.asc,
      defaultDirection,
      onChange,
    }));

    await act(async () => { result.current.handleToggleSort('name'); });
    expect(onChange).toHaveBeenCalledWith({ by: 'name', direction: SORT_DIRECTIONS.desc });
  });

  it('toggles only the direction', async () => {
    const onChange = vi.fn();
    const { result } = await renderHook(() => useSortPreference<'name' | 'usage'>({
      sortBy: 'usage',
      sortDirection: SORT_DIRECTIONS.desc,
      defaultDirection,
      onChange,
    }));

    await act(async () => { result.current.handleToggleDirection(); });
    expect(onChange).toHaveBeenCalledWith({ by: 'usage', direction: SORT_DIRECTIONS.asc });
  });
});
