import { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction, Category } from '../database/types';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { getDisplayCategoryName } from '../i18n';
import { BADGE_SHAPES, TRANSACTION_TYPES } from '../constants/types';
import IconBadge from './IconBadge';

interface Props {
  date: string;
  transactions: Transaction[];
  categories: Category[];
  tagsByTransaction?: Map<number, { tag_id: number; name: string }[]>;
  onTransactionPress?: (transactionId: number) => void;
}

interface TransactionRowProps {
  tx: Transaction;
  category?: Category;
  tags?: { tag_id: number; name: string }[];
  onPress?: (transactionId: number) => void;
}

function TransactionRow({ tx, category, tags, onPress }: TransactionRowProps) {
  const { config, activeColors: c } = useConfig();
  const fs = useFontSize();

  const handlePress = useCallback(() => onPress?.(tx.id), [onPress, tx.id]);

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: c.border }]}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      {category && (
        <IconBadge
          icon={category.icon}
          color={category.color}
          shape={BADGE_SHAPES.circle}
          size={36}
          iconSize={18}
          backgroundAlpha={19}
          style={styles.catIcon}
        />
      )}
      <View style={styles.info}>
        <Text style={[styles.catName, { color: c.text, fontSize: fs(14) }]} numberOfLines={1}>
          {category ? getDisplayCategoryName(category) : ''}
        </Text>
        {tx.description ? (
          <Text style={[styles.desc, { color: c.textSecondary, fontSize: fs(12) }]} numberOfLines={1}>
            {tx.description}
          </Text>
        ) : null}
        {tags && tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <View key={tag.tag_id} style={[styles.tagChip, { backgroundColor: c.primary + '20' }]}>
                <Text style={[styles.tagChipText, { color: c.primary, fontSize: fs(11) }]} numberOfLines={1}>
                  {tag.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Text style={[styles.amount, { color: tx.type === TRANSACTION_TYPES.income ? c.green : c.red, fontSize: fs(15) }]}>
        {tx.type === TRANSACTION_TYPES.income ? '+' : '-'}{formatCurrency(tx.amount, config.currency, config.decimalSeparator)}
      </Text>
    </TouchableOpacity>
  );
}

const MemoizedTransactionRow = memo(TransactionRow);

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = getMonthName(d.getMonth() + 1).toLowerCase();
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  if (year === currentYear) {
    return `${day} ${month}`;
  }
  return `${day} ${month} ${year}`;
}

export default memo(function TransactionGroup({ date, transactions, categories, tagsByTransaction, onTransactionPress }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  const categoriesById = useMemo(() => new Map(categories.map(cat => [cat.id, cat])), [categories]);

  return (
    <View style={styles.group}>
      <Text style={[styles.dateHeader, { color: c.textSecondary, fontSize: fs(13) }]}>
        {formatDateHeader(date)}
      </Text>
      {transactions.map((tx) => (
        <MemoizedTransactionRow
          key={tx.id}
          tx={tx}
          category={categoriesById.get(tx.category_id)}
          tags={tagsByTransaction?.get(tx.id)}
          onPress={onTransactionPress}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  group: { marginBottom: 8 },
  dateHeader: {
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  catIcon: {
    marginRight: 12,
  },
  info: { flex: 1 },
  catName: { fontWeight: '500' },
  desc: { marginTop: 2 },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagChipText: {
    fontWeight: '500',
  },
  amount: { fontWeight: '700' },
});
