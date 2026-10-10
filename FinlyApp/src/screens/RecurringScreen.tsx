import { useCallback, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenShell from '../components/ScreenShell';
import Fab from '../components/Fab';
import RecurringRow from '../components/RecurringRow';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import SelectionActionBar from '../components/SelectionActionBar';
import SelectAllRow from '../components/SelectAllRow';
import BulkDeleteConfirmationModal from '../components/BulkDeleteConfirmationModal';
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
import { USER_ID, type RecurrenceFrequency, type RootStackParamList } from '../constants/types';
import { isRecurrenceEnded, todayDateOnly } from '../utils/recurrence';
import { recurringRepository } from '../database';
import { setRecurringRuleActive } from '../database/recurringService';
import { ERROR_PREFIXES } from '../utils/errors';
import type { RecurringRule } from '../database/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recurring'>;

export default function RecurringScreen() {
  const { activeColors: c } = useConfig();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const { categoriesById, refresh } = useApp();

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

  const frequencyLabels = useMemo<Record<RecurrenceFrequency, string>>(() => ({
    daily: labels.repeat_daily,
    weekly: labels.repeat_weekly,
    monthly: labels.repeat_monthly,
    yearly: labels.repeat_yearly,
  }), [labels]);

  const filteredRules = useSearchFilter(rules, searchText, (rule) => {
    const category = categoriesById.get(rule.category_id);
    return [
      rule.name,
      category ? getDisplayCategoryName(category) : '',
      rule.description ?? '',
      frequencyLabels[rule.frequency],
    ];
  });

  const visibleIds = useMemo(() => filteredRules.map((rule) => rule.id), [filteredRules]);

  const handleToggleActive = useCallback(async (rule: RecurringRule, value: boolean) => {
    // The switch is disabled for finished rules; guard here anyway (the service
    // also refuses to resume an ended rule). Pausing clears the flag; resuming
    // skips the paused window.
    if (isRecurrenceEnded(rule, rule.next_due, todayDateOnly())) return;
    await setRecurringRuleActive(rule.id, value);
    if (value) {
      setData(await loadRules());
      refresh();
    } else {
      setData(prev => ({ ...prev, rules: prev.rules.map(r => (r.id === rule.id ? { ...r, active: 0 } : r)) }));
    }
  }, [setData, refresh, loadRules]);

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
      selectMode={selectMode}
      selected={selectedIds.has(item.id)}
    />
  ), [categoriesById, counts, today, handleRulePress, handleToggleActive, selectMode, selectedIds]);

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
      <ScreenSearchBar
        visible={searchActive}
        placeholder={labels.recurring_search}
        value={searchText}
        onChangeText={setSearchText}
        onClose={closeSearch}
      />

      {selectMode && visibleIds.length > 0 && (
        <SelectAllRow
          allSelected={select.allSelected(visibleIds)}
          countLabel={labels.items_count(visibleIds.length)}
          selectAllLabel={labels.select_all}
          deselectAllLabel={labels.deselect_all}
          onToggle={() => select.toggleSelectAll(visibleIds)}
        />
      )}

      <FlatList
        data={filteredRules}
        keyExtractor={item => String(item.id)}
        extraData={`${selectMode}:${selectedIds.size}`}
        contentContainerStyle={filteredRules.length === 0 ? styles.emptyContent : styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState {...emptyStateProps(searchActive, 'repeat-outline', labels.recurring_empty)} />
        }
      />

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

      <BulkDeleteConfirmationModal
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
  emptyContent: {
    flexGrow: 1,
  },
});
