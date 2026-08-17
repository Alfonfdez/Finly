import { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { transactionRepository } from '../database';
import type { CommentUsage } from '../database/repositories/transactionRepo';
import type { NavigationProp } from '../constants/types';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import SelectionActionBar from '../components/SelectionActionBar';
import ConfirmationModal from '../components/ConfirmationModal';

export default function CommentsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Comments'>>();

  const [comments, setComments] = useState<CommentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        comments.length > 0 ? (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => {
                if (selectMode) setSelectedComments(new Set());
                setSelectMode(!selectMode);
              }}
              style={styles.headerButton}
            >
              <Text style={[styles.selectText, { color: c.primary, fontSize: fs(15) }]}>
                {selectMode ? labels.comments_select_done : labels.comments_select}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSearchActive(!searchActive);
                setSearchText('');
              }}
              style={styles.headerButton}
            >
              <Ionicons name="search-outline" size={22} color={c.text} />
            </TouchableOpacity>
          </View>
        ) : null,
    });
  }, [navigation, selectMode, searchActive, comments.length, c.text, c.primary, fs, labels]);

  const filteredComments = useMemo(() => {
    if (!searchText.trim()) return comments;
    const term = searchText.toLowerCase();
    return comments.filter(c => c.description.toLowerCase().includes(term));
  }, [comments, searchText]);

  const toggleItem = (description: string) => {
    setSelectedComments((prev) => {
      const next = new Set(prev);
      if (next.has(description)) next.delete(description);
      else next.add(description);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setDeleteModalVisible(false);
    await transactionRepository.deleteComments([...selectedComments]);
    setSelectedComments(new Set());
    setSelectMode(false);
    loadComments();
  };

  const renderItem = ({ item }: { item: CommentUsage }) => {
    const selected = selectedComments.has(item.description);
    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: c.surface, borderBottomColor: c.border }]}
        onPress={() => (selectMode ? toggleItem(item.description) : navigation.navigate('ModifyComment', { comment: item.description }))}
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
        <View style={styles.rowText}>
          <Text style={[styles.commentText, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={[styles.commentCount, { color: c.textSecondary, fontSize: fs(12) }]}>
            {labels.comments_used_in(item.count)}
          </Text>
        </View>
        {!selectMode && <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <EmptyState
      icon={searchActive ? 'search-outline' : 'chatbubble-outline'}
      message={labels.comments_empty}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        {searchActive && (
          <View style={styles.searchWrap}>
            <SearchBar
              placeholder={labels.comments_search_placeholder}
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
          onDelete={() => setDeleteModalVisible(true)}
          onCancel={() => {
            setSelectedComments(new Set());
            setSelectMode(false);
          }}
        />
      )}

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.comments_bulk_delete_confirm_title(selectedComments.size)}
        message={labels.comments_bulk_delete_confirm_message}
        confirmLabel={labels.comments_delete_confirm_delete}
        cancelLabel={labels.comments_delete_confirm_cancel}
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
  content: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyList: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  commentText: {
    fontWeight: '500',
  },
  commentCount: {
    marginTop: 2,
  },
  checkbox: {
    marginRight: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 8,
    padding: 4,
  },
  selectText: {
    fontWeight: '600',
  },
  counter: {
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 12,
  },
});
