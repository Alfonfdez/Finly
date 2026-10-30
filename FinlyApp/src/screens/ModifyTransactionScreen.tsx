import { useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import type { NavigationProp, RootStackParamList } from '../constants/types';
import { parseDbDate } from '../utils/formatters';
import { parsePhotos } from '../utils/photoUtils';
import { transactionRepository } from '../database';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useExternalRowRefresh } from '../hooks/useExternalRowRefresh';
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/EmptyState';
import LoadErrorState from '../components/LoadErrorState';
import { BUTTON_BORDER_RADIUS, CARD_BORDER_RADIUS, SECTION_GAP, recurringCardColors } from '../components/componentStyles';

type ModifyRouteProp = RouteProp<RootStackParamList, 'ModifyTransaction'>;

export default function ModifyTransactionScreen() {
  const route = useRoute<ModifyRouteProp>();
  const { transactionId } = route.params;
  const navigation = useNavigation<NavigationProp<'ModifyTransaction'>>();
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const { changeType } = useApp();
  const labels = t();

  const loadTransaction = useCallback(async () => {
    const [transaction, tagIds] = await Promise.all([
      transactionRepository.getById(transactionId),
      transactionRepository.getTagsByTransactionId(transactionId),
    ]);
    return { transaction, tagIds };
  }, [transactionId]);

  const {
    data, loading, error, retry,
  } = useFocusLoad(loadTransaction, null);
  const transaction = data?.transaction ?? null;
  const tagIds = data?.tagIds ?? [];

  // A "Future + past" rule edit (or any external change) rewrites this row while the
  // form is open: an untouched form adopts the new values (remount), a dirty one keeps
  // the user's input and shows a notice instead. Non-recurring rows have no notice to
  // show, so they always adopt.
  const { formKey, updated, adopt, onDirtyChange } = useExternalRowRefresh(transaction?.updated_at, {
    warnWhenDirty: transaction?.recurring_rule_id != null,
  });

  if (error && !loading) {
    return (
      <ScreenShell>
        <LoadErrorState onRetry={retry} />
      </ScreenShell>
    );
  }

  if (loading && !transaction) {
    return (
      <ScreenShell>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </ScreenShell>
    );
  }

  if (!transaction) {
    return (
      <ScreenShell>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <EmptyState message={labels.transactions_empty} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <TransactionForm
      key={formKey}
      initialType={transaction.type}
      initialAccountId={transaction.account_id}
      initialCategoryId={transaction.category_id}
      initialReorderedCategory={transaction.category_id}
      initialDay={parseDbDate(transaction.date)}
      transactionId={transactionId}
      initialComment={transaction.description ?? ''}
      initialAmount={String(transaction.amount)}
      initialPhotos={parsePhotos(transaction.photo)}
      initialTagIds={tagIds}
      onDirtyChange={onDirtyChange}
      editing
      submitLabel={labels.modify_save}
      errorTitle={labels.modify_error_title}
      errorMessage={labels.modify_error_message}
      topNotice={
        transaction.recurring_rule_id != null ? (
          <View style={[styles.notice, recurringCardColors(c)]}>
            <View style={styles.noticeTitleRow}>
              <Ionicons name="repeat-outline" size={16} color={c.primary} />
              <Text style={[styles.noticeTitle, { color: c.text, fontSize: fs(15) }]}>
                {labels.recurring_chip}
              </Text>
            </View>
            {updated && (
              <Text style={[styles.noticeText, { color: c.text, fontSize: fs(12) }]}>
                {labels.recurring_updated_notice}
              </Text>
            )}
            <Text style={[styles.noticeText, { color: c.textSecondary, fontSize: fs(12) }]}>
              {labels.recurring_edit_notice}
            </Text>
            {updated && (
              <TouchableOpacity
                style={[styles.noticeButton, { borderColor: c.primary }]}
                onPress={adopt}
                accessibilityRole="button"
              >
                <Ionicons name="refresh-outline" size={16} color={c.primary} />
                <Text style={[styles.noticeButtonText, { color: c.primary, fontSize: fs(14) }]}>
                  {labels.recurring_use_rule_values}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.noticeButton, { borderColor: c.primary }]}
              onPress={() =>
                navigation.navigate('ModifyRecurring', { ruleId: transaction.recurring_rule_id as number })
              }
              accessibilityRole="button"
            >
              <Ionicons name="create-outline" size={16} color={c.primary} />
              <Text style={[styles.noticeButtonText, { color: c.primary, fontSize: fs(14) }]}>
                {labels.recurring_edit_rule}
              </Text>
            </TouchableOpacity>
          </View>
        ) : undefined
      }
      onSubmit={async (data, tagIds) => {
        await transactionRepository.updateWithTags(transactionId, data, tagIds);
        changeType(data.type);
      }}
    />
  );
}

const styles = StyleSheet.create({
  notice: {
    gap: 8,
    borderWidth: 1,
    borderRadius: CARD_BORDER_RADIUS,
    padding: 12,
    marginTop: SECTION_GAP,
    marginBottom: 16,
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeTitle: {
    fontWeight: '600',
  },
  noticeText: {
    fontWeight: '500',
  },
  noticeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    borderWidth: 1,
  },
  noticeButtonText: {
    fontWeight: '600',
  },
});
