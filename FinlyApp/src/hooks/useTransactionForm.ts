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
  onSubmit: (data: TransactionDraft, tagIds: number[]) => Promise<void>;
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
    repeatEnabled, setRepeatEnabled,
    repeatFrequency, setRepeatFrequency,
    repeatInterval, setRepeatInterval,
    repeatEnd, setRepeatEnd,
    repeatSkipFirst, setRepeatSkipFirst,
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
  });

  const [modalAccountVisible, setModalAccountVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const prevType = useRef(type);
  const isFirstFocus = useRef(true);

  useEffect(() => {
    if (transactionId === undefined) return;
    let active = true;
    transactionRepository.getTagsByTransactionId(transactionId).then(ids => {
      if (active) setSelectedTags(ids);
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

  const canSubmit = useMemo(() => {
    if (categoryId === null) return false;
    if (numericAmount === null || numericAmount <= 0) return false;
    if (day === null) return false;
    if (accountId === undefined) return false;
    if ((repeatEnabled || ruleMode) && repeatNameError) return false;
    if ((repeatEnabled || ruleMode) && repeatEnd && repeatEnd < repeatMinDate) return false;
    return true;
  }, [categoryId, numericAmount, day, accountId, repeatEnabled, ruleMode, repeatNameError, repeatEnd, repeatMinDate]);

  const { recurringPastAffected, recurringSkipWindow } = useRecurringEditScope({
    ruleMode,
    day,
    frequency: repeatFrequency,
    interval: repeatInterval,
    end: repeatEnd,
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

      if ((repeatEnabled || ruleMode) && onSubmitRule) {
        const recurrence = buildRecurrence();
        if (onBeforeSubmitRule && !(await onBeforeSubmitRule(draft, recurrence))) return;
        await onSubmitRule(draft, selectedTags, recurrence);
      } else {
        await onSubmit(draft, selectedTags);
      }

      navigation.goBack();
      deferredRefresh();
    } catch (err) {
      console.error('Transaction form submit failed:', describeError(err));
      alertError(errorTitle, errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, categoryId, numericAmount, accountId, type, day, comment, photos, selectedTags, repeatEnabled, buildRecurrence, ruleMode, onSubmit, onSubmitRule, onBeforeSubmitRule, deferredRefresh, navigation, errorTitle, errorMessage]);

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
    repeatEnabled, setRepeatEnabled,
    repeatFrequency, setRepeatFrequency,
    repeatInterval, setRepeatInterval,
    repeatEnd, setRepeatEnd,
    repeatSkipFirst, setRepeatSkipFirst,
    repeatMinDate,
    recurringPastAffected,
    recurringSkipWindow,
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
    inputRef, scrollRef,
    config, tags,
  };
}
