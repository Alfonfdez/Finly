import { useCallback, useState } from 'react';
import { TextInput } from 'react-native';
import type { TextInputProps, StyleProp, TextStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import SectionTitle from './SectionTitle';
import CharCounter from './CharCounter';
import { formStyles } from './formStyles';

interface Props extends TextInputProps {
  label?: string;
  error?: string | boolean | null;
  showCounter?: boolean;
  multiline?: boolean;
  inputStyle?: StyleProp<TextStyle>;
  counterStyle?: StyleProp<TextStyle>;
}

/**
 * A labelled text field. `error` is the *validation message* / flag, but the red
 * border is held back until the field has been **touched** (changed or blurred):
 * a freshly-opened form must never greet the user in red, while a value the user
 * themselves invalidated is flagged immediately. The message itself belongs in
 * the form's bottom hint (a single red line above Save), not here.
 */
export default function LabeledTextField({
  label,
  error,
  showCounter = false,
  multiline = false,
  inputStyle,
  counterStyle,
  value,
  maxLength,
  onChangeText,
  onBlur,
  ...inputProps
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const [touched, setTouched] = useState(false);
  const markTouched = useCallback(() => setTouched(true), []);

  return (
    <>
      {label != null && <SectionTitle text={label} />}
      <TextInput
        style={[
          formStyles.input,
          {
            backgroundColor: c.surface,
            color: c.text,
            borderColor: error && touched ? c.red : c.border,
            fontSize: fs(14),
          },
          multiline && formStyles.textArea,
          inputStyle,
        ]}
        value={value}
        maxLength={maxLength}
        multiline={multiline}
        placeholderTextColor={c.textSecondary}
        onChangeText={(text) => {
          markTouched();
          onChangeText?.(text);
        }}
        onBlur={(event) => {
          markTouched();
          onBlur?.(event);
        }}
        {...inputProps}
      />
      {showCounter && maxLength != null && (
        <CharCounter
          value={String(value ?? '').length}
          maxLength={maxLength}
          style={[formStyles.counter, counterStyle]}
        />
      )}
    </>
  );
}
