import { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { RECURRENCE_FREQUENCIES, RECURRENCE_SCOPES, REPEAT_MAX_INTERVAL, REPEAT_MIN_INTERVAL, REPEAT_NAME_MAX_LENGTH, type RecurrenceFrequency, type RecurrenceScope } from '../constants/types';
import { formatDateLong } from '../utils/formatters';
import { buildRecurrenceSchedule, fromDateOnly, recurrencePreview, recurrenceSkipWindow, toDateOnly, todayDateOnly } from '../utils/recurrence';
import { recurrenceSummary } from '../utils/recurrenceSummary';
import { CARD_BORDER_RADIUS, BUTTON_BORDER_RADIUS, CONTROL_BORDER_RADIUS, PILL_RADIUS, SECTION_GAP, SECTION_GAP_SM, SECTION_TITLE_STYLE, recurringCardColors, switchColors } from './componentStyles';
import ClearButton from './ClearButton';
import CheckboxRow from './settings/CheckboxRow';
import RecurrenceInfo from './RecurrenceInfo';

interface Props {
  enabled: boolean;
  onToggle: (value: boolean) => void;
  frequency: RecurrenceFrequency;
  onChangeFrequency: (frequency: RecurrenceFrequency) => void;
  interval: number;
  onChangeInterval: (interval: number) => void;
  startDay: Date;
  endDate: Date | null;
  onOpenEndDate: () => void;
  onClearEndDate: () => void;
  skipFirst: boolean;
  onChangeSkipFirst: (value: boolean) => void;
  showSkipFirst?: boolean;
  name: string;
  onChangeName: (value: string) => void;
  nameError: 'required' | 'taken' | null;
  showToggle?: boolean;
  /** Edit mode: the rule's cursor (presence switches the info to "next transaction"). */
  ruleNextDue?: string | null;
  ruleSkippedFrom?: string | null;
  showScope?: boolean;
  scope?: RecurrenceScope;
  onChangeScope?: (scope: RecurrenceScope) => void;
  scopeDisabled?: boolean;
}

const FREQUENCIES: RecurrenceFrequency[] = [
  RECURRENCE_FREQUENCIES.daily,
  RECURRENCE_FREQUENCIES.weekly,
  RECURRENCE_FREQUENCIES.monthly,
  RECURRENCE_FREQUENCIES.yearly,
];

export default function RepeatSection({
  enabled,
  onToggle,
  frequency,
  onChangeFrequency,
  interval,
  onChangeInterval,
  startDay,
  endDate,
  onOpenEndDate,
  onClearEndDate,
  skipFirst,
  onChangeSkipFirst,
  showSkipFirst = false,
  name,
  onChangeName,
  nameError,
  showToggle = true,
  ruleNextDue = null,
  ruleSkippedFrom = null,
  showScope = false,
  scope = RECURRENCE_SCOPES.future,
  onChangeScope,
  scopeDisabled = false,
}: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const frequencyLabels = useMemo<Record<RecurrenceFrequency, string>>(() => ({
    daily: labels.repeat_daily,
    weekly: labels.repeat_weekly,
    monthly: labels.repeat_monthly,
    yearly: labels.repeat_yearly,
  }), [labels]);

  const schedule = useMemo(
    () => buildRecurrenceSchedule(startDay, frequency, interval, endDate ? toDateOnly(endDate) : null),
    [startDay, frequency, interval, endDate],
  );
  const summary = recurrenceSummary(schedule, config.language);

  const isEdit = ruleNextDue != null;
  const preview = recurrencePreview(schedule, {
    today: todayDateOnly(),
    skipFirst: !isEdit && skipFirst,
    cursor: ruleNextDue,
    scope,
    skippedFrom: ruleSkippedFrom,
  });
  const skipWindow = isEdit && scope === RECURRENCE_SCOPES.future && ruleNextDue
    ? recurrenceSkipWindow(schedule, ruleNextDue, todayDateOnly())
    : null;

  const formatOccurrence = (value: string) => formatDateLong(fromDateOnly(value), config.language);
  const firstLine = isEdit
    ? labels.recurring_info_next(formatOccurrence(preview.firstDate))
    : labels.repeat_first_occurrence(formatOccurrence(preview.firstDate));

  const detailLines: string[] = [];
  if (isEdit && scope === RECURRENCE_SCOPES.futureAndPast) {
    detailLines.push(preview.count > 0 ? labels.recurring_info_backfill(preview.count) : labels.recurring_info_count(0));
  } else {
    detailLines.push(labels.recurring_info_count(preview.count));
    if (skipWindow) detailLines.push(labels.recurring_info_skipped(skipWindow.count));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {enabled && <Ionicons name="repeat-outline" size={16} color={c.primary} />}
          <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>{labels.recurring_chip}</Text>
        </View>
        {showToggle && (
          <Switch
            value={enabled}
            onValueChange={onToggle}
            accessibilityLabel={labels.recurring_chip}
            {...switchColors(c)}
          />
        )}
      </View>

      {enabled && (
        <View
          testID="repeat-options"
          style={[
            styles.options,
            recurringCardColors(c),
          ]}
        >
          <Text style={[styles.firstLabel, { color: c.textSecondary, fontSize: fs(12) }]}>
            {labels.repeat_name}
          </Text>
          <TextInput
            style={[
              styles.nameInput,
              { backgroundColor: c.background, borderColor: nameError ? c.red : c.border, color: c.text, fontSize: fs(14) },
            ]}
            placeholder={labels.repeat_name_placeholder}
            placeholderTextColor={c.textSecondary}
            value={name}
            onChangeText={onChangeName}
            maxLength={REPEAT_NAME_MAX_LENGTH}
          />
          {nameError && (
            <Text style={[styles.nameError, { color: c.red, fontSize: fs(12) }]}>
              {nameError === 'required' ? labels.repeat_name_required : labels.repeat_name_taken}
            </Text>
          )}
          <Text style={[styles.label, { color: c.textSecondary, fontSize: fs(12) }]}>
            {labels.repeat_frequency}
          </Text>
          <View style={styles.chips}>
            {FREQUENCIES.map((value) => {
              const active = value === frequency;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? c.primary : 'transparent',
                      borderColor: active ? c.primary : c.border,
                    },
                  ]}
                  onPress={() => onChangeFrequency(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, { color: active ? c.background : c.text, fontSize: fs(13) }]}>
                    {frequencyLabels[value]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.intervalRow}>
            <Text style={[styles.label, { color: c.textSecondary, fontSize: fs(12) }]}>
              {labels.repeat_interval}
            </Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: c.border }]}
                onPress={() => onChangeInterval(Math.max(REPEAT_MIN_INTERVAL, interval - 1))}
                disabled={interval <= REPEAT_MIN_INTERVAL}
                accessibilityRole="button"
                accessibilityLabel="-"
              >
                <Ionicons name="remove" size={18} color={c.text} />
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: c.text, fontSize: fs(15) }]}>{interval}</Text>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: c.border }]}
                onPress={() => onChangeInterval(Math.min(REPEAT_MAX_INTERVAL, interval + 1))}
                disabled={interval >= REPEAT_MAX_INTERVAL}
                accessibilityRole="button"
                accessibilityLabel="+"
              >
                <Ionicons name="add" size={18} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.label, { color: c.textSecondary, fontSize: fs(12), marginTop: 12 }]}>
            {labels.repeat_end_date}
          </Text>
          <View style={styles.endRow}>
            <TouchableOpacity
              testID="repeat-end-date"
              style={[styles.endField, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={onOpenEndDate}
              accessibilityRole="button"
              accessibilityLabel={labels.repeat_end_date}
            >
              <Text
                style={[styles.endText, { color: endDate ? c.text : c.textSecondary, fontSize: fs(14) }]}
                numberOfLines={1}
              >
                {endDate ? formatDateLong(endDate, config.language) : labels.repeat_no_end}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={c.primary} />
            </TouchableOpacity>
            <ClearButton visible={!!endDate} onPress={onClearEndDate} accessibilityLabel={labels.repeat_no_end} />
          </View>

          {showSkipFirst && (
            <View style={styles.skipFirstRow}>
              <CheckboxRow
                checked={skipFirst}
                onToggle={() => onChangeSkipFirst(!skipFirst)}
                label={labels.repeat_skip_first}
              />
            </View>
          )}

          {showScope && (
            <View style={styles.scopeBlock}>
              <Text style={[styles.label, { color: c.textSecondary, fontSize: fs(12) }]}>
                {labels.recurring_scope_title}
              </Text>
              <View style={[styles.segmented, { backgroundColor: c.background }]}>
                {([
                  [RECURRENCE_SCOPES.future, labels.recurring_scope_future],
                  [RECURRENCE_SCOPES.futureAndPast, labels.recurring_scope_future_past],
                ] as [RecurrenceScope, string][]).map(([value, label]) => {
                  const disabled = value === RECURRENCE_SCOPES.futureAndPast && scopeDisabled;
                  const active = scope === value && !disabled;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.segment, active && { backgroundColor: c.primary }, disabled && styles.segmentDisabled]}
                      onPress={() => !disabled && onChangeScope?.(value)}
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
          )}

          <RecurrenceInfo summary={summary} firstLine={firstLine} detailLines={detailLines} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SECTION_GAP_SM,
    marginBottom: SECTION_GAP,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: SECTION_TITLE_STYLE,
  options: {
    borderWidth: 1,
    borderRadius: CARD_BORDER_RADIUS,
    padding: 14,
  },
  firstLabel: {
    fontWeight: '500',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: BUTTON_BORDER_RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    fontWeight: '500',
  },
  nameError: {
    marginTop: 4,
    fontWeight: '500',
  },
  skipFirstRow: {
    marginTop: 12,
  },
  scopeBlock: {
    marginTop: 12,
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
  label: {
    fontWeight: '500',
    marginTop: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderRadius: PILL_RADIUS,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontWeight: '600',
  },
  intervalRow: {
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: PILL_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  endRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  endField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: BUTTON_BORDER_RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  endText: {
    flex: 1,
    fontWeight: '500',
  },
});
