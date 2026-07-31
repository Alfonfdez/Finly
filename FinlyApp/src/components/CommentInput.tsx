import { forwardRef, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { transactionRepository } from '../database';

interface Props {
  comment: string;
  onChange: (text: string) => void;
  onFocus?: () => void;
}

const CommentInput = forwardRef<TextInput, Props>(({ comment, onChange, onFocus }, ref) => {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (comment.length < 1) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await transactionRepository.searchComments(comment);
      setSuggestions(results);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [comment]);

  const handleSelectSuggestion = (text: string) => {
    skipNextSearch.current = true;
    onChange(text);
    setSuggestions([]);
  };

  return (
    <>
      {suggestions.length > 0 && (
        <View style={[styles.suggestionsPanel, { backgroundColor: c.surface, borderColor: c.border }]}>
          {suggestions.map((item, i) => (
            <Pressable
              key={i}
              style={[styles.suggestionItem, { borderBottomColor: c.border }]}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text style={[styles.suggestionText, { color: c.text, fontSize: fs(13) }]} numberOfLines={1}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
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
          onFocus={onFocus}
          multiline
          maxLength={4096}
          textAlignVertical="top"
        />
        <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(12) }]}>
          {comment.length}/4096
        </Text>
      </View>
    </>
  );
});

export default CommentInput;

CommentInput.displayName = 'CommentInput';
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
  suggestionsPanel: {
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 180,
    marginBottom: 16,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontWeight: '500',
  },
});
