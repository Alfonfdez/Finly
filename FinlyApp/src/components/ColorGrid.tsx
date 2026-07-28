import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';


export const QUICK_COLORS = [
  '#22D3EE', '#F87171', '#34D399', '#FBBF24',
  '#F472B6', '#60A5FA',
];

interface Props {
  selectedColor: string | null;
  customColor: string | null;
  onSelect: (color: string) => void;
  onOpenPicker: () => void;
}

export default function ColorGrid({ selectedColor, customColor, onSelect, onOpenPicker }: Props) {
  const { activeColors: c } = useConfig();

  return (
    <View style={styles.row}>
      {QUICK_COLORS.map((color) => {
        const isSelected = selectedColor === color;
        return (
          <TouchableOpacity
            key={color}
            style={[
              styles.circle,
              { backgroundColor: color },
              isSelected && { borderWidth: 3, borderColor: c.text },
            ]}
            onPress={() => onSelect(color)}
            accessibilityLabel={color}
            accessibilityState={{ selected: isSelected }}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        );
      })}
      {customColor && (
        <TouchableOpacity
          style={[
            styles.circle,
            { backgroundColor: customColor },
            selectedColor === customColor && { borderWidth: 3, borderColor: c.text },
          ]}
          onPress={() => onSelect(customColor)}
          accessibilityLabel={customColor}
          accessibilityState={{ selected: selectedColor === customColor }}
        >
          {selectedColor === customColor && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.circle, { backgroundColor: c.textSecondary }]}
        onPress={onOpenPicker}
        accessibilityLabel="More colors"
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
