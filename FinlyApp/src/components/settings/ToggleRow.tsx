import { Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { switchColors } from '../componentStyles';

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
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <Text style={[styles.label, { color: c.text, fontSize: fs(14) }]}>{label}</Text>
      <Switch
        value={checked}
        onValueChange={onToggle}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        {...switchColors(c)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontWeight: '500', flex: 1, paddingRight: 12 },
});
