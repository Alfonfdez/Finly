import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';

interface RadioButtonProps {
  selected: boolean;
  onPress?: () => void;
  color?: string;
  borderColor?: string;
  size?: number;
}

export default function RadioButton({
  selected,
  onPress,
  color,
  borderColor,
  size = 22,
}: RadioButtonProps) {
  const { activeColors: c } = useConfig();
  const activeColor = color ?? c.primary;
  const innerSize = size * 0.545;

  const circle = (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: selected ? activeColor : (borderColor ?? c.border),
        },
      ]}
    >
      {selected && (
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: activeColor,
          }}
        />
      )}
    </View>
  );

  if (!onPress) {
    return circle;
  }

  return <TouchableOpacity onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>{circle}</TouchableOpacity>;
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
