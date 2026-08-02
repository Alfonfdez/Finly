import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  section: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: { borderRadius: 12, padding: 16, marginBottom: 8 },
  label: { fontWeight: '600', marginBottom: 10 },
});
