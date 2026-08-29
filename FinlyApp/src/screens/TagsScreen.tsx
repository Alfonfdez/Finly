import { useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
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
import { showErrorAlert } from '../utils/errors';
import Fab from '../components/Fab';
import EmptyState from '../components/EmptyState';
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
    deleteModalVisible, setDeleteModalVisible, toggleItem, exitSelectMode,
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

  const handleBulkDelete = async () => {
    setDeleteModalVisible(false);
    try {
      await tagRepository.deleteMany([...selectedIds]);
      exitSelectMode();
      await refreshTags();
    } catch (err) {
      console.error('Failed to delete tags:', err);
      showErrorAlert(labels);
    }
  };

  const renderItem = useCallback(({ item }: { item: Tag }) => {
    const selected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: c.surface, borderBottomColor: c.border }]}
        onPress={() => (selectMode ? toggleItem(item.id) : navigation.navigate('ModifyTag', { tagId: item.id }))}
        accessibilityRole="button"
      >
        {selectMode && (
          <Ionicons
            name={selected ? 'checkbox' : 'checkbox-outline'}
            size={22}
            color={selected ? c.primary : c.textSecondary}
            style={styles.checkbox}
          />
        )}
        <Text style={[styles.tagName, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
          {item.name}
        </Text>
        {!selectMode && <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />}
      </TouchableOpacity>
    );
  }, [selectedIds, selectMode, toggleItem, navigation, c, fs]);

  const renderEmpty = () => (
    <EmptyState
      icon={searchActive ? 'search-outline' : 'pricetag-outline'}
      message={searchActive ? labels.filter_no_results : labels.tags_empty}
    />
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
          onDelete={() => setDeleteModalVisible(true)}
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
        onConfirm={handleBulkDelete}
        onCancel={() => setDeleteModalVisible(false)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  tagName: {
    fontWeight: '500',
    flex: 1,
  },
  checkbox: {
    marginRight: 10,
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
