import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { weekStart, formatWeekRange } from '../../utils/formatters';
import type { CalendarBaseProps } from './types';
import MonthNav from './MonthNav';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { useToday } from '../../hooks/useToday';
import { t } from '../../i18n';
import { calendarStyles, DISABLED_OPACITY } from './calendarStyles';
import { resolveDateBounds } from '../../utils/calendarBounds';
import { type FirstDay } from '../../constants/types';
import { CONTROL_BORDER_RADIUS } from '../componentStyles';
import { DAYS_PER_WEEK, CALENDAR_GRID_CELLS } from '../../constants/calendar';
import { TEST_IDS } from '../../constants/testIds';

interface Props extends CalendarBaseProps {
  minDate?: Date | null;
  maxDate?: Date | null;
}

interface WeekSlot {
  start: Date;
  end: Date;
}

function sameWeek(a: Date, b: Date, firstDay: FirstDay): boolean {
  const ia = weekStart(a, firstDay);
  const ib = weekStart(b, firstDay);
  return ia.getTime() === ib.getTime();
}

export default function WeekPicker({ date, onSelect, minDate, maxDate }: Props) {
  const today = useToday();
  const { min, max } = resolveDateBounds(minDate, maxDate, today);
  const [year, setYear] = useState(date.getFullYear());
  const [activeMonth, setActiveMonth] = useState(date.getMonth() + 1);
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const firstDay = config.firstDayOfWeek;
  // The view is independent from selection while the modal is open: tapping a
  // shared week must not jump to the month where that week starts. Only an
  // external date change (or reopening) re-syncs the visible month.
  const lastSelectedWeek = useRef<number | null>(null);

  useEffect(() => {
    if (lastSelectedWeek.current === date.getTime()) {
      lastSelectedWeek.current = null;
      return;
    }
    setYear(date.getFullYear());
    setActiveMonth(date.getMonth() + 1);
  }, [date]);

  const weeks = useMemo<(WeekSlot | null)[]>(() => {
    const result: (WeekSlot | null)[] = [];
    const monthStart = new Date(year, activeMonth - 1, 1);
    const monthEnd = new Date(year, activeMonth, 0);
    let cursor = weekStart(monthStart, firstDay);
    for (let i = 0; i < CALENDAR_GRID_CELLS / DAYS_PER_WEEK; i++) {
      const end = new Date(cursor);
      end.setDate(end.getDate() + DAYS_PER_WEEK - 1);
      result.push(cursor <= monthEnd && end >= monthStart ? { start: new Date(cursor), end } : null);
      cursor.setDate(cursor.getDate() + DAYS_PER_WEEK);
    }
    return result;
  }, [year, activeMonth, firstDay]);

  const changeYear = useCallback((newYear: number) => {
    if (max && newYear > max.getFullYear()) return;
    if (min && newYear < min.getFullYear()) return;
    setYear(newYear);
    if (max && newYear === max.getFullYear() && activeMonth > max.getMonth() + 1) {
      setActiveMonth(max.getMonth() + 1);
    }
    if (min && newYear === min.getFullYear() && activeMonth < min.getMonth() + 1) {
      setActiveMonth(min.getMonth() + 1);
    }
  }, [min, max, activeMonth]);

  return (
    <View style={calendarStyles.container}>
      <YearNav year={year} onChange={changeYear} minDate={min} maxDate={max} />

      <MonthNav
        year={year}
        month={activeMonth}
        onChange={(a, m) => { setYear(a); setActiveMonth(m); }}
        minDate={min}
        maxDate={max}
      />

      <View>
        {weeks.map((week, i) => {
          if (!week) {
            return (
              <View
                key={`empty-${i}`}
                testID={TEST_IDS.weekPickerEmptyRow}
                style={[styles.weekRow, styles.weekRowEmpty]}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Text style={{ fontSize: fs(14), opacity: 0 }}>{'\u00A0'}</Text>
              </View>
            );
          }
          const isOutOfBounds = (min != null && week.start < min) || (max != null && week.start > max);
          const isSelected = sameWeek(week.start, date, firstDay);
          return (
            <TouchableOpacity
              key={i}
              testID={TEST_IDS.weekPickerRow}
              style={[styles.weekRow, { backgroundColor: c.surface }, isSelected && { backgroundColor: c.primary }, isOutOfBounds && { opacity: DISABLED_OPACITY }]}
              onPress={() => {
                if (isOutOfBounds) return;
                lastSelectedWeek.current = week.start.getTime();
                onSelect(week.start);
              }}
              disabled={isOutOfBounds}
              accessibilityRole="button"
              accessibilityLabel={formatWeekRange(week.start, labels.months_short, firstDay)}
              accessibilityState={{ selected: isSelected, disabled: isOutOfBounds }}
            >
              <Text style={{ color: isSelected ? c.background : c.text, fontWeight: isSelected ? '700' : '400', fontSize: fs(14) }}>
                {formatWeekRange(week.start, labels.months_short, firstDay)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: CONTROL_BORDER_RADIUS, marginBottom: 4 },
  weekRowEmpty: { backgroundColor: 'transparent' },
});
