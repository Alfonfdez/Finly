import { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatDateRangeLines, formatWeekRange } from '../utils/formatters';
import { canGoForward, canJumpToCurrent, shiftPeriod } from '../utils/periodNavigation';
import CalendarModal from './CalendarModal';
import type { Period } from './calendars/types';
import { PERIODS } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import DateIcon from './DateIcon';
import { BUTTON_BORDER_RADIUS } from './componentStyles';

const PERIOD_ARROW_SIZE = 22;
/** Both side slots share this width, so the date stays centred and the arrows never shift it. */
const ARROW_SLOT = 76;

interface Props {
  period: Period;
  date: Date;
  onDateChange: (date: Date) => void;
  onRangeChange?: (start: Date, end: Date) => void;
  rangeStart?: Date;
  rangeEnd?: Date;
  visible?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export default function CalendarPicker({
  period, date, onDateChange, onRangeChange,
  rangeStart, rangeEnd, visible = false, onOpen, onClose,
}: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const months = labels.months;
  const shortMonths = labels.months_short;
  // Read fresh on every render so "the current period" flips correctly after midnight.
  const today = new Date();
  const showNavigation = period !== PERIODS.custom;

  const rangeLines = period === PERIODS.custom
    ? formatDateRangeLines(
      rangeStart ?? new Date(today.getFullYear(), 0, 1),
      rangeEnd ?? today,
      months,
      labels.cal_range_start,
      labels.cal_range_end,
    )
    : null;

  const dateText = (() => {
    switch (period) {
      case PERIODS.day: return formatDate(date);
      case PERIODS.week: return formatWeekRange(date, shortMonths, false, config.firstDayOfWeek);
      case PERIODS.month: return `${months[date.getMonth()]} ${date.getFullYear()}`;
      case PERIODS.year: return date.getFullYear().toString();
      case PERIODS.custom: return '';
    }
  })();

  const showNext = showNavigation && canGoForward(period, date, today, config.firstDayOfWeek);
  const showJump = showNavigation && canJumpToCurrent(period, date, today, config.firstDayOfWeek);

  const goBack = useCallback(() => onDateChange(shiftPeriod(period, date, -1)), [onDateChange, period, date]);
  const goForward = useCallback(() => onDateChange(shiftPeriod(period, date, 1)), [onDateChange, period, date]);
  const goToCurrent = useCallback(() => onDateChange(new Date()), [onDateChange]);

  return (
    <>
      <View style={styles.row}>
        {showNavigation && (
          <View style={styles.slot}>
            <TouchableOpacity
              onPress={goBack}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={labels.a11y_previous_period}
            >
              <Ionicons name="chevron-back-outline" size={PERIOD_ARROW_SIZE} color={c.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.center}>
          <TouchableOpacity
            style={[styles.button, period === PERIODS.custom && styles.buttonCustom, { backgroundColor: c.surface }]}
            onPress={onOpen}
            accessibilityLabel={rangeLines ? `${rangeLines.start}, ${rangeLines.end}` : dateText}
          >
            <DateIcon kind="calendar" size={14} color={c.primary} />
            {rangeLines ? (
              <View style={styles.rangeText}>
                <Text style={[styles.text, { color: c.primary, fontSize: fs(14) }]}>{rangeLines.start}</Text>
                <Text style={[styles.text, { color: c.primary, fontSize: fs(14) }]}>{rangeLines.end}</Text>
              </View>
            ) : (
              <Text style={[styles.text, { color: c.primary, fontSize: fs(14) }]}>{dateText}</Text>
            )}
          </TouchableOpacity>
        </View>

        {showNavigation && (
          <View style={[styles.slot, styles.slotRight]}>
            {showJump && (
              <TouchableOpacity
                onPress={goToCurrent}
                style={styles.jumpButton}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={labels.a11y_go_to_current_period}
              >
                <Ionicons name="chevron-forward-outline" size={PERIOD_ARROW_SIZE} color={c.primary} />
                <Ionicons
                  name="chevron-forward-outline"
                  size={PERIOD_ARROW_SIZE}
                  color={c.primary}
                  style={styles.jumpOverlap}
                />
              </TouchableOpacity>
            )}
            {showNext && (
              <TouchableOpacity
                onPress={goForward}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={labels.a11y_next_period}
              >
                <Ionicons name="chevron-forward-outline" size={PERIOD_ARROW_SIZE} color={c.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <CalendarModal
        visible={visible}
        period={period}
        date={date}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onSelectDate={onDateChange}
        onSelectRange={onRangeChange}
        onClose={() => onClose?.()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  slot: {
    width: ARROW_SLOT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  slotRight: {
    justifyContent: 'flex-end',
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  buttonCustom: {
    maxWidth: '100%',
    paddingHorizontal: 12,
  },
  text: { fontWeight: '600', textAlign: 'center', flexShrink: 1 },
  rangeText: { flexShrink: 1, minWidth: 0 },
  jumpButton: { flexDirection: 'row', alignItems: 'center' },
  jumpOverlap: { marginLeft: -12 },
});
