import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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

export default function AddTransactionScreen() {
  const { activeColors: c, config } = useConfig();
  const { activeType, activePeriod, customDate, selectedDate, accounts, categories, accountsWithBalance, activeAccount } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();

  const [type, setType] = useState<TransactionType>(activeType);
  const [amount, setAmount] = useState('');
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

  const [modalAccountVisible, setModalAccountVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);

  const [availableTags] = useState<Tag[]>([
    { id: 1, name: 'Urgente' },
    { id: 2, name: 'Recurrente' },
    { id: 3, name: 'Personal' },
  ]);

  const isInvalidAmount = amount.length > 0 && !/^\d*\.?\d{0,2}$/.test(amount);

  const handleAmountChange = (value: string) => {
    const clean = value.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(clean);
  };

  const handleToggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleCreateTag = (name: string) => {
    const newId = availableTags.length + 1;
    availableTags.push({ id: newId, name });
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

  const handleSubmit = () => {
    // TODO: save transaction
    console.log({
      type,
      amount: parseFloat(amount) || 0,
      accountId,
      categoryId,
      day,
      selectedTags,
      comment,
      fotoUri,
    });
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
              isInvalidAmount && { color: '#F87171' },
            ]}
            placeholder={labels.add_amount_placeholder}
            placeholderTextColor={c.textSecondary}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
          />
          <Text style={[styles.currencySymbol, { color: c.textSecondary, fontSize: fs(18) }]}>
            {config.currency}
          </Text>
          <TouchableOpacity style={styles.calculatorButton}>
            <Ionicons name="calculator-outline" size={24} color={c.primary} />
          </TouchableOpacity>
        </View>
        {isInvalidAmount && (
          <Text style={[styles.errorText, { color: '#F87171', fontSize: fs(12) }]}>
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

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: c.primary }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitButtonText, { color: c.background, fontSize: fs(16) }]}>
            {labels.add_submit}
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
});
