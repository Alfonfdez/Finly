import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { accountRepository } from '../database';
import { Account } from '../database/types';
import { formatCurrency } from '../utils/formatters';
import { RootStackParamList } from '../constants/types';

const USER_ID = 1;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Accounts'>;

type AccountWithBalance = Account & { saldo: number };

export default function AccountsScreen() {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();

  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [total, setTotal] = useState(0);

  const loadData = useCallback(async () => {
    const list = await accountRepository.list(USER_ID);
    const withBalance = await Promise.all(
      list.map(async (account) => {
        const saldo = await accountRepository.getCurrentBalance(account.id);
        return { ...account, saldo };
      })
    );
    setAccounts(withBalance);
    setTotal(withBalance.reduce((sum, a) => sum + a.saldo, 0));
  }, []);

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
      loadData();
    }, [navigation, c.text, labels.home_open_menu, loadData])
  );

  const renderItem = ({ item }: { item: AccountWithBalance }) => (
    <TouchableOpacity
      style={[styles.accountRow, { backgroundColor: c.surface }]}
      onPress={() => navigation.navigate('ModifyAccount', { accountId: item.id })}
      accessibilityLabel={`${item.name} ${formatCurrency(item.saldo, config.currency, config.decimalSeparator)}`}
    >
      <View style={[styles.iconBubble, { backgroundColor: item.color + '22' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.accountInfo}>
        <Text style={[styles.accountName, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.description ? (
          <Text
            style={[styles.accountNote, { color: c.textSecondary, fontSize: fs(12) }]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.accountBalance,
          {
            color: item.saldo >= 0 ? c.green : c.red,
            fontSize: fs(15),
          },
        ]}
      >
        {item.saldo >= 0 ? '+' : ''}{formatCurrency(item.saldo, config.currency, config.decimalSeparator)}
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color={c.textSecondary} />
      <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(16) }]}>
        {labels.accounts_empty}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={[styles.totalSection, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.totalLabel, { color: c.textSecondary, fontSize: fs(14) }]}>
          {labels.accounts_total}:
        </Text>
        <Text
          style={[
            styles.totalValue,
            {
              color: total >= 0 ? c.green : c.red,
              fontSize: fs(22),
            },
          ]}
        >
          {total >= 0 ? '+' : ''}{formatCurrency(total, config.currency, config.decimalSeparator)}
        </Text>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={accounts.length === 0 ? styles.emptyList : styles.list}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('CreateAccount')}
        accessibilityLabel="+"
      >
        <Ionicons name="add" size={28} color={c.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  totalSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: '500',
    marginBottom: 2,
  },
  totalValue: {
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontWeight: '600',
  },
  accountNote: {
    marginTop: 2,
  },
  accountBalance: {
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontWeight: '500',
  },
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
