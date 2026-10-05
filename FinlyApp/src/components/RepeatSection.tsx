import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { RECURRENCE_FREQUENCIES, type RecurrenceFrequency } from '../constants/types';
import { formatDateLong } from '../utils/formatters';
import { toDateOnly } from '../utils/recurrence';
import { recurrenceSummary } from '../utils/recurrenceSummary';
import { withAlpha } from '../utils/color';
import { CARD_BORDER_RADIUS, BUTTON_BORDER_RADIUS, PILL_RADIUS, SECTION_GAP, SECTION_TITLE_STYLE, switchColors } from './componentStyles';
import ClearButton from './ClearButton';

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
      weekday: frequency === RECURRENCE_FREQUENCIES.weekly ? startDay.getDay() : null,
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
            { backgroundColor: withAlpha(c.primary, 10), borderColor: withAlpha(c.primary, 30) },
          ]}
        >
          <Text style={[styles.firstLabel, { color: c.textSecondary, fontSize: fs(12) }]}>
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

          <Text style={[styles.summary, { color: c.primary, fontSize: fs(13) }]}>{summary}</Text>
        </View>
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
  summary: {
    fontWeight: '600',
    marginTop: 16,
  },
});
