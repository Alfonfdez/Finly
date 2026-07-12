import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

export default function SearchBar({ placeholder, value, onChangeText, onClose }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={[styles.container, { backgroundColor: c.fondoAlto, borderColor: c.borde }]}>
      <Ionicons name="search-outline" size={20} color={c.textoSuave} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: c.texto, fontSize: fs(15) }]}
        placeholder={placeholder}
        placeholderTextColor={c.textoSuave}
        value={value}
        onChangeText={onChangeText}
        autoFocus
      />
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close-circle" size={20} color={c.textoSuave} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
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
  closeButton: {
    marginLeft: 8,
  },
});
