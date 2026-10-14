import { useRef, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useTransactionForm, type TransactionDraft, type RecurrenceDraft } from '../hooks/useTransactionForm';
import { t, getDisplayAccountName } from '../i18n';
import TabBar, { typeTabs } from './TabBar';
import AmountInput from './AmountInput';
import AccountModal from './AccountModal';
import CategoryGrid from './CategoryGrid';
import DaySelector from './DaySelector';
import RepeatSection from './RepeatSection';
import TagSection from './TagSection';
import CommentInput from './CommentInput';
import PhotoSection from './PhotoSection';
import CalendarModal from './CalendarModal';
import CalculatorModal from './CalculatorModal';
import { BUTTON_BORDER_RADIUS, CARD_BORDER_RADIUS } from './componentStyles';
import { type TransactionType, type RecurrenceFrequency, type RecurrenceScope, type RootStackParamList } from '../constants/types';
import { withAlpha } from '../utils/color';
import { parseAmountInput } from '../utils/amountInput';
import { buildRecurrenceSchedule, toDateOnly } from '../utils/recurrence';
import { formFieldVisibility, type FormMode } from '../utils/formFieldVisibility';
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
  onSubmit?: (data: TransactionDraft, tagIds: number[]) => Promise<void>;
  onSubmitRule?: (data: TransactionDraft, tagIds: number[], recurrence: RecurrenceDraft) => Promise<void>;
  onBeforeSubmitRule?: (data: TransactionDraft, recurrence: RecurrenceDraft) => Promise<boolean>;
  ruleMode?: boolean;
  initialRepeatFrequency?: RecurrenceFrequency;
  initialRepeatInterval?: number;
  initialRepeatEnd?: Date | null;
  initialTagIds?: number[];
  initialRuleNextDue?: string | null;
  initialRuleActive?: boolean;
  initialRuleSkippedFrom?: string | null;
  /** Dates the rule already generated a transaction for (edit mode, for the Summary count). */
  initialRuleOccurrenceDates?: string[];
  showRepeatScope?: boolean;
  repeatScope?: RecurrenceScope;
  onChangeRepeatScope?: (scope: RecurrenceScope) => void;
  repeatScopeDisabled?: boolean;
  initialRepeatName?: string;
  initialRepeatLastDay?: boolean;
  existingRepeatNames?: string[];
  footer?: ReactNode;
  onRecurringPastAffectedChange?: (value: boolean) => void;
  /** Reports whether the draft differs from the values the form opened with. */
  onDirtyChange?: (dirty: boolean) => void;
  topNotice?: ReactNode;
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
    repeatFrequency, setRepeatFrequency,
    repeatInterval, setRepeatInterval,
    repeatEnd, setRepeatEnd,
    repeatLastDay, setRepeatLastDay,
    repeatMinDate,
    recurringPastAffected,
    ruleUnmaterialized,
    ruleStartMovedEarlier,
    repeatName, setRepeatName, repeatNameError,
    modalAccountVisible, setModalAccountVisible,
    modalCalendarVisible, setModalCalendarVisible,
    modalRepeatEndVisible, setModalRepeatEndVisible,
    calculatorVisible, setCalculatorVisible,
    handleToggleTag, handleCreateTag,
    handleSelectAccount, handleSelectDate,
    handleSubmit,
    handleTakePhoto, handlePickFromGallery, handleRemovePhoto,
    canSubmit, visibleCategories, hasMore, selectedAccount, selectableAccounts, numericAmount,
    isDirty,
    inputRef, scrollRef,
    config, tags,
  } = useTransactionForm({ ...props, onError: props.onError ?? (() => showErrorAlert()) });

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The Comment field is the bottom-most text input, so the keyboard can cover the submit
  // button that follows it. Used to decide whether a keyboard pop should scroll it into view.
  const bottomFieldFocused = useRef(false);
  const { onRecurringPastAffectedChange, onDirtyChange } = props;

  useEffect(() => {
    return () => { if (scrollTimer.current != null) clearTimeout(scrollTimer.current); };
  }, []);

  // Scroll to the end so the submit button clears the keyboard (the content's generous
  // `paddingBottom` sets the gap). Scheduled, not immediate, because the keyboard resize
  // animates; the `onLayout`/`keyboardDidShow` passes below re-run it once the viewport has
  // settled, so a first attempt that lands short is corrected.
  const revealSubmit = useCallback(() => {
    if (scrollTimer.current != null) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 300);
  }, [scrollRef]);

  const handleBottomFieldFocus = useCallback(() => {
    bottomFieldFocused.current = true;
    revealSubmit();
  }, [revealSubmit]);

  const handleBottomFieldBlur = useCallback(() => {
    bottomFieldFocused.current = false;
  }, []);

  // The keyboard shrinks the ScrollView; when that happens while the comment is focused,
  // re-run the reveal so it lands after the resize (not before it).
  const handleScrollLayout = useCallback(() => {
    if (bottomFieldFocused.current) revealSubmit();
  }, [revealSubmit]);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (bottomFieldFocused.current) revealSubmit();
    });
    return () => sub.remove();
  }, [revealSubmit]);

  useEffect(() => {
    onRecurringPastAffectedChange?.(recurringPastAffected);
  }, [recurringPastAffected, onRecurringPastAffectedChange]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const tabs = useMemo(() => typeTabs(labels), [labels]);

  // Which optional sections to show depends on the screen: Add vs Modify
  // transaction, New vs Edit recurring rule (see `formFieldVisibility`).
  const mode: FormMode = props.ruleMode
    ? (props.initialRuleNextDue != null ? 'editRule' : 'createRule')
    : (props.transactionId !== undefined ? 'modify' : 'add');
  const fieldVisibility = useMemo(() => formFieldVisibility(config, mode), [config, mode]);

  // The rule's schedule before the edit, so the Summary can tell that today's
  // occurrence already exists (avoid re-counting it on a "Future only" save).
  const previousSchedule = useMemo(() => {
    if (props.initialRuleNextDue == null || props.initialRepeatFrequency == null) return null;
    return buildRecurrenceSchedule(
      props.initialDay,
      props.initialRepeatFrequency,
      props.initialRepeatInterval ?? 1,
      props.initialRepeatEnd ? toDateOnly(props.initialRepeatEnd) : null,
      props.initialRepeatLastDay ?? false,
    );
  }, [
    props.initialDay,
    props.initialRepeatFrequency,
    props.initialRepeatInterval,
    props.initialRepeatEnd,
    props.initialRepeatLastDay,
    props.initialRuleNextDue,
  ]);

  const handleAccountClose = useCallback(() => setModalAccountVisible(false), [setModalAccountVisible]);
  const handleCalendarClose = useCallback(() => setModalCalendarVisible(false), [setModalCalendarVisible]);
  const handleSelectRepeatEnd = useCallback((date: Date) => {
    setRepeatEnd(date);
    setModalRepeatEndVisible(false);
  }, [setRepeatEnd, setModalRepeatEndVisible]);

  // The recurring end date must be on/after the first occurrence (which shifts when skipping the first one).
  const repeatEndConflict = !!props.ruleMode && !!repeatEnd && repeatEnd < repeatMinDate;
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
        <ScrollView ref={scrollRef} style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" onLayout={handleScrollLayout}>
        {props.topNotice}
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
          title={props.ruleMode ? labels.repeat_start_date : undefined}
        />

        {props.ruleMode && (
          <RepeatSection
            frequency={repeatFrequency}
            onChangeFrequency={setRepeatFrequency}
            interval={repeatInterval}
            onChangeInterval={setRepeatInterval}
            startDay={day}
            endDate={repeatEnd}
            onOpenEndDate={() => setModalRepeatEndVisible(true)}
            onClearEndDate={() => setRepeatEnd(null)}
            lastDay={repeatLastDay}
            onChangeLastDay={setRepeatLastDay}
            name={repeatName}
            onChangeName={setRepeatName}
            nameError={repeatNameError}
            ruleNextDue={props.initialRuleNextDue ?? null}
            ruleSkippedFrom={props.initialRuleSkippedFrom ?? null}
            ruleOccurrenceDates={props.initialRuleOccurrenceDates}
            ruleUnmaterialized={ruleUnmaterialized}
            ruleStartMovedEarlier={ruleStartMovedEarlier}
            previousSchedule={previousSchedule}
            showScope={!!props.showRepeatScope}
            scope={props.repeatScope}
            onChangeScope={props.onChangeRepeatScope}
            scopeDisabled={props.repeatScopeDisabled}
          />
        )}

        {fieldVisibility.labels && (
          <TagSection
            tags={tags}
            selectedTags={selectedTags}
            onToggle={handleToggleTag}
            onCreate={handleCreateTag}
          />
        )}

        {fieldVisibility.comments && (
          <CommentInput
            ref={inputRef}
            comment={comment}
            onChange={setComment}
            onFocus={handleBottomFieldFocus}
            onBlur={handleBottomFieldBlur}
          />
        )}

        {fieldVisibility.photo && (
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
              : repeatEndConflict
              ? labels.add_hint_repeat_end
              : ''}
          </Text>
        )}
        {props.footer}

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: canSubmit ? c.primary : withAlpha(c.textSecondary, 38) },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={[styles.submitButtonText, { color: canSubmit ? c.background : c.text, fontSize: fs(15) }]}>
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
        maxDate={props.ruleMode ? null : undefined}
        onSelectDate={handleSelectDate}
        onClose={handleCalendarClose}
      />

      <CalendarModal
        visible={modalRepeatEndVisible}
        period="day"
        date={repeatEnd ?? repeatMinDate}
        minDate={repeatMinDate}
        maxDate={null}
        onSelectDate={handleSelectRepeatEnd}
        onClose={() => setModalRepeatEndVisible(false)}
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
  scrollContent: { paddingBottom: 112 },
  accountContainer: {
    borderRadius: CARD_BORDER_RADIUS,
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
    borderRadius: BUTTON_BORDER_RADIUS,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'transparent',
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
