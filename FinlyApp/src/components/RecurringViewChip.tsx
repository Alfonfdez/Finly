import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { RECURRING_VIEWS, type RecurringView } from '../constants/types';
import OptionPickerModal from './OptionPickerModal';

interface Props {
  value: RecurringView;
  onChange: (value: RecurringView) => void;
}

export default function RecurringViewChip({ value, onChange }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [visible, setVisible] = useState(false);

  const options = [
    { label: labels.transactions_view_all, value: RECURRING_VIEWS.all },
    { label: labels.transactions_view_one_time, value: RECURRING_VIEWS.oneTime },
    { label: labels.transactions_view_recurring, value: RECURRING_VIEWS.recurring },
  ];
  const currentLabel = options.find(op => op.value === value)?.label ?? labels.transactions_view_all;

  return (
    <>
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: c.surface }]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={currentLabel}
      >
        <Ionicons name="repeat-outline" size={14} color={c.primary} />
        <Text style={[styles.chipText, { color: c.text, fontSize: fs(13) }]} numberOfLines={1}>
          {currentLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color={c.textSecondary} />
      </TouchableOpacity>

      <OptionPickerModal
        visible={visible}
        title={labels.recurring_chip}
        icon="repeat-outline"
        options={options}
        selected={value}
        onSelect={onChange}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontWeight: '500',
    maxWidth: 120,
  },
});
