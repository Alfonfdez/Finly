import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { COUNTER_STYLE } from '../components/componentStyles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { t } from '../i18n';
import { transactionRepository } from '../database';
import type { CommentUsage } from '../database/repositories/transactionRepo';
import { COMMENT_SORT_BY, SORT_DIRECTIONS, type NavigationProp, type CommentSortBy, type SortDirection } from '../constants/types';
import { TEST_IDS } from '../constants/testIds';
import { parseDbDate } from '../utils/formatters';
import { defaultCommentSortDirection, sortComments } from '../utils/commentSort';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import ListItemRow from '../components/ListItemRow';
import ListOrEmpty from '../components/ListOrEmpty';
import { useBulkDelete } from '../hooks/useBulkDelete';
import { ERROR_PREFIXES } from '../utils/errors';
import SelectionActionBar from '../components/SelectionActionBar';
import SelectAllRow from '../components/SelectAllRow';
import SortToggle, { commentSortFields } from '../components/SortToggle';
import SortRow from '../components/SortRow';
import ConfirmationModal from '../components/ConfirmationModal';
import SelectSearchHeader from '../components/SelectSearchHeader';
import ScreenSearchBar from '../components/ScreenSearchBar';

export default function CommentsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Comments'>>();

  const [comments, setComments] = useState<CommentUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const select = useSelectAndSearch<string>({ hasItems: comments.length > 0 });

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds: selectedComments,
    toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = select;

  useSelectableScreen({
    navigation,
    showHeader: comments.length > 0,
    selectMode,
    headerRight: () => (
      <SelectSearchHeader
        selectMode={selectMode}
        onToggleSelect={toggleSelectMode}
        onToggleSearch={toggleSearch}
      />
    ),
  });

  const loadComments = useCallback(() => {
    let active = true;
    setLoading(true);
    transactionRepository.getDistinctComments()
      .then(rows => {
        if (active) setComments(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(useCallback(() => {
    const cleanup = loadComments();
    return cleanup;
  }, [loadComments]));

  const filteredComments = useSearchFilter(comments, searchText, (c) => [c.description]);

  const [sortBy, setSortBy] = useState<CommentSortBy>(COMMENT_SORT_BY.name);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTIONS.asc);

  const handleToggleSort = useCallback((field: CommentSortBy) => {
    if (field === sortBy) {
      setSortDirection(d => (d === SORT_DIRECTIONS.desc ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc));
    } else {
      setSortBy(field);
      setSortDirection(defaultCommentSortDirection(field));
    }
  }, [sortBy]);

  const handleToggleDirection = useCallback(() => {
    setSortDirection(d => (d === SORT_DIRECTIONS.desc ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc));
  }, []);

  const sortedComments = useMemo(
    () => sortComments(filteredComments, sortBy, sortDirection),
    [filteredComments, sortBy, sortDirection],
  );

  const visibleIds = useMemo(() => sortedComments.map((c) => c.description), [sortedComments]);

  const {
    deleteModalVisible, openDeleteModal, closeDeleteModal, confirmBulkDelete,
  } = useBulkDelete({
    selectedIds: selectedComments,
    exitSelectMode,
    deleteFn: (ids) => transactionRepository.deleteComments(ids),
    afterDelete: () => { loadComments(); },
    errorPrefix: ERROR_PREFIXES.commentsDelete,
  });

  const renderItem = useCallback(({ item }: { item: CommentUsage }) => {
    const selected = selectedComments.has(item.description);
    const lastUsed = parseDbDate(item.lastUsed);
    const lastUsedText = `${lastUsed.getDate()} ${labels.months_short[lastUsed.getMonth()]} ${lastUsed.getFullYear()}`;
    return (
      <ListItemRow
        title={item.description}
        titleSize={15}
        subtitle={labels.comments_used_in(item.count)}
        middle={
          <Text style={[styles.lastUsed, { color: c.textSecondary, fontSize: fs(12) }]}>
            {labels.comments_last_used(lastUsedText)}
          </Text>
        }
        leading={selectMode ? (
          <Ionicons
            name={selected ? 'checkbox' : 'checkbox-outline'}
            size={22}
            color={selected ? c.primary : c.textSecondary}
          />
        ) : undefined}
        right={!selectMode ? <Ionicons name="chevron-forward" size={18} color={c.textSecondary} /> : undefined}
        divider
        style={[styles.row, { backgroundColor: c.surface }]}
        onPress={() => (selectMode ? toggleItem(item.description) : navigation.navigate('ModifyComment', { comment: item.description }))}
      />
    );
  }, [selectedComments, selectMode, toggleItem, navigation, c, labels, fs]);

  const renderEmpty = () => (
    <EmptyState {...emptyStateProps(searchActive, 'chatbubble-outline', labels.comments_empty)} />
  );

  return (
    <ScreenShell>
      <View style={styles.content}>
        <ScreenSearchBar
          visible={searchActive}
          placeholder={labels.comments_search_placeholder}
          value={searchText}
          onChangeText={setSearchText}
          onClose={closeSearch}
        />

        {!selectMode && (
          <Text style={[COUNTER_STYLE, { color: c.textSecondary, fontSize: fs(13) }]}>
            {labels.comments_counter(filteredComments.length)}
          </Text>
        )}

        <SortRow bordered>
          <SortToggle
            fields={commentSortFields(labels)}
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

        <ListOrEmpty
          empty={sortedComments.length === 0}
          emptyState={loading ? null : renderEmpty()}
        >
          <FlatList
            testID={TEST_IDS.commentsList}
            data={sortedComments}
            keyExtractor={(item) => item.description}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        </ListOrEmpty>
      </View>

      {selectMode && (
        <SelectionActionBar
          selectedCount={selectedComments.size}
          deleteLabel={labels.comments_bulk_delete(selectedComments.size)}
          cancelLabel={labels.comments_delete_confirm_cancel}
          onDelete={openDeleteModal}
          onCancel={exitSelectMode}
        />
      )}

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.comments_bulk_delete_confirm_title(selectedComments.size)}
        message={labels.comments_bulk_delete_confirm_message}
        confirmLabel={labels.comments_delete_confirm_delete}
        cancelLabel={labels.comments_delete_confirm_cancel}
        onConfirm={confirmBulkDelete}
        onCancel={closeDeleteModal}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  row: {
    padding: 14,
  },
  lastUsed: {
    marginTop: 2,
  },
});
