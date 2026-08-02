import { Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import type { Tag } from '../database/types';
import type { RootStackParamList } from '../constants/types';
import Fab from '../components/Fab';
import EmptyState from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tags'>;

export default function TagsScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const { tags } = useApp();
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
    <EmptyState icon="pricetag-outline" message={labels.tags_empty} />
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
});
