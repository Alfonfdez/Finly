import { useState, useMemo, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useApp } from '../context/AppContext';
import { t, getDisplayCategoryName } from '../i18n';
import TabBar from '../components/TabBar';
import CategoryGrid from '../components/CategoryGrid';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { TRANSACTION_TYPES, MAX_CATEGORIES_PER_TYPE, type TransactionType, type NavigationProp } from '../constants/types';
import { sortCategoriesWithOthersLast } from '../utils/categoryUtils';
import { countAtLimit } from '../utils/limits';

export default function CategoriesScreen() {
  const { activeColors: c } = useConfig();
  const { categories } = useApp();
  const labels = t();
  const fs = useFontSize();
  const navigation = useNavigation<NavigationProp<'Categories'>>();

  const [activeType, setActiveType] = useState<TransactionType>(TRANSACTION_TYPES.expense);
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

  const categoriesByType = useMemo(() => {
    const filtered = categories.filter((cat) => cat.type === activeType);
    return sortCategoriesWithOthersLast(filtered);
  }, [categories, activeType]);

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categoriesByType;

    const searchTerms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
    return categoriesByType.filter((cat) => {
      const name = getDisplayCategoryName(cat).toLowerCase();
      return searchTerms.every((term) => name.includes(term));
    });
  }, [categoriesByType, searchText]);

  const typeCount = categories.filter((cat) => cat.type === activeType).length;
  const atCategoryLimit = countAtLimit(typeCount, MAX_CATEGORIES_PER_TYPE);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <TabBar
          tabs={[
            { key: TRANSACTION_TYPES.expense, label: labels.tab_expenses },
            { key: TRANSACTION_TYPES.income, label: labels.tab_income },
          ]}
          active={activeType}
          onChange={setActiveType}
        />

        {searchActive && (
          <SearchBar
            placeholder={labels.add_cat_search}
            value={searchText}
            onChangeText={setSearchText}
            onClose={() => {
              setSearchActive(false);
              setSearchText('');
            }}
            autoFocus
          />
        )}

        {filteredCategories.length === 0 ? (
          <EmptyState
            icon={searchActive ? 'search-outline' : 'grid-outline'}
            message={labels.add_cat_no_results}
          />
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <CategoryGrid
              categories={filteredCategories}
              selectedCategory={null}
              onSelect={(id) => navigation.navigate('ModifyCategory', { categoryId: id })}
              onAddMore={() => navigation.navigate('CreateCategory', { type: activeType })}
              showAddMore={!atCategoryLimit}
              addMoreLabel={labels.add_cat_create}
              hideTitle
            />
            {atCategoryLimit && (
              <Text style={[styles.limitText, { color: c.textSecondary, fontSize: fs(13) }]}>
                {labels.create_cat_error_limit(MAX_CATEGORIES_PER_TYPE)}
              </Text>
            )}
          </ScrollView>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  limitText: {
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  searchButton: {
    marginRight: 8,
    padding: 4,
  },
});
