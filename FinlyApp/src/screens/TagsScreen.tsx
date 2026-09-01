import { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository } from '../database';
import { type Tag } from '../database/types';
import { type NavigationProp, MAX_TAGS } from '../constants/types';
import { countAtLimit } from '../utils/limits';
import { useBulkDelete } from '../hooks/useBulkDelete';
import Fab from '../components/Fab';
import ListItemRow from '../components/ListItemRow';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import SelectionActionBar from '../components/SelectionActionBar';
import ConfirmationModal from '../components/ConfirmationModal';
import SelectSearchHeader from '../components/SelectSearchHeader';
import ScreenSearchBar from '../components/ScreenSearchBar';

export default function TagsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Tags'>>();
  const { tags, refreshTags } = useApp();

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = useSelectableScreen({ navigation, hasItems: tags.length > 0, showHeader: tags.length > 0, headerRight: () => (
    <SelectSearchHeader
      selectMode={selectMode}
      onToggleSelect={toggleSelectMode}
      onToggleSearch={toggleSearch}
    />
  )});

  const filteredTags = useSearchFilter(tags, searchText, (tag) => [tag.name]);

  const atTagLimit = countAtLimit(tags.length, MAX_TAGS);

  const {
    deleteModalVisible, openDeleteModal, closeDeleteModal, confirmBulkDelete,
  } = useBulkDelete({
    selectedIds,
    exitSelectMode,
    deleteFn: (ids) => tagRepository.deleteMany(ids),
    afterDelete: refreshTags,
    errorPrefix: 'Failed to delete tags',
  });

  const renderItem = useCallback(({ item }: { item: Tag }) => {
    const selected = selectedIds.has(item.id);
    return (
      <ListItemRow
        title={item.name}
        titleSize={15}
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
        onPress={() => (selectMode ? toggleItem(item.id) : navigation.navigate('ModifyTag', { tagId: item.id }))}
      />
    );
  }, [selectedIds, selectMode, toggleItem, navigation, c]);

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
        <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(13) }]}>
          {labels.tags_counter(tags.length, MAX_TAGS)}
        </Text>
      )}

      <FlatList
        data={filteredTags}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filteredTags.length === 0 ? styles.emptyList : styles.list}
      />

      {selectMode ? (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          deleteLabel={labels.tags_bulk_delete(selectedIds.size)}
          cancelLabel={labels.modify_tag_delete_confirm_cancel}
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
        message={labels.tags_bulk_delete_confirm_message}
        confirmLabel={labels.modify_tag_delete_confirm_delete}
        cancelLabel={labels.modify_tag_delete_confirm_cancel}
        onConfirm={confirmBulkDelete}
        onCancel={closeDeleteModal}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
  },
  counter: {
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 12,
  },
  row: {
    padding: 14,
  },
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
