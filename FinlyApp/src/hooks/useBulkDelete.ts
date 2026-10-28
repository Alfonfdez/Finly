import { useState, useCallback, useRef } from 'react';
import { runWithErrorAlert } from '../utils/errors';

interface UseBulkDeleteOptions<T> {
  selectedIds: ReadonlySet<T>;
  /** IDs currently visible under the active filters. Hidden selections are never deleted. */
  visibleIds?: readonly T[];
  exitSelectMode: () => void;
  deleteFn: (selected: T[]) => Promise<unknown>;
  afterDelete?: () => void | Promise<void>;
  errorPrefix: string;
  labels?: { error_title: string; error_generic: string };
}

export function useBulkDelete<T extends number | string>({
  selectedIds,
  visibleIds,
  exitSelectMode,
  deleteFn,
  afterDelete,
  errorPrefix,
  labels,
}: UseBulkDeleteOptions<T>) {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const openDeleteModal = useCallback(() => setDeleteModalVisible(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

  const confirmBulkDelete = useCallback(async () => {
    if (busyRef.current) return;
    const visible = visibleIds ? new Set(visibleIds) : null;
    const ids = visible ? [...selectedIds].filter(id => visible.has(id)) : [...selectedIds];
    if (ids.length === 0) return;
    busyRef.current = true;
    setBusy(true);
    setDeleteModalVisible(false);
    try {
      await runWithErrorAlert(async () => {
        await deleteFn(ids);
        exitSelectMode();
        await afterDelete?.();
      }, errorPrefix, labels);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [selectedIds, visibleIds, exitSelectMode, deleteFn, afterDelete, errorPrefix, labels]);

  return {
    deleteModalVisible,
    busy,
    openDeleteModal,
    closeDeleteModal,
    confirmBulkDelete,
  };
}
