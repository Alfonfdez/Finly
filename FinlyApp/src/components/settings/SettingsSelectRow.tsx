import { View, Text } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import SelectorInline, { type Option } from '../SelectorInline';
import { settingsStyles } from './settingsStyles';

interface SettingsSelectRowProps<T extends string> {
  label: string;
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export default function SettingsSelectRow<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: SettingsSelectRowProps<T>) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>
      <Text style={[settingsStyles.label, { color: c.text, fontSize: fs(15) }]}>{label}</Text>
      <SelectorInline options={options} selected={selected} onSelect={onSelect} />
    </View>
  );
}
