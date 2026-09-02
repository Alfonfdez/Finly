import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useTransactionForm, type TransactionDraft } from '../hooks/useTransactionForm';
import { t, getDisplayAccountName } from '../i18n';
import TabBar, { typeTabs } from './TabBar';
import AmountInput from './AmountInput';
import AccountModal from './AccountModal';
import CategoryGrid from './CategoryGrid';
import DaySelector from './DaySelector';
import TagSection from './TagSection';
import CommentInput from './CommentInput';
import PhotoSection from './PhotoSection';
import CalendarModal from './CalendarModal';
import CalculatorModal from './CalculatorModal';
import { type TransactionType, type RootStackParamList } from '../constants/types';
import { withAlpha } from '../utils/color';
import { parseAmountInput } from '../utils/amountInput';
import { showErrorAlert } from '../utils/errors';

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
  onError?: () => void;
}

export default function TransactionForm(props: TransactionFormProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    type, setType,
    amountRaw, setAmountRaw,
    categoryId, setCategoryId, day, setDay,
    selectedTags, comment, setComment,
    submitting, photos,
    modalAccountVisible, setModalAccountVisible,
    modalCalendarVisible, setModalCalendarVisible,
    calculatorVisible, setCalculatorVisible,
    handleToggleTag, handleCreateTag,
    handleSelectAccount, handleSelectDate,
    handleSubmit,
    handleTakePhoto, handlePickFromGallery, handleRemovePhoto,
    canSubmit, visibleCategories, hasMore, selectedAccount, selectableAccounts, numericAmount,
    inputRef, scrollRef,
    config, tags,
  } = useTransactionForm({ ...props, onError: props.onError ?? (() => showErrorAlert()) });

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (scrollTimer.current != null) clearTimeout(scrollTimer.current); };
  }, []);

  const tabs = useMemo(() => typeTabs(labels), [labels]);

  const handleAccountClose = useCallback(() => setModalAccountVisible(false), [setModalAccountVisible]);
  const handleCalendarClose = useCallback(() => setModalCalendarVisible(false), [setModalCalendarVisible]);
  const handleCalculatorAccept = useCallback((result: string) => {
    const clean = parseAmountInput(result);
    if (clean !== null && clean !== '') {
      setAmountRaw(clean);
    }
    setCalculatorVisible(false);
  }, [setAmountRaw, setCalculatorVisible]);
  const handleCalculatorCancel = useCallback(() => setCalculatorVisible(false), [setCalculatorVisible]);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safe, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardAvoid}
      >
        <ScrollView ref={scrollRef} style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TabBar
          tabs={tabs}
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
              if (scrollTimer.current != null) clearTimeout(scrollTimer.current);
              scrollTimer.current = setTimeout(() => {
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
            {submitting ? '...' : props.submitLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>

      <AccountModal
        visible={modalAccountVisible}
        accounts={selectableAccounts}
        selectedId={props.initialAccountId}
        onSelect={handleSelectAccount}
        onClose={handleAccountClose}
      />

      <CalendarModal
        visible={modalCalendarVisible}
        period="day"
        date={day}
        onSelectDate={handleSelectDate}
        onClose={handleCalendarClose}
      />

      <CalculatorModal
        visible={calculatorVisible}
        onAccept={handleCalculatorAccept}
        onCancel={handleCalculatorCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },
  scrollContent: { paddingBottom: 48 },
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
