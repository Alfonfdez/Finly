import { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { formatCurrency, formatDateLong } from '../utils/formatters';
import { deletePhotoFile, parsePhotos } from '../utils/photoUtils';
import { withAlpha } from '../utils/color';
import { t, getDisplayCategoryName, getDisplayAccountName } from '../i18n';
import { isNative } from '../utils/platform';
import { transactionRepository } from '../database';
import { RootStackParamList, TRANSACTION_TYPES } from '../constants/types';
import { badgeShapeFor } from '../utils/badgeShape';
import { WHITE } from '../constants/themes';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import IconBadge from '../components/IconBadge';

type DetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;
type DetailsNavProp = NativeStackNavigationProp<RootStackParamList, 'TransactionDetails'>;

export default function TransactionDetailsScreen() {
  const navigation = useNavigation<DetailsNavProp>();
  const route = useRoute<DetailsRouteProp>();
  const { transactionId } = route.params;
  const { categories, accounts, refresh } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Refresh transaction data when screen gains focus (after editing)
  const loadTransaction = useCallback(async () => {
    return await transactionRepository.getById(transactionId);
  }, [transactionId]);

  const { data: transaction } = useFocusLoad(loadTransaction, null);

  // Parse photos from DB (supports both old single URI and new JSON array)
  const parsedPhotos = useMemo(() => parsePhotos(transaction?.photo), [transaction?.photo]);

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
    return `${labels.details_created}: ${h}:${min} - ${day} ${month.toLowerCase()} ${year}`;
  }, [transaction, labels]);

  const updatedDate = useMemo(() => {
    if (!transaction?.updated_at) return null;
    const d = new Date(transaction.updated_at);
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const day = d.getDate();
    const month = labels.months_short[d.getMonth()];
    const year = d.getFullYear();
    return `${labels.details_updated}: ${h}:${min} - ${day} ${month.toLowerCase()} ${year}`;
  }, [transaction, labels]);

  const loadTags = useCallback(async () => {
    const tagIds = await transactionRepository.getTagsByTransactionId(transactionId);
    if (tagIds.length === 0) return [] as { tag_id: number; name: string }[];
    return await transactionRepository.getTagsByTransactionIds([transactionId]);
  }, [transactionId]);

  const { data: tagNames } = useFocusLoad(loadTags, [] as { tag_id: number; name: string }[]);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      for (const uri of parsedPhotos) {
        await deletePhotoFile(uri);
      }
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
        <View style={styles.content}>
          <EmptyState message={labels.transactions_empty} />
        </View>
      </SafeAreaView>
    );
  }

  const isExpense = transaction.type === TRANSACTION_TYPES.expense;
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
                <IconBadge
                  icon={account.icon}
                  color={account.color}
                  shape={badgeShapeFor(config, 'account')}
                  size={28}
                  iconSize={18}
                  roundedRadius={4}
                />
              )}
              <Text style={[styles.nameValue, { color: c.text, fontSize: fs(15) }]}>{account ? getDisplayAccountName(account) : ''}</Text>
            </View>
          </DataRow>

          <DataRow label={labels.details_category} c={c} fs={fs}>
            <View style={styles.iconRow}>
              {category && (
                <IconBadge
                  icon={category.icon}
                  color={category.color}
                  shape={badgeShapeFor(config, 'category')}
                  size={28}
                  iconSize={18}
                  roundedRadius={4}
                />
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
                  <View key={tag.tag_id} style={[styles.tagChip, { backgroundColor: withAlpha(c.primary, 13) }]}>
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

          {parsedPhotos.length > 0 && isNative && (
            <DataRow label={labels.details_photo} c={c} fs={fs} noBorder>
              <View style={styles.photoGrid}>
                {parsedPhotos.map((uri, index) => (
                  <TouchableOpacity key={uri} onPress={() => { setSelectedPhotoIndex(index); setPhotoViewerVisible(true); }}>
                    <Image source={{ uri }} style={styles.photoThumbnail} />
                  </TouchableOpacity>
                ))}
              </View>
            </DataRow>
          )}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: c.red }]}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Ionicons name="trash-outline" size={18} color={c.red} />
            <Text style={[styles.actionButtonText, { color: c.red, fontSize: fs(15) }]}>
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

        <View style={styles.timestamps}>
          <Text style={[styles.timestampText, { color: c.textSecondary, fontSize: fs(11) }]}>
            {createdDate}
          </Text>
          {updatedDate && (
            <Text style={[styles.timestampText, { color: c.textSecondary, fontSize: fs(11) }]}>
              {updatedDate}
            </Text>
          )}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.details_delete_title}
        confirmLabel={labels.details_delete_yes}
        cancelLabel={labels.details_delete_no}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />

      <Modal visible={photoViewerVisible} transparent animationType="fade" onRequestClose={() => setPhotoViewerVisible(false)}>
        <View style={styles.viewerOverlay}>
          <TouchableOpacity style={styles.viewerClose} onPress={() => setPhotoViewerVisible(false)}>
            <Ionicons name="close" size={28} color={WHITE} />
          </TouchableOpacity>
          {parsedPhotos.length > 0 && (
            <Image source={{ uri: parsedPhotos[selectedPhotoIndex] || parsedPhotos[0] }} resizeMode="contain" style={styles.viewerImage} />
          )}
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
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  photoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 1,
    padding: 8,
  },
  viewerImage: {
    width: '90%',
    height: '80%',
  },
  timestamps: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 2,
  },
  timestampText: {},
});
