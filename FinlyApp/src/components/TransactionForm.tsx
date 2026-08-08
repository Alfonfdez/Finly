import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, type NavigationProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { usePhotos } from '../hooks/usePhotos';
import { t, getDisplayAccountName } from '../i18n';
import TabBar from './TabBar';
import AmountInput from './AmountInput';
import AccountModal from './AccountModal';
import CategoryGrid from './CategoryGrid';
import DaySelector from './DaySelector';
import TagSection from './TagSection';
import CommentInput from './CommentInput';
import PhotoSection from './PhotoSection';
import CalendarModal from './CalendarModal';
import CalculatorModal from './CalculatorModal';
import {
  TRANSACTION_TYPES,
  type TransactionType,
  type RootStackParamList,
  CATEGORY_USAGE_WINDOW_DAYS,
  USER_ID,
  MAX_VISIBLE_CATEGORIES,
} from '../constants/types';
import { formatDateForDB } from '../utils/formatters';
import { withAlpha } from '../utils/color';
import { parseAmountInput, parseAmountValue } from '../utils/amountInput';
import { transactionRepository, tagRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import { consumePendingCategory } from '../utils/pendingCategory';

export type TransactionDraft = {
  account_id: number;
  category_id: number;
  type: TransactionType;
  amount: number;
  description: string | null;
  photo: string | null;
  date: string;
};

interface TransactionFormProps {
  initialType: TransactionType;
  initialAccountId: number | undefined;
  initialCategoryId: number | null;
  initialReorderedCategory: number | null;
  initialDay: Date;
  transactionId?: number;
  initialComment: string;
  initialPhotos: string[];
  initialAmount?: string;
  submitLabel: string;
  errorTitle: string;
  errorMessage: string;
  onSubmit: (data: TransactionDraft, tagIds: number[]) => Promise<void>;
  resetTagsOnFirstFocus?: boolean;
}

export default function TransactionForm({
  initialType,
  initialAccountId,
  initialCategoryId,
  initialReorderedCategory,
  initialDay,
  transactionId,
  initialComment,
  initialPhotos,
  submitLabel,
  errorTitle,
  errorMessage,
  onSubmit,
  resetTagsOnFirstFocus = false,
  initialAmount,
}: TransactionFormProps) {
  const { activeColors: c, config } = useConfig();
  const { accounts, categories, accountsWithBalance, tags, refresh, refreshTags } = useApp();
  const selectableAccounts = useMemo(() => accountsWithBalance.filter(a => !isTotalAccount(a)), [accountsWithBalance]);
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountRaw, setAmountRaw] = useState<string>(initialAmount ?? '');
  const [accountId, setAccountId] = useState<number | undefined>(initialAccountId);
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [reorderedCategory, setReorderedCategory] = useState<number | null>(initialReorderedCategory);
  const [day, setDay] = useState<Date>(initialDay);
  const [categoryUsage, setCategoryUsage] = useState<Map<number, number>>(new Map());
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const { photos, handleTakePhoto, handlePickFromGallery, handleRemovePhoto } = usePhotos(initialPhotos);

  const [modalAccountVisible, setModalAccountVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const prevType = useRef(type);
  const isFirstFocus = useRef(true);

  // Pre-populate tags for an existing transaction
  useEffect(() => {
    if (transactionId === undefined) return;
    let active = true;
    transactionRepository.getTagsByTransactionId(transactionId).then(ids => {
      if (active) setSelectedTags(ids);
    });
    return () => {
      active = false;
    };
  }, [transactionId]);

  // Handle category selected from AddCategoryScreen
  useFocusEffect(useCallback(() => {
    let active = true;
    if (resetTagsOnFirstFocus && isFirstFocus.current) {
      setSelectedTags([]);
      isFirstFocus.current = false;
    }
    const pending = consumePendingCategory();
    if (pending) {
      if (pending.type !== type) setType(pending.type);
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
      if (accountId === undefined) return;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - CATEGORY_USAGE_WINDOW_DAYS);
      const counts = await transactionRepository.getCategoryUsageCounts(USER_ID, type, formatDateForDB(startDate), accountId);
      if (active) setCategoryUsage(new Map(counts.map(c => [c.id, c.count])));
    };
    loadUsage();
    return () => { active = false; };
  }, [categories, type, accountId, resetTagsOnFirstFocus]));

  useEffect(() => {
    if (prevType.current !== type) {
      prevType.current = type;
      setCategoryId(null);
      setReorderedCategory(null);
    }
  }, [type]);

  // Parsed numeric value (null if invalid or empty)
  const numericAmount = useMemo(() => parseAmountValue(amountRaw), [amountRaw]);

  const canSubmit = useMemo(() => {
    if (categoryId === null) return false;
    if (numericAmount === null || numericAmount <= 0) return false;
    if (day === null) return false;
    if (accountId === undefined) return false;
    return true;
  }, [categoryId, numericAmount, day, accountId]);

  const handleToggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleCreateTag = async (name: string) => {
    const existing = tags.some(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return false;
    const created = await tagRepository.create({ user_id: USER_ID, name });
    await refreshTags();
    setSelectedTags(prev => prev.includes(created.id) ? prev : [...prev, created.id]);
    return true;
  };

  const handleSelectAccount = (id: number) => {
    setAccountId(id);
    setModalAccountVisible(false);
  };

  const handleSelectDate = (date: Date) => {
    setDay(date);
    setModalCalendarVisible(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    if (categoryId === null || numericAmount === null || accountId === undefined) return;
    setSubmitting(true);

    try {
      const dateStr = formatDateForDB(day);

      await onSubmit({
        account_id: accountId,
        category_id: categoryId,
        type,
        amount: numericAmount,
        description: comment || null,
        photo: photos.length > 0 ? JSON.stringify(photos) : null,
        date: dateStr,
      }, selectedTags);

      await refresh();
      navigation.goBack();
    } catch {
      Alert.alert(errorTitle, errorMessage);
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
        <TabBar
          tabs={[
            { key: TRANSACTION_TYPES.expense, label: labels.tab_expenses },
            { key: TRANSACTION_TYPES.income, label: labels.tab_income },
          ]}
          active={type}
          onChange={setType}
        />

        <AmountInput
          raw={amountRaw}
          onChangeRaw={setAmountRaw}
          onOpenCalculator={() => setCalculatorVisible(true)}
        />

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
        )}

        {config.addShowPhoto && (
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
            { backgroundColor: canSubmit ? c.primary : withAlpha(c.textSecondary, 38) },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={[styles.submitButtonText, { color: canSubmit ? c.background : c.text, fontSize: fs(16) }]}>
            {submitting ? '...' : submitLabel}
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
