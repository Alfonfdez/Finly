import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import ScreenShell from '../components/ScreenShell';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import TransactionForm from '../components/TransactionForm';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { t } from '../i18n';
import { RECURRENCE_SCOPES, type RecurrenceScope, type NavigationProp, type RootStackParamList } from '../constants/types';
import { fromDateOnly } from '../utils/recurrence';
import { recurringRepository } from '../database';
import { saveRecurringRuleEdit } from '../database/recurringService';
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

  const load = useCallback(async () => {
    const rule = await recurringRepository.getById(ruleId);
    const tagIds = rule ? await recurringRepository.getTagIds(rule.id) : [];
    return { rule, tagIds } as { rule: RecurringRule | null; tagIds: number[] };
  }, [ruleId]);

  const { data, loading } = useFocusLoad(load, { rule: null, tagIds: [] } as { rule: RecurringRule | null; tagIds: number[] });
  const { rule, tagIds } = data;

  const persist = useCallback(async (
    updated: Partial<RecurringRule>,
    recurrence: { frequency: RecurringRule['frequency']; interval: number; endDate: string | null },
    pastPatch: { account_id: number; category_id: number; amount: number; description: string | null },
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
      <Text style={[styles.scopeTitle, { color: c.textSecondary, fontSize: fs(12) }]}>
        {labels.recurring_scope_title}
      </Text>
      <View style={styles.scopeRow}>
        {([
          [RECURRENCE_SCOPES.future, labels.recurring_scope_future],
          [RECURRENCE_SCOPES.futureAndPast, labels.recurring_scope_future_past],
        ] as [RecurrenceScope, string][]).map(([value, label]) => {
          const active = scope === value;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.chip, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primary : 'transparent' }]}
              onPress={() => setScope(value)}
            >
              <Text style={[styles.chipText, { color: active ? c.background : c.text, fontSize: fs(13) }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        style={[styles.deleteButton, { borderColor: c.red }]}
        onPress={() => setDeleteVisible(true)}
      >
        <Ionicons name="trash-outline" size={18} color={c.red} />
        <Text style={[styles.deleteText, { color: c.red, fontSize: fs(15) }]}>{labels.delete}</Text>
      </TouchableOpacity>
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
        submitLabel={labels.modify_save}
        errorTitle={labels.recurring_error_title}
        errorMessage={labels.recurring_error_message}
        onSubmit={async () => {}}
        onSubmitRule={async (draft, selectedTagIds, recurrence) => {
          await persist(
            {
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
            },
            selectedTagIds,
          );
          changeType(draft.type);
        }}
        enableRepeat
        ruleMode
        footer={footer}
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
  scopeTitle: {
    fontWeight: '500',
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 24,
  },
  deleteText: {
    fontWeight: '600',
  },
});
