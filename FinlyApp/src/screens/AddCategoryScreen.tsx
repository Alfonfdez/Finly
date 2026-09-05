import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { LIMIT_TEXT_STYLE } from '../components/componentStyles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useApp } from '../context/AppContext';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { t, getDisplayCategoryName } from '../i18n';
import ScreenSearchBar from '../components/ScreenSearchBar';
import CategoryGrid from '../components/CategoryGrid';
import EmptyState from '../components/EmptyState';
import type { RootStackParamList, NavigationProp } from '../constants/types';
import { MAX_CATEGORIES_PER_TYPE } from '../constants/types';
import { sortCategoriesWithOthersLast, categoriesOfType, countCategoriesOfType } from '../utils/categoryUtils';
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

  const categoriesByType = useMemo(() => {
    return sortCategoriesWithOthersLast(categoriesOfType(categories, type));
  }, [categories, type]);

  const {
    searchActive, searchText, setSearchText,
    toggleSearch, closeSearch,
  } = useSelectableScreen({
    navigation,
    hasItems: categoriesByType.length > 0,
    showHeader: true,
    headerRight: () => (
      <TouchableOpacity
        onPress={toggleSearch}
        style={styles.searchButton}
      >
        <Ionicons name="search-outline" size={22} color={c.text} />
      </TouchableOpacity>
    ),
  });

  const filteredCategories = useSearchFilter(categoriesByType, searchText, (cat) => [getDisplayCategoryName(cat)]);

  const typeCount = countCategoriesOfType(categories, type);
  const atCategoryLimit = countAtLimit(typeCount, MAX_CATEGORIES_PER_TYPE);

  const handleSelectCategory = (categoryId: number) => {
    setPendingCategory(categoryId, type);
    navigation.goBack();
  };

  return (
    <ScreenShell>
      <View style={styles.content}>
        <ScreenSearchBar
          visible={searchActive}
          placeholder={labels.add_cat_search}
          value={searchText}
          onChangeText={setSearchText}
          onClose={closeSearch}
          style={styles.searchBarWrap}
        />

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
              <Text style={[LIMIT_TEXT_STYLE, { color: c.textSecondary, fontSize: fs(13) }]}>
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
  searchBarWrap: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  searchButton: {
    marginRight: 8,
    padding: 4,
  },
});
