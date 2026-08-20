import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Alert, type TextInput, type ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { usePhotos } from './usePhotos';
import {
  type TransactionType,
  CATEGORY_USAGE_WINDOW_DAYS,
  USER_ID,
  MAX_VISIBLE_CATEGORIES,
} from '../constants/types';
import { formatDateForDB } from '../utils/formatters';
import { parseAmountValue } from '../utils/amountInput';
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
  resetTagsOnFirstFocus?: boolean;
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
  resetTagsOnFirstFocus = false,
}: UseTransactionFormProps) {
  const { config } = useConfig();
  const { accounts, categories, accountsWithBalance, tags, refresh, refreshTags } = useApp();
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

  useEffect(() => {
    if (transactionId === undefined) return;
    let active = true;
    transactionRepository.getTagsByTransactionId(transactionId).then(ids => {
      if (active) setSelectedTags(ids);
    });
    return () => { active = false; };
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
      const allByType = categories.filter(c => c.type === pending.type);
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
    loadUsage();
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
    return true;
  }, [categoryId, numericAmount, day, accountId]);

  const handleToggleTag = useCallback((id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id],
    );
  }, []);

  const handleCreateTag = useCallback(async (name: string) => {
    const existing = tags.some(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return false;
    const created = await tagRepository.create({ user_id: USER_ID, name });
    await refreshTags();
    setSelectedTags(prev => prev.includes(created.id) ? prev : [...prev, created.id]);
    return true;
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

      await onSubmit({
        account_id: accountId,
        category_id: categoryId,
        type,
        amount: numericAmount,
        description: comment.trim() || null,
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
  }, [canSubmit, submitting, categoryId, numericAmount, accountId, type, day, comment, photos, selectedTags, onSubmit, refresh, navigation, errorTitle, errorMessage]);

  const categoriesByType = useMemo(() => {
    const byType = categories.filter(c => c.type === type);
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
  };
}
