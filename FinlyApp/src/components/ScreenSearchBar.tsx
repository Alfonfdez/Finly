import { View, StyleSheet } from 'react-native';
import SearchBar from './SearchBar';

interface Props {
  visible: boolean;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

export default function ScreenSearchBar({ visible, placeholder, value, onChangeText, onClose }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <SearchBar
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onClose={onClose}
        autoFocus
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
