import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { formStyles } from './formStyles';

interface Props {
  text: string;
  fontSize?: number;
  style?: StyleProp<TextStyle>;
}

export default function SectionTitle({ text, fontSize = 14, style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <Text style={[formStyles.sectionTitle, { color: c.text, fontSize: fs(fontSize) }, style]}>
      {text}
    </Text>
  );
}
