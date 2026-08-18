import { useMemo, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HEADER_BUTTONS } from '../components/componentStyles';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository } from '../database';
import { type Tag } from '../database/types';
import { type NavigationProp, MAX_TAGS } from '../constants/types';
import { countAtLimit } from '../utils/limits';
import Fab from '../components/Fab';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import SelectionActionBar from '../components/SelectionActionBar';
import ConfirmationModal from '../components/ConfirmationModal';
import SelectToggleButton from '../components/SelectToggleButton';

export default function TagsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Tags'>>();
  const { tags, refreshTags } = useApp();

  const {
    searchActive, setSearchActive, searchText, setSearchText,
    selectMode, selectedIds,
    deleteModalVisible, setDeleteModalVisible, toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch,
  } = useSelectAndSearch({ hasItems: tags.length > 0 });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        tags.length > 0 ? (
          <View style={HEADER_BUTTONS}>
            <SelectToggleButton
              active={selectMode}
              onToggle={toggleSelectMode}
              color={c.primary}
            />
            <TouchableOpacity
              onPress={toggleSearch}
              style={HEADER_BUTTONS}
            >
              <Ionicons name="search-outline" size={22} color={c.text} />
            </TouchableOpacity>
          </View>
        ) : null,
    });
  }, [navigation, selectMode, tags.length, c.text, c.primary, toggleSelectMode, toggleSearch]);

  const filteredTags = useMemo(() => {
    if (!searchText.trim()) return tags;
    const term = searchText.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(term));
  }, [tags, searchText]);

  const atTagLimit = countAtLimit(tags.length, MAX_TAGS);

  const handleBulkDelete = async () => {
    setDeleteModalVisible(false);
    await tagRepository.deleteMany([...selectedIds]);
    exitSelectMode();
    await refreshTags();
  };

  const renderItem = ({ item }: { item: Tag }) => {
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
  };

  const renderEmpty = () => (
    <EmptyState
      icon={searchActive ? 'search-outline' : 'pricetag-outline'}
      message={searchActive ? labels.filter_no_results : labels.tags_empty}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      {searchActive && (
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={labels.tags_search}
            value={searchText}
            onChangeText={setSearchText}
            onClose={() => {
              setSearchActive(false);
              setSearchText('');
            }}
            autoFocus
          />
        </View>
      )}

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
          accessibilityLabel="+"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
