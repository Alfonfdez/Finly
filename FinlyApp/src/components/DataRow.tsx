import { View, Text, StyleSheet } from 'react-native';
import type { ColorPalette } from '../constants/themes';

export default function DataRow({
  label, children, c, fs, noBorder,
}: {
  label: string;
  children: React.ReactNode;
  c: ColorPalette;
  fs: (s: number) => number;
  noBorder?: boolean;
}) {
  return (
    <View style={[styles.dataRow, noBorder ? null : { borderBottomWidth: 1, borderBottomColor: c.border }]}>
      <Text style={[styles.dataLabel, { color: c.textSecondary, fontSize: fs(13) }]}>{label}</Text>
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
  dataLabel: { fontWeight: '500', flex: 1 },
});
