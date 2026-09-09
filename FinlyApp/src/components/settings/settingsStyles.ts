import { StyleSheet } from 'react-native';
import { CARD_BORDER_RADIUS } from '../componentStyles';

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
  card: { borderRadius: CARD_BORDER_RADIUS, padding: 16, marginBottom: 8 },
  label: { fontWeight: '600', marginBottom: 10 },
});
