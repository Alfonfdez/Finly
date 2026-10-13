import { useEffect, useMemo, useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { PERIODS, USER_ID } from '../constants/types';
import { isSameDay } from '../utils/formatters';
import { resolveDefaultAccountId } from '../utils/defaultAccount';
import { recurringRepository } from '../database';
import { createRecurringRule } from '../database/recurringService';
import TransactionForm from '../components/TransactionForm';

export default function CreateRecurringScreen() {
  const { config } = useConfig();
  const { activeType, activePeriod, customDate, selectedDate, accounts, accountsWithBalance, activeAccount, changeType } = useApp();
  const labels = t();

  const initialAccountId = useMemo(
    () => resolveDefaultAccountId(config.createRecurringDefaultAccountId, accountsWithBalance, activeAccount, accounts),
    [config.createRecurringDefaultAccountId, accountsWithBalance, activeAccount, accounts],
  );

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
          lastDay: recurrence.lastDay,
          tagIds,
        });
        changeType(data.type);
      }}
      ruleMode
      existingRepeatNames={existingRepeatNames}
      resetTagsOnFirstFocus
    />
  );
}
