import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { t } from '../i18n';
import { transactionRepository } from '../database';
import { DEBOUNCE_MS, MAX_COMMENT_LENGTH, MIN_COMMENT_SUGGESTION_LENGTH } from '../constants/types';
import CharCounter, { COUNTER_FONT_SIZE, inlineCounterReserve } from './form/CharCounter';
import FormSectionHeader from './form/FormSectionHeader';
import { formStyles } from './form/formStyles';
import { CONTROL_BORDER_RADIUS } from './componentStyles';
import { isWeb } from '../utils/platform';
import { ERROR_PREFIXES, logError, showErrorAlert } from '../utils/errors';

interface Props {
  comment: string;
  onChange: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const CommentInput = forwardRef<TextInput, Props>(({ comment, onChange, onFocus, onBlur }, ref) => {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const { fontScale } = useWindowDimensions();
  const labels = t();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const skipNextSearch = useRef(false);
  const isPressingSuggestion = useRef(false);
  const refocusingInput = useRef(false);
  const focusedRef = useRef(false);
  const searchId = useRef(0);
  const refocusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localInputRef = useRef<TextInput>(null);

  const setInputRef = useCallback((node: TextInput | null) => {
    localInputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: TextInput | null }).current = node;
  }, [ref]);

  const searchComments = useCallback(async (value: string) => {
    const id = ++searchId.current;
    try {
      const results = await transactionRepository.searchComments(value);
      if (id !== searchId.current || !focusedRef.current) return;
      setSuggestions(results);
    } catch (error) {
      if (id !== searchId.current || !focusedRef.current) return;
      logError(ERROR_PREFIXES.commentsLoad, error);
      setSuggestions([]);
      showErrorAlert();
    }
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
    if (refocusTimer.current != null) clearTimeout(refocusTimer.current);
    debouncedSearch.cancel();
    searchId.current += 1;
  }, [debouncedSearch]);

  const commitBlur = useCallback(() => {
    refocusingInput.current = false;
    focusedRef.current = false;
    debouncedSearch.cancel();
    searchId.current += 1;
    setSuggestions([]);
    setFocused(false);
    onBlur?.();
  }, [debouncedSearch, onBlur]);

  const handleSelectSuggestion = (text: string) => {
    skipNextSearch.current = true;
    isPressingSuggestion.current = false;
    refocusingInput.current = true;
    debouncedSearch.cancel();
    searchId.current += 1;
    onChange(text);
    setSuggestions([]);
    // Tapping a suggestion can blur the input on web. Refocus on the next task so the
    // browser's own focus change has settled, keeping the keyboard open for editing.
    if (refocusTimer.current != null) clearTimeout(refocusTimer.current);
    refocusTimer.current = setTimeout(() => {
      refocusTimer.current = null;
      const input = localInputRef.current;
      if (input) {
        input.focus();
        refocusingInput.current = false;
        return;
      }
      commitBlur();
    }, 0);
  };

  // On web, a mousedown on the suggestion would blur the input before onPress runs and
  // unmount the row. Prevent that default focus change; native keeps using onPressIn.
  const webSuggestionPressProps = isWeb
    ? {
      onMouseDown: (event: { preventDefault?: () => void }) => {
        event.preventDefault?.();
        isPressingSuggestion.current = true;
      },
      onPointerDown: (event: { preventDefault?: () => void }) => {
        event.preventDefault?.();
        isPressingSuggestion.current = true;
      },
    }
    : {};

  return (
    <View style={styles.container}>
      <FormSectionHeader title={labels.add_comment} icon="chatbubble-ellipses-outline" />
      {suggestions.length > 0 && (
        <View style={[styles.suggestionsPanel, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={[styles.suggestionsHeader, { borderBottomColor: c.border }]}>
            <Ionicons name="bulb-outline" size={14} color={c.textSecondary} accessible={false} />
            <Text accessibilityRole="header" style={[styles.suggestionsTitle, { color: c.textSecondary, fontSize: fs(12) }]}>
              {labels.add_comment_suggestions}
            </Text>
            <Text style={[styles.suggestionsHint, { color: c.textSecondary, fontSize: fs(11) }]}>
              {labels.add_comment_suggestions_hint}
            </Text>
          </View>
          {suggestions.map((item, i) => (
            <TouchableOpacity
              key={i}
              accessibilityRole="button"
              accessibilityLabel={item}
              accessibilityHint={labels.add_comment_suggestions_hint}
              style={[
                styles.suggestionItem,
                { borderBottomColor: c.border },
                i === suggestions.length - 1 && styles.suggestionItemLast,
              ]}
              {...webSuggestionPressProps}
              onPressIn={() => { isPressingSuggestion.current = true; }}
              onPressOut={() => { isPressingSuggestion.current = false; }}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text style={[styles.suggestionText, { color: c.text, fontSize: fs(13) }]} numberOfLines={1}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={formStyles.inlineInputWrap}>
        <TextInput
          ref={setInputRef}
          style={[styles.input, { paddingBottom: inlineCounterReserve(fs(COUNTER_FONT_SIZE), fontScale), backgroundColor: c.surface, color: c.text, fontSize: fs(14) }]}
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
            if (isPressingSuggestion.current || refocusingInput.current) return;
            commitBlur();
          }}
          multiline
          maxLength={Math.max(MAX_COMMENT_LENGTH, comment.length)}
          textAlignVertical="top"
          accessibilityLabel={labels.a11y_comment}
        />
        <CharCounter value={comment.length} maxLength={MAX_COMMENT_LENGTH} style={formStyles.inlineCounter} />
      </View>
    </View>
  );
});

export default CommentInput;

CommentInput.displayName = 'CommentInput';
const styles = StyleSheet.create({
  container: {},
  input: {
    paddingHorizontal: 12,
    paddingTop: 10,
    borderRadius: CONTROL_BORDER_RADIUS,
    minHeight: 80,
  },
  suggestionsPanel: {
    borderWidth: 1,
    borderRadius: CONTROL_BORDER_RADIUS,
    marginBottom: 10,
    overflow: 'hidden',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  suggestionsTitle: {
    fontWeight: '600',
  },
  suggestionsHint: {
    marginLeft: 'auto',
    fontWeight: '500',
  },
  suggestionItem: {
    minHeight: 44,
    justifyContent: 'center',
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
