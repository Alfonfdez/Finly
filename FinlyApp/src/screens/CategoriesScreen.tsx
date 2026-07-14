import { useState, useMemo, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getCategoryName } from '../i18n';
import TypeTabs from '../components/TypeTabs';
import { TransactionType, RootStackParamList } from '../constants/types';

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
    return categories.filter((cat) => cat.type === activeType);
  }, [categories, activeType]);

  const renderCategory = (cat: typeof categories[0]) => {
    const name = getCategoryName(cat.id) || cat.name;

    return (
      <TouchableOpacity
        key={cat.id}
        style={[styles.item, { backgroundColor: c.surface }]}
        onPress={() => navigation.navigate('ModifyCategory', { categoryId: cat.id })}
        accessibilityLabel={`${labels.a11y_category} ${name}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: cat.color + '22' }]}>
          <Ionicons name={cat.icon as any} size={24} color={cat.color} />
        </View>
        <Text
          style={[styles.name, { color: c.text, fontSize: fs(11) }]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCreateButton = () => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: c.surface }]}
      onPress={() => navigation.navigate('CreateCategory', { type: activeType })}
      accessibilityLabel={labels.add_cat_create}
    >
      <View style={[styles.iconContainer, { backgroundColor: c.textSecondary + '22' }]}>
        <Ionicons name="add" size={24} color={c.textSecondary} />
      </View>
      <Text
        style={[styles.name, { color: c.textSecondary, fontSize: fs(11) }]}
        numberOfLines={1}
      >
        {labels.add_cat_create}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <TypeTabs active={activeType} onChange={setActiveType} />

        {categoriesByType.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color={c.textSecondary} />
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(16) }]}>
              {labels.add_cat_no_results}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.grid}>
              {categoriesByType.map(renderCategory)}
              {renderCreateButton()}
            </View>
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
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontWeight: '500',
    textAlign: 'center',
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
