import { useState, useCallback } from 'react';
import { runWithErrorAlert } from '../utils/errors';

interface UseBulkDeleteOptions<T> {
  selectedIds: ReadonlySet<T>;
  exitSelectMode: () => void;
  deleteFn: (selected: T[]) => Promise<unknown>;
  afterDelete?: () => void | Promise<void>;
  errorPrefix: string;
  labels?: { error_title: string; error_generic: string };
}

export function useBulkDelete<T extends number | string>({
  selectedIds,
  exitSelectMode,
  deleteFn,
  afterDelete,
  errorPrefix,
  labels,
}: UseBulkDeleteOptions<T>) {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const openDeleteModal = useCallback(() => setDeleteModalVisible(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

  const confirmBulkDelete = useCallback(async () => {
    setDeleteModalVisible(false);
    await runWithErrorAlert(async () => {
      await deleteFn([...selectedIds]);
      exitSelectMode();
      await afterDelete?.();
    }, errorPrefix, labels);
  }, [selectedIds, exitSelectMode, deleteFn, afterDelete, errorPrefix, labels]);

  return {
    deleteModalVisible,
    openDeleteModal,
    closeDeleteModal,
    confirmBulkDelete,
  };
}
