import { useState, useMemo, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useApp } from '../context/AppContext';
import { t, getDisplayCategoryName } from '../i18n';
import SearchBar from '../components/SearchBar';
import CategoryGrid from '../components/CategoryGrid';
import EmptyState from '../components/EmptyState';
import type { RootStackParamList, NavigationProp } from '../constants/types';
import { MAX_CATEGORIES_PER_TYPE } from '../constants/types';
import { sortCategoriesWithOthersLast } from '../utils/categoryUtils';
import { countAtLimit } from '../utils/limits';
import { setPendingCategory } from '../utils/pendingCategory';

type AddCategoryRouteProp = RouteProp<RootStackParamList, 'AddCategory'>;

export default function AddCategoryScreen() {
  const { activeColors: c } = useConfig();
  const { categories } = useApp();
  const labels = t();
  const fs = useFontSize();
  const navigation = useNavigation<NavigationProp<'AddCategory'>>();
  const route = useRoute<AddCategoryRouteProp>();

  const type = route.params.type;

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
    const filtered = categories.filter((cat) => cat.type === type);
    return sortCategoriesWithOthersLast(filtered);
  }, [categories, type]);

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categoriesByType;

    const searchTerms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
    return categoriesByType.filter((cat) => {
      const name = getDisplayCategoryName(cat).toLowerCase();
      return searchTerms.every((term) => name.includes(term));
    });
  }, [categoriesByType, searchText]);

  const typeCount = categories.filter((cat) => cat.type === type).length;
  const atCategoryLimit = countAtLimit(typeCount, MAX_CATEGORIES_PER_TYPE);

  const handleSelectCategory = (categoryId: number) => {
    setPendingCategory(categoryId, type);
    navigation.goBack();
  };

  return (
    <ScreenShell>
      <View style={styles.content}>
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
          <EmptyState icon="search-outline" message={labels.add_cat_no_results} />
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <CategoryGrid
              categories={filteredCategories}
              selectedCategory={null}
              onSelect={handleSelectCategory}
              onAddMore={() => navigation.navigate('CreateCategory', { type })}
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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
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
