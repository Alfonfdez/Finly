import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { TEST_IDS } from '../../constants/testIds';

/** Line height factor of the 12px hint text; used to size the reserved band. */
const LINE_HEIGHT = 1.4;

/** Lines of room kept by every band, so the buttons around them never move. */
export const HINT_SLOT_LINES = 2;

interface Props {
  /** The message, or an empty string / null for a blank (still reserved) band. */
  message?: string | null;
  /**
   * `error` (red) is the "why you can't save" hint above Save; `muted` is the
   * explanation that sits above a disabled Delete. Both are reserved so nothing
   * shifts when a message appears or disappears.
   */
  tone?: 'error' | 'muted';
  style?: StyleProp<ViewStyle>;
}

export default function FormHintSlot({ message, tone = 'error', style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const muted = tone === 'muted';
  const text = message ?? '';

  return (
    <View
      testID={muted ? TEST_IDS.formMutedSlot : TEST_IDS.formHintSlot}
      style={[styles.slot, { minHeight: Math.round(fs(12) * LINE_HEIGHT * HINT_SLOT_LINES) }, style]}
    >
      {text !== '' && (
        <Text style={[styles.text, { color: muted ? c.textSecondary : c.red, fontSize: fs(12) }]}>
          {text}
        </Text>
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
