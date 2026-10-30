import { useCallback, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { COUNTER_STYLE, LIMIT_TEXT_STYLE } from '../components/componentStyles';
import CharCounter from '../components/form/CharCounter';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useApp } from '../context/AppContext';
import { useCategoryUsage } from '../hooks/useCategoryUsage';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { useSortPreference } from '../hooks/useSortPreference';
import { t, getDisplayCategoryName } from '../i18n';
import HeaderSearchButton from '../components/HeaderSearchButton';
import HeaderSpacer from '../components/HeaderSpacer';
import ScreenSearchBar from '../components/ScreenSearchBar';
import CategoryGrid from '../components/CategoryGrid';
import EmptyState from '../components/EmptyState';
import SortRow from '../components/SortRow';
import SortToggle, { categorySortFields } from '../components/SortToggle';
import type { RootStackParamList, NavigationProp } from '../constants/types';
import { MAX_CATEGORIES_PER_TYPE } from '../constants/types';
import { categoriesOfType, countCategoriesOfType } from '../utils/categoryUtils';
import { defaultCategorySortDirection, sortCategories } from '../utils/categorySort';
import { countAtLimit } from '../utils/limits';
import { isAndroid } from '../utils/platform';
import { setPendingCategory } from '../utils/pendingCategory';

type AddCategoryRouteProp = RouteProp<RootStackParamList, 'AddCategory'>;

export default function AddCategoryScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const { categories } = useApp();
  const labels = t();
  const fs = useFontSize();
  const navigation = useNavigation<NavigationProp<'AddCategory'>>();
  const route = useRoute<AddCategoryRouteProp>();

  const type = route.params.type;

  const sortBy = config.addCategorySortBy;
  const sortDirection = config.addCategorySortDirection;
  const usage = useCategoryUsage(categories);
  // No memo: display names are localized, so the order must refresh with the language.
  const categoriesByType = sortCategories(categoriesOfType(categories, type), sortBy, sortDirection, usage);

  const { handleToggleSort, handleToggleDirection } = useSortPreference({
    sortBy,
    sortDirection,
    defaultDirection: defaultCategorySortDirection,
    onChange: next => updateConfig({ addCategorySortBy: next.by, addCategorySortDirection: next.direction }),
  });

  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const canSearch = categoriesByType.length > 1;

  const closeSearch = useCallback(() => {
    setSearchActive(false);
    setSearchText('');
  }, []);

  const toggleSearch = useCallback(() => {
    if (searchActive) closeSearch();
    else setSearchActive(true);
  }, [closeSearch, searchActive]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: canSearch
        ? () => <HeaderSearchButton active={searchActive} onPress={toggleSearch} />
        : isAndroid ? () => <HeaderSpacer /> : undefined,
    });
  }, [canSearch, navigation, searchActive, toggleSearch]);

  const filteredCategories = useSearchFilter(categoriesByType, searchText, (cat) => [getDisplayCategoryName(cat)]);

  const typeCount = countCategoriesOfType(categories, type);
  const atCategoryLimit = countAtLimit(typeCount, MAX_CATEGORIES_PER_TYPE);

  const handleSelectCategory = (categoryId: number) => {
    setPendingCategory(categoryId, type);
    navigation.goBack();
  };

  return (
    <ScreenShell>
      <View style={styles.header}>
        <ScreenSearchBar
          visible={canSearch && searchActive}
          placeholder={labels.add_cat_search}
          value={searchText}
          onChangeText={setSearchText}
          onClose={closeSearch}
          style={styles.searchBarWrap}
        />

        <CharCounter value={typeCount} maxLength={MAX_CATEGORIES_PER_TYPE} style={COUNTER_STYLE}>
          {labels.categories_counter(typeCount, MAX_CATEGORIES_PER_TYPE)}
        </CharCounter>
      </View>

      <SortRow bordered>
        <SortToggle
          fields={categorySortFields(labels)}
          sortBy={sortBy}
          direction={sortDirection}
          onToggleSort={handleToggleSort}
          onToggleDirection={handleToggleDirection}
        />
      </SortRow>

      <View style={styles.content}>
        {filteredCategories.length === 0 ? (
          <EmptyState icon="search-outline" message={labels.add_cat_no_results} />
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <CategoryGrid
              categories={filteredCategories}
              counts={usage}
              selectedCategory={null}
              onSelect={handleSelectCategory}
              onAddMore={() => navigation.navigate('CreateCategory', { type, fromTransaction: true })}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
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
});
