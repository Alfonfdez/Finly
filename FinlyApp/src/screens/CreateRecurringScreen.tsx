import { useMemo } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { PERIODS, RECURRENCE_FREQUENCIES, USER_ID } from '../constants/types';
import { isSameDay } from '../utils/formatters';
import { fromDateOnly } from '../utils/recurrence';
import { recurringRepository } from '../database';
import { materializeDueRecurring } from '../database/recurringService';
import { isTotalAccount } from '../database/helpers';
import TransactionForm from '../components/TransactionForm';

export default function CreateRecurringScreen() {
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

  return (
    <TransactionForm
      initialType={activeType}
      initialAccountId={initialAccountId}
      initialCategoryId={null}
      initialReorderedCategory={null}
      initialDay={initialDay}
      initialComment=""
      initialPhotos={[]}
      submitLabel={labels.recurring_submit}
      errorTitle={labels.recurring_error_title}
      errorMessage={labels.recurring_error_message}
      onSubmit={async () => {}}
      onSubmitRule={async (data, tagIds, recurrence) => {
        const startDate = data.date.slice(0, 10);
        const start = fromDateOnly(startDate);
        const isMonthlyOrYearly =
          recurrence.frequency === RECURRENCE_FREQUENCIES.monthly ||
          recurrence.frequency === RECURRENCE_FREQUENCIES.yearly;
        await recurringRepository.createWithTags(
          {
            user_id: USER_ID,
            type: data.type,
            account_id: data.account_id,
            category_id: data.category_id,
            amount: data.amount,
            description: data.description,
            frequency: recurrence.frequency,
            interval: recurrence.interval,
            weekday: recurrence.frequency === RECURRENCE_FREQUENCIES.weekly ? start.getDay() : null,
            day_of_month: isMonthlyOrYearly ? start.getDate() : null,
            month: recurrence.frequency === RECURRENCE_FREQUENCIES.yearly ? start.getMonth() + 1 : null,
            start_date: startDate,
            end_date: recurrence.endDate,
            next_due: startDate,
            active: 1,
          },
          tagIds,
        );
        await materializeDueRecurring();
        changeType(data.type);
      }}
      enableRepeat
      ruleMode
      resetTagsOnFirstFocus
    />
  );
}
