import { useState, useMemo, useCallback, ComponentProps } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { formatCurrency, formatDateLong } from '../utils/formatters';
import { t, getDisplayCategoryName } from '../i18n';
import { transactionRepository } from '../database';
import { RootStackParamList } from '../constants/types';

type DetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;
type DetailsNavProp = NativeStackNavigationProp<RootStackParamList, 'TransactionDetails'>;

export default function TransactionDetailsScreen() {
  const navigation = useNavigation<DetailsNavProp>();
  const route = useRoute<DetailsRouteProp>();
  const { transactionId } = route.params;
  const { transactions, categories, accounts, refresh } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tagNames, setTagNames] = useState<{ tag_id: number; name: string }[]>([]);

  const transaction = useMemo(
    () => transactions.find(tx => tx.id === transactionId),
    [transactions, transactionId]
  );

  const category = useMemo(
    () => categories.find(cat => cat.id === transaction?.category_id),
    [categories, transaction]
  );

  const account = useMemo(
    () => accounts.find(acc => acc.id === transaction?.account_id),
    [accounts, transaction]
  );

  const transactionDate = useMemo(
    () => transaction ? new Date(transaction.date) : null,
    [transaction]
  );

  const createdDate = useMemo(() => {
    if (!transaction) return '';
    const d = new Date(transaction.date);
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const day = d.getDate();
    const month = labels.months_short[d.getMonth()];
    const year = d.getFullYear();
    return `${labels.details_created} ${h}:${min} ${day} ${month.toLowerCase()} ${year}`;
  }, [transaction, labels]);

  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => {
      const tagIds = await transactionRepository.getTagsByTransactionId(transactionId);
      if (!active) return;
      if (tagIds.length === 0) {
        setTagNames([]);
        return;
      }
      const tagLinks = await transactionRepository.getTagsByTransactionIds([transactionId]);
      if (active) setTagNames(tagLinks);
    })();
    return () => { active = false; };
  }, [transactionId]));

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await transactionRepository.delete(transactionId);
      await refresh();
      navigation.goBack();
    } catch {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: c.textSecondary, fontSize: fs(16) }}>
            {labels.transactions_empty}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isExpense = transaction.type === 'expense';
  const typeColor = isExpense ? c.red : c.green;
  const catName = category ? getDisplayCategoryName(category) : '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dataSection}>
          <DataRow label={labels.details_amount} c={c} fs={fs}>
            <Text style={[styles.dataValue, { color: typeColor, fontSize: fs(15) }]}>
              {isExpense ? '-' : '+'}{formatCurrency(transaction.amount, config.currency, config.decimalSeparator)}
            </Text>
          </DataRow>

          <DataRow label={labels.details_account} c={c} fs={fs}>
            <View style={styles.iconRow}>
              {account && (
                <View style={[styles.rowIcon, { backgroundColor: account.color + '30', borderRadius: config.accountIconShape === 'circle' ? 14 : 4 }]}>
                  <Ionicons name={account.icon as ComponentProps<typeof Ionicons>['name']} size={18} color={account.color} />
                </View>
              )}
              <Text style={[styles.nameValue, { color: c.text, fontSize: fs(15) }]}>{account?.name ?? ''}</Text>
            </View>
          </DataRow>

          <DataRow label={labels.details_category} c={c} fs={fs}>
            <View style={styles.iconRow}>
              {category && (
                <View style={[styles.rowIcon, { backgroundColor: category.color + '30', borderRadius: config.categoryIconShape === 'circle' ? 14 : 4 }]}>
                  <Ionicons name={category.icon as ComponentProps<typeof Ionicons>['name']} size={18} color={category.color} />
                </View>
              )}
              <Text style={[styles.nameValue, { color: c.text, fontSize: fs(15) }]}>{catName}</Text>
            </View>
          </DataRow>

          <DataRow label={labels.details_date} c={c} fs={fs}>
            <Text style={[styles.dataValue, { color: c.text, fontSize: fs(15) }]}>
              {transactionDate ? formatDateLong(transactionDate, config.language) : ''}
            </Text>
          </DataRow>

          <DataRow label={labels.details_comment} c={c} fs={fs}>
            <Text style={[styles.dataValue, { color: transaction.description ? c.text : c.textSecondary, fontSize: fs(15) }]}>
              {transaction.description || labels.details_no_comment}
            </Text>
          </DataRow>

          <DataRow label={labels.details_tags} c={c} fs={fs} noBorder>
            {tagNames.length > 0 ? (
              <View style={styles.tagsContainer}>
                {tagNames.map(tag => (
                  <View key={tag.tag_id} style={[styles.tagChip, { backgroundColor: c.primary + '20' }]}>
                    <Text style={[styles.tagChipText, { color: c.primary, fontSize: fs(13) }]} numberOfLines={1}>
                      {tag.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.dataValue, { color: c.textSecondary, fontSize: fs(15) }]}>
                {labels.details_no_tags}
              </Text>
            )}
          </DataRow>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: '#F87171' }]}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Ionicons name="trash-outline" size={18} color="#F87171" />
            <Text style={[styles.actionButtonText, { color: '#F87171', fontSize: fs(15) }]}>
              {labels.details_delete}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: c.primary }]}
            onPress={() => navigation.navigate('ModifyTransaction', { transactionId })}
          >
            <Ionicons name="create-outline" size={18} color={c.primary} />
            <Text style={[styles.actionButtonText, { color: c.primary, fontSize: fs(15) }]}>
              {labels.details_edit}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.createdText, { color: c.textSecondary, fontSize: fs(11) }]}>
          {createdDate}
        </Text>
      </ScrollView>

      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>
              {labels.details_delete_title}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>
                  {labels.details_delete_no}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F87171' }]}
                onPress={handleDelete}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF', fontSize: fs(14) }]}>
                  {labels.details_delete_yes}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DataRow({
  label, children, c, fs, noBorder,
}: {
  label: string;
  children: React.ReactNode;
  c: ReturnType<typeof useConfig>['activeColors'];
  fs: (s: number) => number;
  noBorder?: boolean;
}) {
  return (
    <View style={[styles.dataRow, noBorder ? null : { borderBottomWidth: 1, borderBottomColor: c.border }]}>
      <Text style={[styles.dataLabel, { color: c.textSecondary, fontSize: fs(13) }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  dataSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dataLabel: { fontWeight: '500', flex: 1 },
  dataValue: { fontWeight: '600', flex: 2, textAlign: 'right' },
  nameValue: { fontWeight: '600' },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 2, justifyContent: 'flex-end' },
  rowIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: { fontWeight: '600' },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagChipText: {
    fontWeight: '500',
  },
  createdText: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonText: { fontWeight: '600' },
});
