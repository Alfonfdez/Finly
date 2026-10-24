import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { t } from '../i18n';
import { transactionRepository } from '../database';
import { DEBOUNCE_MS, MAX_COMMENT_LENGTH, MIN_COMMENT_SUGGESTION_LENGTH } from '../constants/types';
import CharCounter from './form/CharCounter';
import FormSectionHeader from './form/FormSectionHeader';
import { CONTROL_BORDER_RADIUS } from './componentStyles';

interface Props {
  comment: string;
  onChange: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const CommentInput = forwardRef<TextInput, Props>(({ comment, onChange, onFocus, onBlur }, ref) => {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const skipNextSearch = useRef(false);
  const isPressingSuggestion = useRef(false);
  const focusedRef = useRef(false);
  const searchId = useRef(0);

  const searchComments = useCallback(async (value: string) => {
    const id = ++searchId.current;
    const results = await transactionRepository.searchComments(value);
    if (id !== searchId.current || !focusedRef.current) return;
    setSuggestions(results);
  }, []);

  const debouncedSearch = useDebouncedCallback(searchComments, DEBOUNCE_MS);

  useEffect(() => {
    if (!focused) {
      debouncedSearch.cancel();
      searchId.current += 1;
      setSuggestions([]);
      return;
    }
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (comment.trim().length < MIN_COMMENT_SUGGESTION_LENGTH) {
      debouncedSearch.cancel();
      searchId.current += 1;
      setSuggestions([]);
      return;
    }
    debouncedSearch(comment.trim());
  }, [comment, debouncedSearch, focused]);

  useEffect(() => () => {
    debouncedSearch.cancel();
    searchId.current += 1;
  }, [debouncedSearch]);

  const handleSelectSuggestion = (text: string) => {
    skipNextSearch.current = true;
    debouncedSearch.cancel();
    searchId.current += 1;
    onChange(text);
    setSuggestions([]);
  };

  return (
    <>
      {suggestions.length > 0 && (
        <View style={[styles.suggestionsPanel, { backgroundColor: c.surface, borderColor: c.border }]}>
          {suggestions.map((item, i) => (
            <View
              key={i}
              role="button"
              accessibilityLabel={item}
              onAccessibilityTap={() => handleSelectSuggestion(item)}
              style={[
                styles.suggestionItem,
                { borderBottomColor: c.border },
                i === suggestions.length - 1 && styles.suggestionItemLast,
              ]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={() => { isPressingSuggestion.current = true; }}
              onResponderRelease={() => { isPressingSuggestion.current = false; handleSelectSuggestion(item); }}
              onResponderTerminate={() => { isPressingSuggestion.current = false; }}
            >
              <Text style={[styles.suggestionText, { color: c.text, fontSize: fs(13) }]} numberOfLines={1}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.container}>
        <FormSectionHeader title={labels.add_comment} icon="chatbubble-ellipses-outline" />
        <View style={styles.inputWrap}>
          <TextInput
            ref={ref}
            style={[styles.input, { backgroundColor: c.surface, color: c.text, fontSize: fs(14) }]}
            placeholder={labels.add_comment}
            placeholderTextColor={c.textSecondary}
            value={comment}
            onChangeText={onChange}
            onFocus={() => {
              focusedRef.current = true;
              setFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              if (isPressingSuggestion.current) return;
              focusedRef.current = false;
              debouncedSearch.cancel();
              searchId.current += 1;
              setSuggestions([]);
              setFocused(false);
              onBlur?.();
            }}
            multiline
            maxLength={MAX_COMMENT_LENGTH}
            textAlignVertical="top"
            accessibilityLabel={labels.a11y_comment}
          />
          <CharCounter value={comment.length} maxLength={MAX_COMMENT_LENGTH} style={styles.counter} />
        </View>
      </View>
    </>
  );
});

export default CommentInput;

CommentInput.displayName = 'CommentInput';
const styles = StyleSheet.create({
  container: {},
  inputWrap: {
    position: 'relative',
  },
  input: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 26,
    borderRadius: CONTROL_BORDER_RADIUS,
    minHeight: 80,
  },
  counter: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    textAlign: 'right',
  },
  suggestionsPanel: {
    borderWidth: 1,
    borderRadius: CONTROL_BORDER_RADIUS,
    marginBottom: 16,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    cursor: 'pointer',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: CONTROL_BORDER_RADIUS,
    borderBottomRightRadius: CONTROL_BORDER_RADIUS,
  },
  suggestionText: {
    fontWeight: '500',
  },
});
