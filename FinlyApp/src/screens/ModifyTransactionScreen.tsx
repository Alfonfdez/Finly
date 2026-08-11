import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { t } from '../i18n';
import type { RootStackParamList } from '../constants/types';
import { parseDbDate } from '../utils/formatters';
import { parsePhotos } from '../utils/photoUtils';
import { transactionRepository } from '../database';
import { useFocusLoad } from '../hooks/useFocusLoad';
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/EmptyState';

type ModifyRouteProp = RouteProp<RootStackParamList, 'ModifyTransaction'>;

export default function ModifyTransactionScreen() {
  const route = useRoute<ModifyRouteProp>();
  const { transactionId } = route.params;
  const { activeColors: c } = useConfig();
  const labels = t();

  const loadTransaction = useCallback(async () => {
    return await transactionRepository.getById(transactionId);
  }, [transactionId]);

  const { data: transaction, loading } = useFocusLoad(loadTransaction, null);

  if (loading || !transaction) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {loading ? <ActivityIndicator size="large" color={c.primary} /> : <EmptyState message={labels.transactions_empty} />}
        </View>
      </SafeAreaView>
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
      onSubmit={async (data, tagIds) => { await transactionRepository.updateWithTags(transactionId, data, tagIds); }}
    />
  );
}
