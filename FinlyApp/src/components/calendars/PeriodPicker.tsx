import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DayPicker from './DayPicker';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';

const MIN_YEAR = new Date().getFullYear();

interface Props {
  tempStart: Date;
  tempEnd: Date;
  onTempRangeChange: (start: Date, end: Date) => void;
  firstDay?: 0 | 1;
}

export default function PeriodPicker({ tempStart, tempEnd, onTempRangeChange, firstDay = 1 }: Props) {
  const [allTime, setAllTime] = useState(false);
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const shortMonths = labels.months_short;

  const minDate = useMemo(() => new Date(MIN_YEAR, 0, 1), []);
  const today = useMemo(() => new Date(), []);

  const handleAllTime = useCallback(() => {
    const nextAllTime = !allTime;
    setAllTime(nextAllTime);
    if (nextAllTime) {
      onTempRangeChange(minDate, today);
    }
  }, [allTime, onTempRangeChange, minDate, today]);

  const handleDayPress = useCallback((d: Date) => {
    if (allTime) return;
    if (selecting === 'start') {
      onTempRangeChange(d, d);
      setSelecting('end');
    } else {
      const start = tempStart < d ? tempStart : d;
      const end = tempStart < d ? d : tempStart;
      onTempRangeChange(start, end);
    }
  }, [selecting, tempStart, allTime, onTempRangeChange]);

  const rangeText = allTime
    ? labels.cal_all
    : selecting === 'end' && tempStart.getTime() === tempEnd.getTime()
      ? `${labels.cal_from} ${tempStart.getDate()} ${shortMonths[tempStart.getMonth()]} — ${labels.cal_period_to_hint}`
      : `${labels.cal_from} ${tempStart.getDate()} ${shortMonths[tempStart.getMonth()]} ${labels.cal_to} ${tempEnd.getDate()} ${shortMonths[tempEnd.getMonth()]} ${tempEnd.getFullYear()}`;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.textSecondary, fontSize: fs(13) }]}>{rangeText}</Text>

      <TouchableOpacity style={styles.allTimeRow} onPress={handleAllTime}>
        <View style={[styles.checkbox, { borderColor: c.textSecondary }, allTime && { backgroundColor: c.primary, borderColor: c.primary }]} />
        <Text style={[styles.allTimeText, { color: c.text, fontSize: fs(14) }]}>{labels.cal_all}</Text>
      </TouchableOpacity>

      {!allTime && (
        <View style={[styles.indicator, { backgroundColor: c.surface }]}>
          <Text style={[styles.indicatorText, { color: c.primary, fontSize: fs(13) }]}>
            {selecting === 'start' ? labels.cal_select_start : labels.cal_select_end}
          </Text>
        </View>
      )}

      {!allTime && (
        <DayPicker
          date={selecting === 'start' ? tempStart : tempEnd}
          onSelect={handleDayPress}
          rangeStart={tempStart}
          rangeEnd={tempEnd}
          initialView={new Date()}
          firstDay={firstDay}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  title: { marginBottom: 12 },
  allTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, marginRight: 8 },
  allTimeText: {},
  indicator: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  indicatorText: { fontWeight: '600' },
});
