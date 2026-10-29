import { useCallback, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import ScreenShell from '../components/ScreenShell';
import EmptyState from '../components/EmptyState';
import LoadErrorState from '../components/LoadErrorState';
import ConfirmationModal from '../components/ConfirmationModal';
import TransactionForm from '../components/TransactionForm';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { t } from '../i18n';
import { RECURRENCE_SCOPES, RULE_ACTIVE, USER_ID, type RecurrenceScope, type NavigationProp, type RootStackParamList } from '../constants/types';
import { buildRecurrenceSchedule, fromDateOnly, isLastDayAnchor, planEdit, ruleEditCursorForEdit, todayDateOnly, type SkipWindow } from '../utils/recurrence';
import { datePart, formatDateLong } from '../utils/formatters';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';
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
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);
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
    const occurrenceDates = rule ? await recurringRepository.listOccurrenceDates(rule.id) : [];
    const otherNames = (await recurringRepository.list(USER_ID))
      .filter(r => r.id !== ruleId)
      .map(r => r.name);
    return { rule, tagIds, otherNames, occurrenceDates } as { rule: RecurringRule | null; tagIds: number[]; otherNames: string[]; occurrenceDates: string[] };
  }, [ruleId]);

  const {
    data, loading, error, retry,
  } = useFocusLoad(load, { rule: null, tagIds: [], otherNames: [], occurrenceDates: [] } as { rule: RecurringRule | null; tagIds: number[]; otherNames: string[]; occurrenceDates: string[] });
  const { rule, tagIds, otherNames, occurrenceDates } = data;

  const persist = useCallback(async (
    updated: Partial<RecurringRule>,
    recurrence: { frequency: RecurringRule['frequency']; interval: number; endDate: string | null; lastDay?: boolean },
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
      fromDateOnly(datePart(draft.date)),
      recurrence.frequency,
      recurrence.interval,
      recurrence.endDate,
      recurrence.lastDay,
    );
    const { skipWindow } = planEdit({
      schedule,
      previousSchedule: rule,
      cursor: ruleEditCursorForEdit(rule, schedule, occurrenceDates.length > 0),
      scope,
      today: todayDateOnly(),
      skippedFrom: rule.skipped_from,
      existingOccurrences: new Set(occurrenceDates),
      ruleActive: rule.active === RULE_ACTIVE,
    });
    if (!skipWindow) return true;
    return new Promise<boolean>(resolve => {
      skipResolveRef.current = resolve;
      setSkipWarning(skipWindow);
    });
  }, [scope, rule, occurrenceDates]);

  const resolveSkipWarning = useCallback((proceed: boolean) => {
    setSkipWarning(null);
    skipResolveRef.current?.(proceed);
    skipResolveRef.current = null;
  }, []);

  const handleDelete = useCallback(async () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    const ok = await runWithErrorAlert(async () => {
      await recurringRepository.remove(ruleId);
      return true;
    }, ERROR_PREFIXES.recurringDelete, labels);
    if (ok) {
      setDeleteVisible(false);
      navigation.goBack();
      return;
    }
    deletingRef.current = false;
    setDeleting(false);
  }, [ruleId, navigation, labels]);

  if (error && !loading) {
    return (
      <ScreenShell>
        <LoadErrorState onRetry={retry} />
      </ScreenShell>
    );
  }

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
        initialRuleActive={rule.active === RULE_ACTIVE}
        initialRuleSkippedFrom={rule.skipped_from}
        initialRuleOccurrenceDates={occurrenceDates}
        initialRepeatName={rule.name}
        initialRepeatLastDay={isLastDayAnchor(rule.day_of_month)}
        existingRepeatNames={otherNames}
        submitLabel={labels.modify_save}
        errorTitle={labels.recurring_error_title}
        errorMessage={labels.recurring_error_message}
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
              start_date: datePart(draft.date),
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
        ruleMode
        editing
        deleteLabel={labels.delete}
        onDeletePress={() => setDeleteVisible(true)}
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
        busy={deleting}
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
});
