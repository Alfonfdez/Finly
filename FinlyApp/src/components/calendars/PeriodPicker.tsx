import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DayPicker from './DayPicker';
import CheckboxRow from '../settings/CheckboxRow';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { useToday } from '../../hooks/useToday';
import { t } from '../../i18n';
import { calendarStyles } from './calendarStyles';
import { isSameDay } from '../../utils/formatters';
import { shiftPeriod } from '../../utils/periodNavigation';
import { PERIODS } from '../../constants/types';

const PICKING_PHASE = {
  start: 'start',
  end: 'end',
} as const;

type PickingPhase = (typeof PICKING_PHASE)[keyof typeof PICKING_PHASE];

const PERIOD_PRESETS = {
  thisYear: 'thisYear',
  last30Days: 'last30Days',
  last90Days: 'last90Days',
  last12Months: 'last12Months',
} as const;

type PeriodPreset = (typeof PERIOD_PRESETS)[keyof typeof PERIOD_PRESETS];

function presetStart(preset: PeriodPreset, today: Date): Date {
  switch (preset) {
    case PERIOD_PRESETS.thisYear: return new Date(today.getFullYear(), 0, 1);
    case PERIOD_PRESETS.last30Days: return shiftPeriod(PERIODS.day, today, -29);
    case PERIOD_PRESETS.last90Days: return shiftPeriod(PERIODS.day, today, -89);
    case PERIOD_PRESETS.last12Months: return shiftPeriod(PERIODS.month, today, -12);
  }
}

const PERIOD_PRESET_ORDER: PeriodPreset[] = [
  PERIOD_PRESETS.thisYear,
  PERIOD_PRESETS.last12Months,
  PERIOD_PRESETS.last30Days,
  PERIOD_PRESETS.last90Days,
];

function findPresetForRange(start: Date, end: Date, today: Date): PeriodPreset | null {
  for (const preset of PERIOD_PRESET_ORDER) {
    if (isSameDay(start, presetStart(preset, today)) && isSameDay(end, today)) return preset;
  }
  return null;
}

interface Props {
  tempStart: Date;
  tempEnd: Date;
  onTempRangeChange: (start: Date, end: Date) => void;
  onSelectingEndChange?: (selectingEnd: boolean) => void;
}

export default function PeriodPicker({ tempStart, tempEnd, onTempRangeChange, onSelectingEndChange }: Props) {
  const [selecting, setSelecting] = useState<PickingPhase>(PICKING_PHASE.start);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const today = useToday();
  const activePreset = findPresetForRange(tempStart, tempEnd, today);

  const setPhase = useCallback((phase: PickingPhase) => {
    setSelecting(phase);
    onSelectingEndChange?.(phase === PICKING_PHASE.end);
  }, [onSelectingEndChange]);

  const presetLabels: Record<PeriodPreset, string> = {
    [PERIOD_PRESETS.thisYear]: labels.cal_this_year,
    [PERIOD_PRESETS.last12Months]: labels.cal_12_months,
    [PERIOD_PRESETS.last30Days]: labels.cal_30_days,
    [PERIOD_PRESETS.last90Days]: labels.cal_90_days,
  };

  const handlePreset = useCallback((preset: PeriodPreset) => {
    onTempRangeChange(presetStart(preset, today), today);
    setPhase(PICKING_PHASE.start);
  }, [onTempRangeChange, today, setPhase]);

  const handleDayPress = useCallback((d: Date) => {
    if (selecting === PICKING_PHASE.start) {
      onTempRangeChange(d, d);
      setPhase(PICKING_PHASE.end);
    } else {
      const start = tempStart < d ? tempStart : d;
      const end = tempStart < d ? d : tempStart;
      onTempRangeChange(start, end);
      setPhase(PICKING_PHASE.start);
    }
  }, [selecting, tempStart, onTempRangeChange, setPhase]);

  return (
    <View style={calendarStyles.container}>
      <DayPicker
        date={selecting === PICKING_PHASE.start ? tempStart : tempEnd}
        onSelect={handleDayPress}
        rangeStart={tempStart}
        rangeEnd={tempEnd}
        initialView={new Date()}
      />

      <View style={styles.presetGrid}>
        {PERIOD_PRESET_ORDER.map(preset => (
          <CheckboxRow
            key={preset}
            checked={activePreset === preset}
            onToggle={() => handlePreset(preset)}
            label={presetLabels[preset]}
            style={styles.presetCell}
          />
        ))}
      </View>

      <Text style={[styles.hint, { color: c.textSecondary, fontSize: fs(12) }]}>
        {selecting === PICKING_PHASE.start ? labels.cal_select_start : labels.cal_select_end}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, marginTop: 12, marginBottom: 12 },
  presetCell: { width: '45%', paddingVertical: 2 },
  hint: { marginTop: 8, marginBottom: 8, paddingHorizontal: 8, fontWeight: '500', textAlign: 'left' },
});
