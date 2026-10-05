import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { RECURRENCE_FREQUENCIES, type RecurrenceFrequency } from '../constants/types';
import { formatDateLong } from '../utils/formatters';
import { toDateOnly } from '../utils/recurrence';
import { recurrenceSummary } from '../utils/recurrenceSummary';
import { PILL_RADIUS, SECTION_GAP, SECTION_TITLE_STYLE } from './componentStyles';

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
  showToggle?: boolean;
}

const FREQUENCIES: RecurrenceFrequency[] = [
  RECURRENCE_FREQUENCIES.daily,
  RECURRENCE_FREQUENCIES.weekly,
  RECURRENCE_FREQUENCIES.monthly,
  RECURRENCE_FREQUENCIES.yearly,
];

const MIN_INTERVAL = 1;
const MAX_INTERVAL = 99;

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
  showToggle = true,
}: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const frequencyLabels: Record<RecurrenceFrequency, string> = {
    daily: labels.repeat_daily,
    weekly: labels.repeat_weekly,
    monthly: labels.repeat_monthly,
    yearly: labels.repeat_yearly,
  };

  const dayOfMonth = startDay.getDate();
  const summary = recurrenceSummary(
    {
      frequency,
      interval,
      day_of_month:
        frequency === RECURRENCE_FREQUENCIES.monthly || frequency === RECURRENCE_FREQUENCIES.yearly
          ? dayOfMonth
          : null,
      month: frequency === RECURRENCE_FREQUENCIES.yearly ? startDay.getMonth() + 1 : null,
      start_date: toDateOnly(startDay),
      end_date: endDate ? toDateOnly(endDate) : null,
    },
    config.language,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>{labels.recurring_chip}</Text>
        {showToggle && (
          <Switch
            value={enabled}
            onValueChange={onToggle}
            accessibilityLabel={labels.recurring_chip}
            trackColor={{ false: c.border, true: c.primary }}
            thumbColor={c.background}
          />
        )}
      </View>

      {enabled && (
        <>
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
                onPress={() => onChangeInterval(Math.max(MIN_INTERVAL, interval - 1))}
                disabled={interval <= MIN_INTERVAL}
                accessibilityRole="button"
                accessibilityLabel="-"
              >
                <Ionicons name="remove" size={18} color={c.text} />
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: c.text, fontSize: fs(15) }]}>{interval}</Text>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: c.border }]}
                onPress={() => onChangeInterval(Math.min(MAX_INTERVAL, interval + 1))}
                disabled={interval >= MAX_INTERVAL}
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
            <TouchableOpacity style={styles.endButton} onPress={onOpenEndDate} accessibilityRole="button">
              <Text style={[styles.endText, { color: c.text, fontSize: fs(14) }]}>
                {endDate ? formatDateLong(endDate, config.language) : labels.repeat_no_end}
              </Text>
            </TouchableOpacity>
            {endDate && (
              <TouchableOpacity
                onPress={onClearEndDate}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={labels.repeat_no_end}
              >
                <Ionicons name="close-circle" size={20} color={c.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.summary, { color: c.primary, fontSize: fs(13) }]}>{summary}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SECTION_GAP,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: SECTION_TITLE_STYLE,
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
  endButton: {
    flex: 1,
  },
  endText: {
    fontWeight: '500',
  },
  summary: {
    fontWeight: '600',
    marginTop: 16,
  },
});
