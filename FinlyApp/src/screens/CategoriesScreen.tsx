import { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import TabBar from '../components/TabBar';
import CategoryGrid from '../components/CategoryGrid';
import Fab from '../components/Fab';
import EmptyState from '../components/EmptyState';
import { TRANSACTION_TYPES, type TransactionType, type RootStackParamList } from '../constants/types';
import { sortCategoriesWithOthersLast } from '../utils/categoryUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Categories'>;

export default function CategoriesScreen() {
  const { activeColors: c } = useConfig();
  const { categories } = useApp();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();

  const [activeType, setActiveType] = useState<TransactionType>(TRANSACTION_TYPES.expense);
  const categoriesByType = useMemo(() => {
    const filtered = categories.filter((cat) => cat.type === activeType);
    return sortCategoriesWithOthersLast(filtered);
  }, [categories, activeType]);

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

        {categoriesByType.length === 0 ? (
          <EmptyState icon="grid-outline" message={labels.add_cat_no_results} />
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <CategoryGrid
              categories={categoriesByType}
              selectedCategory={null}
              onSelect={(id) => navigation.navigate('ModifyCategory', { categoryId: id })}
              onAddMore={() => navigation.navigate('CreateCategory', { type: activeType })}
              showAddMore={false}
              hideTitle
            />
          </ScrollView>
        )}
      </View>

      <Fab
        onPress={() => navigation.navigate('CreateCategory', { type: activeType })}
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
});
