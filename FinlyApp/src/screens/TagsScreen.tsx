import { useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { Tag } from '../database/types';
import { RootStackParamList } from '../constants/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tags'>;

export default function TagsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const { tags } = useApp();

  useFocusEffect(
    useCallback(() => {
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
    }, [navigation, c.text, labels.home_open_menu])
  );

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
    <View style={styles.emptyContainer}>
      <Ionicons name="pricetag-outline" size={64} color={c.textSecondary} />
      <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(16) }]}>
        {labels.tags_empty}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <FlatList
        data={tags}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={tags.length === 0 ? styles.emptyList : styles.list}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('CreateTag')}
        accessibilityLabel="+"
      >
        <Ionicons name="add" size={28} color={c.background} />
      </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
