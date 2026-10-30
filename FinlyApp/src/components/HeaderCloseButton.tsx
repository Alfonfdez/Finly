import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { MODAL_CLOSE_ICON_SIZE } from './componentStyles';

interface Props {
  onPress: () => void;
  accessibilityLabel: string;
}

/** Standard close affordance for a modal/overlay header: a line x with a comfortable hit target. */
export default function HeaderCloseButton({ onPress, accessibilityLabel }: Props) {
  const { activeColors: c } = useConfig();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name="close" size={MODAL_CLOSE_ICON_SIZE} color={c.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MODAL_CLOSE_ICON_SIZE,
    height: MODAL_CLOSE_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
