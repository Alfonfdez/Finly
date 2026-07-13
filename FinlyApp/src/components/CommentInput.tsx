import { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  comment: string;
  onChange: (text: string) => void;
}

const CommentInput = forwardRef<TextInput, Props>(({ comment, onChange }, ref) => {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>
        {labels.add_comment}
      </Text>
      <TextInput
        ref={ref}
        style={[styles.input, { backgroundColor: c.surface, color: c.text, fontSize: fs(14) }]}
        placeholder={labels.add_comment}
        placeholderTextColor={c.textSecondary}
        value={comment}
        onChangeText={onChange}
        multiline
        maxLength={4096}
        textAlignVertical="top"
      />
      <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(12) }]}>
        {comment.length}/4096
      </Text>
    </View>
  );
});

export default CommentInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
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
