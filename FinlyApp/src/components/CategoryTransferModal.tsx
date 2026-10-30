import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import { badgeShapeFor } from '../utils/badgeShape';
import type { Category } from '../database/types';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import RadioButton from './RadioButton';
import ListItemRow from './ListItemRow';
import ModalFooter from './ModalFooter';
import ModalEntitySubject from './ModalEntitySubject';
import { WHITE, TRANSPARENT } from '../constants/themes';
import { CATEGORY_TRANSFER_TARGETS, type IconName, type TransferTargetId } from '../constants/types';
import { CONTROL_BORDER_RADIUS } from './componentStyles';

interface BodyProps {
  categories: Category[];
  selectedId: TransferTargetId | null;
  deleteOptionLabel?: string;
  onSelect: (id: TransferTargetId) => void;
}

/** The category/delete list without a Modal wrapper, reusable inside another dialog. */
export function CategoryTransferBody({
  categories,
  selectedId,
  deleteOptionLabel,
  onSelect,
}: BodyProps) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const isDeleteSelected = selectedId === CATEGORY_TRANSFER_TARGETS.delete;

  return (
    <ScrollView style={styles.list}>
      {categories.length === 0 ? (
        <Text style={[styles.empty, { color: c.textSecondary, fontSize: fs(14) }]}>
          {labels.add_cat_no_results}
        </Text>
      ) : (
        categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          const radio = <RadioButton selected={isSelected} />;
          return (
            <ListItemRow
              key={cat.id}
              title={getDisplayCategoryName(cat)}
              leading={radio}
              icon={cat.icon}
              color={cat.color}
              shape={badgeShapeFor(config, 'category')}
              badgeSize={36}
              badgeIconSize={20}
              badgeRadius={8}
              badgeAlpha={20}
              badgeGap={12}
              style={[styles.item, { backgroundColor: isSelected ? c.background : TRANSPARENT }]}
              onPress={() => onSelect(cat.id)}
              accessibilityLabel={getDisplayCategoryName(cat)}
              accessibilityState={{ selected: isSelected }}
            />
          );
        })
      )}
      {deleteOptionLabel ? (
        <View style={[styles.divider, { backgroundColor: c.border }]} />
      ) : null}
      {deleteOptionLabel ? (
        <TouchableOpacity
          style={[styles.item, styles.deleteItem, { backgroundColor: isDeleteSelected ? c.background : TRANSPARENT }]}
          onPress={() => onSelect(CATEGORY_TRANSFER_TARGETS.delete)}
          accessibilityLabel={deleteOptionLabel}
          accessibilityState={{ selected: isDeleteSelected }}
        >
          <RadioButton selected={isDeleteSelected} color={c.red} />
          <View style={[styles.deleteIcon, { backgroundColor: c.red }]}>
            <Ionicons name="trash-outline" size={18} color={WHITE} />
          </View>
          <Text style={[styles.deleteText, { color: c.red, fontSize: fs(14) }]} numberOfLines={1}>
            {deleteOptionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

interface Props {
  visible: boolean;
  title: string;
  sourceCategory?: Category;
  sourceSubtitle?: string;
  categories: Category[];
  selectedId: TransferTargetId | null;
  confirmLabel: string;
  cancelLabel: string;
  deleteOptionLabel?: string;
  onSelect: (id: TransferTargetId) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CategoryTransferModal({
  visible,
  title,
  sourceCategory,
  sourceSubtitle,
  categories,
  selectedId,
  confirmLabel,
  cancelLabel,
  deleteOptionLabel,
  onSelect,
  onConfirm,
  onCancel,
}: Props) {
  const { activeColors: c, config } = useConfig();

  return (
    <ModalShell visible={visible} onClose={onCancel}>
      <ModalHeader title={title} icon="swap-horizontal-outline" />
      {sourceCategory ? (
        <View style={styles.subject}>
          <ModalEntitySubject
            name={getDisplayCategoryName(sourceCategory)}
            icon={sourceCategory.icon as IconName}
            color={sourceCategory.color}
            shape={badgeShapeFor(config, 'category')}
            subtitle={sourceSubtitle}
          />
        </View>
      ) : null}
      <CategoryTransferBody
        categories={categories}
        selectedId={selectedId}
        deleteOptionLabel={deleteOptionLabel}
        onSelect={onSelect}
      />
      <ModalFooter
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmDisabled={selectedId === null}
        minHeight={44}
        disabledBg={c.textSecondary}
        disabledTextColor={WHITE}
      />
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
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: CONTROL_BORDER_RADIUS,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  deleteItem: {
    gap: 12,
    alignItems: 'center',
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: CONTROL_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontWeight: '600',
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 24,
  },
});
