import { useState, useMemo, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import type { Tag } from '../database/types';
import type { NavigationProp } from '../constants/types';
import Fab from '../components/Fab';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';

export default function TagsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'Tags'>>();
  const { tags } = useApp();

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

  const filteredTags = useMemo(() => {
    if (!searchText.trim()) return tags;
    const term = searchText.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(term));
  }, [tags, searchText]);

  const renderItem = ({ item }: { item: Tag }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: c.surface, borderBottomColor: c.border }]}
      onPress={() => navigation.navigate('ModifyTag', { tagId: item.id })}
    >
      <Text style={[styles.tagName, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
    </TouchableOpacity>
  );

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

      <FlatList
        data={filteredTags}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filteredTags.length === 0 ? styles.emptyList : styles.list}
      />

      <Fab
        onPress={() => navigation.navigate('CreateTag')}
        accessibilityLabel="+"
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
  searchButton: {
    marginRight: 8,
    padding: 4,
  },
});
