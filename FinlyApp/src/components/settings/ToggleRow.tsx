import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

interface Props {
  checked: boolean;
  onToggle: () => void;
  label: string;
}

export default function ToggleRow({ checked, onToggle, label }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <Text style={[styles.label, { color: c.text, fontSize: fs(14) }]}>{label}</Text>
      <Ionicons
        name={checked ? 'toggle' : 'toggle-outline'}
        size={32}
        color={checked ? c.primary : c.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontWeight: '500' },
});
