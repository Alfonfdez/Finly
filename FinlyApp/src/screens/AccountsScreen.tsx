import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayAccountName, getDisplayAccountDescription } from '../i18n';
import { accountRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import { Account } from '../database/types';
import { formatCurrency, formatSignedCurrency, HIDDEN_BALANCE } from '../utils/formatters';
import { RootStackParamList, USER_ID, BADGE_SHAPES, CONFIG_ICON_SHAPES } from '../constants/types';
import EyeToggle from '../components/EyeToggle';
import Fab from '../components/Fab';
import EmptyState from '../components/EmptyState';
import DrawerMenuButton from '../components/DrawerMenuButton';
import IconBadge from '../components/IconBadge';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Accounts'>;

type AccountWithBalance = Account & { balance: number };

export default function AccountsScreen() {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const round = config.accountIconShape === CONFIG_ICON_SHAPES.circle;

  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [total, setTotal] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsRevealed(false);
    }, [])
  );

  const isBalanceHidden = config.hideBalances !== isRevealed;

  const loadData = useCallback(async () => {
    const list = await accountRepository.list(USER_ID);
    const withBalance = await Promise.all(
      list.map(async (account) => {
        if (isTotalAccount(account)) return { ...account, balance: 0 };
        const balance = await accountRepository.getCurrentBalance(account.id);
        return { ...account, balance };
      })
    );
    const nonTotal = withBalance.filter(a => !isTotalAccount(a));
    const totalSum = nonTotal.reduce((sum, a) => sum + a.balance, 0);
    const result = withBalance.map(a => isTotalAccount(a) ? { ...a, balance: totalSum } : a);
    setAccounts(result);
    setTotal(totalSum);
  }, []);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <DrawerMenuButton accessibilityLabel={labels.home_open_menu} />
        ),
      });
      loadData();
    }, [navigation, labels.home_open_menu, loadData])
  );

  const renderItem = ({ item }: { item: AccountWithBalance }) => {
    const isTotal = isTotalAccount(item);
    return (
      <>
        <TouchableOpacity
          style={[
            styles.accountRow,
            { backgroundColor: isTotal ? c.primary + '15' : c.surface },
          ]}
          onPress={() => navigation.navigate('ModifyAccount', { accountId: item.id })}
          accessibilityLabel={`${getDisplayAccountName(item)} ${isBalanceHidden ? HIDDEN_BALANCE : formatCurrency(item.balance, config.currency, config.decimalSeparator)}`}
        >
          <IconBadge
            icon={item.icon}
            color={item.color}
            shape={round ? BADGE_SHAPES.circle : BADGE_SHAPES.rounded}
            size={44}
            iconSize={24}
            roundedRadius={12}
            backgroundAlpha={13}
            style={styles.iconBubble}
          />
          <View style={styles.accountInfo}>
            <Text style={[styles.accountName, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
              {getDisplayAccountName(item)}
            </Text>
            {item.description ? (
              <Text
                style={[styles.accountNote, { color: c.textSecondary, fontSize: fs(12) }]}
                numberOfLines={1}
              >
                {getDisplayAccountDescription(item)}
              </Text>
            ) : null}
          </View>
          <Text
            style={[
              styles.accountBalance,
              {
                color: isBalanceHidden ? c.textSecondary : (item.balance >= 0 ? c.green : c.red),
                fontSize: fs(15),
              },
            ]}
          >
            {isBalanceHidden
              ? HIDDEN_BALANCE
              : formatSignedCurrency(item.balance, config.currency, config.decimalSeparator)}
          </Text>
        </TouchableOpacity>
        {isTotal && <View style={[styles.separator, { backgroundColor: c.primary + '40' }]} />}
      </>
    );
  };

  const renderEmpty = () => (
    <EmptyState icon="wallet-outline" message={labels.accounts_empty} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={[styles.totalSection, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.totalLabel, { color: c.textSecondary, fontSize: fs(14) }]}>
          {labels.accounts_total}:
        </Text>
        <View style={styles.totalRow}>
          <Text
            style={[
              styles.totalValue,
              {
                color: isBalanceHidden ? c.textSecondary : (total >= 0 ? c.green : c.red),
                fontSize: fs(22),
              },
            ]}
          >
            {isBalanceHidden
              ? HIDDEN_BALANCE
              : formatSignedCurrency(total, config.currency, config.decimalSeparator)}
          </Text>
          <EyeToggle isHidden={isBalanceHidden} onToggle={() => setIsRevealed(prev => !prev)} color={c.textSecondary} />
        </View>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={accounts.length === 0 ? styles.emptyList : styles.list}
      />

      <Fab
        onPress={() => navigation.navigate('CreateAccount')}
        accessibilityLabel="+"
      />
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
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  iconBubble: {
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
});
