import { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useDeferredRefresh } from '../hooks/useDeferredRefresh';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { formatAmount, formatDateLong, formatDateTimeShort, parseDbDate, AMOUNT_SIGNS } from '../utils/formatters';
import { deletePhotoFile, parsePhotos } from '../utils/photoUtils';
import { ERROR_PREFIXES } from '../utils/errors';
import { t, getDisplayCategoryName, getDisplayAccountName } from '../i18n';
import { transactionRepository } from '../database';
import { type RootStackParamList, type NavigationProp, TRANSACTION_TYPES } from '../constants/types';
import { badgeShapeFor } from '../utils/badgeShape';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import IconBadge from '../components/IconBadge';
import TagChip from '../components/TagChip';
import DataRow from '../components/DataRow';
import PhotoViewer from '../components/PhotoViewer';
import { CARD_BORDER_RADIUS, CONTROL_BORDER_RADIUS } from '../components/componentStyles';

type DetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

export default function TransactionDetailsScreen() {
  const navigation = useNavigation<NavigationProp<'TransactionDetails'>>();
  const route = useRoute<DetailsRouteProp>();
  const { transactionId } = route.params;
  const { categories, accounts, refresh } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const deferredRefresh = useDeferredRefresh(refresh);

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
    () => transaction ? parseDbDate(transaction.date) : null,
    [transaction]
  );

  const createdDate = useMemo(() => {
    if (!transactionDate) return '';
    return `${labels.details_created}: ${formatDateTimeShort(transactionDate, labels.months_short)}`;
  }, [transactionDate, labels]);

  const updatedDate = useMemo(() => {
    if (!transaction?.updated_at) return null;
    return `${labels.details_updated}: ${formatDateTimeShort(parseDbDate(transaction.updated_at), labels.months_short)}`;
  }, [transaction, labels]);

  const loadTags = useCallback(async () => {
    return await transactionRepository.getTagsByTransactionIds([transactionId]);
  }, [transactionId]);

  const { data: tagNames } = useFocusLoad(loadTags, [] as { tag_id: number; name: string }[]);

  const { visible: deleteModalVisible, open: openDeleteModal, close: closeDeleteModal, confirm: confirmDelete } = useDeleteConfirmation({
    deleteFn: async () => {
      for (const uri of parsedPhotos) {
        await deletePhotoFile(uri);
      }
      await transactionRepository.delete(transactionId);
    },
    onSuccess: async () => {
      navigation.goBack();
      deferredRefresh();
    },
    errorPrefix: ERROR_PREFIXES.transactionsDelete,
  });

  if (!transaction) {
    return (
      <ScreenShell>
        <View style={styles.content}>
          <EmptyState message={labels.transactions_empty} />
        </View>
      </ScreenShell>
    );
  }

  const isExpense = transaction.type === TRANSACTION_TYPES.expense;
  const typeColor = isExpense ? c.red : c.green;
  const catName = category ? getDisplayCategoryName(category) : '';

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dataSection}>
          <DataRow label={labels.details_amount}>
            <Text style={[styles.dataValue, { color: typeColor, fontSize: fs(15) }]}>
              {`${isExpense ? AMOUNT_SIGNS.negative : AMOUNT_SIGNS.positive}${formatAmount(transaction.amount, config)}`}
            </Text>
          </DataRow>

          <DataRow label={labels.details_account}>
            {account && (
              <NamedEntityBadge
                icon={account.icon}
                color={account.color}
                shape={badgeShapeFor(config, 'account')}
                name={getDisplayAccountName(account)}
                c={c}
                fs={fs}
              />
            )}
          </DataRow>

          <DataRow label={labels.details_category}>
            {category && (
              <NamedEntityBadge
                icon={category.icon}
                color={category.color}
                shape={badgeShapeFor(config, 'category')}
                name={catName}
                c={c}
                fs={fs}
              />
            )}
          </DataRow>

          <DataRow label={labels.details_date}>
            <Text style={[styles.dataValue, { color: c.text, fontSize: fs(15) }]}>
              {transactionDate ? formatDateLong(transactionDate, config.language) : ''}
            </Text>
          </DataRow>

          <DataRow label={labels.details_comment}>
            <Text style={[styles.dataValue, { color: transaction.description ? c.text : c.textSecondary, fontSize: fs(15) }]}>
              {transaction.description || labels.details_no_comment}
            </Text>
          </DataRow>

          <DataRow label={labels.details_tags} noBorder>
            {tagNames.length > 0 ? (
              <View style={styles.tagsContainer}>
                {tagNames.map(tag => (
                  <TagChip key={tag.tag_id} label={tag.name} size={13} />
                ))}
              </View>
            ) : (
              <Text style={[styles.dataValue, { color: c.textSecondary, fontSize: fs(15) }]}>
                {labels.details_no_tags}
              </Text>
            )}
          </DataRow>

          {parsedPhotos.length > 0 && (
            <DataRow label={labels.details_photo} noBorder>
              <View style={styles.photoGrid}>
                {parsedPhotos.map((uri, index) => (
                  <TouchableOpacity key={`${uri}-${index}`} onPress={() => { setSelectedPhotoIndex(index); setPhotoViewerVisible(true); }}>
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
            onPress={openDeleteModal}
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
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />

      <PhotoViewer
        photos={parsedPhotos}
        visible={photoViewerVisible}
        selectedIndex={selectedPhotoIndex}
        onClose={() => setPhotoViewerVisible(false)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  dataSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
  },
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
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: 1,
  },
  actionButtonText: { fontWeight: '600' },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  photoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: CONTROL_BORDER_RADIUS,
  },
  timestamps: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 2,
  },
  timestampText: {},
});

interface NamedEntityBadgeProps {
  icon: string;
  color: string;
  shape: ReturnType<typeof badgeShapeFor>;
  name: string;
  c: ReturnType<typeof useConfig>['activeColors'];
  fs: (size: number) => number;
}

function NamedEntityBadge({ icon, color, shape, name, c, fs }: NamedEntityBadgeProps) {
  return (
    <View style={styles.iconRow}>
      <IconBadge icon={icon} color={color} shape={shape} size={28} iconSize={18} roundedRadius={4} />
      <Text style={[styles.nameValue, { color: c.text, fontSize: fs(15) }]}>{name}</Text>
    </View>
  );
}
