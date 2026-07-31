import { useState, useMemo, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import TabBar from '../components/TabBar';
import CategoryGrid from '../components/CategoryGrid';
import Fab from '../components/Fab';
import { TransactionType, RootStackParamList } from '../constants/types';
import { sortCategoriesWithOthersLast } from '../utils/categoryUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Categories'>;

export default function CategoriesScreen() {
  const { activeColors: c } = useConfig();
  const { categories } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();

  const [activeType, setActiveType] = useState<TransactionType>('expense');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={{ marginLeft: 8, padding: 4 }}
          accessibilityLabel={labels.home_open_menu}
        >
          <Ionicons name="menu-outline" size={24} color={c.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, c.text, labels.home_open_menu]);

  const categoriesByType = useMemo(() => {
    const filtered = categories.filter((cat) => cat.type === activeType);
    return sortCategoriesWithOthersLast(filtered);
  }, [categories, activeType]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <TabBar
          tabs={[
            { key: 'expense', label: labels.tab_expenses },
            { key: 'income', label: labels.tab_income },
          ]}
          active={activeType}
          onChange={setActiveType}
        />

        {categoriesByType.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="grid-outline" size={64} color={c.textSecondary} />
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(16) }]}>
              {labels.add_cat_no_results}
            </Text>
          </View>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontWeight: '500',
  },
});
