import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { t } from '../i18n';
import { darkColors } from '../constants/themes';

interface Props {
  onRetry: () => void;
}

export default function WebTabBlocked({ onRetry }: Props) {
  const labels = t();

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>{labels.web_tab_blocked_title}</Text>
      <Text style={styles.message}>{labels.web_tab_blocked_message}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={labels.error_boundary_retry}
      >
        <Text style={styles.buttonText}>{labels.error_boundary_retry}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
    backgroundColor: darkColors.background,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: darkColors.primary,
  },
  buttonText: {
    color: darkColors.background,
    fontSize: 15,
    fontWeight: '600',
  },
});
