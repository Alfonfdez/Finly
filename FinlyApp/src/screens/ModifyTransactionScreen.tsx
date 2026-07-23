import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayAccountName } from '../i18n';
import { isNative } from '../utils/platform';
import TypeTabs from '../components/TypeTabs';
import AccountModal from '../components/AccountModal';
import CategoryGrid from '../components/CategoryGrid';
import DaySelector from '../components/DaySelector';
import TagSection from '../components/TagSection';
import CommentInput from '../components/CommentInput';
import PhotoSection from '../components/PhotoSection';
import CalendarModal from '../components/CalendarModal';
import CalculatorModal from '../components/CalculatorModal';
import { TransactionType, RootStackParamList } from '../constants/types';
import { transactionRepository, tagRepository } from '../database';
import { consumePendingCategory } from './AddTransactionScreen';

type ModifyRouteProp = RouteProp<RootStackParamList, 'ModifyTransaction'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ModifyTransaction'>;

const GRID_ROWS = 2;
const GRID_COLS = 4;
const MAX_VISIBLE_CATEGORIES = GRID_ROWS * GRID_COLS - 1;
const MAX_AMOUNT_INTEGER_DIGITS = 9;

function parseAmountInput(text: string): string | null {
  let raw = text.replace(/\s/g, '');
  const hasComma = raw.includes(',');
  const hasDot = raw.includes('.');
  if (hasComma && hasDot) return null;
  if (hasComma) raw = raw.replace(',', '.');
  raw = raw.replace(/[^0-9.]/g, '');
  const dotIndex = raw.indexOf('.');
  if (dotIndex !== -1) {
    let before = raw.slice(0, dotIndex);
    let after = raw.slice(dotIndex + 1).replace(/\./g, '');
    before = before.replace(/^0+(?=\d)/, '') || '0';
    before = before.slice(0, MAX_AMOUNT_INTEGER_DIGITS);
    after = after.slice(0, 2);
    raw = before + '.' + after;
  } else {
    raw = raw.replace(/^0+(?=\d)/, '') || '0';
    raw = raw.slice(0, MAX_AMOUNT_INTEGER_DIGITS);
  }
  return raw;
}

function formatAmountDisplay(raw: string, decimalSeparator: ',' | '.'): string {
  if (!raw) return '';
  const parts = raw.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (decimalPart || raw.endsWith('.')) {
    return `${formattedInteger}${decimalSeparator}${decimalPart}`;
  }
  return formattedInteger;
}

export default function ModifyTransactionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ModifyRouteProp>();
  const { transactionId } = route.params;
  const { activeColors: c, config } = useConfig();
  const { transactions, accounts, categories, accountsWithBalance, tags, refresh, refreshTags } = useApp();
  const selectableAccounts = useMemo(() => accountsWithBalance.filter(a => (a.is_total ?? 0) !== 1), [accountsWithBalance]);
  const fs = useFontSize();
  const labels = t();

  const transaction = useMemo(
    () => transactions.find(tx => tx.id === transactionId),
    [transactions, transactionId]
  );

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amountRaw, setAmountRaw] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [accountId, setAccountId] = useState(transaction?.account_id ?? 1);
  const [categoryId, setCategoryId] = useState<number | null>(transaction?.category_id ?? null);
  const [reorderedCategory, setReorderedCategory] = useState<number | null>(transaction?.category_id ?? null);
  const [day, setDay] = useState<Date>(transaction ? new Date(transaction.date) : new Date());
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [comment, setComment] = useState(transaction?.description ?? '');
  const [commentSuggestions, setCommentSuggestions] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>(() => {
    if (transaction?.photo) {
      try {
        const parsed = JSON.parse(transaction.photo);
        return Array.isArray(parsed) ? parsed : [transaction.photo];
      } catch {
        return transaction.photo ? [transaction.photo] : [];
      }
    }
    return [];
  });
  const [submitting, setSubmitting] = useState(false);

  const [modalAccountVisible, setModalAccountVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSearch = useRef(false);
  const prevType = useRef(type);

  // Pre-populate amount from transaction
  useEffect(() => {
    if (transaction) {
      const raw = String(transaction.amount);
      const clean = parseAmountInput(raw);
      if (clean !== null) setAmountRaw(clean);
    }
  }, [transaction]);

  // Load existing tags for this transaction
  useEffect(() => {
    if (transaction) {
      transactionRepository.getTagsByTransactionId(transactionId).then(ids => {
        setSelectedTags(ids);
      });
    }
  }, [transactionId, transaction]);

  // Handle category selected from AddCategoryScreen
  useFocusEffect(useCallback(() => {
    const pending = consumePendingCategory();
    if (pending) {
      if (pending.type !== type) setType(pending.type);
      setCategoryId(pending.categoryId);
      setReorderedCategory(pending.categoryId);
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 100);
    }
  }, [type]));

  useEffect(() => {
    if (prevType.current !== type) {
      prevType.current = type;
      setCategoryId(null);
      setReorderedCategory(null);
    }
  }, [type]);

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

  const displayAmount = useMemo(() => {
    if (!amountRaw) return '';
    return formatAmountDisplay(amountRaw, config.decimalSeparator);
  }, [amountRaw, config.decimalSeparator]);

  const numericAmount = useMemo(() => {
    if (!amountRaw) return null;
    const num = parseFloat(amountRaw);
    return isNaN(num) ? null : num;
  }, [amountRaw]);

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
    if (clean === null) return;
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

  const deletePhoto = async (uri: string) => {
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch (e) {
      console.warn('Failed to delete photo:', uri, e);
    }
  };

  const handleRemovePhoto = async (uri: string) => {
    await deletePhoto(uri);
    setPhotos(prev => prev.filter(p => p !== uri));
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
      setPhotos(prev => [...prev, dest]);
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
      setPhotos(prev => [...prev, dest]);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting || !transaction) return;
    setSubmitting(true);
    try {
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, '0');
      const d = String(day.getDate()).padStart(2, '0');
      const h = String(day.getHours()).padStart(2, '0');
      const min = String(day.getMinutes()).padStart(2, '0');
      const s = String(day.getSeconds()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d} ${h}:${min}:${s}`;

      await transactionRepository.updateWithTags(transactionId, {
        account_id: accountId,
        category_id: categoryId!,
        type,
        amount: numericAmount!,
        description: comment || null,
        photo: photos.length > 0 ? JSON.stringify(photos) : null,
        date: dateStr,
      }, selectedTags);

      await refresh();
      navigation.goBack();
    } catch {
      Alert.alert(labels.modify_error_title, labels.modify_error_message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoriesByType = categories.filter(c => c.type === type);
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

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: c.textSecondary, fontSize: fs(16) }}>
            {labels.transactions_empty}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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

        {config.addShowPhoto && isNative && (
          <PhotoSection
            photos={photos}
            onTakePhoto={handleTakePhoto}
            onPickFromGallery={handlePickFromGallery}
            onRemovePhoto={handleRemovePhoto}
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
            {submitting ? '...' : labels.modify_save}
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
