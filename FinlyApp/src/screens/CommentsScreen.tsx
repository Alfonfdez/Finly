import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { t } from '../i18n';
import { transactionRepository } from '../database';
import type { CommentUsage } from '../database/repositories/transactionRepo';
import type { NavigationProp } from '../constants/types';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import ListItemRow from '../components/ListItemRow';
import { useBulkDelete } from '../hooks/useBulkDelete';
import { ERROR_PREFIXES } from '../utils/errors';
import SelectionActionBar from '../components/SelectionActionBar';
import BulkDeleteConfirmationModal from '../components/BulkDeleteConfirmationModal';
import SelectSearchHeader from '../components/SelectSearchHeader';
import ScreenSearchBar from '../components/ScreenSearchBar';

export default function CommentsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Comments'>>();

  const [comments, setComments] = useState<CommentUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds: selectedComments,
    toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = useSelectableScreen<string>({ navigation, hasItems: comments.length > 0, showHeader: comments.length > 0, headerRight: () => (
    <SelectSearchHeader
      selectMode={selectMode}
      onToggleSelect={toggleSelectMode}
      onToggleSearch={toggleSearch}
    />
  )});

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
    return (
      <ListItemRow
        title={item.description}
        titleSize={15}
        subtitle={labels.comments_used_in(item.count)}
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
  }, [selectedComments, selectMode, toggleItem, navigation, c, labels]);

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

        {comments.length > 0 && !selectMode && (
          <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(13) }]}>
            {labels.comments_counter(filteredComments.length)}
          </Text>
        )}

        <FlatList
          data={filteredComments}
          keyExtractor={(item) => item.description}
          renderItem={renderItem}
          ListEmptyComponent={loading ? null : renderEmpty}
          contentContainerStyle={filteredComments.length === 0 ? styles.emptyList : styles.list}
        />
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

      <BulkDeleteConfirmationModal
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
  emptyList: {
    flex: 1,
  },
  row: {
    padding: 14,
  },
  counter: {
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 12,
  },
});
