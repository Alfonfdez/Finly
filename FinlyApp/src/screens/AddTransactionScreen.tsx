import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayAccountName } from '../i18n';
import TypeTabs from '../components/TypeTabs';
import AccountModal from '../components/AccountModal';
import CategoryGrid from '../components/CategoryGrid';
import DaySelector from '../components/DaySelector';
import TagSection from '../components/TagSection';
import CommentInput from '../components/CommentInput';
import PhotoSection from '../components/PhotoSection';
import CalendarModal from '../components/CalendarModal';
import CalculatorModal from '../components/CalculatorModal';
import { TransactionType, RootStackParamList, CATEGORY_USAGE_WINDOW_DAYS } from '../constants/types';
import { isSameDay, formatDateForDB } from '../utils/formatters';
import { transactionRepository, tagRepository } from '../database';

// Module-level pending category data (passed back from AddCategoryScreen)
let pendingCategoryId: number | null = null;
let pendingCategoryType: TransactionType | null = null;

export function setPendingCategory(categoryId: number, type: TransactionType) {
  pendingCategoryId = categoryId;
  pendingCategoryType = type;
}

export function consumePendingCategory(): { categoryId: number; type: TransactionType } | null {
  if (pendingCategoryId !== null && pendingCategoryType !== null) {
    const result = { categoryId: pendingCategoryId, type: pendingCategoryType };
    pendingCategoryId = null;
    pendingCategoryType = null;
    return result;
  }
  return null;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;

const GRID_ROWS = 2;
const GRID_COLS = 4;
const MAX_VISIBLE_CATEGORIES = GRID_ROWS * GRID_COLS - 1;
const MAX_AMOUNT_INTEGER_DIGITS = 9; // up to 999,999,999.99

/**
 * Parse user input into a clean raw amount string (digits + optional '.' separator).
 * Returns null if input is invalid (both separators present).
 */
function parseAmountInput(text: string): string | null {
  let raw = text.replace(/\s/g, '');

  const hasComma = raw.includes(',');
  const hasDot = raw.includes('.');

  // Both separators at same time is invalid
  if (hasComma && hasDot) return null;

  // Normalize comma to dot
  if (hasComma) {
    raw = raw.replace(',', '.');
  }

  // Remove all non-digit, non-dot characters
  raw = raw.replace(/[^0-9.]/g, '');

  // Only allow one dot
  const dotIndex = raw.indexOf('.');
  if (dotIndex !== -1) {
    let before = raw.slice(0, dotIndex);
    let after = raw.slice(dotIndex + 1).replace(/\./g, '');
    // Remove leading zeros from integer part (keep single "0")
    before = before.replace(/^0+(?=\d)/, '') || '0';
    // Limit integer digits
    before = before.slice(0, MAX_AMOUNT_INTEGER_DIGITS);
    // Max 2 decimal digits
    after = after.slice(0, 2);
    raw = before + '.' + after;
  } else {
    // No dot - remove leading zeros
    raw = raw.replace(/^0+(?=\d)/, '') || '0';
    // Limit integer digits
    raw = raw.slice(0, MAX_AMOUNT_INTEGER_DIGITS);
  }

  return raw;
}

/**
 * Format a raw amount string for display: add thousand separators (spaces)
 * and use the configured decimal separator.
 */
function formatAmountDisplay(raw: string, decimalSeparator: ',' | '.'): string {
  if (!raw) return '';
  const parts = raw.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  // Show decimal separator even if no decimal digits yet (user is still typing)
  if (decimalPart || raw.endsWith('.')) {
    return `${formattedInteger}${decimalSeparator}${decimalPart}`;
  }
  return formattedInteger;
}

export default function AddTransactionScreen() {
  const { activeColors: c, config } = useConfig();
  const { activeType, activePeriod, customDate, selectedDate, accounts, categories, accountsWithBalance, activeAccount, tags, refresh, refreshTags } = useApp();
  const selectableAccounts = useMemo(() => accountsWithBalance.filter(a => (a.is_total ?? 0) !== 1), [accountsWithBalance]);
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();

  const [type, setType] = useState<TransactionType>(activeType);
  const [amountRaw, setAmountRaw] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [accountId, setAccountId] = useState(() => {
    // Respect addDefaultAccountId setting
    if (config.addDefaultAccountId !== null) {
      const found = accountsWithBalance.find(a => a.id === config.addDefaultAccountId && (a.is_total ?? 0) !== 1);
      if (found) return found.id;
    }
    // Fallback: inherit from HomeScreen; if Total, use first non-Total
    if (activeAccount && (activeAccount.is_total ?? 0) !== 1) return activeAccount.id;
    return accounts.find(a => (a.is_total ?? 0) !== 1)?.id ?? 1;
  });
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [reorderedCategory, setReorderedCategory] = useState<number | null>(null);
  const initialDay = (() => {
    if (activePeriod === 'custom') {
      const isSingleDay = isSameDay(customDate.start, customDate.end);
      if (isSingleDay) return customDate.start;
    }
    return selectedDate;
  })();
  const [day, setDay] = useState(initialDay);
  const [categoryUsage, setCategoryUsage] = useState<Map<number, number>>(new Map());

  const prevType = useRef(type);
  const isFirstFocus = useRef(true);

  // Handle category selected from AddCategoryScreen
  useFocusEffect(useCallback(() => {
    if (isFirstFocus.current) {
      setSelectedTags([]);
      isFirstFocus.current = false;
    }
    const pending = consumePendingCategory();
    if (pending) {
      if (pending.type !== type) {
        setType(pending.type);
      }
      setCategoryId(pending.categoryId);
      const allByType = categories.filter(c => c.type === pending.type);
      const isVisible = allByType.slice(0, MAX_VISIBLE_CATEGORIES).some(c => c.id === pending.categoryId);
      setReorderedCategory(isVisible ? null : pending.categoryId);
      // Scroll to top so user can see the newly created category
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
    // Refresh category usage counts when screen gains focus
    const loadUsage = async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - CATEGORY_USAGE_WINDOW_DAYS);
      const counts = await transactionRepository.getCategoryUsageCounts(1, type, formatDateForDB(startDate), accountId);
      setCategoryUsage(new Map(counts.map(c => [c.id, c.count])));
    };
    loadUsage();
  }, [categories, type, accountId]));

  useEffect(() => {
    if (prevType.current !== type) {
      prevType.current = type;
      setCategoryId(null);
      setReorderedCategory(null);
    }
  }, [type]);

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [comment, setComment] = useState('');
  const [commentSuggestions, setCommentSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSearch = useRef(false);

  // Debounced search of existing comments for autocomplete
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (comment.length < 1) {
      setCommentSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await transactionRepository.searchComments(comment);
      setCommentSuggestions(results);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [comment]);

  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [modalAccountVisible, setModalAccountVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  // Display-formatted amount (empty when focused and empty, so placeholder shows)
  const displayAmount = useMemo(() => {
    if (!amountRaw) return '';
    return formatAmountDisplay(amountRaw, config.decimalSeparator);
  }, [amountRaw, config.decimalSeparator]);

  // Parsed numeric value (null if invalid or empty)
  const numericAmount = useMemo(() => {
    if (!amountRaw) return null;
    const num = parseFloat(amountRaw);
    return isNaN(num) ? null : num;
  }, [amountRaw]);

  // Validation (only truly invalid input)
  const isAmountInvalid = useMemo(() => {
    if (!amountRaw) return false;
    return numericAmount === null;
  }, [amountRaw, numericAmount]);

  const canSubmit = useMemo(() => {
    if (categoryId === null) return false;
    if (numericAmount === null || numericAmount <= 0) return false;
    if (day === null) return false;
    if (accountId === undefined) return false;
    return true;
  }, [categoryId, numericAmount, day, accountId]);

  const handleAmountChange = useCallback((text: string) => {
    const clean = parseAmountInput(text);
    if (clean === null) return; // invalid - both separators
    setAmountRaw(clean);
  }, []);

  const handleToggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleCreateTag = async (name: string) => {
    const existing = tags.some(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return false;
    await tagRepository.create({ user_id: 1, name });
    await refreshTags();
    return true;
  };

  const handleSelectSuggestion = (text: string) => {
    skipNextSearch.current = true;
    setComment(text);
    setCommentSuggestions([]);
  };

  const handleSelectAccount = (id: number) => {
    setAccountId(id);
    setModalAccountVisible(false);
  };

  const handleSelectDate = (date: Date) => {
    setDay(date);
    setModalCalendarVisible(false);
  };

  const deletePhoto = async (uri: string | null) => {
    if (!uri) return;
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {}
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      const src = result.assets[0].uri;
      const dest = Paths.document.uri + `photo_${Date.now()}.jpg`;
      const srcFile = new File(src);
      const destFile = new File(dest);
      srcFile.copy(destFile);
      setFotoUri(dest);
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      const src = result.assets[0].uri;
      const dest = Paths.document.uri + `photo_${Date.now()}.jpg`;
      const srcFile = new File(src);
      const destFile = new File(dest);
      srcFile.copy(destFile);
      setFotoUri(dest);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    try {
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, '0');
      const d = String(day.getDate()).padStart(2, '0');
      const h = String(day.getHours()).padStart(2, '0');
      const min = String(day.getMinutes()).padStart(2, '0');
      const s = String(day.getSeconds()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d} ${h}:${min}:${s}`;

      await transactionRepository.createWithTags({
        account_id: accountId,
        category_id: categoryId!,
        type,
        amount: numericAmount!,
        description: comment || null,
        photo: fotoUri,
        date: dateStr,
      }, selectedTags);

      await refresh();
      setSelectedTags([]);
      navigation.goBack();
    } catch {
      Alert.alert(labels.add_error_title, labels.add_error_message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoriesByType = useMemo(() => {
    const byType = categories.filter(c => c.type === type);
    return [...byType].sort((a, b) => {
      const countA = categoryUsage.get(a.id) ?? 0;
      const countB = categoryUsage.get(b.id) ?? 0;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name);
    });
  }, [categories, type, categoryUsage]);
  const totalByType = categoriesByType.length;
  const hasMore = totalByType > MAX_VISIBLE_CATEGORIES;

  const visibleCategories = useMemo(() => {
    if (reorderedCategory) {
      const selected = categoriesByType.find(c => c.id === reorderedCategory);
      if (selected) {
        return [selected, ...categoriesByType.filter(c => c.id !== reorderedCategory)].slice(0, MAX_VISIBLE_CATEGORIES);
      }
    }
    return categoriesByType.slice(0, MAX_VISIBLE_CATEGORIES);
  }, [categoriesByType, reorderedCategory]);

  const selectedAccount = accounts.find(c => c.id === accountId);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <ScrollView ref={scrollRef} style={[styles.container, { backgroundColor: c.background }]} keyboardShouldPersistTaps="handled">
          <TypeTabs active={type} onChange={setType} />

        <View style={styles.amountRow}>
          <TextInput
            style={[
              styles.amountInput,
              { backgroundColor: c.surface, color: amountRaw ? c.text : c.textSecondary, fontSize: fs(24), borderColor: amountFocused ? c.primary : 'transparent' },
              isAmountInvalid && { color: c.red },
            ]}
            placeholder="0"
            placeholderTextColor={c.textSecondary}
            value={displayAmount}
            onChangeText={handleAmountChange}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            keyboardType="decimal-pad"
          />
          <Text style={[styles.currencySymbol, { color: c.textSecondary, fontSize: fs(18) }]}>
            {config.currency}
          </Text>
          <TouchableOpacity
            style={styles.calculatorButton}
            onPress={() => setCalculatorVisible(true)}
          >
            <Ionicons name="calculator-outline" size={24} color={c.primary} />
          </TouchableOpacity>
        </View>
        {isAmountInvalid && (
          <Text style={[styles.errorText, { color: c.red, fontSize: fs(12) }]}>
            {labels.add_amount_error}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.accountContainer, { backgroundColor: c.surface }]}
          onPress={() => setModalAccountVisible(true)}
        >
          <Text style={[styles.accountLabel, { color: c.textSecondary, fontSize: fs(12) }]}>
            {labels.add_account}
          </Text>
          <Text style={[styles.accountName, { color: c.text, fontSize: fs(15) }]}>
            {selectedAccount ? getDisplayAccountName(selectedAccount) : ''}
          </Text>
        </TouchableOpacity>

        <CategoryGrid
          categories={visibleCategories}
          selectedCategory={categoryId}
          onSelect={setCategoryId}
          onAddMore={() => hasMore
            ? navigation.navigate('AddCategory', { type })
            : navigation.navigate('CreateCategory', { type })
          }
          showAddMore
          addMoreLabel={hasMore ? labels.add_more : labels.add_cat_create}
        />

        <DaySelector
          selectedDate={day}
          onSelect={setDay}
          onOpenCalendar={() => setModalCalendarVisible(true)}
        />

        {config.addShowLabels && (
          <TagSection
            tags={tags}
            selectedTags={selectedTags}
            onToggle={handleToggleTag}
            onCreate={handleCreateTag}
          />
        )}

        {config.addShowComments && (
          <>
            {commentSuggestions.length > 0 && (
              <View style={[styles.suggestionsPanel, { backgroundColor: c.surface, borderColor: c.border }]}>
                {commentSuggestions.map((item, i) => (
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

            <CommentInput
              ref={inputRef}
              comment={comment}
              onChange={setComment}
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
          </>
        )}

        {config.addShowPhoto && Platform.OS !== 'web' && (
          <PhotoSection
            photoUri={fotoUri}
            onTakePhoto={handleTakePhoto}
            onPickFromGallery={handlePickFromGallery}
            onRemovePhoto={() => { deletePhoto(fotoUri); setFotoUri(null); }}
          />
        )}

        {!canSubmit && !submitting && (
          <Text style={[styles.hintText, { color: c.red, fontSize: fs(12) }]}>
            {categoryId === null && (numericAmount === null || numericAmount <= 0)
              ? labels.add_hint_category_amount
              : categoryId === null
              ? labels.add_hint_category
              : numericAmount === null || numericAmount <= 0
              ? labels.add_hint_amount
              : ''}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: canSubmit ? c.primary : c.textSecondary + '60' },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={[styles.submitButtonText, { color: canSubmit ? c.background : c.text, fontSize: fs(16) }]}>
            {submitting ? '...' : labels.add_submit}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 200 }} />
        </ScrollView>

      <AccountModal
        visible={modalAccountVisible}
        accounts={selectableAccounts}
        selectedId={accountId}
        onSelect={handleSelectAccount}
        onClose={() => setModalAccountVisible(false)}
      />

      <CalendarModal
        visible={modalCalendarVisible}
        period="day"
        date={day}
        onSelectDate={handleSelectDate}
        onClose={() => setModalCalendarVisible(false)}
        firstDay={config.firstDayOfWeek}
      />

      <CalculatorModal
        visible={calculatorVisible}
        onAccept={(result) => {
          const clean = parseAmountInput(result);
          if (clean !== null && clean !== '') {
            setAmountRaw(clean);
          }
          setCalculatorVisible(false);
        }}
        onCancel={() => setCalculatorVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    gap: 8,
  },
  amountContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontWeight: '700',
  },
  currencySymbol: {
    marginRight: 8,
    fontWeight: '600',
  },
  calculatorButton: {
    padding: 8,
  },
  errorText: {
    marginBottom: 8,
  },
  accountContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  accountLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  accountName: {
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    fontWeight: '700',
  },
  hintText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
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
