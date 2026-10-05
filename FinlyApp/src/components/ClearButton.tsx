import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { CLEAR_ICON_SIZE } from './componentStyles';

interface Props {
  onPress: () => void;
  accessibilityLabel: string;
  /** When false the button reserves the same space but is inert and invisible (keeps layout stable). */
  visible?: boolean;
}

/** Standard inline "clear a value" affordance: a filled circle-x on the right of a field/input. */
export default function ClearButton({ onPress, accessibilityLabel, visible = true }: Props) {
  const { activeColors: c } = useConfig();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={!visible}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
    >
      <Ionicons
        name="close-circle"
        size={CLEAR_ICON_SIZE}
        color={c.textSecondary}
        style={visible ? undefined : styles.hidden}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: CLEAR_ICON_SIZE,
    height: CLEAR_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: {
    opacity: 0,
  },
});
