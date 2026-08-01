import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { usePhotos } from '../hooks/usePhotos';
import { t, getDisplayAccountName } from '../i18n';
import { isNative } from '../utils/platform';
import TabBar from '../components/TabBar';
import AmountInput from '../components/AmountInput';
import AccountModal from '../components/AccountModal';
import CategoryGrid from '../components/CategoryGrid';
import DaySelector from '../components/DaySelector';
import TagSection from '../components/TagSection';
import CommentInput from '../components/CommentInput';
import PhotoSection from '../components/PhotoSection';
import CalendarModal from '../components/CalendarModal';
import CalculatorModal from '../components/CalculatorModal';
import { TRANSACTION_TYPES, type TransactionType, type RootStackParamList, USER_ID, MAX_VISIBLE_CATEGORIES } from '../constants/types';
import { parseAmountInput, parseAmountValue } from '../utils/amountInput';
import { formatDateForDB } from '../utils/formatters';
import { parsePhotos } from '../utils/photoUtils';
import { transactionRepository, tagRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import { consumePendingCategory } from './AddTransactionScreen';
import EmptyState from '../components/EmptyState';

type ModifyRouteProp = RouteProp<RootStackParamList, 'ModifyTransaction'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ModifyTransaction'>;

export default function ModifyTransactionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ModifyRouteProp>();
  const { transactionId } = route.params;
  const { activeColors: c, config } = useConfig();
  const { transactions, accounts, categories, accountsWithBalance, tags, refresh, refreshTags } = useApp();
  const selectableAccounts = useMemo(() => accountsWithBalance.filter(a => !isTotalAccount(a)), [accountsWithBalance]);
  const fs = useFontSize();
  const labels = t();

  const transaction = useMemo(
    () => transactions.find(tx => tx.id === transactionId),
    [transactions, transactionId]
  );

  const [type, setType] = useState<TransactionType>(transaction?.type ?? TRANSACTION_TYPES.expense);
  const [amountRaw, setAmountRaw] = useState('');
  const [accountId, setAccountId] = useState(
    transaction?.account_id ?? accounts.find(a => !isTotalAccount(a))?.id ?? 1
  );
  const [categoryId, setCategoryId] = useState<number | null>(transaction?.category_id ?? null);
  const [reorderedCategory, setReorderedCategory] = useState<number | null>(transaction?.category_id ?? null);
  const [day, setDay] = useState<Date>(transaction ? new Date(transaction.date) : new Date());
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [comment, setComment] = useState(transaction?.description ?? '');
  const [submitting, setSubmitting] = useState(false);
  const { photos, handleTakePhoto, handlePickFromGallery, handleRemovePhoto } = usePhotos(
    transaction ? parsePhotos(transaction.photo) : []
  );

  const [modalAccountVisible, setModalAccountVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
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
    if (!transaction) return;
    let active = true;
    transactionRepository.getTagsByTransactionId(transactionId).then(ids => {
      if (active) setSelectedTags(ids);
    });
    return () => {
      active = false;
    };
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
    await tagRepository.create({ user_id: USER_ID, name });
    await refreshTags();
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
    if (!canSubmit || submitting || !transaction) return;
    if (categoryId === null || numericAmount === null) return;
    setSubmitting(true);
    try {
      const dateStr = formatDateForDB(day);

      await transactionRepository.updateWithTags(transactionId, {
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
        <EmptyState message={labels.transactions_empty} />
      </SafeAreaView>
    );
  }

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
