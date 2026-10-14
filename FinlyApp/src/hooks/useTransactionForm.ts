import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { type TextInput, type ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { usePhotos } from './usePhotos';
import { useDeferredRefresh } from './useDeferredRefresh';
import { useRecurringDraft } from './useRecurringDraft';
import { useRecurringEditScope } from './useRecurringEditScope';
import {
  type TransactionType,
  type RecurrenceFrequency,
  type TransactionDraft,
  type RecurrenceDraft,
  CATEGORY_USAGE_WINDOW_DAYS,
  USER_ID,
  MAX_VISIBLE_CATEGORIES,
} from '../constants/types';
import { formatDateForDB } from '../utils/formatters';
import { isRuleUnmaterialized, toDateOnly } from '../utils/recurrence';
import { categoriesOfType } from '../utils/categoryUtils';
import { parseAmountValue } from '../utils/amountInput';
import { transactionRepository, tagRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import { consumePendingCategory } from '../utils/pendingCategory';
import { alertError, describeError } from '../utils/errors';

export type { TransactionDraft, RecurrenceDraft } from '../constants/types';

type UseTransactionFormProps = {
  initialType: TransactionType;
  initialAccountId: number | undefined;
  initialCategoryId: number | null;
  initialReorderedCategory: number | null;
  initialDay: Date;
  transactionId?: number;
  initialComment: string;
  initialPhotos: string[];
  initialAmount?: string;
  errorTitle: string;
  errorMessage: string;
  onSubmit?: (data: TransactionDraft, tagIds: number[]) => Promise<void>;
  onSubmitRule?: (data: TransactionDraft, tagIds: number[], recurrence: RecurrenceDraft) => Promise<void>;
  /** Runs before `onSubmitRule`; returning false aborts the save (e.g. a confirmation dialog). */
  onBeforeSubmitRule?: (data: TransactionDraft, recurrence: RecurrenceDraft) => Promise<boolean>;
  resetTagsOnFirstFocus?: boolean;
  onError?: () => void;
  ruleMode?: boolean;
  initialRepeatFrequency?: RecurrenceFrequency;
  initialRepeatInterval?: number;
  initialRepeatEnd?: Date | null;
  initialTagIds?: number[];
  initialRuleNextDue?: string | null;
  initialRuleActive?: boolean;
  initialRuleSkippedFrom?: string | null;
  initialRepeatName?: string;
  initialRepeatLastDay?: boolean;
  existingRepeatNames?: string[];
};

export function useTransactionForm({
  initialType,
  initialAccountId,
  initialCategoryId,
  initialReorderedCategory,
  initialDay,
  transactionId,
  initialComment,
  initialPhotos,
  initialAmount,
  errorTitle,
  errorMessage,
  onSubmit,
  onSubmitRule,
  onBeforeSubmitRule,
  resetTagsOnFirstFocus = false,
  onError,
  ruleMode = false,
  initialRepeatFrequency,
  initialRepeatInterval,
  initialRepeatEnd,
  initialTagIds,
  initialRuleNextDue,
  initialRuleActive,
  initialRuleSkippedFrom,
  initialRepeatName,
  initialRepeatLastDay,
  existingRepeatNames,
}: UseTransactionFormProps) {
  const { config } = useConfig();
  const { accounts, categories, accountsWithBalance, tags, refresh: refreshAll, refreshTags } = useApp();
  const deferredRefresh = useDeferredRefresh(refreshAll);
  const navigation = useNavigation();

  const selectableAccounts = useMemo(
    () => accountsWithBalance.filter(a => !isTotalAccount(a)),
    [accountsWithBalance],
  );

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountRaw, setAmountRaw] = useState<string>(initialAmount ?? '');
  const [accountId, setAccountId] = useState<number | undefined>(initialAccountId);
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [reorderedCategory, setReorderedCategory] = useState<number | null>(initialReorderedCategory);
  const [day, setDay] = useState<Date>(initialDay);
  const [categoryUsage, setCategoryUsage] = useState<Map<number, number>>(new Map());
  const [selectedTags, setSelectedTags] = useState<number[]>(initialTagIds ?? []);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const { photos, handleTakePhoto, handlePickFromGallery, handleRemovePhoto } = usePhotos(initialPhotos);

  const {
    repeatFrequency, setRepeatFrequency,
    repeatInterval, setRepeatInterval,
    repeatEnd, setRepeatEnd,
    repeatLastDay, setRepeatLastDay,
    repeatName, setRepeatName,
    repeatMinDate,
    repeatNameError,
    modalRepeatEndVisible, setModalRepeatEndVisible,
    buildRecurrence,
  } = useRecurringDraft({
    day,
    ruleMode,
    existingRepeatNames,
    initialRepeatFrequency,
    initialRepeatInterval,
    initialRepeatEnd,
    initialRepeatName,
    initialRepeatLastDay,
  });

  const [modalAccountVisible, setModalAccountVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const prevType = useRef(type);
  const isFirstFocus = useRef(true);

  // Values the form opened with. Compared against the live state to tell whether the
  // user changed anything (a "Future + past" rule edit may rewrite the row underneath,
  // and an untouched form should adopt it while a dirty one must be preserved).
  const initialSnapshot = useRef({
    type: initialType,
    amount: initialAmount !== undefined ? parseAmountValue(initialAmount) : null,
    accountId: initialAccountId,
    categoryId: initialCategoryId,
    day: toDateOnly(initialDay),
    comment: initialComment,
    photos: initialPhotos,
  });
  // Tags load from the DB (below), so their "initial" value is the first loaded set.
  const initialTags = useRef<number[]>(initialTagIds ?? []);

  useEffect(() => {
    if (transactionId === undefined) return;
    let active = true;
    transactionRepository.getTagsByTransactionId(transactionId).then(ids => {
      if (active) {
        initialTags.current = ids;
        setSelectedTags(ids);
      }
    }).catch(onError ?? (() => {}));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onError is stable
  }, [transactionId]);

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
      const allByType = categoriesOfType(categories, pending.type);
      const isVisible = allByType.slice(0, MAX_VISIBLE_CATEGORIES).some(c => c.id === pending.categoryId);
      setReorderedCategory(isVisible ? null : pending.categoryId);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
    const loadUsage = async () => {
      if (accountId === undefined) return;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - CATEGORY_USAGE_WINDOW_DAYS);
      const counts = await transactionRepository.getCategoryUsageCounts(USER_ID, type, formatDateForDB(startDate), accountId);
      if (active) setCategoryUsage(new Map(counts.map(c => [c.id, c.count])));
    };
    loadUsage().catch(onError ?? (() => {}));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- categories intentionally excluded to avoid redundant loadUsage queries
  }, [type, accountId, resetTagsOnFirstFocus]));

  useEffect(() => {
    if (prevType.current !== type) {
      prevType.current = type;
      setCategoryId(null);
      setReorderedCategory(null);
    }
  }, [type]);

  const numericAmount = useMemo(() => parseAmountValue(amountRaw), [amountRaw]);

  /** Whether the draft differs from the values the form opened with (see `initialSnapshot`). */
  const isDirty = useMemo(() => {
    const initial = initialSnapshot.current;
    const initialTagsSorted = [...initialTags.current].sort((a, b) => a - b);
    const tagsSorted = [...selectedTags].sort((a, b) => a - b);
    const tagsChanged =
      initialTagsSorted.length !== tagsSorted.length || initialTagsSorted.some((v, i) => v !== tagsSorted[i]);
    const photosChanged =
      initial.photos.length !== photos.length || initial.photos.some((p, i) => p !== photos[i]);
    return (
      type !== initial.type ||
      numericAmount !== initial.amount ||
      accountId !== initial.accountId ||
      categoryId !== initial.categoryId ||
      toDateOnly(day) !== initial.day ||
      (comment.trim() || null) !== (initial.comment.trim() || null) ||
      tagsChanged ||
      photosChanged
    );
  }, [type, numericAmount, accountId, categoryId, day, comment, selectedTags, photos]);

  const canSubmit = useMemo(() => {
    if (categoryId === null) return false;
    if (numericAmount === null || numericAmount <= 0) return false;
    if (day === null) return false;
    if (accountId === undefined) return false;
    if (ruleMode && repeatNameError) return false;
    if (ruleMode && repeatEnd && repeatEnd < repeatMinDate) return false;
    return true;
  }, [categoryId, numericAmount, day, accountId, ruleMode, repeatNameError, repeatEnd, repeatMinDate]);

  // A rule whose cursor still equals its start has never generated/skipped an
  // occurrence ("fresh"): editing the start date re-anchors it from the new start
  // instead of keeping the stale (future) cursor.
  const ruleUnmaterialized =
    initialRuleNextDue != null &&
    isRuleUnmaterialized({ next_due: initialRuleNextDue, start_date: toDateOnly(initialDay) });
  // Editing a rule that already generated transactions with an earlier start does
  // not recreate the past occurrences (the cursor floor keeps them skipped).
  const ruleStartMovedEarlier = initialRuleNextDue != null && !ruleUnmaterialized && toDateOnly(day) < toDateOnly(initialDay);

  const { recurringPastAffected } = useRecurringEditScope({
    ruleMode,
    day,
    frequency: repeatFrequency,
    interval: repeatInterval,
    end: repeatEnd,
    lastDay: repeatLastDay,
    accountId,
    categoryId,
    amount: numericAmount,
    comment,
    type,
    tagIds: selectedTags,
    initialAccountId,
    initialCategoryId,
    initialAmount,
    initialComment,
    initialType,
    initialTagIds,
    initialRuleNextDue,
    ruleUnmaterialized,
    initialRuleActive,
    initialRuleSkippedFrom,
  });

  const handleToggleTag = useCallback((id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id],
    );
  }, []);

  const handleCreateTag = useCallback(async (name: string) => {
    const existing = tags.some(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return false;
    try {
      const created = await tagRepository.create({ user_id: USER_ID, name });
      await refreshTags();
      setSelectedTags(prev => prev.includes(created.id) ? prev : [...prev, created.id]);
      return true;
    } catch {
      return false;
    }
  }, [tags, refreshTags]);

  const handleSelectAccount = useCallback((id: number) => {
    setAccountId(id);
    setModalAccountVisible(false);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setDay(date);
    setModalCalendarVisible(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    if (categoryId === null || numericAmount === null || accountId === undefined) return;
    setSubmitting(true);

    try {
      const dateStr = formatDateForDB(day);
      const draft: TransactionDraft = {
        account_id: accountId,
        category_id: categoryId,
        type,
        amount: numericAmount,
        description: comment.trim() || null,
        photo: photos.length > 0 ? JSON.stringify(photos) : null,
        date: dateStr,
      };

      if (ruleMode && onSubmitRule) {
        const recurrence = buildRecurrence();
        if (onBeforeSubmitRule && !(await onBeforeSubmitRule(draft, recurrence))) return;
        await onSubmitRule(draft, selectedTags, recurrence);
      } else {
        await onSubmit?.(draft, selectedTags);
      }

      navigation.goBack();
      deferredRefresh();
    } catch (err) {
      console.error('Transaction form submit failed:', describeError(err));
      alertError(errorTitle, errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, categoryId, numericAmount, accountId, type, day, comment, photos, selectedTags, buildRecurrence, ruleMode, onSubmit, onSubmitRule, onBeforeSubmitRule, deferredRefresh, navigation, errorTitle, errorMessage]);

  const categoriesByType = useMemo(() => {
    const byType = categoriesOfType(categories, type);
    return [...byType].sort((a, b) => {
      const countA = categoryUsage.get(a.id) ?? 0;
      const countB = categoryUsage.get(b.id) ?? 0;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name);
    });
  }, [categories, type, categoryUsage]);
  const hasMore = categoriesByType.length > MAX_VISIBLE_CATEGORIES;

  const visibleCategories = useMemo(() => {
    if (reorderedCategory) {
      const selected = categoriesByType.find(c => c.id === reorderedCategory);
      if (selected) {
        return [selected, ...categoriesByType.filter(c => c.id !== reorderedCategory)].slice(0, MAX_VISIBLE_CATEGORIES);
      }
    }
    return categoriesByType.slice(0, MAX_VISIBLE_CATEGORIES);
  }, [categoriesByType, reorderedCategory]);

  const selectedAccount = useMemo(() => accounts.find(a => a.id === accountId), [accounts, accountId]);

  return {
    type, setType,
    amountRaw, setAmountRaw,
    accountId,
    categoryId, setCategoryId,
    day, setDay,
    selectedTags, comment, setComment,
    submitting,
    photos,
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
  };
}
