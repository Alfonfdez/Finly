import { StyleSheet } from 'react-native';
import { BUTTON_BORDER_RADIUS } from '../componentStyles';

export const formStyles = StyleSheet.create({
  sectionTitle: { fontWeight: '600', marginBottom: 4, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: BUTTON_BORDER_RADIUS, padding: 12 },
  textArea: { minHeight: 80 },
  counter: { textAlign: 'right', marginTop: 4, marginBottom: 4 },
  button: { paddingVertical: 14, borderRadius: BUTTON_BORDER_RADIUS, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
});
