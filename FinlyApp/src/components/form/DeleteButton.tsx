import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  iconSize?: number;
  textSize?: number;
  style?: StyleProp<ViewStyle>;
}

export default function DeleteButton({
  label,
  onPress,
  disabled = false,
  iconSize = 18,
  textSize = 15,
  style,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  const color = disabled ? c.textSecondary : c.red;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: disabled ? c.border : c.red, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
    >
      <Ionicons name="trash-outline" size={iconSize} color={color} />
      <Text style={[styles.text, { color, fontSize: fs(textSize) }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  text: { fontWeight: '600' },
});
