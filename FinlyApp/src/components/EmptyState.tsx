import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import type { IconName } from '../constants/types';

interface Props {
  icon?: IconName;
  message: string;
}

export function emptyStateProps(searchActive: boolean, idleIcon: IconName, idleMessage: string) {
  return searchActive
    ? { icon: 'search-outline' as IconName, message: t().filter_no_results }
    : { icon: idleIcon, message: idleMessage };
}

export default function EmptyState({ icon, message }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon} size={64} color={c.textSecondary} />}
      <Text style={[styles.text, { color: c.textSecondary, fontSize: fs(16) }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    textAlign: 'center',
    marginTop: 4,
  },
});
