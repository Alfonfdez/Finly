import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import type { RootStackParamList } from '../constants/types';
import { parseDbDate } from '../utils/formatters';
import { parsePhotos } from '../utils/photoUtils';
import { transactionRepository } from '../database';
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/EmptyState';

type ModifyRouteProp = RouteProp<RootStackParamList, 'ModifyTransaction'>;

export default function ModifyTransactionScreen() {
  const route = useRoute<ModifyRouteProp>();
  const { transactionId } = route.params;
  const { activeColors: c } = useConfig();
  const { transactions } = useApp();
  const labels = t();

  const transaction = useMemo(
    () => transactions.find(tx => tx.id === transactionId),
    [transactions, transactionId]
  );

  if (!transaction) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <EmptyState message={labels.transactions_empty} />
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
