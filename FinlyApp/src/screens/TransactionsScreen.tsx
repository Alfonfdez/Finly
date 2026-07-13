import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { scrollbarFlatList } from '../constants/platformStyles';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useMemo } from 'react';
import { RootStackParamList } from '../constants/types';
import { t } from '../i18n';

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const { transactions, categories } = useApp();
  const { config, activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const categoryId = route.params?.categoryId;

  const filtered = useMemo(() => {
    let list = transactions;
    if (categoryId) {
      list = list.filter(t => t.category_id === categoryId);
    }
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, categoryId]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.title, { color: c.text, fontSize: fs(20) }]}>{labels.transactions_title}</Text>
        <FlatList
          style={scrollbarFlatList}
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const cat = categories.find(ct => ct.id === item.category_id);
            return (
              <View style={[styles.item, { borderBottomColor: c.border }]}>
                <View style={styles.info}>
                  <Text style={[styles.description, { color: c.text, fontSize: fs(15) }]}>{item.description}</Text>
                  <Text style={[styles.category, { color: c.textSecondary, fontSize: fs(12) }]}>{cat?.name ?? ''}</Text>
                  <Text style={[styles.date, { color: c.textSecondary, fontSize: fs(11) }]}>{formatDate(new Date(item.date))}</Text>
                </View>
                <Text style={[styles.amount, { color: item.type === 'income' ? c.green : c.red, fontSize: fs(16) }]}>
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, config.currency, config.decimalSeparator)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: c.textSecondary, fontSize: fs(14) }]}>{labels.transactions_empty}</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  title: { fontWeight: '700', marginBottom: 16 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  info: { flex: 1 },
  description: { fontWeight: '500' },
  category: { marginTop: 2 },
  date: { marginTop: 1 },
  amount: { fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 40 },
});
