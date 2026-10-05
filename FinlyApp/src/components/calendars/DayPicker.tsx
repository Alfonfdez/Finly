import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getDaysInMonth, isSameDay, isDateWithinBounds, dayOffset } from '../../utils/formatters';
import { resolveDateBounds } from '../../utils/calendarBounds';
import { withAlpha } from '../../utils/color';
import type { CalendarBaseProps } from './types';
import MonthNav from './MonthNav';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { t } from '../../i18n';
import { useFontSize } from '../../hooks/useFontSize';
import { calendarStyles, DISABLED_OPACITY } from './calendarStyles';
import { FIRST_DAYS } from '../../constants/types';
import { CALENDAR_GRID_CELLS, DAY_WIDTH_PERCENT } from '../../constants/calendar';

interface Props extends CalendarBaseProps {
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  initialView?: Date;
  minDate?: Date | null;
  maxDate?: Date | null;
}

export default function DayPicker({ date, onSelect, rangeStart, rangeEnd, initialView, minDate, maxDate }: Props) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState((initialView ?? date).getFullYear());
  const [month, setMonth] = useState((initialView ?? date).getMonth() + 1);
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const firstDay = config.firstDayOfWeek;
  // undefined keeps the historical "no future" default; null means unbounded.
  const { min: minBound, max: maxBound } = resolveDateBounds(minDate, maxDate, today);

  // Follow the selected date (the modal resets it on open, after this mounts).
  // Skipped when an explicit initialView is given (e.g. PeriodPicker).
  useEffect(() => {
    if (initialView) return;
    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
  }, [date, initialView]);

  const changeYear = useCallback((newYear: number) => {
    if (maxBound && newYear > maxBound.getFullYear()) return;
    if (minBound && newYear < minBound.getFullYear()) return;
    setYear(newYear);
    if (maxBound && newYear === maxBound.getFullYear() && month > maxBound.getMonth() + 1) {
      setMonth(maxBound.getMonth() + 1);
    }
    if (minBound && newYear === minBound.getFullYear() && month < minBound.getMonth() + 1) {
      setMonth(minBound.getMonth() + 1);
    }
  }, [minBound, maxBound, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const prevDays = dayOffset(firstDayOfMonth, firstDay);
  const headers = firstDay === FIRST_DAYS.monday ? labels.days_short_mon : labels.days_short_sun;

  const inRange = (d: Date) => rangeStart && rangeEnd && d >= rangeStart && d <= rangeEnd;
  const isStartEdge = (d: Date) => rangeStart && isSameDay(d, rangeStart);
  const isEndEdge = (d: Date) => rangeEnd && isSameDay(d, rangeEnd);

  return (
    <View style={calendarStyles.container}>
      <YearNav year={year} minDate={minBound} maxDate={maxBound} onChange={changeYear} />

      <MonthNav year={year} month={month} onChange={(a, m) => { setYear(a); setMonth(m); }} minDate={minBound} maxDate={maxBound} />

      <View style={styles.weekDays}>
        {headers.map(d => (
          <Text key={d} style={[styles.weekDayText, { color: c.textSecondary, fontSize: fs(12) }]}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: prevDays }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.emptyDay} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dayDate = new Date(year, month - 1, day);
          const isToday = isSameDay(dayDate, today);
          const isSelected = isSameDay(dayDate, date);
          const isDisabled = !isDateWithinBounds(dayDate, minBound, maxBound);
          const withinRange = inRange(dayDate);
          const isStart = isStartEdge(dayDate);
          const isEnd = isEndEdge(dayDate);

          return (
            <TouchableOpacity
              key={day}
              style={[styles.day, isDisabled && { opacity: DISABLED_OPACITY }]}
              onPress={() => !isDisabled && onSelect(dayDate)}
              disabled={isDisabled}
              accessibilityLabel={`${day} ${labels.months[month - 1]}${isToday ? ', today' : ''}${isSelected ? ', selected' : ''}`}
            >
              <View style={styles.dayWrap}>
                <View style={[
                  styles.dayBg,
                  isToday && [styles.todayBorder, { borderColor: c.primary }],
                  isSelected && { backgroundColor: c.primary },
                  withinRange && !isSelected && { backgroundColor: withAlpha(c.primary, 16), borderRadius: 4 },
                  isStart && !isSelected && { backgroundColor: withAlpha(c.primary, 25) },
                  isEnd && !isSelected && { backgroundColor: withAlpha(c.primary, 25) },
                ]} />
                <View style={styles.dayCenter}>
                  <Text style={[
                    styles.dayText,
                    { color: c.text, fontSize: fs(14) },
                    isSelected && { color: c.background, fontWeight: '700' },
                    isDisabled && { color: c.textSecondary },
                    withinRange && !isSelected && { fontWeight: '600' },
                  ]}>
                    {String(day)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {Array.from({ length: CALENDAR_GRID_CELLS - prevDays - daysInMonth }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.emptyDay} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekDays: { flexDirection: 'row', marginBottom: 8 },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: DAY_WIDTH_PERCENT, aspectRatio: 1 },
  emptyDay: { width: DAY_WIDTH_PERCENT, aspectRatio: 1 },
  dayWrap: { flex: 1 },
  dayBg: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 20, overflow: 'hidden' },
  dayCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  todayBorder: { borderWidth: 1 },
  dayText: { textAlign: 'center' },
});
