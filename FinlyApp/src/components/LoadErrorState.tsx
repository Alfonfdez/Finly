import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { BUTTON_BORDER_RADIUS } from './componentStyles';

const LOAD_ERROR_ICON = 'cloud-offline-outline' as const;

interface Props {
  onRetry: () => void;
}

/** Shared retry state for a failed screen load. */
export default function LoadErrorState({ onRetry }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <View style={styles.container}>
      <Ionicons name={LOAD_ERROR_ICON} size={56} color={c.textSecondary} />
      <Text style={[styles.title, { color: c.text, fontSize: fs(18) }]}>{labels.error_title}</Text>
      <Text style={[styles.message, { color: c.textSecondary, fontSize: fs(14) }]}>
        {labels.error_generic}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.primary }]}
        onPress={onRetry}
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: c.background, fontSize: fs(14) }]}>
          {labels.error_boundary_retry}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  buttonText: {
    fontWeight: '600',
  },
});
