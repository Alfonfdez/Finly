import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

interface Props {
  message?: string | null;
  fontSize?: number;
  style?: StyleProp<TextStyle>;
}

export default function FormError({ message, fontSize = 13, style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  if (!message) return null;

  return (
    <Text style={[{ color: c.red, fontSize: fs(fontSize) }, style]}>
      {message}
    </Text>
  );
}
