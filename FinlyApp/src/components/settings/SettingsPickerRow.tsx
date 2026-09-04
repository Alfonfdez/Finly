import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import OptionPickerModal from '../OptionPickerModal';
import type { Option } from '../SelectorInline';
import { settingsStyles } from './settingsStyles';
import { CONTROL_BORDER_RADIUS } from '../componentStyles';

interface SettingsPickerRowProps<T extends string> {
  label: string;
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
  title: string;
  searchable?: boolean;
}

export default function SettingsPickerRow<T extends string>({
  label,
  options,
  selected,
  onSelect,
  title,
  searchable,
}: SettingsPickerRowProps<T>) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find(op => op.value === selected);

  return (
    <>
      <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>
        <Text style={[settingsStyles.label, { color: c.text, fontSize: fs(15) }]}>{label}</Text>
        <TouchableOpacity
          style={[styles.trigger, { borderColor: c.border }]}
          onPress={() => setVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.triggerText, { color: c.text, fontSize: fs(14) }]}>
            {selectedOption?.label ?? selected}
          </Text>
          <Ionicons name="chevron-down" size={18} color={c.textSecondary} />
        </TouchableOpacity>
      </View>
      <OptionPickerModal
        visible={visible}
        title={title}
        options={options}
        selected={selected}
        onSelect={onSelect}
        onClose={() => setVisible(false)}
        searchable={searchable}
      />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: CONTROL_BORDER_RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerText: { fontWeight: '500' },
});
