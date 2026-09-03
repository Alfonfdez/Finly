import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useSearchFilter } from '../../src/hooks/useSearchFilter';

interface Item {
  id: number;
  name: string;
  note: string;
}

const items: Item[] = [
  { id: 1, name: 'Groceries', note: 'weekend' },
  { id: 2, name: 'Transport', note: 'commute' },
  { id: 3, name: 'Health', note: 'weekend gym' },
];

function getHaystacks(item: Item): string[] {
  return [item.name, item.note];
}

describe('useSearchFilter', () => {
  it('returns all items for a blank query', async () => {
    const { result } = await renderHook(() => useSearchFilter(items, '', getHaystacks));
    expect(result.current).toHaveLength(3);
  });

  it('matches a single term across haystacks (case-insensitive)', async () => {
    const { result } = await renderHook(() => useSearchFilter(items, 'GROC', getHaystacks));
    expect(result.current.map((i) => i.id)).toEqual([1]);
  });

  it('requires every whitespace-separated term to match', async () => {
    const { result } = await renderHook(() => useSearchFilter(items, 'weekend gym', getHaystacks));
    expect(result.current.map((i) => i.id)).toEqual([3]);
  });

  it('returns an empty array when nothing matches', async () => {
    const { result } = await renderHook(() => useSearchFilter(items, 'zzz', getHaystacks));
    expect(result.current).toHaveLength(0);
  });

  it('applies a keep predicate that takes priority over the term match', async () => {
    const keep = (item: Item) => item.id === 2;
    const { result } = await renderHook(() => useSearchFilter(items, 'zzz', getHaystacks, keep));
    expect(result.current.map((i) => i.id)).toEqual([2]);
  });

  it('recomputes when items change', async () => {
    let current = items;
    const { result, rerender } = await renderHook(() => useSearchFilter(current, 'grocer', getHaystacks));
    expect(result.current.map((i) => i.id)).toEqual([1]);

    current = [...items, { id: 4, name: 'Groceries Plus', note: '' }];
    await rerender({});
    expect(result.current.map((i) => i.id)).toEqual([1, 4]);
  });
});
