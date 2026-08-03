import { useMemo } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { PERIODS } from '../constants/types';
import { isSameDay } from '../utils/formatters';
import { transactionRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import TransactionForm from '../components/TransactionForm';

export default function AddTransactionScreen() {
  const { config } = useConfig();
  const { activeType, activePeriod, customDate, selectedDate, accounts, accountsWithBalance, activeAccount } = useApp();
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

  return (
    <TransactionForm
      initialType={activeType}
      initialAccountId={initialAccountId}
      initialCategoryId={null}
      initialReorderedCategory={null}
      initialDay={initialDay}
      initialComment=""
      initialPhotos={[]}
      submitLabel={labels.add_submit}
      errorTitle={labels.add_error_title}
      errorMessage={labels.add_error_message}
      onSubmit={async (data, tagIds) => { await transactionRepository.createWithTags(data, tagIds); }}
      resetTagsOnFirstFocus
    />
  );
}
