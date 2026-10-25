import { useCallback, useState } from 'react';
import { TextInput, View } from 'react-native';
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
  /** Multiline fields can place the counter inside the input (bottom-right). */
  inlineCounter?: boolean;
  multiline?: boolean;
  inputStyle?: StyleProp<TextStyle>;
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
  inlineCounter = false,
  multiline = false,
  inputStyle,
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
  const useInlineCounter = inlineCounter && multiline;

  const input = (
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
        useInlineCounter && formStyles.inlineInput,
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
  );

  const counter = showCounter && maxLength != null ? (
    <CharCounter
      value={String(value ?? '').length}
      maxLength={maxLength}
      style={useInlineCounter ? formStyles.inlineCounter : formStyles.counter}
    />
  ) : null;

  return (
    <>
      {label != null && <SectionTitle text={label} />}
      {useInlineCounter ? (
        <View style={formStyles.inlineInputWrap}>
          {input}
          {counter}
        </View>
      ) : (
        <>
          {input}
          {counter}
        </>
      )}
    </>
  );
}
