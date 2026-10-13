import { useMemo } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { PERIODS, type RootStackParamList } from '../constants/types';
import { isSameDay } from '../utils/formatters';
import { resolveDefaultAccountId } from '../utils/defaultAccount';
import { transactionRepository } from '../database';
import TransactionForm from '../components/TransactionForm';

type AddTransactionRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

export default function AddTransactionScreen() {
  const route = useRoute<AddTransactionRouteProp>();
  const routeType = route.params?.type;
  const { config } = useConfig();
  const { activeType, activePeriod, customDate, selectedDate, accounts, accountsWithBalance, activeAccount, changeType } = useApp();
  const labels = t();

  const initialAccountId = useMemo(
    () => resolveDefaultAccountId(config.addDefaultAccountId, accountsWithBalance, activeAccount, accounts),
    [config.addDefaultAccountId, accountsWithBalance, activeAccount, accounts],
  );

  const initialDay = useMemo(() => {
    if (activePeriod === PERIODS.custom) {
      const isSingleDay = isSameDay(customDate.start, customDate.end);
      if (isSingleDay) return customDate.start;
    }
    return selectedDate;
  }, [activePeriod, customDate, selectedDate]);

  return (
    <TransactionForm
      initialType={routeType ?? activeType}
      initialAccountId={initialAccountId}
      initialCategoryId={null}
      initialReorderedCategory={null}
      initialDay={initialDay}
      initialComment=""
      initialPhotos={[]}
      submitLabel={labels.add_submit}
      errorTitle={labels.add_error_title}
      errorMessage={labels.add_error_message}
      onSubmit={async (data, tagIds) => {
        await transactionRepository.createWithTags(data, tagIds);
        changeType(data.type);
      }}
      resetTagsOnFirstFocus
    />
  );
}
