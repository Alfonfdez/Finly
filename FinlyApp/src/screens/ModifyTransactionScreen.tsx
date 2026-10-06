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
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/EmptyState';
import { CARD_BORDER_RADIUS, SECTION_GAP } from '../components/componentStyles';

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
    return await transactionRepository.getById(transactionId);
  }, [transactionId]);

  const { data: transaction, loading } = useFocusLoad(loadTransaction, null);

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
      initialType={transaction.type}
      initialAccountId={transaction.account_id}
      initialCategoryId={transaction.category_id}
      initialReorderedCategory={transaction.category_id}
      initialDay={parseDbDate(transaction.date)}
      transactionId={transactionId}
      initialComment={transaction.description ?? ''}
      initialAmount={String(transaction.amount)}
      initialPhotos={parsePhotos(transaction.photo)}
      submitLabel={labels.modify_save}
      errorTitle={labels.modify_error_title}
      errorMessage={labels.modify_error_message}
      topNotice={
        transaction.recurring_rule_id != null ? (
          <View style={[styles.notice, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="repeat-outline" size={18} color={c.primary} />
            <View style={styles.noticeBody}>
              <Text style={[styles.noticeText, { color: c.textSecondary, fontSize: fs(12) }]}>
                {labels.recurring_edit_notice}
              </Text>
              <TouchableOpacity
                style={styles.noticeLink}
                onPress={() =>
                  navigation.navigate('ModifyRecurring', { ruleId: transaction.recurring_rule_id as number })
                }
              >
                <Text style={[styles.noticeLinkText, { color: c.primary, fontSize: fs(13) }]}>
                  {labels.recurring_edit_rule}
                </Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: CARD_BORDER_RADIUS,
    padding: 12,
    marginTop: SECTION_GAP,
    marginBottom: 16,
  },
  noticeBody: {
    alignItems: 'center',
    gap: 4,
  },
  noticeText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  noticeLink: {
    alignSelf: 'center',
  },
  noticeLinkText: {
    fontWeight: '600',
  },
});
