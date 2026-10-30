import { useCallback, useState } from 'react';
import { TextInput } from 'react-native';
import type { StyleProp, TextStyle, TextInputProps, ViewStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import type { IconName } from '../../constants/types';
import FormSectionHeader from './FormSectionHeader';
import CharCounter from './CharCounter';
import { formStyles } from './formStyles';

interface Props extends TextInputProps {
  label?: string;
  labelIcon?: IconName;
  labelStyle?: StyleProp<ViewStyle>;
  error?: string | boolean | null;
  showCounter?: boolean;
  /** Fields with a section header place the counter in its right slot. */
  counterInHeader?: boolean;
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
  labelIcon,
  labelStyle,
  error,
  showCounter = false,
  counterInHeader = false,
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
      ]}
      value={value}
      maxLength={maxLength == null ? undefined : Math.max(maxLength, String(value ?? '').length)}
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
      accessibilityLabel={inputProps.accessibilityLabel ?? label}
    />
  );

  const headerCounter = showCounter && maxLength != null && counterInHeader && label != null;
  const counter = showCounter && maxLength != null && !headerCounter ? (
    <CharCounter
      value={String(value ?? '').length}
      maxLength={maxLength}
      style={formStyles.counter}
    />
  ) : null;

  return (
    <>
      {label != null && (
        <FormSectionHeader
          title={label}
          icon={labelIcon ?? 'text-outline'}
          style={labelStyle}
          right={headerCounter
            ? <CharCounter value={String(value ?? '').length} maxLength={maxLength} />
            : undefined}
        />
      )}
      {input}
      {counter}
    </>
  );
}
