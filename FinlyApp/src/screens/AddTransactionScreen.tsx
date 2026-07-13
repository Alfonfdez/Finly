import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import TypeTabs from '../components/TypeTabs';
import AccountModal from '../components/AccountModal';
import CategoryGrid from '../components/CategoryGrid';
import DaySelector from '../components/DaySelector';
import TagSection from '../components/TagSection';
import CommentInput from '../components/CommentInput';
import PhotoSection from '../components/PhotoSection';
import CalendarModal from '../components/CalendarModal';
import { TransactionType, RootStackParamList } from '../constants/types';
import { isSameDay } from '../utils/formatters';
import { transactionRepository } from '../database';

// Module-level pending category data (passed back from AddCategoryScreen)
let pendingCategoryId: number | null = null;
let pendingCategoryType: TransactionType | null = null;

export function setPendingCategory(categoryId: number, type: TransactionType) {
  pendingCategoryId = categoryId;
  pendingCategoryType = type;
}

function consumePendingCategory(): { categoryId: number; type: TransactionType } | null {
  if (pendingCategoryId !== null && pendingCategoryType !== null) {
    const result = { categoryId: pendingCategoryId, type: pendingCategoryType };
    pendingCategoryId = null;
    pendingCategoryType = null;
    return result;
  }
  return null;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;

interface Tag {
  id: number;
  name: string;
}

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
  const { activeType, activePeriod, customDate, selectedDate, accounts, categories, accountsWithBalance, activeAccount, refresh } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();

  const [type, setType] = useState<TransactionType>(activeType);
  const [amountRaw, setAmountRaw] = useState('0');
  const [accountId, setAccountId] = useState(activeAccount?.id ?? 1);
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

  const prevType = useRef(type);

  // Handle category selected from AddCategoryScreen
  useFocusEffect(useCallback(() => {
    const pending = consumePendingCategory();
    if (pending) {
      if (pending.type !== type) {
        setType(pending.type);
      }
      setCategoryId(pending.categoryId);
      const allByType = categories.filter(c => c.type === pending.type);
      const isVisible = allByType.slice(0, MAX_VISIBLE_CATEGORIES).some(c => c.id === pending.categoryId);
      setReorderedCategory(isVisible ? null : pending.categoryId);
    }
  }, [categories, type]));

  useEffect(() => {
    if (prevType.current !== type) {
      prevType.current = type;
      setCategoryId(null);
      setReorderedCategory(null);
    }
  }, [type]);

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [comment, setComment] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [modalAccountVisible, setModalAccountVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);

  const [availableTags, setAvailableTags] = useState<Tag[]>([
    { id: 1, name: labels.add_tag_urgent },
    { id: 2, name: labels.add_tag_recurring },
    { id: 3, name: labels.add_tag_personal },
  ]);
  // Update tag names when language changes
  useEffect(() => {
    setAvailableTags(prev => prev.map((tag, i) => ({
      ...tag,
      name: [labels.add_tag_urgent, labels.add_tag_recurring, labels.add_tag_personal][i] ?? tag.name,
    })));
  }, [labels]);

  // Display-formatted amount
  const displayAmount = useMemo(
    () => formatAmountDisplay(amountRaw, config.decimalSeparator),
    [amountRaw, config.decimalSeparator],
  );

  // Parsed numeric value (null if invalid)
  const numericAmount = useMemo(() => {
    if (!amountRaw) return null;
    const num = parseFloat(amountRaw);
    return isNaN(num) ? null : num;
  }, [amountRaw]);

  // Validation (only true for truly invalid input, not for "0" as starting value)
  const isAmountInvalid = useMemo(() => {
    if (!amountRaw || amountRaw === '0') return false;
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

  const handleCreateTag = (name: string) => {
    setAvailableTags(prev => [...prev, { id: prev.length + 1, name }]);
  };

  const handleSelectAccount = (account: typeof accountsWithBalance[0]) => {
    setAccountId(account.id);
    setModalAccountVisible(false);
  };

  const handleSelectDate = (date: Date) => {
    setDay(date);
    setModalCalendarVisible(false);
  };

  const handleTakePhoto = () => {
    // TODO: implement camera
  };

  const handlePickFromGallery = () => {
    // TODO: implement gallery
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

      await transactionRepository.create({
        account_id: accountId,
        category_id: categoryId!,
        type,
        amount: numericAmount!,
        description: comment || null,
        date: dateStr,
      });

      await refresh();
      navigation.goBack();
    } catch (err) {
      Alert.alert(labels.add_error_title, labels.add_error_message);
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
        <TypeTabs active={type} onChange={setType} />

        <View style={[styles.amountContainer, { backgroundColor: c.surface }]}>
          <TextInput
            style={[
              styles.amountInput,
              { color: c.text, fontSize: fs(24) },
              isAmountInvalid && { color: c.red },
            ]}
            placeholder={labels.add_amount_placeholder}
            placeholderTextColor={c.textSecondary}
            value={displayAmount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
          />
          <Text style={[styles.currencySymbol, { color: c.textSecondary, fontSize: fs(18) }]}>
            {config.currency}
          </Text>
          <TouchableOpacity style={styles.calculatorButton}>
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
            {selectedAccount?.name ?? ''}
          </Text>
        </TouchableOpacity>

        <CategoryGrid
          categories={visibleCategories}
          selectedCategory={categoryId}
          onSelect={setCategoryId}
          onAddMore={() => navigation.navigate('AddCategory', { type })}
          showAddMore={hasMore}
        />

        <DaySelector
          selectedDate={day}
          onSelect={setDay}
          onOpenCalendar={() => setModalCalendarVisible(true)}
        />

        <TagSection
          tags={availableTags}
          selectedTags={selectedTags}
          onToggle={handleToggleTag}
          onCreate={handleCreateTag}
        />

        <CommentInput
          comment={comment}
          onChange={setComment}
        />

        <PhotoSection
          photoUri={fotoUri}
          onTakePhoto={handleTakePhoto}
          onPickFromGallery={handlePickFromGallery}
        />

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
      </ScrollView>

      <AccountModal
        visible={modalAccountVisible}
        accounts={accountsWithBalance}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
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
});
