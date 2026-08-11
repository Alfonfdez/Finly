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

export default function CommentsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Comments'>>();

  const [comments, setComments] = useState<CommentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setSearchActive(!searchActive);
            setSearchText('');
          }}
          style={styles.searchButton}
        >
          <Ionicons name="search-outline" size={22} color={c.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, searchActive, c.text]);

  useFocusEffect(useCallback(() => {
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
  }, []));

  const filteredComments = useMemo(() => {
    if (!searchText.trim()) return comments;
    const term = searchText.toLowerCase();
    return comments.filter(c => c.description.toLowerCase().includes(term));
  }, [comments, searchText]);

  const renderItem = ({ item }: { item: CommentUsage }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: c.surface, borderBottomColor: c.border }]}
      onPress={() => navigation.navigate('ModifyComment', { comment: item.description })}
    >
      <View style={styles.rowText}>
        <Text style={[styles.commentText, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={[styles.commentCount, { color: c.textSecondary, fontSize: fs(12) }]}>
          {labels.comments_used_in(item.count)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
    </TouchableOpacity>
  );

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

        <FlatList
          data={filteredComments}
          keyExtractor={(item) => item.description}
          renderItem={renderItem}
          ListEmptyComponent={loading ? null : renderEmpty}
          contentContainerStyle={filteredComments.length === 0 ? styles.emptyList : styles.list}
        />
      </View>
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
  searchButton: {
    marginRight: 8,
    padding: 4,
  },
});
