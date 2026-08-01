import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getDaysInMonth, isSameDay, isFutureDate, dayOffset } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import MonthNav from './MonthNav';
import { useConfig } from '../../context/ConfigContext';
import { t } from '../../i18n';
import { useFontSize } from '../../hooks/useFontSize';
import { calendarStyles, FUTURE_OPACITY } from './calendarStyles';
import { FIRST_DAYS } from '../../constants/types';

interface Props extends CalendarBaseProps {
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  initialView?: Date;
}

export default function DayPicker({ date, onSelect, rangeStart, rangeEnd, initialView }: Props) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState((initialView ?? date).getFullYear());
  const [month, setMonth] = useState((initialView ?? date).getMonth() + 1);
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const firstDay = config.firstDayOfWeek;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const prevDays = dayOffset(firstDayOfMonth, firstDay);
  const headers = firstDay === FIRST_DAYS.monday ? labels.days_short_mon : labels.days_short_sun;

  const inRange = (d: Date) => rangeStart && rangeEnd && d >= rangeStart && d <= rangeEnd;
  const isStartEdge = (d: Date) => rangeStart && isSameDay(d, rangeStart);
  const isEndEdge = (d: Date) => rangeEnd && isSameDay(d, rangeEnd);

  return (
    <View style={calendarStyles.container}>
      <MonthNav year={year} month={month} onChange={(a, m) => { setYear(a); setMonth(m); }} />

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
          const isFuture = isFutureDate(dayDate);
          const withinRange = inRange(dayDate);
          const isStart = isStartEdge(dayDate);
          const isEnd = isEndEdge(dayDate);

          return (
            <TouchableOpacity
              key={day}
              style={[styles.day, isFuture && { opacity: FUTURE_OPACITY }]}
              onPress={() => !isFuture && onSelect(dayDate)}
              disabled={isFuture}
            >
              <View style={styles.dayWrap}>
                <View style={[
                  styles.dayBg,
                  isToday && [styles.todayBorder, { borderColor: c.primary }],
                  isSelected && { backgroundColor: c.primary },
                  withinRange && !isSelected && { backgroundColor: c.primary + '25', borderRadius: 4 },
                  isStart && !isSelected && { backgroundColor: c.primary + '40' },
                  isEnd && !isSelected && { backgroundColor: c.primary + '40' },
                ]} />
                <View style={styles.dayCenter}>
                  <Text style={[
                    styles.dayText,
                    { color: c.text, fontSize: fs(14) },
                    isSelected && { color: c.background, fontWeight: '700' },
                    isFuture && { color: c.textSecondary },
                    withinRange && !isSelected && { fontWeight: '600' },
                  ]}>
                    {String(day)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {Array.from({ length: 42 - prevDays - daysInMonth }).map((_, i) => (
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
  day: { width: '14.28%', aspectRatio: 1 },
  emptyDay: { width: '14.28%', aspectRatio: 1 },
  dayWrap: { flex: 1 },
  dayBg: { ...StyleSheet.absoluteFillObject, borderRadius: 20, overflow: 'hidden' },
  dayCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  todayBorder: { borderWidth: 1 },
  dayText: { textAlign: 'center' },
});
