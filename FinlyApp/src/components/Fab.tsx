import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { BLACK } from '../constants/themes';

interface Props {
  onPress: () => void;
  accessibilityLabel: string;
}

export default function Fab({ onPress, accessibilityLabel }: Props) {
  const { activeColors: c } = useConfig();
  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: c.primary }]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name="add" size={28} color={c.background} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
