import { StyleSheet } from 'react-native';

export const FUTURE_OPACITY = 0.3;

export const MIN_DATE = new Date(new Date().getFullYear(), 0, 1);

export const calendarStyles = StyleSheet.create({
  container: { padding: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '23%', aspectRatio: 1.2 },
  gridItemInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  gridItemText: { fontWeight: '500', includeFontPadding: false, textAlignVertical: 'center' },
});
