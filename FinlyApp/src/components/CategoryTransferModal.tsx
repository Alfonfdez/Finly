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
import { WHITE, TRANSPARENT } from '../constants/themes';
import { CONTROL_BORDER_RADIUS } from './componentStyles';

export type TransferTargetId = number | 'delete';

interface Props {
  visible: boolean;
  title: string;
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
  const fs = useFontSize();
  const labels = t();
  const isDeleteSelected = selectedId === 'delete';

  return (
    <ModalShell visible={visible} onClose={onCancel}>
      <ModalHeader title={title} size={16} />
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
            onPress={() => onSelect('delete')}
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
