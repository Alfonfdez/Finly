import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { COUNTER_STYLE } from '../components/componentStyles';
import CharCounter from '../components/form/CharCounter';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { useSortPreference } from '../hooks/useSortPreference';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository, transactionRepository } from '../database';
import { type Tag } from '../database/types';
import { type NavigationProp, MAX_TAGS } from '../constants/types';
import { TEST_IDS } from '../constants/testIds';
import { LIST_BOTTOM_FAB_PADDING } from '../constants/layout';
import { countAtLimit } from '../utils/limits';
import { parseDbDate } from '../utils/formatters';
import { useBulkDelete } from '../hooks/useBulkDelete';
import { ERROR_PREFIXES } from '../utils/errors';
import { defaultTagSortDirection, sortTags } from '../utils/tagSort';
import Fab from '../components/Fab';
import ListItemRow from '../components/ListItemRow';
import SelectionCheckbox from '../components/SelectionCheckbox';
import DateIcon from '../components/DateIcon';
import ListOrEmpty from '../components/ListOrEmpty';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import SelectionActionBar from '../components/SelectionActionBar';
import SelectAllRow from '../components/SelectAllRow';
import SortToggle, { tagSortFields } from '../components/SortToggle';
import SortRow from '../components/SortRow';
import ConfirmationModal from '../components/ConfirmationModal';
import SelectSearchHeader from '../components/SelectSearchHeader';
import ScreenSearchBar from '../components/ScreenSearchBar';

export default function TagsScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Tags'>>();
  const { tags, refreshTags } = useApp();

  const select = useSelectAndSearch({ hasItems: tags.length > 0 });

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    toggleItem, reconcileSelection, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = select;

  useSelectableScreen({
    navigation,
    showHeader: tags.length > 0,
    selectMode,
    headerRight: () => (
      <SelectSearchHeader
        selectMode={selectMode}
        onToggleSelect={toggleSelectMode}
        onToggleSearch={toggleSearch}
      />
    ),
  });

  const filteredTags = useSearchFilter(tags, searchText, (tag) => [tag.name]);

  const [usage, setUsage] = useState<Map<number, number>>(new Map());
  // Creation order ascending (oldest first) keeps the list's historical order.
  const sortBy = config.tagsSortBy;
  const sortDirection = config.tagsSortDirection;

  useEffect(() => {
    let active = true;
    transactionRepository.countByTagIdsMap(tags.map(t => t.id))
      .then(map => {
        if (active) setUsage(new Map(Object.entries(map).map(([id, count]) => [Number(id), count])));
      })
      .catch(() => { if (active) setUsage(new Map()); });
    return () => { active = false; };
  }, [tags]);

  const { handleToggleSort, handleToggleDirection } = useSortPreference({
    sortBy,
    sortDirection,
    defaultDirection: defaultTagSortDirection,
    onChange: next => updateConfig({ tagsSortBy: next.by, tagsSortDirection: next.direction }),
  });

  const sortedTags = useMemo(
    () => sortTags(filteredTags, sortBy, sortDirection, usage),
    [filteredTags, sortBy, sortDirection, usage],
  );

  const visibleIds = useMemo(() => sortedTags.map(t => t.id), [sortedTags]);

  useEffect(() => {
    reconcileSelection(visibleIds);
  }, [visibleIds, reconcileSelection]);

  const atTagLimit = countAtLimit(tags.length, MAX_TAGS);

  const {
    deleteModalVisible, busy, openDeleteModal, closeDeleteModal, confirmBulkDelete,
  } = useBulkDelete({
    selectedIds,
    visibleIds,
    exitSelectMode,
    deleteFn: (ids) => tagRepository.deleteMany(ids),
    afterDelete: refreshTags,
    errorPrefix: ERROR_PREFIXES.tagsDelete,
  });

  const renderItem = useCallback(({ item }: { item: Tag }) => {
    const selected = selectedIds.has(item.id);
    const created = parseDbDate(item.created_at);
    const createdText = `${created.getDate()} ${labels.months_short[created.getMonth()]} ${created.getFullYear()}`;
    return (
      <ListItemRow
        title={item.name}
        titleSize={15}
        subtitle={labels.tags_used_in(usage.get(item.id) ?? 0)}
        middle={
          <View style={styles.dateRow}>
            <DateIcon kind="time" size={12} />
            <Text style={[styles.dateText, { color: c.textSecondary, fontSize: fs(12) }]}>
              {labels.tags_created_on(createdText)}
            </Text>
          </View>
        }
        leading={selectMode ? <SelectionCheckbox selected={selected} /> : undefined}
        right={!selectMode ? <Ionicons name="chevron-forward" size={18} color={c.textSecondary} /> : undefined}
        divider
        accessibilityState={selectMode ? { selected } : undefined}
        style={[styles.row, { backgroundColor: c.surface }]}
        onPress={() => (selectMode ? toggleItem(item.id) : navigation.navigate('ModifyTag', { tagId: item.id }))}
      />
    );
  }, [selectedIds, selectMode, toggleItem, navigation, c, usage, labels, fs]);

  const renderEmpty = () => (
    <EmptyState {...emptyStateProps(searchActive, 'pricetag-outline', labels.tags_empty)} />
  );

  return (
    <ScreenShell>
      <ScreenSearchBar
        visible={searchActive}
        placeholder={labels.tags_search}
        value={searchText}
        onChangeText={setSearchText}
        onClose={closeSearch}
      />

      {!selectMode && (
        <CharCounter value={tags.length} maxLength={MAX_TAGS} style={COUNTER_STYLE}>
          {labels.tags_counter(tags.length, MAX_TAGS)}
        </CharCounter>
      )}

      <SortRow bordered>
        <SortToggle
          fields={tagSortFields(labels)}
          sortBy={sortBy}
          direction={sortDirection}
          onToggleSort={handleToggleSort}
          onToggleDirection={handleToggleDirection}
        />
      </SortRow>

      {selectMode && visibleIds.length > 0 && (
        <SelectAllRow
          allSelected={select.allSelected(visibleIds)}
          countLabel={labels.items_count(visibleIds.length)}
          selectAllLabel={labels.select_all}
          deselectAllLabel={labels.deselect_all}
          onToggle={() => select.toggleSelectAll(visibleIds)}
        />
      )}

      <ListOrEmpty empty={sortedTags.length === 0} emptyState={renderEmpty()}>
        <FlatList
          testID={TEST_IDS.tagsList}
          data={sortedTags}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      </ListOrEmpty>

      {selectMode ? (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          deleteLabel={labels.tags_bulk_delete(selectedIds.size)}
          cancelLabel={labels.cancel}
          onDelete={openDeleteModal}
          onCancel={exitSelectMode}
        />
      ) : atTagLimit ? (
        <View style={styles.limitWrap}>
          <Text style={[styles.limitText, { color: c.textSecondary, fontSize: fs(13) }]}>
            {labels.create_tag_error_limit(MAX_TAGS)}
          </Text>
        </View>
      ) : (
        <Fab
          onPress={() => navigation.navigate('CreateTag')}
          accessibilityLabel={labels.a11y_add}
        />
      )}

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.tags_bulk_delete_confirm_title(selectedIds.size)}
        icon="trash-outline"
        message={labels.tags_bulk_delete_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={confirmBulkDelete}
        onCancel={closeDeleteModal}
        busy={busy}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    ...LIST_BOTTOM_FAB_PADDING,
  },
  row: {
    padding: 14,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dateText: { flexShrink: 1 },
  limitWrap: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  limitText: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
