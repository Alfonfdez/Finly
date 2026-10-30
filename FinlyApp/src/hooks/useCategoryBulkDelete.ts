import { useCallback, useMemo, useState } from 'react';
import { CATEGORY_TRANSFER_TARGETS, type TransferTargetId } from '../constants/types';
import { categoryRepository, recurringRepository, transactionRepository } from '../database';
import type { Category } from '../database/types';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';
import { useBulkDelete } from './useBulkDelete';
import { useBusyGuard } from './useBusyGuard';

export interface BulkCategoryItem {
  category: Category;
  txCount: number;
  ruleCount: number;
}

interface UseCategoryBulkDeleteOptions {
  categoriesByType: readonly Category[];
  visibleIds: readonly number[];
  selectedIds: ReadonlySet<number>;
  typeCount: number;
  exitSelectMode: () => void;
  onChanged: () => void | Promise<void>;
}

function visibleSelectedIds(
  selectedIds: ReadonlySet<number>,
  visibleIds: readonly number[],
): number[] {
  const visible = new Set(visibleIds);
  return [...selectedIds].filter(id => visible.has(id));
}

export function useCategoryBulkDelete({
  categoriesByType,
  visibleIds,
  selectedIds,
  typeCount,
  exitSelectMode,
  onChanged,
}: UseCategoryBulkDeleteOptions) {
  const [resolutionVisible, setResolutionVisible] = useState(false);
  const [guardVisible, setGuardVisible] = useState(false);
  const [inUseCategories, setInUseCategories] = useState<BulkCategoryItem[]>([]);
  const [deleteHasData, setDeleteHasData] = useState(false);
  const [decisions, setDecisions] = useState<Record<number, TransferTargetId | null>>({});
  const { run } = useBusyGuard();

  const {
    deleteModalVisible,
    busy,
    openDeleteModal,
    closeDeleteModal,
    confirmBulkDelete,
  } = useBulkDelete({
    selectedIds,
    visibleIds,
    exitSelectMode,
    exitSelectOnError: true,
    deleteFn: categoryRepository.deleteMany,
    afterDelete: onChanged,
    errorPrefix: ERROR_PREFIXES.categoriesDelete,
  });

  const transferTargets = useMemo(
    () => categoriesByType.filter(category => !selectedIds.has(category.id)),
    [categoriesByType, selectedIds],
  );

  const handleDeletePress = useCallback(async () => {
    const ids = visibleSelectedIds(selectedIds, visibleIds);
    if (ids.length === 0) return;
    if (ids.length >= typeCount) {
      setGuardVisible(true);
      return;
    }
    try {
      const selected = new Set(ids);
      const [txCounts, ruleCounts] = await Promise.all([
        transactionRepository.countByCategoryIdsMap(ids),
        recurringRepository.countByCategoryIds(ids),
      ]);
      const inUse = categoriesByType
        .filter(category => selected.has(category.id)
          && ((txCounts[category.id] ?? 0) > 0 || (ruleCounts[category.id] ?? 0) > 0))
        .map(category => ({
          category,
          txCount: txCounts[category.id] ?? 0,
          ruleCount: ruleCounts[category.id] ?? 0,
        }));
      setInUseCategories(inUse);
      setDeleteHasData(inUse.length > 0);
    } catch {
      const selected = new Set(ids);
      setInUseCategories(
        categoriesByType
          .filter(category => selected.has(category.id))
          .map(category => ({ category, txCount: 0, ruleCount: 0 })),
      );
      setDeleteHasData(true);
    }
    openDeleteModal();
  }, [categoriesByType, openDeleteModal, selectedIds, typeCount, visibleIds]);

  const handlePermanentDelete = useCallback(() => {
    const ids = visibleSelectedIds(selectedIds, visibleIds);
    if (ids.length === 0) {
      closeDeleteModal();
      exitSelectMode();
      return;
    }
    confirmBulkDelete();
  }, [closeDeleteModal, confirmBulkDelete, exitSelectMode, selectedIds, visibleIds]);

  const handleMoveTransactions = useCallback(() => {
    closeDeleteModal();
    setDecisions({});
    setResolutionVisible(true);
  }, [closeDeleteModal]);

  const handleDecide = useCallback((categoryId: number, decision: TransferTargetId | null) => {
    setDecisions(prev => ({ ...prev, [categoryId]: decision }));
  }, []);

  const handleConfirmResolution = useCallback(async () => {
    if (inUseCategories.length === 0) return;
    setResolutionVisible(false);
    const items = visibleSelectedIds(selectedIds, visibleIds).map((id) => {
      const decision = decisions[id];
      const targetId =
        decision === undefined || decision === null || decision === CATEGORY_TRANSFER_TARGETS.delete
          ? null
          : decision;
      return { id, targetId };
    });
    if (items.length === 0) {
      exitSelectMode();
      return;
    }
    await run(async () => {
      await runWithErrorAlert(async () => {
        await categoryRepository.bulkDeleteWithTargets(items);
        await onChanged();
      }, ERROR_PREFIXES.categoriesDelete);
    });
    exitSelectMode();
  }, [
    decisions,
    exitSelectMode,
    inUseCategories.length,
    onChanged,
    run,
    selectedIds,
    visibleIds,
  ]);

  const closeGuard = useCallback(() => setGuardVisible(false), []);
  const closeResolution = useCallback(() => setResolutionVisible(false), []);

  return {
    deleteModalVisible,
    deleteBusy: busy,
    guardVisible,
    inUseCategories,
    deleteHasData,
    resolutionVisible,
    decisions,
    transferTargets,
    handleDeletePress,
    handlePermanentDelete,
    handleMoveTransactions,
    handleDecide,
    handleConfirmResolution,
    closeDeleteModal,
    closeGuard,
    closeResolution,
  };
}
