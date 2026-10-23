import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DayPicker from './DayPicker';
import CheckboxRow from '../settings/CheckboxRow';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { calendarStyles } from './calendarStyles';
import { CONTROL_BORDER_RADIUS } from '../componentStyles';
import { formatDateRangeLines } from '../../utils/formatters';
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

interface Props {
  tempStart: Date;
  tempEnd: Date;
  onTempRangeChange: (start: Date, end: Date) => void;
}

export default function PeriodPicker({ tempStart, tempEnd, onTempRangeChange }: Props) {
  const [activePreset, setActivePreset] = useState<PeriodPreset | null>(null);
  const [selecting, setSelecting] = useState<PickingPhase>(PICKING_PHASE.start);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const months = labels.months;

  const today = useMemo(() => new Date(), []);

  const handlePreset = useCallback((preset: PeriodPreset) => {
    const next = activePreset === preset ? null : preset;
    setActivePreset(next);
    setSelecting(PICKING_PHASE.start);
    if (next) {
      onTempRangeChange(presetStart(next, today), today);
    }
  }, [activePreset, onTempRangeChange, today]);

  const handleDayPress = useCallback((d: Date) => {
    setActivePreset(null);
    if (selecting === PICKING_PHASE.start) {
      onTempRangeChange(d, d);
      setSelecting(PICKING_PHASE.end);
    } else {
      const start = tempStart < d ? tempStart : d;
      const end = tempStart < d ? d : tempStart;
      onTempRangeChange(start, end);
    }
  }, [selecting, tempStart, onTempRangeChange]);

  const rangeLines = formatDateRangeLines(
    tempStart,
    tempEnd,
    months,
    labels.cal_range_start,
    labels.cal_range_end,
  );
  const rangeText = !activePreset && selecting === PICKING_PHASE.end && tempStart.getTime() === tempEnd.getTime()
    ? `${labels.cal_range_start(tempStart.getDate(), months[tempStart.getMonth()])}\n${labels.cal_period_to_hint}`
    : `${rangeLines.start}\n${rangeLines.end}`;

  return (
    <View style={calendarStyles.container}>
      <Text style={[styles.title, { color: c.textSecondary, fontSize: fs(13) }]}>{rangeText}</Text>

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

      {!activePreset && (
        <View style={[styles.indicator, { backgroundColor: c.surface }]}>
          <Text style={[styles.indicatorText, { color: c.primary, fontSize: fs(13) }]}>
            {selecting === PICKING_PHASE.start ? labels.cal_select_start : labels.cal_select_end}
          </Text>
        </View>
      )}

      {!activePreset && (
        <DayPicker
          date={selecting === PICKING_PHASE.start ? tempStart : tempEnd}
          onSelect={handleDayPress}
          rangeStart={tempStart}
          rangeEnd={tempEnd}
          initialView={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 12, textAlign: 'center' },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, marginBottom: 12 },
  presetCell: { width: '45%', paddingVertical: 2 },
  indicator: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: CONTROL_BORDER_RADIUS, marginBottom: 8, alignItems: 'center' },
  indicatorText: { fontWeight: '600' },
});
