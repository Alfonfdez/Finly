import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, DrawerActions } from '@react-navigation/native';
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
import { t } from '../i18n';
import AccountSelector from '../components/AccountSelector';
import SortToggle, { SortBy, SortDirection } from '../components/SortToggle';
import TagFilterBar from '../components/TagFilterBar';
import TransactionGroup from '../components/TransactionGroup';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllTransactions'>;

export default function AllTransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { categories, accounts, activeAccount, accountsWithBalance, tags } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccount?.id ?? accounts[0]?.id ?? 1);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagsByTransaction, setTagsByTransaction] = useState<Map<number, { tag_id: number; name: string }[]>>(new Map());
  const [localTagIds, setLocalTagIds] = useState<number[]>([]);

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
        const data = await transactionRepository.list({});
        if (active) {
          setAllTransactions(data);
          setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
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

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ marginLeft: 8, padding: 4 }}
            accessibilityLabel={labels.home_open_menu}
          >
            <Ionicons name="menu-outline" size={24} color={c.text} />
          </TouchableOpacity>
        ),
      });
    }, [navigation, c.text, labels.home_open_menu])
  );

  const filtered = useMemo(() => {
    let list = allTransactions.filter(t => t.account_id === selectedAccountId);
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
  }, [allTransactions, selectedAccountId, sortBy, sortDirection, localTagIds, tagsByTransaction]);

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

  const accountBalance = useMemo(() => {
    return filtered
      .reduce(
        (sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0
      );
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
      <View style={[styles.controls, { borderBottomColor: c.border }]}>
        <AccountSelector
          accounts={accountsWithBalance}
          selectedId={selectedAccountId}
          onSelect={setSelectedAccountId}
        />
        <Text style={[styles.accountBalance, { color: accountBalance >= 0 ? c.green : c.red, fontSize: fs(22) }]}>
          {accountBalance >= 0 ? '+' : ''}{formatCurrency(accountBalance, config.currency, config.decimalSeparator)}
        </Text>
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('AddTransaction')}
        accessibilityLabel="+"
      >
        <Ionicons name="add" size={28} color={c.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  accountBalance: { fontWeight: '700' },
  listContent: { paddingBottom: 80 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
