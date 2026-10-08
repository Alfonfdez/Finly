import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import type { IconName } from '../constants/types';

export default function DataRow({
  label, icon, children, noBorder,
}: {
  label: string;
  icon?: IconName;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <View style={[styles.dataRow, noBorder ? null : { borderBottomWidth: 1, borderBottomColor: c.border }]}>
      <View style={styles.labelWrap}>
        {icon && <Ionicons name={icon} size={15} color={c.primary} />}
        <Text style={[styles.dataLabel, { color: c.textSecondary, fontSize: fs(13) }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dataLabel: { fontWeight: '500', flexShrink: 1 },
});
