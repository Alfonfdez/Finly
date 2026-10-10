import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  allSelected: boolean;
  countLabel: string;
  selectAllLabel: string;
  deselectAllLabel: string;
  disabled?: boolean;
  onToggle: () => void;
}

export default function SelectAllRow({
  allSelected,
  countLabel,
  selectAllLabel,
  deselectAllLabel,
  disabled = false,
  onToggle,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: c.border, opacity: disabled ? 0.5 : 1 }]}
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: allSelected, disabled }}
    >
      <Ionicons
        name={allSelected ? 'checkbox' : 'checkbox-outline'}
        size={22}
        color={allSelected ? c.primary : c.textSecondary}
      />
      <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
        {allSelected ? deselectAllLabel : selectAllLabel}
      </Text>
      <Text style={[styles.count, { color: c.textSecondary, fontSize: fs(13) }]}>{countLabel}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  label: {
    flex: 1,
    fontWeight: '600',
  },
  count: {
    fontWeight: '500',
  },
});
