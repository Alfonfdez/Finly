import { useState, useMemo, useCallback, ComponentProps } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { scrollbarFlatList } from '../constants/platformStyles';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { RootStackParamList } from '../constants/types';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { formatCurrency } from '../utils/formatters';
import { getCategoryName, t } from '../i18n';
import AccountSelector from '../components/AccountSelector';
import SortToggle, { SortBy, SortDirection } from '../components/SortToggle';
import TransactionGroup from '../components/TransactionGroup';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Transactions'>;
type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TransactionsRouteProp>();
  const { categories, accounts, activeAccount, accountsWithBalance } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const categoryId = route.params?.categoryId;
  const startDate = route.params?.startDate;
  const endDate = route.params?.endDate;

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccount?.id ?? accounts[0]?.id ?? 1);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(k => k + 1);
    }, [])
  );

  const { allTransactions, sections } = useTransactionFilters({
    categoryId,
    startDate,
    endDate,
    selectedAccountId,
    sortBy,
    sortDirection,
    refreshTrigger: refreshKey,
  });

  const category = categories.find(ct => ct.id === categoryId);

  const categoryTotal = useMemo(() => {
    return allTransactions
      .filter(t => t.account_id === selectedAccountId)
      .reduce((sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0);
  }, [allTransactions, selectedAccountId]);

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
              {getCategoryName(category.id) || category.name}
            </Text>
          </View>
          <Text style={[styles.categoryTotal, { color: categoryTotal >= 0 ? c.green : c.red, fontSize: fs(22) }]}>
            {categoryTotal >= 0 ? '+' : ''}{formatCurrency(categoryTotal, config.currency, config.decimalSeparator)}
          </Text>
        </View>
      )}

      <View style={[styles.controls, { borderBottomColor: c.border }]}>
        <AccountSelector
          accounts={accountsWithBalance}
          selectedId={selectedAccountId}
          onSelect={setSelectedAccountId}
        />
        <SortToggle
          sortBy={sortBy}
          direction={sortDirection}
          onToggleSort={handleToggleSort}
          onToggleDirection={() => setSortDirection(d => d === 'desc' ? 'asc' : 'desc')}
        />
      </View>

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
            onTransactionPress={(id) => navigation.navigate('TransactionDetails', { transactionId: id })}
          />
        )}
        renderItem={({ item }) => null}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: c.textSecondary, fontSize: fs(14) }]}>{labels.transactions_empty}</Text>
        }
        stickySectionHeadersEnabled={false}
      />

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
  listContent: { paddingBottom: 80 },
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
