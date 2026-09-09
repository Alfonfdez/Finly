import { Text, TouchableOpacity } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { WHITE } from '../../constants/themes';
import { formStyles } from './formStyles';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  textSize?: number;
  enabledTextColor?: string;
  disabledBg?: string;
  disabledTextColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  textSize = 15,
  enabledTextColor = WHITE,
  disabledBg,
  disabledTextColor = WHITE,
  style,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  const backgroundColor = disabled ? (disabledBg ?? c.textSecondary) : c.primary;
  const textColor = disabled ? disabledTextColor : enabledTextColor;

  return (
    <TouchableOpacity
      style={[formStyles.button, { backgroundColor }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[formStyles.buttonText, { color: textColor, fontSize: fs(textSize) }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
