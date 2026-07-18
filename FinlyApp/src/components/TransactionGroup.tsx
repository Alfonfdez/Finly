import { ComponentProps } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Category } from '../database/types';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { getDisplayCategoryName } from '../i18n';

interface Props {
  date: string;
  transactions: Transaction[];
  categories: Category[];
  tagsByTransaction?: Map<number, { tag_id: number; name: string }[]>;
  onTransactionPress?: (transactionId: number) => void;
}

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

export default function TransactionGroup({ date, transactions, categories, tagsByTransaction, onTransactionPress }: Props) {
  const { config, activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={styles.group}>
      <Text style={[styles.dateHeader, { color: c.textSecondary, fontSize: fs(13) }]}>
        {formatDateHeader(date)}
      </Text>
      {transactions.map((tx) => {
        const cat = categories.find(ct => ct.id === tx.category_id);
        const txTags = tagsByTransaction?.get(tx.id);
        return (
          <TouchableOpacity
            key={tx.id}
            style={[styles.row, { borderBottomColor: c.border }]}
            onPress={() => onTransactionPress?.(tx.id)}
            activeOpacity={0.6}
          >
            {cat && (
              <View style={[styles.catIcon, { backgroundColor: cat.color + '30' }]}>
                <Ionicons name={cat.icon as ComponentProps<typeof Ionicons>['name']} size={18} color={cat.color} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={[styles.catName, { color: c.text, fontSize: fs(14) }]} numberOfLines={1}>
                {cat ? getDisplayCategoryName(cat) : ''}
              </Text>
              {tx.description ? (
                <Text style={[styles.desc, { color: c.textSecondary, fontSize: fs(12) }]} numberOfLines={1}>
                  {tx.description}
                </Text>
              ) : null}
              {txTags && txTags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {txTags.map((tag) => (
                    <View key={tag.tag_id} style={[styles.tagChip, { backgroundColor: c.primary + '20' }]}>
                      <Text style={[styles.tagChipText, { color: c.primary, fontSize: fs(11) }]} numberOfLines={1}>
                        {tag.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <Text style={[styles.amount, { color: tx.type === 'income' ? c.green : c.red, fontSize: fs(15) }]}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, config.currency, config.decimalSeparator)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
