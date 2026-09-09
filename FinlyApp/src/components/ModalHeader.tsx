import { Text, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface ModalHeaderProps {
  title: string;
  size?: number;
}

export default function ModalHeader({ title, size = 18 }: ModalHeaderProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <Text style={[styles.title, { color: c.text, fontSize: fs(size) }]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});
