import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useResetOnOpen } from '../hooks/useResetOnOpen';
import { t } from '../i18n';
import { RECURRING_STATUSES, type RecurringStatus } from '../constants/types';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import ModalFooter from './ModalFooter';
import CheckboxRow from './settings/CheckboxRow';

interface Props {
  /** Selected statuses; an empty list means "All". */
  selected: RecurringStatus[];
  onChange: (selected: RecurringStatus[]) => void;
}

const ALL_STATUSES: RecurringStatus[] = [
  RECURRING_STATUSES.active,
  RECURRING_STATUSES.paused,
  RECURRING_STATUSES.ended,
];

/**
 * Recurring-screen status filter: a chip that opens a compact multi-select modal
 * (All / Active / Paused / Ended). "All" and the concrete statuses are mutually
 * exclusive; picking every status collapses back to "All".
 */
export default function RecurringStatusChip({ selected, onChange }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [visible, setVisible] = useState(false);
  const [temp, setTemp] = useState<RecurringStatus[]>(selected);

  const statusLabels: Record<RecurringStatus, string> = {
    active: labels.recurring_active,
    paused: labels.recurring_paused,
    ended: labels.recurring_ended,
  };

  const resetOnOpen = useCallback(() => setTemp(selected), [selected]);
  useResetOnOpen(visible, resetOnOpen);

  const allSelected = selected.length === 0;
  const chipLabel = allSelected
    ? labels.tab_all
    : ALL_STATUSES.filter(status => selected.includes(status)).map(status => statusLabels[status]).join(' + ');

  const toggleStatus = (status: RecurringStatus) => {
    setTemp(prev => {
      if (prev.includes(status)) return prev.filter(s => s !== status);
      const next = [...prev, status];
      return next.length === ALL_STATUSES.length ? [] : next;
    });
  };

  const apply = () => {
    onChange(temp);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: c.surface }]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={chipLabel}
      >
        <Ionicons name="funnel-outline" size={14} color={c.primary} />
        <Text style={[styles.chipText, { color: c.text, fontSize: fs(13) }]} numberOfLines={1}>
          {chipLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color={c.textSecondary} />
      </TouchableOpacity>

      <ModalShell visible={visible} onClose={() => setVisible(false)} maxHeight="70%">
        <ModalHeader title={labels.recurring_status_title} icon="funnel-outline" />
        <View style={styles.options}>
          <CheckboxRow checked={temp.length === 0} onToggle={() => setTemp([])} label={labels.tab_all} />
          {ALL_STATUSES.map(status => (
            <CheckboxRow
              key={status}
              checked={temp.includes(status)}
              onToggle={() => toggleStatus(status)}
              label={statusLabels[status]}
            />
          ))}
        </View>
        <ModalFooter
          cancelLabel={labels.cancel}
          confirmLabel={temp.length === 0 ? labels.filter_apply_all : labels.filter_apply(temp.length)}
          onCancel={() => setVisible(false)}
          onConfirm={apply}
        />
      </ModalShell>
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
    maxWidth: 160,
  },
  options: {
    marginTop: 4,
  },
});
