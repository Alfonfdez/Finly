import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  color: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}

export default function NavArrows({ color, onPrev, onNext, nextDisabled = false }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev}>
        <Ionicons name="chevron-back-outline" size={22} color={color} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onNext}
        style={{ opacity: nextDisabled ? 0.3 : 1 }}
        disabled={nextDisabled}
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
