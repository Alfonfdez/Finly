import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDate, formatWeekRange } from '../utils/formatters';
import CalendarModal from './CalendarModal';
import { Period } from './calendars/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

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
  firstDay?: 0 | 1;
}

export default function CalendarPicker({
  period, date, onDateChange, onRangeChange,
  rangeStart, rangeEnd, visible = false, onOpen, onClose, firstDay = 1,
}: Props) {
  const today = new Date();
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const months = labels.months;
  const shortMonths = labels.months_short;

  const dateText = () => {
    switch (period) {
      case 'day': return formatDate(date);
      case 'week': return formatWeekRange(date, shortMonths);
      case 'month': return `${months[date.getMonth()]} ${date.getFullYear()}`;
      case 'year': return date.getFullYear().toString();
      case 'custom': {
        const startDate = rangeStart ?? new Date(today.getFullYear(), 0, 1);
        const endDate = rangeEnd ?? today;
        return `${labels.cal_from} ${startDate.getDate()} ${shortMonths[startDate.getMonth()]} ${labels.cal_to} ${endDate.getDate()} ${shortMonths[endDate.getMonth()]} ${endDate.getFullYear()}`;
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.surface }]}
        onPress={onOpen}
        accessibilityLabel={`${dateText()}`}
      >
        <Text style={[styles.text, { color: c.primary, fontSize: fs(14) }]}>{dateText()}</Text>
      </TouchableOpacity>
      <CalendarModal
        visible={visible}
        period={period}
        date={date}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onSelectDate={onDateChange}
        onSelectRange={onRangeChange}
        onClose={() => onClose?.()}
        firstDay={firstDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 4 },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  text: { fontWeight: '600' },
});
