import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { TEST_IDS } from '../../constants/testIds';

/** Line height factor of the 12px hint text; used to size the reserved slot. */
const LINE_HEIGHT = 1.4;

/** Lines of room kept for the hint when it sits between two buttons. */
export const HINT_SLOT_LINES = 2;

interface Props {
  /** The "why you can't save" message, or an empty string / null for none. */
  message?: string | null;
  /**
   * Reserve the hint's room even when there is no message, so a hint appearing
   * or disappearing never moves the buttons around it. Only worth it when the
   * slot sits between two buttons (Delete + Save); a Save-only form just shows
   * the message above the button.
   */
  reserve?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function FormHintSlot({ message, reserve = true, style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const text = message ?? '';

  return (
    <View
      testID={TEST_IDS.formHintSlot}
      style={[
        styles.slot,
        reserve && { minHeight: Math.round(fs(12) * LINE_HEIGHT * HINT_SLOT_LINES) },
        style,
      ]}
    >
      {text !== '' && (
        <Text style={[styles.text, { color: c.red, fontSize: fs(12) }]}>{text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
