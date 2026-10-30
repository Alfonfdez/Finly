import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import SearchBar from './SearchBar';

interface Props {
  visible: boolean;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenSearchBar({
  visible, placeholder, value, onChangeText, onClose, autoFocus = true, style,
}: Props) {
  if (!visible) return null;

  return (
    <View style={[styles.wrap, style]}>
      <SearchBar
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onClose={onClose}
        autoFocus={autoFocus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
