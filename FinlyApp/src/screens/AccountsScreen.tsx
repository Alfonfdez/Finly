import { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
} from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useBalanceVisibility } from '../hooks/useBalanceVisibility';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useApp } from '../context/AppContext';
import { t, getDisplayAccountName, getDisplayAccountDescription } from '../i18n';
import { accountRepository } from '../database';
import { sanitizeDefaultAccounts } from '../database/configDefaults';
import { ERROR_PREFIXES, runWithErrorAlert, showErrorAlert } from '../utils/errors';
import { isTotalAccount } from '../database/helpers';
import type { Account } from '../database/types';
import { formatCurrency, formatSignedCurrency, HIDDEN_BALANCE } from '../utils/formatters';
import { withAlpha } from '../utils/color';
import { badgeShapeFor } from '../utils/badgeShape';
import { matchesAccountSearch } from '../utils/accountSearch';
import { type NavigationProp, USER_ID } from '../constants/types';
import EyeToggle from '../components/EyeToggle';
import Fab from '../components/Fab';
import EmptyState from '../components/EmptyState';
import ListItemRow from '../components/ListItemRow';
import SelectSearchHeader from '../components/SelectSearchHeader';
import ScreenSearchBar from '../components/ScreenSearchBar';
import SelectionActionBar from '../components/SelectionActionBar';
import ConfirmationModal from '../components/ConfirmationModal';
import GuardModal from '../components/GuardModal';

type AccountWithBalance = Account & { balance: number };

export default function AccountsScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Accounts'>>();
  const { refreshAccounts, refresh } = useApp();

  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [total, setTotal] = useState(0);
  const [guardVisible, setGuardVisible] = useState(false);
  const { isBalanceHidden, toggleReveal } = useBalanceVisibility(config.hideBalances);

  const nonTotalCount = useMemo(
    () => accounts.filter(a => !isTotalAccount(a)).length,
    [accounts]
  );

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    deleteModalVisible, setDeleteModalVisible, toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = useSelectableScreen({
    navigation,
    hasItems: nonTotalCount > 1,
    showHeader: nonTotalCount > 1,
    headerRight: () => (
      <SelectSearchHeader
        selectMode={selectMode}
        onToggleSelect={toggleSelectMode}
        onToggleSearch={toggleSearch}
      />
    ),
  });

  const loadData = useCallback(async (): Promise<{ accounts: AccountWithBalance[]; total: number }> => {
    const list = await accountRepository.list(USER_ID);
    const balanceById = new Map(
      (await accountRepository.getBalances()).map(b => [b.account_id, b.balance])
    );
    const withBalance = list.map((account) => {
      if (isTotalAccount(account)) return { ...account, balance: 0 };
      return { ...account, balance: balanceById.get(account.id) ?? 0 };
    });
    const nonTotal = withBalance.filter(a => !isTotalAccount(a));
    const totalSum = nonTotal.reduce((sum, a) => sum + a.balance, 0);
    const result = withBalance.map(a => isTotalAccount(a) ? { ...a, balance: totalSum } : a);
    return { accounts: result, total: totalSum };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadData().then(({ accounts, total }) => {
        if (!active) return;
        setAccounts(accounts);
        setTotal(total);
      }).catch(() => showErrorAlert());
      return () => { active = false; };
    }, [loadData])
  );

  const filteredAccounts = useMemo(() => {
    if (!searchText.trim()) return accounts;
    return accounts.filter(a => isTotalAccount(a) || matchesAccountSearch(a, searchText));
  }, [accounts, searchText]);

  const handleDeletePress = useCallback(() => {
    if (selectedIds.size >= nonTotalCount) {
      setGuardVisible(true);
      return;
    }
    setDeleteModalVisible(true);
  }, [selectedIds.size, nonTotalCount, setDeleteModalVisible]);

  const handleBulkDelete = useCallback(async () => {
    setDeleteModalVisible(false);
    await runWithErrorAlert(async () => {
      await accountRepository.deleteMany([...selectedIds]);

      const remaining = accounts.filter(a => !selectedIds.has(a.id));
      const updates = sanitizeDefaultAccounts(config, remaining);
      if (Object.keys(updates).length > 0) {
        updateConfig(updates);
      }

      exitSelectMode();
      const { accounts: updated, total: newTotal } = await loadData();
      setAccounts(updated);
      setTotal(newTotal);
      await refreshAccounts();
      refresh();
    }, ERROR_PREFIXES.accountsDelete);
  }, [selectedIds, config, accounts, exitSelectMode, loadData, refreshAccounts, refresh, updateConfig, setDeleteModalVisible]);

  const renderItem = useCallback(({ item }: { item: AccountWithBalance }) => {
    const isTotal = isTotalAccount(item);
    const selectable = !isTotal;
    const selected = selectMode && selectedIds.has(item.id);
    return (
      <>
        <ListItemRow
          title={getDisplayAccountName(item)}
          titleSize={15}
          subtitle={item.description ? getDisplayAccountDescription(item) : undefined}
          icon={item.icon}
          color={item.color}
          shape={badgeShapeFor(config, 'account')}
          badgeSize={44}
          badgeIconSize={24}
          badgeRadius={12}
          badgeAlpha={13}
          right={
            selectMode && selectable ? (
              <Ionicons
                name={selected ? 'checkbox' : 'square-outline'}
                size={24}
                color={selected ? c.primary : c.textSecondary}
              />
            ) : (
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
            )
          }
          style={[
            styles.accountRow,
            { backgroundColor: isTotal ? withAlpha(c.primary, 8) : c.surface },
          ]}
          onPress={() => {
            if (selectMode) {
              if (selectable) toggleItem(item.id);
              return;
            }
            navigation.navigate('ModifyAccount', { accountId: item.id });
          }}
          accessibilityLabel={`${getDisplayAccountName(item)} ${isBalanceHidden ? HIDDEN_BALANCE : formatCurrency(item.balance, config.currency, config.decimalSeparator)}`}
        />
        {isTotal && <View style={[styles.separator, { backgroundColor: withAlpha(c.primary, 25) }]} />}
      </>
    );
  }, [c, config, navigation, isBalanceHidden, fs, selectMode, selectedIds, toggleItem]);

  const renderEmpty = useCallback(() => (
    <EmptyState icon="wallet-outline" message={labels.accounts_empty} />
  ), [labels.accounts_empty]);

  const searchingNoResults = searchActive && searchText.trim()
    && !filteredAccounts.some(a => !isTotalAccount(a));

  const renderSearchFooter = useCallback(() => (
    <EmptyState icon="search-outline" message={labels.filter_no_results} />
  ), [labels.filter_no_results]);

  return (
    <ScreenShell>
      {!selectMode && (
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
            <EyeToggle isHidden={isBalanceHidden} onToggle={toggleReveal} color={c.textSecondary} />
          </View>
        </View>
      )}

      <ScreenSearchBar
        visible={searchActive}
        placeholder={labels.accounts_search}
        value={searchText}
        onChangeText={setSearchText}
        onClose={closeSearch}
      />

      <FlatList
        data={filteredAccounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={searchingNoResults ? renderSearchFooter : null}
        contentContainerStyle={filteredAccounts.length === 0 ? styles.emptyList : styles.list}
      />

      {selectMode ? (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          deleteLabel={labels.accounts_bulk_delete(selectedIds.size)}
          cancelLabel={labels.cancel}
          onDelete={handleDeletePress}
          onCancel={exitSelectMode}
        />
      ) : (
        <Fab
          onPress={() => navigation.navigate('CreateAccount')}
          accessibilityLabel={labels.a11y_add}
        />
      )}

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.accounts_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.accounts_bulk_delete_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={handleBulkDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />

      <GuardModal
        visible={guardVisible}
        title={labels.accounts_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.accounts_bulk_delete_min_one}
        onClose={() => setGuardVisible(false)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  accountBalance: {
    fontWeight: '700',
  },
});
