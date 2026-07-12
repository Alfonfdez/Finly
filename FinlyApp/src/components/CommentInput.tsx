import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  comentario: string;
  onChange: (texto: string) => void;
}

export default function CommentInput({ comentario, onChange }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: c.texto, fontSize: fs(15) }]}>
        {texto.add_comment}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.fondoAlto, color: c.texto, fontSize: fs(14) }]}
        placeholder={texto.add_comment}
        placeholderTextColor={c.textoSuave}
        value={comentario}
        onChangeText={onChange}
        multiline
        maxLength={4096}
        textAlignVertical="top"
      />
      <Text style={[styles.counter, { color: c.textoSuave, fontSize: fs(12) }]}>
        {comentario.length}/4096
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titulo: {
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 80,
  },
  counter: {
    marginTop: 4,
    textAlign: 'right',
  },
});
