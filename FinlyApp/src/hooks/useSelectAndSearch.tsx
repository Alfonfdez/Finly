import { useState, useCallback } from 'react';

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

  const exitSelectMode = useCallback(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
  }, []);

  const toggleSelectMode = useCallback(() => {
    if (selectMode) setSelectedIds(new Set());
    setSelectMode(!selectMode);
  }, [selectMode]);

  const toggleSearch = useCallback(() => {
    setSearchActive((prev) => !prev);
    setSearchText('');
  }, []);

  return {
    searchActive,
    setSearchActive,
    searchText,
    setSearchText,
    selectMode,
    setSelectMode,
    selectedIds,
    setSelectedIds,
    deleteModalVisible,
    setDeleteModalVisible,
    toggleItem,
    exitSelectMode,
    toggleSelectMode,
    toggleSearch,
    hasItems,
  };
}
