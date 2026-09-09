import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FUTURE_OPACITY } from './calendarStyles';
import { t } from '../../i18n';

interface Props {
  color: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}

export default function NavArrows({ color, onPrev, onNext, nextDisabled = false }: Props) {
  const labels = t();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} accessibilityLabel={labels.a11y_previous_month}>
        <Ionicons name="chevron-back-outline" size={22} color={color} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onNext}
        style={{ opacity: nextDisabled ? FUTURE_OPACITY : 1 }}
        disabled={nextDisabled}
        accessibilityLabel={labels.a11y_next_month}
      >
        <Ionicons name="chevron-forward-outline" size={22} color={color} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
