import { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { RECURRENCE_FREQUENCIES, RECURRENCE_SCOPES, REPEAT_MAX_INTERVAL, REPEAT_MIN_INTERVAL, REPEAT_NAME_MAX_LENGTH, type RecurrenceFrequency, type RecurrenceScope } from '../constants/types';
import { formatDateLong } from '../utils/formatters';
import { buildRecurrenceSchedule, todayDateOnly, type RecurrenceSchedule } from '../utils/recurrence';
import { recurrenceFrequencyLabels } from '../utils/recurrenceSummary';
import { recurrenceInfoLines } from '../utils/recurrenceInfo';
import { CARD_BORDER_RADIUS, BUTTON_BORDER_RADIUS, CONTROL_BORDER_RADIUS, PILL_RADIUS, SECTION_GAP, SECTION_GAP_SM, SECTION_TITLE_STYLE, recurringCardColors } from './componentStyles';
import { TEST_IDS } from '../constants/testIds';
import ClearButton from './ClearButton';
import CheckboxRow from './settings/CheckboxRow';
import RecurrenceInfo from './RecurrenceInfo';

interface Props {
  frequency: RecurrenceFrequency;
  onChangeFrequency: (frequency: RecurrenceFrequency) => void;
  interval: number;
  onChangeInterval: (interval: number) => void;
  startDay: Date;
  endDate: Date | null;
  onOpenEndDate: () => void;
  onClearEndDate: () => void;
  lastDay?: boolean;
  onChangeLastDay?: (value: boolean) => void;
  name: string;
  onChangeName: (value: string) => void;
  nameError: 'required' | 'taken' | null;
  /** The name field gained/lost focus (used to reveal the section and to arm its error). */
  onNameFocus?: () => void;
  onNameBlur?: () => void;
  /** Reports this section's y within the scroll content (for scroll-on-focus). */
  onSectionLayout?: (y: number) => void;
  /** Edit mode: the rule's cursor (presence switches the info to "next transaction"). */
  ruleNextDue?: string | null;
  ruleSkippedFrom?: string | null;
  /** Dates this rule already generated a transaction for (edit mode). */
  ruleOccurrenceDates?: string[];
  /** The rule's cursor still equals its start (never generated/skipped): the new start anchors it. */
  ruleUnmaterialized?: boolean;
  /** Edit mode: the draft start moved earlier than the rule's start (past occurrences stay skipped). */
  ruleStartMovedEarlier?: boolean;
  /** The rule's schedule before the edit (used to skip today's already-generated occurrence). */
  previousSchedule?: RecurrenceSchedule | null;
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
  frequency,
  onChangeFrequency,
  interval,
  onChangeInterval,
  startDay,
  endDate,
  onOpenEndDate,
  onClearEndDate,
  lastDay = false,
  onChangeLastDay = () => {},
  name,
  onChangeName,
  nameError,
  onNameFocus,
  onNameBlur,
  onSectionLayout,
  ruleNextDue = null,
  ruleSkippedFrom = null,
  ruleOccurrenceDates,
  ruleUnmaterialized = false,
  ruleStartMovedEarlier = false,
  previousSchedule = null,
  showScope = false,
  scope = RECURRENCE_SCOPES.future,
  onChangeScope,
  scopeDisabled = false,
}: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const frequencyLabels = recurrenceFrequencyLabels(labels);

  const schedule = useMemo(
    () => buildRecurrenceSchedule(startDay, frequency, interval, endDate, lastDay),
    [startDay, frequency, interval, endDate, lastDay],
  );

  // A "fresh" rule (never generated/skipped) anchors on the new start, so moving the
  // start date re-anchors it; otherwise keep the rule's cursor.
  const cursor = ruleUnmaterialized ? schedule.start_date : ruleNextDue;
  const occurrenceSet = useMemo(() => new Set(ruleOccurrenceDates ?? []), [ruleOccurrenceDates]);
  const info = recurrenceInfoLines(
    schedule,
    {
      today: todayDateOnly(),
      cursor,
      scope,
      skippedFrom: ruleSkippedFrom,
      previousSchedule,
      existingOccurrences: occurrenceSet,
    },
    config.language,
  );

  return (
    <View
      style={styles.container}
      onLayout={onSectionLayout ? (e) => onSectionLayout(e.nativeEvent.layout.y) : undefined}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="repeat-outline" size={16} color={c.primary} />
          <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>{labels.recurring_chip}</Text>
        </View>
      </View>

      <View
        testID={TEST_IDS.repeatOptions}
        style={[
          styles.options,
          recurringCardColors(c),
        ]}
      >
        <Text style={[styles.firstLabel, { color: c.textSecondary, fontSize: fs(12) }]}>
          {labels.repeat_name}
        </Text>
        <TextInput
          testID={TEST_IDS.repeatName}
          style={[
            styles.nameInput,
            { backgroundColor: c.background, borderColor: nameError ? c.red : c.border, color: c.text, fontSize: fs(14) },
          ]}
          placeholder={labels.repeat_name_placeholder}
          placeholderTextColor={c.textSecondary}
          value={name}
          onChangeText={onChangeName}
          onFocus={onNameFocus}
          onBlur={onNameBlur}
          maxLength={REPEAT_NAME_MAX_LENGTH}
          accessibilityLabel={labels.repeat_name}
        />
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

        {(frequency === RECURRENCE_FREQUENCIES.monthly || frequency === RECURRENCE_FREQUENCIES.yearly) && (
          <View style={styles.checkboxRow}>
            <CheckboxRow
              checked={lastDay}
              onToggle={() => onChangeLastDay(!lastDay)}
              label={labels.repeat_last_day}
            />
          </View>
        )}

        <Text style={[styles.label, { color: c.textSecondary, fontSize: fs(12), marginTop: 12 }]}>
          {labels.repeat_end_date}
        </Text>
        <View style={styles.endRow}>
          <TouchableOpacity
            testID={TEST_IDS.repeatEndDate}
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

        <RecurrenceInfo summary={info.summary} firstLine={info.firstLine} detailLines={info.detailLines} />

        {ruleStartMovedEarlier && (
          <Text style={[styles.startHint, { color: c.textSecondary, fontSize: fs(11) }]}>
            {labels.repeat_start_earlier_hint}
          </Text>
        )}
      </View>
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
  checkboxRow: {
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
  startHint: {
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
