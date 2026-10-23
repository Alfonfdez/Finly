import { TouchableOpacity, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

interface Props {
  checked: boolean;
  onToggle: () => void;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export default function CheckboxRow({ checked, onToggle, label, style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <TouchableOpacity style={[styles.row, style]} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={checked ? c.primary : c.textSecondary}
      />
      <Text style={[styles.label, { color: c.text, fontSize: fs(14) }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  label: { fontWeight: '500', flexShrink: 1 },
});
