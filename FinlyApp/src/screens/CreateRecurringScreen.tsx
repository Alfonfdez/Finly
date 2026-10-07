import { useEffect, useMemo, useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { PERIODS, USER_ID } from '../constants/types';
import { isSameDay } from '../utils/formatters';
import { recurringRepository } from '../database';
import { createRecurringRule } from '../database/recurringService';
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
      onSubmit={async () => {}}
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
      ruleMode
      allowSkipFirst
      existingRepeatNames={existingRepeatNames}
      resetTagsOnFirstFocus
    />
  );
}
