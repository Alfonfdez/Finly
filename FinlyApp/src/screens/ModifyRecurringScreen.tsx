import { useCallback, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import ScreenShell from '../components/ScreenShell';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import TransactionForm from '../components/TransactionForm';
import DeleteButton from '../components/form/DeleteButton';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { t } from '../i18n';
import { RECURRENCE_SCOPES, USER_ID, type RecurrenceScope, type NavigationProp, type RootStackParamList } from '../constants/types';
import { buildRecurrenceSchedule, fromDateOnly, recurrenceSkipWindow, todayDateOnly, type SkipWindow } from '../utils/recurrence';
import { formatDateLong } from '../utils/formatters';
import { recurringRepository } from '../database';
import { saveRecurringRuleEdit } from '../database/recurringService';
import type { TransactionDraft, RecurrenceDraft } from '../hooks/useTransactionForm';
import type { RecurringRule } from '../database/types';

type ModifyRecurringRouteProp = RouteProp<RootStackParamList, 'ModifyRecurring'>;

export default function ModifyRecurringScreen() {
  const route = useRoute<ModifyRecurringRouteProp>();
  const { ruleId } = route.params;
  const navigation = useNavigation<NavigationProp<'ModifyRecurring'>>();
  const { activeColors: c, config } = useConfig();
  const labels = t();
  const { changeType } = useApp();

  const [scope, setScope] = useState<RecurrenceScope>(RECURRENCE_SCOPES.future);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [pastAffected, setPastAffected] = useState(false);
  const [skipWarning, setSkipWarning] = useState<SkipWindow | null>(null);
  const skipResolveRef = useRef<((proceed: boolean) => void) | null>(null);

  // "From now on + past ones" only makes sense when a past-affecting field changed.
  useEffect(() => {
    if (!pastAffected && scope !== RECURRENCE_SCOPES.future) {
      setScope(RECURRENCE_SCOPES.future);
    }
  }, [pastAffected, scope]);

  const load = useCallback(async () => {
    const rule = await recurringRepository.getById(ruleId);
    const tagIds = rule ? await recurringRepository.getTagIds(rule.id) : [];
    const otherNames = (await recurringRepository.list(USER_ID))
      .filter(r => r.id !== ruleId)
      .map(r => r.name);
    return { rule, tagIds, otherNames } as { rule: RecurringRule | null; tagIds: number[]; otherNames: string[] };
  }, [ruleId]);

  const { data, loading } = useFocusLoad(load, { rule: null, tagIds: [], otherNames: [] } as { rule: RecurringRule | null; tagIds: number[]; otherNames: string[] });
  const { rule, tagIds, otherNames } = data;

  const persist = useCallback(async (
    updated: Partial<RecurringRule>,
    recurrence: { frequency: RecurringRule['frequency']; interval: number; endDate: string | null },
    pastPatch: { account_id: number; category_id: number; amount: number; description: string | null; type: RecurringRule['type'] },
    selectedTagIds: number[],
  ) => {
    await saveRecurringRuleEdit({
      ruleId,
      updated,
      recurrence,
      scope,
      pastPatch,
      tagIds: selectedTagIds,
    });
  }, [ruleId, scope]);

  // Warn before a "Future only" save silently skips occurrences (they stay
  // recoverable later with "Future + past").
  const handleBeforeSubmitRule = useCallback(async (
    draft: TransactionDraft,
    recurrence: RecurrenceDraft,
  ): Promise<boolean> => {
    if (scope !== RECURRENCE_SCOPES.future || !rule) return true;
    const schedule = buildRecurrenceSchedule(
      fromDateOnly(draft.date.slice(0, 10)),
      recurrence.frequency,
      recurrence.interval,
      recurrence.endDate,
    );
    const skip = recurrenceSkipWindow(schedule, rule.next_due, todayDateOnly());
    if (!skip) return true;
    return new Promise<boolean>(resolve => {
      skipResolveRef.current = resolve;
      setSkipWarning(skip);
    });
  }, [scope, rule]);

  const resolveSkipWarning = useCallback((proceed: boolean) => {
    setSkipWarning(null);
    skipResolveRef.current?.(proceed);
    skipResolveRef.current = null;
  }, []);

  const handleDelete = useCallback(async () => {
    await recurringRepository.remove(ruleId);
    setDeleteVisible(false);
    navigation.goBack();
  }, [ruleId, navigation]);

  if (loading && !rule) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </ScreenShell>
    );
  }

  if (!rule) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <EmptyState message={labels.recurring_empty} />
        </View>
      </ScreenShell>
    );
  }

  const footer = (
    <View style={styles.footer}>
      <DeleteButton
        label={labels.delete}
        onPress={() => setDeleteVisible(true)}
        style={styles.deleteButton}
      />
    </View>
  );

  return (
    <>
      <TransactionForm
        initialType={rule.type}
        initialAccountId={rule.account_id}
        initialCategoryId={rule.category_id}
        initialReorderedCategory={rule.category_id}
        initialDay={fromDateOnly(rule.start_date)}
        initialComment={rule.description ?? ''}
        initialAmount={String(rule.amount)}
        initialPhotos={[]}
        initialTagIds={tagIds}
        initialRepeatFrequency={rule.frequency}
        initialRepeatInterval={rule.interval}
        initialRepeatEnd={rule.end_date ? fromDateOnly(rule.end_date) : null}
        initialRuleNextDue={rule.next_due}
        initialRuleActive={rule.active === 1}
        initialRuleSkippedFrom={rule.skipped_from}
        initialRepeatName={rule.name}
        existingRepeatNames={otherNames}
        submitLabel={labels.modify_save}
        errorTitle={labels.recurring_error_title}
        errorMessage={labels.recurring_error_message}
        onSubmit={async () => {}}
        onBeforeSubmitRule={handleBeforeSubmitRule}
        onSubmitRule={async (draft, selectedTagIds, recurrence) => {
          await persist(
            {
              name: recurrence.name,
              type: draft.type,
              account_id: draft.account_id,
              category_id: draft.category_id,
              amount: draft.amount,
              description: draft.description,
              start_date: draft.date.slice(0, 10),
              end_date: recurrence.endDate,
            },
            recurrence,
            {
              account_id: draft.account_id,
              category_id: draft.category_id,
              amount: draft.amount,
              description: draft.description,
              type: draft.type,
            },
            selectedTagIds,
          );
          changeType(draft.type);
        }}
        enableRepeat
        ruleMode
        footer={footer}
        onRecurringPastAffectedChange={setPastAffected}
        showRepeatScope
        repeatScope={scope}
        onChangeRepeatScope={setScope}
        repeatScopeDisabled={!pastAffected}
      />

      <ConfirmationModal
        visible={deleteVisible}
        title={labels.recurring_delete_confirm_title}
        message={labels.recurring_delete_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteVisible(false)}
      />

      <ConfirmationModal
        visible={skipWarning !== null}
        title={labels.recurring_skip_warning_title}
        message={skipWarning
          ? labels.recurring_skip_warning_message(
              skipWarning.count,
              formatDateLong(fromDateOnly(skipWarning.from), config.language),
            )
          : undefined}
        confirmLabel={labels.recurring_skip_warning_confirm}
        cancelLabel={labels.cancel}
        onConfirm={() => resolveSkipWarning(true)}
        onCancel={() => resolveSkipWarning(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  footer: {
    marginTop: 24,
  },
  deleteButton: {
    marginTop: 24,
  },
});
