import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { BUTTON_BORDER_RADIUS } from './componentStyles';
import ClearButton from './ClearButton';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({ placeholder, value, onChangeText, onClose, autoFocus = false }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Ionicons name="search-outline" size={20} color={c.textSecondary} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: c.text, fontSize: fs(15) }]}
        placeholder={placeholder}
        placeholderTextColor={c.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />
      <ClearButton onPress={onClose} accessibilityLabel={labels.a11y_close_search} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BUTTON_BORDER_RADIUS,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
});
