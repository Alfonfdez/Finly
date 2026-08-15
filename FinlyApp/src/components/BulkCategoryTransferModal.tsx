import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import { badgeShapeFor } from '../utils/badgeShape';
import type { Category } from '../database/types';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import ListItemRow from './ListItemRow';
import CategoryTransferModal, { type TransferTargetId } from './CategoryTransferModal';
import PrimaryButton from './form/PrimaryButton';
import { WHITE } from '../constants/themes';
import { BUTTON_BORDER_RADIUS } from './componentStyles';

export interface BulkCategoryItem {
  category: Category;
  count: number;
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

  const targetById = new Map<number, Category>();
  for (const target of targets) targetById.set(target.id, target);

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

  return (
    <ModalShell visible={visible} onClose={onCancel}>
      <ModalHeader title={labels.categories_bulk_move_title} size={16} />
      <ScrollView style={styles.list}>
        {categories.map(({ category, count }) => {
          const decision = decisions[category.id] ?? null;
          return (
            <ListItemRow
              key={category.id}
              title={getDisplayCategoryName(category)}
              subtitle={labels.categories_bulk_move_transactions(count)}
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
              accessibilityState={{ expanded: pickerFor === category.id }}
              divider
            />
          );
        })}
        <Text style={[styles.note, { color: c.textSecondary, fontSize: fs(13) }]}>
          {labels.categories_bulk_move_note}
        </Text>
      </ScrollView>
      <View style={styles.buttons}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={onCancel}
          >
            <Text style={[styles.buttonText, { color: c.text, fontSize: fs(14) }]}>
              {labels.modify_cat_select_cancel}
            </Text>
          </TouchableOpacity>
          <PrimaryButton
            label={labels.categories_bulk_move_confirm}
            onPress={onConfirm}
            disabled={!allResolved}
            disabledBg={c.textSecondary}
            enabledTextColor={WHITE}
            style={styles.button}
          />
        </View>
      </View>

      <CategoryTransferModal
        visible={pickerFor !== null}
        title={
          pickerCategory
            ? `${labels.categories_bulk_move_title}: ${getDisplayCategoryName(pickerCategory.category)}`
            : labels.categories_bulk_move_title
        }
        categories={targets}
        selectedId={pickerFor !== null ? (decisions[pickerFor] ?? null) : null}
        confirmLabel={labels.modify_cat_select_confirm}
        cancelLabel={labels.modify_cat_select_cancel}
        deleteOptionLabel={labels.categories_bulk_move_delete_option}
        onSelect={(id) => {
          if (pickerFor !== null) onDecide(pickerFor, id);
        }}
        onConfirm={() => setPickerFor(null)}
        onCancel={() => setPickerFor(null)}
      />
    </ModalShell>
  );
}

const styles = StyleSheet.create({
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
  buttons: {
    flexDirection: 'column',
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
