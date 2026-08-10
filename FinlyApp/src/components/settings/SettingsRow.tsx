import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { settingsStyles } from './settingsStyles';
import type { IconName } from '../IconGrid';

interface Props {
  label: string;
  description?: string;
  onPress: () => void;
  icon?: IconName;
  iconColor?: string;
  labelColor?: string;
  showChevron?: boolean;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function SettingsRow({
  label,
  description,
  onPress,
  icon,
  iconColor,
  labelColor,
  showChevron = true,
  right,
  style,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <TouchableOpacity
      style={[settingsStyles.card, styles.row, { backgroundColor: c.surface }, style]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {icon && <Ionicons name={icon} size={22} color={iconColor ?? c.primary} />}
      <View style={styles.text}>
        <Text style={[styles.label, { color: labelColor ?? c.text, fontSize: fs(15) }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: c.textSecondary, fontSize: fs(12) }]}>{description}</Text>
        ) : null}
      </View>
      {right}
      {showChevron && <Ionicons name="chevron-forward-outline" size={20} color={c.textSecondary} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontWeight: '600',
  },
  description: {
    fontWeight: '400',
  },
});
