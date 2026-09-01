import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { settingsStyles } from './settingsStyles';

interface SettingsSectionProps {
  title: string;
  card?: boolean;
  children: ReactNode;
}

export default function SettingsSection({ title, card = true, children }: SettingsSectionProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <>
      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{title}</Text>
      {card ? (
        <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>{children}</View>
      ) : (
        children
      )}
    </>
  );
}
