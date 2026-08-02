import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { settingsStyles } from './settingsStyles';

interface Props {
  text: string;
  style?: StyleProp<TextStyle>;
}

export default function SettingsSection({ text, style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }, style]}>
      {text}
    </Text>
  );
}
