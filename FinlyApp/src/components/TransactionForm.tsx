import { useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useTransactionForm, type TransactionDraft, type RecurrenceDraft } from '../hooks/useTransactionForm';
import { useKeyboardReveal, type RevealAction } from '../hooks/useKeyboardReveal';
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
import FormActions from './form/FormActions';
import CalendarModal from './CalendarModal';
import CalculatorModal from './CalculatorModal';
import { BUTTON_BORDER_RADIUS, CARD_BORDER_RADIUS } from './componentStyles';
import { type TransactionType, type RecurrenceFrequency, type RecurrenceScope, type RootStackParamList, RECURRENCE_SCOPES } from '../constants/types';
import { withAlpha } from '../utils/color';
import { parseAmountInput } from '../utils/amountInput';
import { buildRecurrenceSchedule, recurrencePreview, ruleEditCursor, toDateOnly, todayDateOnly, MAX_CATCH_UP_OCCURRENCES } from '../utils/recurrence';
import { formFieldVisibility, FORM_MODES, type FormMode } from '../utils/formFieldVisibility';
import { isWeb } from '../utils/platform';
import { showErrorAlert } from '../utils/errors';
import { getTransactionFormHintText } from '../utils/formHints';

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
  /** Pass label + handler to render the destructive action above the hint band
   *  (rule editing); omitted for the add/modify transaction and create-rule forms. */
  deleteLabel?: string;
  onDeletePress?: () => void;
  deleteDisabled?: boolean;
  /** Muted explanation shown above the Delete button (reserved band). */
  deleteHint?: string | null;
  onRecurringPastAffectedChange?: (value: boolean) => void;
  /** Reports whether the draft differs from the values the form opened with. */
  onDirtyChange?: (dirty: boolean) => void;
  topNotice?: ReactNode;
  resetTagsOnFirstFocus?: boolean;
  /** The form edits an existing transaction/rule: Save requires an actual change. */
  editing?: boolean;
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
    repeatName, setRepeatName,
    repeatNameError,
    repeatNameErrorDisplay, markNameTouched,
    modalAccountVisible, setModalAccountVisible,
    modalCalendarVisible, setModalCalendarVisible,
    modalRepeatEndVisible, setModalRepeatEndVisible,
    calculatorVisible, setCalculatorVisible,
    handleToggleTag, handleCreateTag,
    handleSelectAccount, handleSelectDate,
    handleSubmit,
    handleTakePhoto, handlePickFromGallery, handleRemovePhoto,
    accountId,
    canSubmit, visibleCategories, hasMore, selectedAccount, selectableAccounts, numericAmount,
    isDirty,
    inputRef, scrollRef,
    config, tags,
  } = useTransactionForm({ ...props, onError: props.onError ?? (() => showErrorAlert()) });

  const { onRecurringPastAffectedChange, onDirtyChange } = props;

  // The Comment field is the bottom-most input, so the keyboard can cover the submit button
  // that follows it; focusing it scrolls the form so the button clears the keyboard.
  const { onBottomFieldFocus, onBottomFieldBlur, onScrollLayout } = useKeyboardReveal(scrollRef);

  // Focusing the recurring Name brings the "Recurring" section to the top so the input
  // stays visible above the keyboard (native only — web has no software keyboard). Same
  // reveal mechanism as the Comment field, with a scroll-to-section action instead of the end.
  const repeatSectionY = useRef(0);
  const handleRepeatSectionLayout = useCallback((y: number) => { repeatSectionY.current = y; }, []);
  const revealRepeatName = useCallback<RevealAction>((ref) => {
    if (isWeb) return;
    ref.current?.scrollTo({ y: Math.max(0, repeatSectionY.current - 8), animated: true });
  }, []);
  const {
    onBottomFieldFocus: onNameFocus,
    onBottomFieldBlur: onNameBlur,
    onScrollLayout: onNameScrollLayout,
  } = useKeyboardReveal(scrollRef, revealRepeatName);
  const handleRepeatNameBlur = useCallback(() => {
    onNameBlur();
    markNameTouched();
  }, [onNameBlur, markNameTouched]);
  const handleScrollLayout = useCallback(() => {
    onScrollLayout();
    onNameScrollLayout();
  }, [onScrollLayout, onNameScrollLayout]);

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
    ? (props.initialRuleNextDue != null ? FORM_MODES.editRule : FORM_MODES.createRule)
    : (props.transactionId !== undefined ? FORM_MODES.modify : FORM_MODES.add);
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

  // Mirrors the service guard: a rule whose due backlog cannot finish in one run is
  // refused, so the form blocks Save and explains it in the bottom hint.
  const tooManyOccurrences = useMemo(() => {
    if (!props.ruleMode) return false;
    const schedule = buildRecurrenceSchedule(
      day,
      repeatFrequency,
      repeatInterval,
      repeatEnd ? toDateOnly(repeatEnd) : null,
      repeatLastDay,
    );
    const today = todayDateOnly();
    if (props.initialRuleNextDue == null) {
      return recurrencePreview(schedule, { today }).truncated;
    }
    return recurrencePreview(schedule, {
      today,
      cursor: ruleEditCursor({ next_due: props.initialRuleNextDue, start_date: toDateOnly(props.initialDay) }, schedule),
      scope: props.repeatScope ?? RECURRENCE_SCOPES.future,
      skippedFrom: props.initialRuleSkippedFrom ?? null,
      previousSchedule,
      existingOccurrences: new Set(props.initialRuleOccurrenceDates ?? []),
    }).truncated;
  }, [
    props.ruleMode,
    props.initialRuleNextDue,
    props.initialRuleSkippedFrom,
    props.initialRuleOccurrenceDates,
    props.repeatScope,
    props.initialDay,
    day,
    repeatFrequency,
    repeatInterval,
    repeatEnd,
    repeatLastDay,
    previousSchedule,
  ]);
  const saveDisabled = !canSubmit || submitting || tooManyOccurrences;

  const handleAccountClose = useCallback(() => setModalAccountVisible(false), [setModalAccountVisible]);
  const handleCalendarClose = useCallback(() => setModalCalendarVisible(false), [setModalCalendarVisible]);
  const handleSelectRepeatEnd = useCallback((date: Date) => {
    setRepeatEnd(date);
    setModalRepeatEndVisible(false);
  }, [setRepeatEnd, setModalRepeatEndVisible]);

  // The recurring end date must be on/after the first occurrence (which shifts when skipping the first one).
  const repeatEndConflict = !!props.ruleMode && !!repeatEnd && repeatEnd < repeatMinDate;

  // Every condition that still blocks the save, as a red checklist above the button.
  const hintText = getTransactionFormHintText(
    {
      categoryId, numericAmount, accountId, repeatEndConflict, ruleMode: props.ruleMode, repeatNameError,
      repeatTooMany: tooManyOccurrences,
    },
    {
      category: labels.add_hint_category,
      amount: labels.add_hint_amount,
      account: labels.add_hint_account,
      repeatEnd: labels.add_hint_repeat_end,
      repeatName: labels.recurring_hint_name,
      repeatNameTaken: labels.recurring_hint_name_taken,
      // The advice adapts to the draft: "add an end date" only makes sense when none is set.
      repeatTooMany: repeatEnd
        ? labels.recurring_too_many_occurrences_end(MAX_CATCH_UP_OCCURRENCES)
        : labels.recurring_too_many_occurrences(MAX_CATCH_UP_OCCURRENCES),
    },
  );
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
            error={amountRaw.length > 0 && (numericAmount === null || numericAmount <= 0)}
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
              nameError={repeatNameErrorDisplay}
              onNameFocus={onNameFocus}
              onNameBlur={handleRepeatNameBlur}
              onSectionLayout={handleRepeatSectionLayout}
              ruleNextDue={props.initialRuleNextDue ?? null}
              ruleActive={props.initialRuleActive ?? true}
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
              onFocus={onBottomFieldFocus}
              onBlur={onBottomFieldBlur}
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

          {/* The destructive action comes first, then the "why you can't save" hint,
            then Save. Both bands are reserved, so the buttons never move. */}
          <FormActions
            deleteLabel={props.deleteLabel}
            onDeletePress={props.onDeletePress}
            deleteDisabled={props.deleteDisabled}
            deleteHint={props.deleteHint}
            saveHint={submitting ? '' : hintText}
          >
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: saveDisabled ? withAlpha(c.textSecondary, 38) : c.primary },
              ]}
              onPress={handleSubmit}
              disabled={saveDisabled}
            >
              <Text style={[styles.submitButtonText, { color: saveDisabled ? c.text : c.background, fontSize: fs(15) }]}>
                {submitting ? '...' : props.submitLabel}
              </Text>
            </TouchableOpacity>
          </FormActions>
        </ScrollView>
      </KeyboardAvoidingView>

      <AccountModal
        visible={modalAccountVisible}
        accounts={selectableAccounts}
        selectedId={accountId}
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
    marginTop: 0,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  submitButtonText: {
    fontWeight: '700',
  },
});
