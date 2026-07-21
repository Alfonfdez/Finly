import { useState, useMemo, useCallback, useEffect, ComponentProps } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { scrollbarFlatList } from '../constants/platformStyles';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { RootStackParamList } from '../constants/types';
import { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatCurrency } from '../utils/formatters';
import { getDisplayCategoryName, t, getDisplayAccountName } from '../i18n';
import AccountModal from '../components/AccountModal';
import SortToggle, { SortBy, SortDirection } from '../components/SortToggle';
import TagFilterBar from '../components/TagFilterBar';
import TransactionGroup from '../components/TransactionGroup';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Transactions'>;
type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TransactionsRouteProp>();
  const { categories, accounts, activeAccount, accountsWithBalance, tags } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const categoryId = route.params?.categoryId;
  const startDate = route.params?.startDate;
  const endDate = route.params?.endDate;
  const tagIds = route.params?.tagIds;

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccount?.id ?? accounts.find(a => (a.is_total ?? 0) !== 1)?.id ?? 1);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagsByTransaction, setTagsByTransaction] = useState<Map<number, { tag_id: number; name: string }[]>>(new Map());
  const [localTagIds, setLocalTagIds] = useState<number[]>(() => tagIds ?? []);

  const isTotal = useMemo(
    () => accounts.find(a => a.id === selectedAccountId)?.is_total === 1,
    [accounts, selectedAccountId]
  );

  const handleToggleTag = useCallback((id: number) => {
    setLocalTagIds(prev => {
      if (id === -1) {
        return prev.includes(-1) ? [] : [-1];
      }
      if (prev.includes(-1)) {
        return [id];
      }
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  }, []);

  const handleClearTagFilter = useCallback(() => {
    setLocalTagIds([]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        const filters: { category_id?: number; start_date?: string; end_date?: string } = {};
        if (categoryId) filters.category_id = categoryId;
        if (startDate) filters.start_date = startDate;
        if (endDate) filters.end_date = endDate;
        const data = await transactionRepository.list(filters);

        if (active) {
          setAllTransactions(data);
          setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [categoryId, startDate, endDate])
  );

  // Load tags for visible transactions
  useEffect(() => {
    if (allTransactions.length === 0) {
      setTagsByTransaction(new Map());
      return;
    }
    let active = true;
    (async () => {
      const txIds = allTransactions.map(t => t.id);
      const tagLinks = await transactionRepository.getTagsByTransactionIds(txIds);
      if (!active) return;
      const map = new Map<number, { tag_id: number; name: string }[]>();
      for (const link of tagLinks) {
        if (!map.has(link.transaction_id)) map.set(link.transaction_id, []);
        map.get(link.transaction_id)!.push(link);
      }
      setTagsByTransaction(map);
    })();
    return () => { active = false; };
  }, [allTransactions]);

  const filtered = useMemo(() => {
    let list = isTotal
      ? [...allTransactions]
      : allTransactions.filter(t => t.account_id === selectedAccountId);
    if (localTagIds.length > 0) {
      const hasUntagged = localTagIds.includes(-1);
      const regularIds = localTagIds.filter(id => id !== -1);
      list = list.filter(tx => {
        const txTags = tagsByTransaction.get(tx.id) ?? [];
        if (hasUntagged && txTags.length === 0) return true;
        if (regularIds.length > 0 && regularIds.some(id => txTags.some(t => t.tag_id === id))) return true;
        return false;
      });
    }
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDirection === 'desc' ? -diff : diff;
      }
      const diff = a.amount - b.amount;
      return sortDirection === 'desc' ? -diff : diff;
    });
    return sorted;
  }, [allTransactions, selectedAccountId, isTotal, sortBy, sortDirection, localTagIds, tagsByTransaction]);

  const sections = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const dateKey = tx.date.split(' ')[0];
      const existing = grouped.get(dateKey);
      if (existing) {
        existing.push(tx);
      } else {
        grouped.set(dateKey, [tx]);
      }
    }
    return Array.from(grouped.entries()).map(([date, data]) => ({ date, data }));
  }, [filtered]);

  const category = categories.find(ct => ct.id === categoryId);

  const categoryTotal = useMemo(() => {
    return filtered
      .reduce((sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0);
  }, [filtered]);

  const handleToggleSort = (field: SortBy) => {
    if (field === sortBy) {
      setSortDirection(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      {category && (
        <View style={[styles.categoryInfo, { borderBottomColor: c.border }]}>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '30' }]}>
              <Ionicons name={category.icon as ComponentProps<typeof Ionicons>['name']} size={22} color={category.color} />
            </View>
            <Text style={[styles.categoryName, { color: c.text, fontSize: fs(16) }]} numberOfLines={1}>
              {getDisplayCategoryName(category)}
            </Text>
          </View>
          <Text style={[styles.categoryTotal, { color: categoryTotal >= 0 ? c.green : c.red, fontSize: fs(22) }]}>
            {categoryTotal >= 0 ? '+' : ''}{formatCurrency(categoryTotal, config.currency, config.decimalSeparator)}
          </Text>
        </View>
      )}

      <View style={[styles.controls, { borderBottomColor: c.border }]}>
        <TouchableOpacity style={styles.accountTrigger} onPress={() => setAccountModalVisible(true)}>
          {(() => { const a = accountsWithBalance.find(x => x.id === selectedAccountId); return a ? (
            <View style={[styles.accountTriggerIcon, { backgroundColor: a.color + '30', borderRadius: config.accountIconShape === 'circle' ? 14 : 6 }]}>
              <Ionicons name={a.icon as ComponentProps<typeof Ionicons>['name']} size={18} color={a.color} />
            </View>
          ) : null; })()}
          <Text style={[styles.accountTriggerName, { color: c.text, fontSize: fs(14) }]} numberOfLines={1}>
            {accountsWithBalance.find(x => x.id === selectedAccountId) ? getDisplayAccountName(accountsWithBalance.find(x => x.id === selectedAccountId)!) : ''}
          </Text>
          <Ionicons name="chevron-down" size={16} color={c.textSecondary} />
        </TouchableOpacity>
        <SortToggle
          sortBy={sortBy}
          direction={sortDirection}
          onToggleSort={handleToggleSort}
          onToggleDirection={() => setSortDirection(d => d === 'desc' ? 'asc' : 'desc')}
        />
      </View>

      <TagFilterBar
        tags={tags}
        activeTagIds={localTagIds}
        onToggle={handleToggleTag}
        onClear={handleClearTagFilter}
        style={{ marginTop: 12 }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
      <SectionList
        style={scrollbarFlatList}
        contentContainerStyle={styles.listContent}
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section }) => (
          <TransactionGroup
            date={section.date}
            transactions={section.data}
            categories={categories}
            tagsByTransaction={tagsByTransaction}
            onTransactionPress={(id) => navigation.navigate('TransactionDetails', { transactionId: id })}
          />
        )}
        renderItem={({ item }) => null}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: c.textSecondary, fontSize: fs(14) }]}>{labels.transactions_empty}</Text>
        }
        stickySectionHeadersEnabled={false}
      />
      )}

      <AccountModal
        visible={accountModalVisible}
        accounts={accountsWithBalance}
        selectedId={selectedAccountId}
        onSelect={(id) => { setSelectedAccountId(id); setAccountModalVisible(false); }}
        onClose={() => setAccountModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryInfo: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryName: { fontWeight: '600' },
  categoryTotal: { fontWeight: '700' },
  controls: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  accountTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountTriggerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTriggerName: { fontWeight: '600', maxWidth: 100 },
  listContent: { paddingBottom: 80 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40 },
});
