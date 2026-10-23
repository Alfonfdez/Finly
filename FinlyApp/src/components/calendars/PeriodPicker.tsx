import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DayPicker from './DayPicker';
import CheckboxRow from '../settings/CheckboxRow';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
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
}

export default function PeriodPicker({ tempStart, tempEnd, onTempRangeChange }: Props) {
  const [selecting, setSelecting] = useState<PickingPhase>(PICKING_PHASE.start);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const today = useMemo(() => new Date(), []);
  const activePreset = findPresetForRange(tempStart, tempEnd, today);

  const handlePreset = useCallback((preset: PeriodPreset) => {
    onTempRangeChange(presetStart(preset, today), today);
    setSelecting(PICKING_PHASE.start);
  }, [onTempRangeChange, today]);

  const handleDayPress = useCallback((d: Date) => {
    if (selecting === PICKING_PHASE.start) {
      onTempRangeChange(d, d);
      setSelecting(PICKING_PHASE.end);
    } else {
      const start = tempStart < d ? tempStart : d;
      const end = tempStart < d ? d : tempStart;
      onTempRangeChange(start, end);
      setSelecting(PICKING_PHASE.start);
    }
  }, [selecting, tempStart, onTempRangeChange]);

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
        <CheckboxRow
          checked={activePreset === PERIOD_PRESETS.thisYear}
          onToggle={() => handlePreset(PERIOD_PRESETS.thisYear)}
          label={labels.cal_this_year}
          style={styles.presetCell}
        />
        <CheckboxRow
          checked={activePreset === PERIOD_PRESETS.last12Months}
          onToggle={() => handlePreset(PERIOD_PRESETS.last12Months)}
          label={labels.cal_12_months}
          style={styles.presetCell}
        />
        <CheckboxRow
          checked={activePreset === PERIOD_PRESETS.last30Days}
          onToggle={() => handlePreset(PERIOD_PRESETS.last30Days)}
          label={labels.cal_30_days}
          style={styles.presetCell}
        />
        <CheckboxRow
          checked={activePreset === PERIOD_PRESETS.last90Days}
          onToggle={() => handlePreset(PERIOD_PRESETS.last90Days)}
          label={labels.cal_90_days}
          style={styles.presetCell}
        />
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
