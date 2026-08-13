import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  selectedCount: number;
  deleteLabel: string;
  cancelLabel: string;
  onDelete: () => void;
  onCancel: () => void;
}

export default function SelectionActionBar({
  selectedCount,
  deleteLabel,
  cancelLabel,
  onDelete,
  onCancel,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const disabled = selectedCount === 0;

  return (
    <View style={[styles.bar, { backgroundColor: c.background, borderTopColor: c.border }]}>
      <TouchableOpacity
        onPress={onCancel}
        style={[styles.cancelButton, { borderColor: c.border }]}
        accessibilityRole="button"
      >
        <Text style={[styles.cancelText, { color: c.text, fontSize: fs(15) }]}>{cancelLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDelete}
        disabled={disabled}
        style={[styles.deleteButton, { borderColor: disabled ? c.border : c.red, opacity: disabled ? 0.5 : 1 }]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Ionicons name="trash-outline" size={18} color={disabled ? c.textSecondary : c.red} />
        <Text style={[styles.deleteText, { color: disabled ? c.textSecondary : c.red, fontSize: fs(15) }]}>
          {deleteLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  cancelText: {
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  deleteText: {
    fontWeight: '600',
  },
});
