import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenShell from '../components/ScreenShell';
import Fab from '../components/Fab';
import AccountTrigger from '../components/AccountTrigger';
import AccountModal from '../components/AccountModal';
import TabBar, { typeTabs } from '../components/TabBar';
import RecurringRow from '../components/RecurringRow';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import ListOrEmpty from '../components/ListOrEmpty';
import SelectionActionBar from '../components/SelectionActionBar';
import SelectAllRow from '../components/SelectAllRow';
import SortToggle, { recurringSortFields } from '../components/SortToggle';
import RecurringStatusChip from '../components/RecurringStatusChip';
import SortRow from '../components/SortRow';
import ConfirmationModal from '../components/ConfirmationModal';
import SelectSearchHeader from '../components/SelectSearchHeader';
import ScreenSearchBar from '../components/ScreenSearchBar';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { useBulkDelete } from '../hooks/useBulkDelete';
import { t, getDisplayCategoryName } from '../i18n';
import { USER_ID, RULE_INACTIVE, TYPE_FILTERS, type RootStackParamList, type RecurringSortBy, type RecurringStatus, type TransactionTypeFilter } from '../constants/types';
import { TEST_IDS } from '../constants/testIds';
import { isRecurrenceEnded, recurringStatus, todayDateOnly } from '../utils/recurrence';
import { recurrenceFrequencyLabels } from '../utils/recurrenceSummary';
import { defaultRecurringSortDirection, sortRecurringRules } from '../utils/recurringSort';
import { nextSortPreference, toggleSortDirection } from '../utils/sortPreference';
import { filterRecurringRules } from '../utils/recurringFilter';
import { isTotalAccount } from '../database/helpers';
import { recurringRepository } from '../database';
import { setRecurringRuleActive } from '../database/recurringService';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';
import type { RecurringRule } from '../database/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recurring'>;

export default function RecurringScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const { accountsWithBalance, categoriesById, refresh } = useApp();

  const loadRules = useCallback(async () => {
    const rules = await recurringRepository.list(USER_ID);
    const counts = await recurringRepository.countOccurrencesByRuleIds(rules.map(r => r.id));
    return { rules, counts };
  }, []);
  const { data, setData, loading } = useFocusLoad(
    loadRules,
    { rules: [] as RecurringRule[], counts: new Map<number, number>() },
  );
  const { rules, counts } = data;
  const today = todayDateOnly();

  const sortBy = config.recurringSortBy;
  const sortDirection = config.recurringSortDirection;
  const [statusFilter, setStatusFilter] = useState<RecurringStatus[]>([]);
  const [typeTab, setTypeTab] = useState<TransactionTypeFilter>(TYPE_FILTERS.all);
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(undefined);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  // A ref mirrors the state so a same-tick double tap is still rejected (the settled
  // state would only be visible on the next render).
  const busyRuleIdsRef = useRef<Set<number>>(new Set());
  const [busyRuleIds, setBusyRuleIds] = useState<ReadonlySet<number>>(() => new Set());
  const setRuleBusy = useCallback((ruleId: number, busy: boolean) => {
    const next = new Set(busyRuleIdsRef.current);
    if (busy) next.add(ruleId); else next.delete(ruleId);
    busyRuleIdsRef.current = next;
    setBusyRuleIds(next);
  }, []);

  // Default to the "Total" account (every rule) once accounts load.
  const totalAccountId = useMemo(() => accountsWithBalance.find(isTotalAccount)?.id, [accountsWithBalance]);
  useEffect(() => {
    if (selectedAccountId !== undefined) return;
    const fallback = totalAccountId ?? accountsWithBalance[0]?.id;
    if (fallback !== undefined) setSelectedAccountId(fallback);
  }, [selectedAccountId, totalAccountId, accountsWithBalance]);

  const selectedAccount = accountsWithBalance.find(a => a.id === selectedAccountId);
  const isTotal = !selectedAccount || isTotalAccount(selectedAccount);

  const openAccountModal = useCallback(() => setAccountModalVisible(true), []);
  const closeAccountModal = useCallback(() => setAccountModalVisible(false), []);
  const selectAccount = useCallback((id: number) => {
    setSelectedAccountId(id);
    setAccountModalVisible(false);
  }, []);

  const handleToggleSort = useCallback((field: RecurringSortBy) => {
    const next = nextSortPreference({ by: sortBy, direction: sortDirection }, field, defaultRecurringSortDirection);
    updateConfig({ recurringSortBy: next.by, recurringSortDirection: next.direction });
  }, [sortBy, sortDirection, updateConfig]);

  const handleToggleDirection = useCallback(() => {
    updateConfig({ recurringSortDirection: toggleSortDirection(sortDirection) });
  }, [sortDirection, updateConfig]);

  const select = useSelectAndSearch({ hasItems: rules.length > 0 });
  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = select;

  useSelectableScreen({
    navigation,
    showHeader: !loading && rules.length > 0,
    selectMode,
    headerRight: () => (
      <SelectSearchHeader
        selectMode={selectMode}
        onToggleSelect={toggleSelectMode}
        onToggleSearch={toggleSearch}
      />
    ),
  });

  const frequencyLabels = recurrenceFrequencyLabels(labels);

  const typeAndAccountRules = useMemo(
    () => filterRecurringRules(rules, { type: typeTab, accountId: selectedAccountId, isTotal }),
    [rules, typeTab, selectedAccountId, isTotal],
  );

  const statusFilteredRules = useMemo(
    () => (statusFilter.length === 0 ? typeAndAccountRules : typeAndAccountRules.filter(rule => statusFilter.includes(recurringStatus(rule, today)))),
    [typeAndAccountRules, statusFilter, today],
  );

  const filteredRules = useSearchFilter(statusFilteredRules, searchText, (rule) => {
    const category = categoriesById.get(rule.category_id);
    return [
      rule.name,
      category ? getDisplayCategoryName(category) : '',
      rule.description ?? '',
      frequencyLabels[rule.frequency],
    ];
  });

  const visibleIds = useMemo(() => filteredRules.map((rule) => rule.id), [filteredRules]);

  const sortedRules = useMemo(
    () => sortRecurringRules(filteredRules, sortBy, sortDirection),
    [filteredRules, sortBy, sortDirection],
  );

  const handleToggleActive = useCallback(async (rule: RecurringRule, value: boolean) => {
    // The switch is disabled for finished rules; guard here anyway (the service
    // also refuses to resume an ended rule). Pausing clears the flag; resuming
    // skips the paused window.
    if (isRecurrenceEnded(rule, rule.next_due, todayDateOnly())) return;
    // One write per rule at a time: a second tap while resuming would interleave
    // the optimistic pause with the reloaded list.
    if (busyRuleIdsRef.current.has(rule.id)) return;
    setRuleBusy(rule.id, true);
    try {
      await runWithErrorAlert(async () => {
        await setRecurringRuleActive(rule.id, value);
        if (value) {
          setData(await loadRules());
          refresh();
        } else {
          setData(prev => ({ ...prev, rules: prev.rules.map(r => (r.id === rule.id ? { ...r, active: RULE_INACTIVE } : r)) }));
        }
      }, ERROR_PREFIXES.recurringUpdate);
    } finally {
      setRuleBusy(rule.id, false);
    }
  }, [setData, refresh, loadRules, setRuleBusy]);

  const handleRulePress = useCallback((rule: RecurringRule) => {
    if (selectMode) { toggleItem(rule.id); return; }
    navigation.navigate('ModifyRecurring', { ruleId: rule.id });
  }, [selectMode, toggleItem, navigation]);

  const {
    deleteModalVisible, openDeleteModal, closeDeleteModal, confirmBulkDelete,
  } = useBulkDelete({
    selectedIds,
    exitSelectMode,
    deleteFn: (ids) => recurringRepository.deleteMany(ids),
    afterDelete: async () => { setData(await loadRules()); refresh(); },
    errorPrefix: ERROR_PREFIXES.recurringDelete,
  });

  const renderItem = useCallback(({ item }: { item: RecurringRule }) => (
    <RecurringRow
      rule={item}
      category={categoriesById.get(item.category_id)}
      count={counts.get(item.id) ?? 0}
      today={today}
      onPress={() => handleRulePress(item)}
      onToggleActive={value => handleToggleActive(item, value)}
      busy={busyRuleIds.has(item.id)}
      selectMode={selectMode}
      selected={selectedIds.has(item.id)}
    />
  ), [categoriesById, counts, today, handleRulePress, handleToggleActive, busyRuleIds, selectMode, selectedIds]);

  if (loading && rules.length === 0) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <TabBar
        tabs={[{ key: TYPE_FILTERS.all, label: labels.tab_all }, ...typeTabs(labels)]}
        active={typeTab}
        onChange={setTypeTab}
      />

      <ScreenSearchBar
        visible={searchActive}
        placeholder={labels.recurring_search}
        value={searchText}
        onChangeText={setSearchText}
        onClose={closeSearch}
      />

      <View style={[styles.controls, { borderBottomColor: c.border }]}>
        <AccountTrigger
          accountId={selectedAccountId}
          accounts={accountsWithBalance}
          onPress={openAccountModal}
        />

        <SortRow>
          <RecurringStatusChip selected={statusFilter} onChange={setStatusFilter} />
          <SortToggle
            fields={recurringSortFields(labels)}
            sortBy={sortBy}
            direction={sortDirection}
            onToggleSort={handleToggleSort}
            onToggleDirection={handleToggleDirection}
          />
        </SortRow>
      </View>

      {selectMode && visibleIds.length > 0 && (
        <SelectAllRow
          allSelected={select.allSelected(visibleIds)}
          countLabel={labels.items_count(visibleIds.length)}
          selectAllLabel={labels.select_all}
          deselectAllLabel={labels.deselect_all}
          onToggle={() => select.toggleSelectAll(visibleIds)}
        />
      )}

      <ListOrEmpty
        empty={sortedRules.length === 0}
        emptyState={<EmptyState {...emptyStateProps(searchActive, 'repeat-outline', labels.recurring_empty)} />}
      >
        <FlatList
          testID={TEST_IDS.recurringList}
          data={sortedRules}
          keyExtractor={item => String(item.id)}
          extraData={`${selectMode}:${selectedIds.size}`}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
        />
      </ListOrEmpty>

      {selectMode ? (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          deleteLabel={labels.recurring_bulk_delete(selectedIds.size)}
          cancelLabel={labels.cancel}
          onDelete={openDeleteModal}
          onCancel={exitSelectMode}
        />
      ) : (
        <Fab onPress={() => navigation.navigate('CreateRecurring')} accessibilityLabel={labels.recurring_add} />
      )}

      <AccountModal
        visible={accountModalVisible}
        accounts={accountsWithBalance}
        selectedId={selectedAccountId}
        onSelect={selectAccount}
        onClose={closeAccountModal}
      />

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.recurring_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.recurring_bulk_delete_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={confirmBulkDelete}
        onCancel={closeDeleteModal}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  listContent: {
    paddingBottom: 128,
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
});
