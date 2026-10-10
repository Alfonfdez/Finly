import { useState, useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- T is used for caller type inference
interface UseSelectAndSearchOptions<T extends number | string> {
  hasItems: boolean;
}

export function useSelectAndSearch<T extends number | string = number>({
  hasItems,
}: UseSelectAndSearchOptions<T>) {
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const toggleItem = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = useCallback(
    (ids: T[]) => ids.length > 0 && ids.every((id) => selectedIds.has(id)),
    [selectedIds]
  );

  const toggleSelectAll = useCallback((ids: T[]) => {
    setSelectedIds((prev) =>
      ids.length > 0 && ids.every((id) => prev.has(id)) ? new Set() : new Set(ids)
    );
  }, []);

  const exitSelectMode = useCallback(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
  }, []);

  const toggleSelectMode = useCallback(() => {
    setSelectMode(prev => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const toggleSearch = useCallback(() => {
    setSearchActive((prev) => !prev);
    setSearchText('');
  }, []);

  const closeSearch = useCallback(() => {
    setSearchActive(false);
    setSearchText('');
  }, []);

  return {
    searchActive,
    searchText,
    setSearchText,
    selectMode,
    setSelectMode,
    selectedIds,
    setSelectedIds,
    deleteModalVisible,
    setDeleteModalVisible,
    toggleItem,
    allSelected,
    toggleSelectAll,
    exitSelectMode,
    toggleSelectMode,
    toggleSearch,
    closeSearch,
    hasItems,
  };
}
