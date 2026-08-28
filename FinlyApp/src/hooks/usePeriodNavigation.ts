import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { PERIODS, type Period } from '../constants/types';
import { startOfDay, endOfDay } from '../utils/formatters';

export function usePeriodNavigation(openCalendar: () => void) {
  const { changePeriod, setCustomDate } = useApp();

  const handlePeriodChange = useCallback((period: Period) => {
    changePeriod(period);
    if (period === PERIODS.custom) openCalendar();
  }, [changePeriod, openCalendar]);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setCustomDate({ start: startOfDay(start), end: endOfDay(end) });
  }, [setCustomDate]);

  return { handlePeriodChange, handleRangeChange };
}
