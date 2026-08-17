import { memo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Transaction, Category } from '../database/types';
import { formatCurrency, getMonthName, parseDbDate } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { getDisplayCategoryName } from '../i18n';
import { BADGE_SHAPES, TRANSACTION_TYPES } from '../constants/types';
import ListItemRow from './ListItemRow';
import TagChip from './TagChip';

interface TransactionRowProps {
  tx: Transaction;
  category?: Category;
  tags?: { tag_id: number; name: string }[];
  onPress?: (transactionId: number) => void;
  selectMode?: boolean;
  selected?: boolean;
}

export const TransactionRow = memo(function TransactionRow({ tx, category, tags, onPress, selectMode, selected }: TransactionRowProps) {
  const { config, activeColors: c } = useConfig();
  const fs = useFontSize();

  const handlePress = useCallback(() => onPress?.(tx.id), [onPress, tx.id]);

  const checkbox = selectMode ? (
    <Ionicons
      name={selected ? 'checkbox' : 'checkbox-outline'}
      size={22}
      color={selected ? c.primary : c.textSecondary}
      style={styles.checkbox}
    />
  ) : undefined;

  return (
    <ListItemRow
      title={category ? getDisplayCategoryName(category) : ''}
      subtitle={tx.description ?? undefined}
      icon={category?.icon}
      color={category?.color}
      shape={BADGE_SHAPES.circle}
      badgeSize={36}
      badgeIconSize={18}
      badgeAlpha={19}
      leading={checkbox}
      middle={tags && tags.length > 0 ? (
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <TagChip key={tag.tag_id} label={tag.name} />
          ))}
        </View>
      ) : undefined}
      right={
        <Text style={[styles.amount, { color: tx.type === TRANSACTION_TYPES.income ? c.green : c.red, fontSize: fs(15) }]}>
          {tx.type === TRANSACTION_TYPES.income ? '+' : '-'}{formatCurrency(tx.amount, config.currency, config.decimalSeparator)}
        </Text>
      }
      divider
      activeOpacity={0.6}
      onPress={handlePress}
    />
  );
});

export const TransactionDateHeader = memo(function TransactionDateHeader({ date }: { date: string }) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <Text style={[styles.dateHeader, { color: c.textSecondary, fontSize: fs(13) }]}>
      {formatDateHeader(date)}
    </Text>
  );
});

function formatDateHeader(dateStr: string): string {
  const d = parseDbDate(dateStr);
  const day = d.getDate();
  const month = getMonthName(d.getMonth() + 1).toLowerCase();
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  if (year === currentYear) {
    return `${day} ${month}`;
  }
  return `${day} ${month} ${year}`;
}

const styles = StyleSheet.create({
  dateHeader: {
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  checkbox: {
    marginRight: 10,
  },
  amount: { fontWeight: '700' },
});
