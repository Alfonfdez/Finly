import type { ReactNode } from 'react';
import { Text, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

/**
 * The one place a character/limit counter is styled. It is right-aligned and
 * muted by default, and turns the WHOLE counter red + bold once the value
 * reaches its limit — the only moment the field stops accepting input, so it
 * reads as "you can't type more" rather than "this is invalid".
 *
 * The limit always comes from a `constants/types.ts` constant (`maxLength` is a
 * prop, never a literal at the call site); languages that apply their own limit
 * (e.g. the recurring rule name) pass their own constant.
 */
export const COUNTER_FONT_SIZE = 12;

const COUNTER_FONT_WEIGHT = '500';
const AT_LIMIT_FONT_WEIGHT = '700';

interface Props {
  /** Current count (characters typed, items used, ...). */
  value: number;
  /** Upper limit; omit when the count has no maximum (never flags a limit). */
  maxLength?: number;
  /** Unscaled font size (defaults to `COUNTER_FONT_SIZE`). */
  fontSize?: number;
  /** Rendering a localized string (e.g. "5 of 100 tags")? Pass it as the child. */
  children?: ReactNode;
  /** Layout only — alignment, margins, padding. The colour, weight and size stay
   *  the component's so the at-limit state can never be overridden by a caller. */
  style?: StyleProp<TextStyle>;
}

export default function CharCounter({ value, maxLength, fontSize = COUNTER_FONT_SIZE, children, style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  const atLimit = maxLength != null && value >= maxLength;

  return (
    <Text
      style={[
        styles.counter,
        style,
        {
          color: atLimit ? c.red : c.textSecondary,
          fontWeight: atLimit ? AT_LIMIT_FONT_WEIGHT : COUNTER_FONT_WEIGHT,
          fontSize: fs(fontSize),
        },
      ]}
    >
      {children ?? `${value}/${maxLength}`}
    </Text>
  );
}

const styles = StyleSheet.create({
  counter: {
    textAlign: 'right',
  },
});
