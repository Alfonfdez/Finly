import { Text, TextInput } from 'react-native';
import type { TextInputProps, StyleProp, TextStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import SectionTitle from './SectionTitle';
import { formStyles } from './formStyles';

interface Props extends TextInputProps {
  label?: string;
  error?: string | boolean | null;
  showCounter?: boolean;
  multiline?: boolean;
  inputStyle?: StyleProp<TextStyle>;
  counterStyle?: StyleProp<TextStyle>;
  counterFontSize?: number;
}

export default function LabeledTextField({
  label,
  error,
  showCounter = false,
  multiline = false,
  inputStyle,
  counterStyle,
  counterFontSize,
  value,
  maxLength,
  ...inputProps
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <>
      {label != null && <SectionTitle text={label} />}
      <TextInput
        style={[
          formStyles.input,
          {
            backgroundColor: c.surface,
            color: c.text,
            borderColor: error ? c.red : c.border,
            fontSize: fs(14),
          },
          multiline && formStyles.textArea,
          inputStyle,
        ]}
        value={value}
        maxLength={maxLength}
        multiline={multiline}
        placeholderTextColor={c.textSecondary}
        {...inputProps}
      />
      {showCounter && maxLength != null && (
        <Text
          style={[
            formStyles.counter,
            { color: c.textSecondary, fontSize: fs(counterFontSize ?? 11) },
            counterStyle,
          ]}
        >
          {String(value ?? '').length}/{maxLength}
        </Text>
      )}
    </>
  );
}
