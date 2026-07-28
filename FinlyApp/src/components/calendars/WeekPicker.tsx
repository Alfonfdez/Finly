import { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getShortMonthName, weekStart } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import MonthNav from './MonthNav';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { FUTURE_OPACITY } from './calendarStyles';

interface Props extends CalendarBaseProps {
  firstDay?: 0 | 1;
}

function formatShortWeek(start: Date, end: Date): string {
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = getShortMonthName(start.getMonth() + 1).toLowerCase();
  const endMonth = getShortMonthName(end.getMonth() + 1).toLowerCase();
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

function sameWeek(a: Date, b: Date, firstDay: 0 | 1): boolean {
  const ia = weekStart(a, firstDay);
  const ib = weekStart(b, firstDay);
  return ia.getTime() === ib.getTime();
}

export default function WeekPicker({ date, onSelect, firstDay = 1 }: Props) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(date.getFullYear());
  const [activeMonth, setActiveMonth] = useState(date.getMonth() + 1);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  const weeks = useMemo(() => {
    const result: { start: Date; end: Date }[] = [];
    const firstMonthDay = new Date(year, activeMonth - 1, 1);
    let cursor = weekStart(firstMonthDay, firstDay);
    for (let i = 0; i < 6; i++) {
      const end = new Date(cursor);
      end.setDate(end.getDate() + 6);
      result.push({ start: new Date(cursor), end });
      cursor.setDate(cursor.getDate() + 7);
    }
    return result;
  }, [year, activeMonth, firstDay]);

  const changeYear = useCallback((newYear: number) => {
    if (newYear > today.getFullYear()) return;
    setYear(newYear);
    if (newYear === today.getFullYear() && activeMonth > today.getMonth() + 1) {
      setActiveMonth(today.getMonth() + 1);
    }
  }, [today, activeMonth]);

  return (
    <View style={styles.container}>
      <YearNav year={year} onChange={changeYear} />

      <MonthNav year={year} month={activeMonth} onChange={(a, m) => { setYear(a); setActiveMonth(m); }} />

      <View>
        {weeks.map((week, i) => {
          const isFuture = week.start > today;
          const isSelected = sameWeek(week.start, date, firstDay);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.weekRow, { backgroundColor: c.surface }, isSelected && { backgroundColor: c.primary }, isFuture && { opacity: FUTURE_OPACITY }]}
              onPress={() => !isFuture && onSelect(week.start)}
              disabled={isFuture}
            >
              <Text style={{ color: isSelected ? c.background : c.text, fontWeight: isSelected ? '700' : '400', fontSize: fs(14) }}>
                {formatShortWeek(week.start, week.end)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  weekRow: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
});
