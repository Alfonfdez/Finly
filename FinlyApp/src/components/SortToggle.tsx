import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { t } from '../i18n';
import { useFontSize } from '../hooks/useFontSize';
import {
  SORT_BY, SORT_DIRECTIONS, RECURRING_SORT_BY, TAG_SORT_BY, COMMENT_SORT_BY, ACCOUNT_SORT_BY, CATEGORY_SORT_BY,
  type SortBy, type SortDirection, type RecurringSortBy, type TagSortBy, type CommentSortBy, type AccountSortBy, type CategorySortBy, type IconName,
} from '../constants/types';

export interface SortField<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  fields: SortField<T>[];
  sortBy: T;
  direction: SortDirection;
  onToggleSort: (field: T) => void;
  onToggleDirection: () => void;
}

export function transactionSortFields(labels: {
  transactions_sort_date: string;
  transactions_sort_amount: string;
}): SortField<SortBy>[] {
  return [
    { key: SORT_BY.date, label: labels.transactions_sort_date },
    { key: SORT_BY.amount, label: labels.transactions_sort_amount },
  ];
}

export function recurringSortFields(labels: {
  recurring_sort_next_due: string;
  recurring_sort_name: string;
  recurring_sort_amount: string;
  recurring_sort_created: string;
}): SortField<RecurringSortBy>[] {
  return [
    { key: RECURRING_SORT_BY.nextDue, label: labels.recurring_sort_next_due },
    { key: RECURRING_SORT_BY.name, label: labels.recurring_sort_name },
    { key: RECURRING_SORT_BY.amount, label: labels.recurring_sort_amount },
    { key: RECURRING_SORT_BY.created, label: labels.recurring_sort_created },
  ];
}

export function tagSortFields(labels: {
  tags_sort_name: string;
  tags_sort_created: string;
  tags_sort_usage: string;
}): SortField<TagSortBy>[] {
  return [
    { key: TAG_SORT_BY.name, label: labels.tags_sort_name },
    { key: TAG_SORT_BY.created, label: labels.tags_sort_created },
    { key: TAG_SORT_BY.usage, label: labels.tags_sort_usage },
  ];
}

export function commentSortFields(labels: {
  comments_sort_name: string;
  comments_sort_last_used: string;
  comments_sort_usage: string;
}): SortField<CommentSortBy>[] {
  return [
    { key: COMMENT_SORT_BY.name, label: labels.comments_sort_name },
    { key: COMMENT_SORT_BY.lastUsed, label: labels.comments_sort_last_used },
    { key: COMMENT_SORT_BY.usage, label: labels.comments_sort_usage },
  ];
}

export function accountSortFields(labels: {
  accounts_sort_name: string;
  accounts_sort_balance: string;
}): SortField<AccountSortBy>[] {
  return [
    { key: ACCOUNT_SORT_BY.name, label: labels.accounts_sort_name },
    { key: ACCOUNT_SORT_BY.balance, label: labels.accounts_sort_balance },
  ];
}

export function categorySortFields(labels: {
  categories_sort_name: string;
  categories_sort_usage: string;
}): SortField<CategorySortBy>[] {
  return [
    { key: CATEGORY_SORT_BY.name, label: labels.categories_sort_name },
    { key: CATEGORY_SORT_BY.usage, label: labels.categories_sort_usage },
  ];
}

export default function SortToggle<T extends string>({
  fields, sortBy, direction, onToggleSort, onToggleDirection,
}: Props<T>) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const arrowIcon: IconName = direction === SORT_DIRECTIONS.desc ? 'arrow-down' : 'arrow-up';

  return (
    <View style={styles.container}>
      {fields.map((field) => {
        const active = field.key === sortBy;
        return (
          <View key={field.key} style={styles.option}>
            <TouchableOpacity
              onPress={() => onToggleSort(field.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={field.label}
            >
              <Text style={[
                styles.label,
                { color: active ? c.primary : c.textSecondary, fontSize: fs(13) },
              ]}>
                {field.label}
              </Text>
            </TouchableOpacity>
            {active && (
              <TouchableOpacity
                onPress={onToggleDirection}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={direction === SORT_DIRECTIONS.desc ? labels.a11y_sort_ascending : labels.a11y_sort_descending}
              >
                <Ionicons name={arrowIcon} size={14} color={c.primary} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontWeight: '600',
  },
});
