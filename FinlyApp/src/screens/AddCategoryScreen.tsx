import { useState, useMemo, useLayoutEffect } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t, getDisplayCategoryName } from '../i18n';
import SearchBar from '../components/SearchBar';
import CategoryGrid from '../components/CategoryGrid';
import Fab from '../components/Fab';
import EmptyState from '../components/EmptyState';
import type { RootStackParamList } from '../constants/types';
import { sortCategoriesWithOthersLast } from '../utils/categoryUtils';
import { setPendingCategory } from './AddTransactionScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddCategory'>;
type AddCategoryRouteProp = RouteProp<RootStackParamList, 'AddCategory'>;

export default function AddCategoryScreen() {
  const { activeColors: c } = useConfig();
  const { categories } = useApp();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
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

  const handleSelectCategory = (categoryId: number) => {
    setPendingCategory(categoryId, type);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
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
              showAddMore={false}
              hideTitle
            />
          </ScrollView>
        )}
      </View>

      <Fab
        onPress={() => navigation.navigate('CreateCategory', { type })}
        accessibilityLabel="+"
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  searchButton: {
    marginRight: 8,
    padding: 4,
  },
});
