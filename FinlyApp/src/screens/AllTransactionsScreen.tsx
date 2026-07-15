import { useState, useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { scrollbarFlatList } from '../constants/platformStyles';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { RootStackParamList } from '../constants/types';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { formatCurrency } from '../utils/formatters';
import { t } from '../i18n';
import AccountSelector from '../components/AccountSelector';
import SortToggle, { SortBy, SortDirection } from '../components/SortToggle';
import TransactionGroup from '../components/TransactionGroup';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllTransactions'>;

export default function AllTransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { categories, accounts, activeAccount, accountsWithBalance } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccount?.id ?? accounts[0]?.id ?? 1);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { allTransactions, sections } = useTransactionFilters({
    selectedAccountId,
    sortBy,
    sortDirection,
  });

  const accountBalance = useMemo(() => {
    return allTransactions
      .filter(t => t.account_id === selectedAccountId)
      .reduce(
        (sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0
      );
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
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.container}>
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
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  empty: { textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute',
    bottom: 24,
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
