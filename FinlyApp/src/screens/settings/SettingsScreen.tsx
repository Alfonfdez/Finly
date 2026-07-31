import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../constants/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

type Subsection = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  screen: 'SettingsAppearance' | 'SettingsRegional' | 'SettingsPersonalization' | 'SettingsData';
};

export default function SettingsScreen({ navigation }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const subsections: Subsection[] = [
    { icon: 'color-palette-outline', label: labels.settings_appearance, screen: 'SettingsAppearance' },
    { icon: 'globe-outline', label: labels.settings_regional, screen: 'SettingsRegional' },
    { icon: 'options-outline', label: labels.settings_personalization, screen: 'SettingsPersonalization' },
    { icon: 'server-outline', label: labels.settings_data, screen: 'SettingsData' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      {subsections.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={[styles.row, { backgroundColor: c.surface }]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons name={item.icon} size={24} color={c.primary} />
          <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{item.label}</Text>
          <Ionicons name="chevron-forward-outline" size={20} color={c.textSecondary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  label: {
    flex: 1,
    fontWeight: '600',
  },
});
