import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import ScreenShell from '../components/ScreenShell';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import TransactionForm from '../components/TransactionForm';
import DeleteButton from '../components/form/DeleteButton';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { t } from '../i18n';
import { RECURRENCE_SCOPES, USER_ID, type RecurrenceScope, type NavigationProp, type RootStackParamList } from '../constants/types';
import { fromDateOnly } from '../utils/recurrence';
import { recurringRepository } from '../database';
import { saveRecurringRuleEdit } from '../database/recurringService';
import { BUTTON_BORDER_RADIUS, CARD_BORDER_RADIUS, CONTROL_BORDER_RADIUS, recurringCardColors } from '../components/componentStyles';
import type { RecurringRule } from '../database/types';

type ModifyRecurringRouteProp = RouteProp<RootStackParamList, 'ModifyRecurring'>;

export default function ModifyRecurringScreen() {
  const route = useRoute<ModifyRecurringRouteProp>();
  const { ruleId } = route.params;
  const navigation = useNavigation<NavigationProp<'ModifyRecurring'>>();
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const { changeType } = useApp();

  const [scope, setScope] = useState<RecurrenceScope>(RECURRENCE_SCOPES.future);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [pastAffected, setPastAffected] = useState(false);

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
      <View style={[styles.scopeCard, recurringCardColors(c)]}>
        <Text style={[styles.scopeTitle, { color: c.textSecondary, fontSize: fs(12) }]}>
          {labels.recurring_scope_title}
        </Text>
        <View style={[styles.segmented, { backgroundColor: c.background }]}>
          {([
            [RECURRENCE_SCOPES.future, labels.recurring_scope_future],
            [RECURRENCE_SCOPES.futureAndPast, labels.recurring_scope_future_past],
          ] as [RecurrenceScope, string][]).map(([value, label]) => {
            const disabled = value === RECURRENCE_SCOPES.futureAndPast && !pastAffected;
            const active = scope === value && !disabled;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.segment, active && { backgroundColor: c.primary }, disabled && styles.segmentDisabled]}
                onPress={() => !disabled && setScope(value)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
              >
                <Text style={[styles.segmentText, { color: active ? c.background : c.textSecondary, fontSize: fs(13), fontWeight: active ? '700' : '600' }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.scopeHint, { color: c.textSecondary, fontSize: fs(11) }]}>
          {labels.recurring_scope_past_hint}
        </Text>
      </View>
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
        initialRepeatName={rule.name}
        existingRepeatNames={otherNames}
        submitLabel={labels.modify_save}
        errorTitle={labels.recurring_error_title}
        errorMessage={labels.recurring_error_message}
        onSubmit={async () => {}}
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
  scopeCard: {
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: 1,
    padding: 12,
  },
  scopeTitle: {
    fontWeight: '500',
  },
  segmented: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: BUTTON_BORDER_RADIUS,
    padding: 3,
    marginTop: 8,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: CONTROL_BORDER_RADIUS,
  },
  segmentDisabled: {
    opacity: 0.5,
  },
  segmentText: {
    fontWeight: '600',
  },
  scopeHint: {
    marginTop: 8,
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: 24,
  },
});
