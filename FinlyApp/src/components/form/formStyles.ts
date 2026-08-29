import { StyleSheet } from 'react-native';

export const formStyles = StyleSheet.create({
  sectionTitle: { fontWeight: '600', marginBottom: 4, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12 },
  textArea: { minHeight: 80 },
  counter: { textAlign: 'right', marginTop: 4, marginBottom: 4 },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
});
