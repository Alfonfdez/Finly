import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { isSameDay } from '../utils/formatters';

interface Props {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onOpenCalendar: () => void;
}

export default function DaySelector({ selectedDate, onSelect, onOpenCalendar }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(today.getDate() - 2);

  const isToday = isSameDay(selectedDate, today);
  const isYesterday = isSameDay(selectedDate, yesterday);
  const isOtherSelected = !isToday && !isYesterday;

  const formatShortDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = labels.months_short[date.getMonth()];
    return `${day} ${month}`;
  };

  const formatLongDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = labels.months_short[date.getMonth()];
    const year = date.getFullYear();
    const isCurrentYear = year === today.getFullYear();
    return isCurrentYear ? `${day} ${month}` : `${day} ${month} ${year}`;
  };

  const thirdDate = isOtherSelected ? selectedDate : dayBeforeYesterday;
  const isThirdSelected = isOtherSelected;

  const renderOption = (date: Date, label: string, isSelected: boolean, isDynamic = false) => (
    <TouchableOpacity
      style={[
        styles.option,
        { backgroundColor: isSelected ? c.primary + '22' : c.surface },
        isSelected && { borderWidth: 2, borderColor: c.primary },
      ]}
      onPress={() => onSelect(date)}
    >
      <Text style={[styles.date, { color: c.text, fontSize: fs(14) }]}>
        {isDynamic ? formatLongDate(date) : formatShortDate(date)}
      </Text>
      <Text style={[styles.label, { color: isSelected ? c.primary : c.textSecondary, fontSize: fs(12) }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>
          {labels.add_day}
        </Text>
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={onOpenCalendar}
          accessibilityLabel={labels.cal_select_day}
        >
          <Ionicons name="calendar-outline" size={20} color={c.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {renderOption(today, labels.add_today, isToday)}
        {renderOption(yesterday, labels.add_yesterday, isYesterday)}
        {renderOption(
          thirdDate,
          isThirdSelected ? labels.add_selected : labels.add_day_before,
          isThirdSelected,
          true,
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: '600',
  },
  calendarButton: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  date: {
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontWeight: '500',
  },
});
