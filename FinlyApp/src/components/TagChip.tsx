import { View, Text, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { withAlpha } from '../utils/color';
import { MODAL_BORDER_RADIUS } from './componentStyles';

interface TagChipProps {
  label: string;
  variant?: 'primary' | 'neutral';
  size?: number;
}

export default function TagChip({ label, variant = 'primary', size = 11 }: TagChipProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const isPrimary = variant === 'primary';

  return (
    <View style={[styles.chip, { backgroundColor: isPrimary ? withAlpha(c.primary, 13) : c.surface }]}>
      <Text style={[styles.text, { color: isPrimary ? c.primary : c.textSecondary, fontSize: fs(size) }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: MODAL_BORDER_RADIUS,
  },
  text: {
    fontWeight: '500',
  },
});
