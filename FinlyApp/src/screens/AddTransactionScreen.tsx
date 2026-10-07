import { useEffect, useMemo, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { PERIODS, USER_ID, type RootStackParamList } from '../constants/types';
import { isSameDay } from '../utils/formatters';
import { transactionRepository, recurringRepository } from '../database';
import { createRecurringRule } from '../database/recurringService';
import { isTotalAccount } from '../database/helpers';
import TransactionForm from '../components/TransactionForm';

type AddTransactionRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

export default function AddTransactionScreen() {
  const route = useRoute<AddTransactionRouteProp>();
  const routeType = route.params?.type;
  const { config } = useConfig();
  const { activeType, activePeriod, customDate, selectedDate, accounts, accountsWithBalance, activeAccount, changeType } = useApp();
  const labels = t();

  const initialAccountId = useMemo(() => {
    if (config.addDefaultAccountId !== null) {
      const found = accountsWithBalance.find(a => a.id === config.addDefaultAccountId && !isTotalAccount(a));
      if (found) return found.id;
    }
    if (activeAccount && !isTotalAccount(activeAccount)) return activeAccount.id;
    return accounts.find(a => !isTotalAccount(a))?.id;
  }, [config.addDefaultAccountId, accountsWithBalance, activeAccount, accounts]);

  const initialDay = useMemo(() => {
    if (activePeriod === PERIODS.custom) {
      const isSingleDay = isSameDay(customDate.start, customDate.end);
      if (isSingleDay) return customDate.start;
    }
    return selectedDate;
  }, [activePeriod, customDate, selectedDate]);

  const [existingRepeatNames, setExistingRepeatNames] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    recurringRepository.list(USER_ID)
      .then(rules => { if (active) setExistingRepeatNames(rules.map(r => r.name)); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

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
      onSubmitRule={async (data, tagIds, recurrence) => {
        await createRecurringRule({
          name: recurrence.name,
          type: data.type,
          account_id: data.account_id,
          category_id: data.category_id,
          amount: data.amount,
          description: data.description,
          date: data.date,
          frequency: recurrence.frequency,
          interval: recurrence.interval,
          endDate: recurrence.endDate,
          skipFirst: recurrence.skipFirst,
          tagIds,
        });
        changeType(data.type);
      }}
      enableRepeat
      allowSkipFirst
      existingRepeatNames={existingRepeatNames}
      resetTagsOnFirstFocus
    />
  );
}
