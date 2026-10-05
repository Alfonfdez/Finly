import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
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
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.labelArea}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={[styles.label, { color: c.text, fontSize: fs(14) }]}>{label}</Text>
      </TouchableOpacity>
      <Switch
        value={checked}
        onValueChange={onToggle}
        accessibilityLabel={label}
        {...switchColors(c)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelArea: { flex: 1, paddingRight: 12 },
  label: { fontWeight: '500' },
});
