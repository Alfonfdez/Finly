import { useState, useCallback } from 'react';
import { runWithErrorAlert } from '../utils/errors';
import { useBusyGuard } from './useBusyGuard';

interface UseBulkDeleteOptions<T> {
  selectedIds: ReadonlySet<T>;
  /** IDs currently visible under the active filters. Hidden selections are never deleted. */
  visibleIds?: readonly T[];
  exitSelectMode: () => void;
  /** Leave select mode even when the delete fails. Defaults to keeping the selection. */
  exitSelectOnError?: boolean;
  deleteFn: (selected: T[]) => Promise<unknown>;
  afterDelete?: () => void | Promise<void>;
  errorPrefix: string;
  labels?: { error_title: string; error_generic: string };
}

export function useBulkDelete<T extends number | string>({
  selectedIds,
  visibleIds,
  exitSelectMode,
  exitSelectOnError = false,
  deleteFn,
  afterDelete,
  errorPrefix,
  labels,
}: UseBulkDeleteOptions<T>) {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { busy, run } = useBusyGuard();

  const openDeleteModal = useCallback(() => setDeleteModalVisible(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

  const confirmBulkDelete = useCallback(async () => {
    const visible = visibleIds ? new Set(visibleIds) : null;
    const ids = visible ? [...selectedIds].filter(id => visible.has(id)) : [...selectedIds];
    if (ids.length === 0) return;
    await run(async () => {
      setDeleteModalVisible(false);
      const ok = await runWithErrorAlert(async () => {
        await deleteFn(ids);
        exitSelectMode();
        await afterDelete?.();
        return true;
      }, errorPrefix, labels);
      if (ok === undefined && exitSelectOnError) exitSelectMode();
    });
  }, [
    selectedIds,
    visibleIds,
    exitSelectMode,
    exitSelectOnError,
    deleteFn,
    afterDelete,
    errorPrefix,
    labels,
    run,
  ]);

  return {
    deleteModalVisible,
    busy,
    openDeleteModal,
    closeDeleteModal,
    confirmBulkDelete,
  };
}
