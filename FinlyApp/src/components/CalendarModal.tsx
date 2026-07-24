import { useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { isWeb } from '../utils/platform';
import { formatPeriodText } from '../utils/formatters';
import { Period } from './calendars/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import DayPicker from './calendars/DayPicker';
import WeekPicker from './calendars/WeekPicker';
import MonthGrid from './calendars/MonthGrid';
import YearGrid from './calendars/YearGrid';
import PeriodPicker from './calendars/PeriodPicker';

interface Props {
  visible: boolean;
  period: Period;
  date: Date;
  rangeStart?: Date;
  rangeEnd?: Date;
  onSelectDate: (date: Date) => void;
  onSelectRange?: (start: Date, end: Date) => void;
  onClose: () => void;
  firstDay?: 0 | 1;
}

const TITLE_KEYS: Record<Period, keyof ReturnType<typeof t>> = {
  day: 'cal_select_day',
  week: 'cal_select_week',
  month: 'cal_select_month',
  year: 'cal_select_year',
  custom: 'cal_select_period',
};

export default function CalendarModal({
  visible, period, date, rangeStart, rangeEnd,
  onSelectDate, onSelectRange, onClose, firstDay = 1,
}: Props) {
  const [tempDate, setTempDate] = useState(date);
  const [tempRangeStart, setTempRangeStart] = useState(rangeStart ?? new Date(new Date().getFullYear(), 0, 1));
  const [tempRangeEnd, setTempRangeEnd] = useState(rangeEnd ?? new Date());
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const handleSelect = useCallback((d: Date) => {
    setTempDate(d);
  }, []);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setTempRangeStart(start);
    setTempRangeEnd(end);
  }, []);

  const handleOk = useCallback(() => {
    if (period === 'custom') {
      onSelectRange?.(tempRangeStart, tempRangeEnd);
    } else {
      onSelectDate(tempDate);
    }
    onClose();
  }, [period, tempDate, tempRangeStart, tempRangeEnd, onSelectDate, onSelectRange, onClose]);

  const handleCancel = useCallback(() => {
    setTempDate(date);
    setTempRangeStart(rangeStart ?? new Date(new Date().getFullYear(), 0, 1));
    setTempRangeEnd(rangeEnd ?? new Date());
    onClose();
  }, [date, rangeStart, rangeEnd, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.background }]}>
          <Text style={[styles.title, { color: c.text, fontSize: fs(18) }]}>{labels[TITLE_KEYS[period]] as string}</Text>
          {period !== 'custom' && <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: fs(13) }]}>{formatPeriodText(period, tempDate, labels.months, labels.months_short)}</Text>}

          {period === 'day' && (
            <DayPicker date={tempDate} onSelect={handleSelect} firstDay={firstDay} />
          )}
          {period === 'week' && (
            <WeekPicker date={tempDate} onSelect={handleSelect} firstDay={firstDay} />
          )}
          {period === 'month' && (
            <MonthGrid date={tempDate} onSelect={handleSelect} />
          )}
          {period === 'year' && (
            <YearGrid date={tempDate} onSelect={handleSelect} />
          )}
          {period === 'custom' && (
            <PeriodPicker
              tempStart={tempRangeStart}
              tempEnd={tempRangeEnd}
              onTempRangeChange={handleRangeChange}
              firstDay={firstDay}
            />
          )}

          <View style={[styles.buttons, { borderTopColor: c.border }]}>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: c.surface }]} onPress={handleCancel}>
              <Text style={[styles.cancelButtonText, { color: c.textSecondary, fontSize: fs(14) }]}>{labels.cal_cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.okButton, { backgroundColor: c.primary }]} onPress={handleOk}>
              <Text style={[styles.okButtonText, { color: c.background, fontSize: fs(14) }]}>{labels.cal_ok}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    padding: 16,
    ...(isWeb
      ? { boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }
      : { elevation: 10 }),
  },
  title: { fontWeight: '700', marginBottom: 2 },
  subtitle: { marginBottom: 12 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cancelButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  cancelButtonText: { fontWeight: '600' },
  okButton: { paddingHorizontal: 28, paddingVertical: 10, borderRadius: 8 },
  okButtonText: { fontWeight: '700' },
});
