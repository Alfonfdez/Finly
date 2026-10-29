import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import { badgeShapeFor } from '../utils/badgeShape';
import type { Category } from '../database/types';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import ListItemRow from './ListItemRow';
import ModalEntitySubject from './ModalEntitySubject';
import { CategoryTransferBody, type TransferTargetId } from './CategoryTransferModal';
import ModalFooter from './ModalFooter';
import type { IconName } from '../constants/types';
import { WHITE } from '../constants/themes';

export interface BulkCategoryItem {
  category: Category;
  /** Generated transactions the category holds. */
  txCount: number;
  /** Recurring rules pointing at the category. */
  ruleCount: number;
}

interface Props {
  visible: boolean;
  categories: BulkCategoryItem[];
  targets: Category[];
  decisions: Record<number, TransferTargetId | null>;
  onDecide: (categoryId: number, decision: TransferTargetId | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BulkCategoryTransferModal({
  visible,
  categories,
  targets,
  decisions,
  onDecide,
  onConfirm,
  onCancel,
}: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  const targetById = useMemo(() => {
    const map = new Map<number, Category>();
    for (const target of targets) map.set(target.id, target);
    return map;
  }, [targets]);

  const decisionLabel = (categoryId: number): string => {
    const decision = decisions[categoryId];
    if (decision === 'delete') return labels.categories_bulk_move_delete_option;
    if (decision === null || decision === undefined) return labels.categories_bulk_move_choose;
    const target = targetById.get(decision);
    return target ? getDisplayCategoryName(target) : labels.categories_bulk_move_choose;
  };

  const pickerCategory = pickerFor !== null ? categories.find((item) => item.category.id === pickerFor) : undefined;
  const allResolved =
    categories.length > 0 && categories.every(({ category }) => decisions[category.id] != null);

  const pickerDecision = pickerFor !== null ? (decisions[pickerFor] ?? null) : null;

  return (
    <ModalShell visible={visible} onClose={pickerFor !== null ? () => setPickerFor(null) : onCancel}>
      {pickerFor !== null ? (
        <>
          <ModalHeader title={labels.categories_bulk_move_title} icon="swap-horizontal-outline" />
          {pickerCategory ? (
            <View style={styles.subject}>
              <ModalEntitySubject
                name={getDisplayCategoryName(pickerCategory.category)}
                icon={pickerCategory.category.icon as IconName}
                color={pickerCategory.category.color}
                shape={badgeShapeFor(config, 'category')}
                subtitle={labels.categories_bulk_move_data(pickerCategory.txCount, pickerCategory.ruleCount)}
              />
            </View>
          ) : null}
          <CategoryTransferBody
            categories={targets}
            selectedId={pickerDecision}
            deleteOptionLabel={labels.categories_bulk_move_delete_option}
            onSelect={(id) => onDecide(pickerFor, id)}
          />
          <ModalFooter
            cancelLabel={labels.cancel}
            confirmLabel={labels.modify_cat_select_confirm}
            onCancel={() => setPickerFor(null)}
            onConfirm={() => setPickerFor(null)}
            confirmDisabled={pickerDecision === null}
            minHeight={44}
            disabledBg={c.textSecondary}
            disabledTextColor={WHITE}
          />
        </>
      ) : (
        <>
          <ModalHeader title={labels.categories_bulk_move_title} icon="swap-horizontal-outline" />
          <ScrollView style={styles.list}>
            {categories.map(({ category, txCount, ruleCount }) => {
              const decision = decisions[category.id] ?? null;
              return (
                <ListItemRow
                  key={category.id}
                  title={getDisplayCategoryName(category)}
                  subtitle={labels.categories_bulk_move_data(txCount, ruleCount)}
                  icon={category.icon}
                  color={category.color}
                  shape={badgeShapeFor(config, 'category')}
                  badgeSize={36}
                  badgeIconSize={20}
                  badgeRadius={8}
                  badgeAlpha={20}
                  badgeGap={12}
                  right={
                    <View style={styles.decision}>
                      <Text
                        style={[
                          styles.decisionText,
                          {
                            color: decision == null ? c.textSecondary : c.primary,
                            fontSize: fs(13),
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {decisionLabel(category.id)}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
                    </View>
                  }
                  onPress={() => setPickerFor(category.id)}
                  accessibilityLabel={getDisplayCategoryName(category)}
                  accessibilityState={{ expanded: false }}
                  divider
                />
              );
            })}
            <Text style={[styles.note, { color: c.textSecondary, fontSize: fs(13) }]}>
              {labels.categories_bulk_move_note}
            </Text>
          </ScrollView>
          <ModalFooter
            cancelLabel={labels.cancel}
            confirmLabel={labels.categories_bulk_move_confirm}
            onCancel={onCancel}
            onConfirm={onConfirm}
            confirmDisabled={!allResolved}
            minHeight={44}
            disabledBg={c.textSecondary}
            disabledTextColor={WHITE}
          />
        </>
      )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  subject: {
    marginBottom: 8,
  },
  list: {
    maxHeight: 300,
    marginBottom: 16,
  },
  decision: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
    maxWidth: 140,
  },
  decisionText: {
    fontWeight: '600',
    flexShrink: 1,
  },
  note: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
});
