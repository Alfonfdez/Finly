import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { withAlpha } from '../utils/color';

export type Option<T extends string = string> = { label: string; value: T; icon?: ReactNode };

interface Props<T extends string> {
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export default function SelectorInline<T extends string>({ options, selected, onSelect }: Props<T>) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <View style={styles.options}>
      {options.map(op => (
        <TouchableOpacity
          key={String(op.value)}
          style={[styles.option, { backgroundColor: selected === op.value ? withAlpha(c.primary, 13) : c.surface }]}
          onPress={() => onSelect(op.value)}
        >
          {op.icon && <View style={styles.iconWrap}>{op.icon}</View>}
          <Text style={[styles.optionText, { color: selected === op.value ? c.primary : c.text, fontSize: fs(14) }]}>
            {op.label}
          </Text>
          {selected === op.value && (
            <Text style={[styles.check, { color: c.primary, fontSize: fs(14) }]}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 6 },
  optionText: { fontWeight: '500' },
  check: { fontWeight: '700' },
  iconWrap: { justifyContent: 'center', alignItems: 'center' },
});
