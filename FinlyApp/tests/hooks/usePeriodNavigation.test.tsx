import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { usePeriodNavigation } from '../../src/hooks/usePeriodNavigation';
import { PERIODS } from '../../src/constants/types';
import { buildAppMock, getAppStub, resetAppStub } from '../component/helpers/appStub';

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

describe('usePeriodNavigation', () => {
  afterEach(() => {
    resetAppStub();
  });

  it('handlePeriodChange calls changePeriod with the selected period', async () => {
    const openCalendar = vi.fn();
    const { result } = await renderHook(() => usePeriodNavigation(openCalendar));

    await act(() => result.current.handlePeriodChange(PERIODS.week));

    expect(getAppStub().changePeriod).toHaveBeenCalledWith(PERIODS.week);
    expect(openCalendar).not.toHaveBeenCalled();
  });

  it('handlePeriodChange opens the calendar for the custom period', async () => {
    const openCalendar = vi.fn();
    const { result } = await renderHook(() => usePeriodNavigation(openCalendar));

    await act(() => result.current.handlePeriodChange(PERIODS.custom));

    expect(getAppStub().changePeriod).toHaveBeenCalledWith(PERIODS.custom);
    expect(openCalendar).toHaveBeenCalledTimes(1);
  });

  it('handleRangeChange sets custom dates clamped to day boundaries', async () => {
    const start = new Date(2026, 5, 10, 9, 30);
    const end = new Date(2026, 5, 12, 18, 45);
    const { result } = await renderHook(() => usePeriodNavigation(() => {}));

    await act(() => result.current.handleRangeChange(start, end));

    const arg = getAppStub().setCustomDate.mock.calls[0][0];
    expect(arg.start.getHours()).toBe(0);
    expect(arg.start.getMinutes()).toBe(0);
    expect(arg.start.getDate()).toBe(10);
    expect(arg.end.getHours()).toBe(23);
    expect(arg.end.getMinutes()).toBe(59);
    expect(arg.end.getDate()).toBe(12);
  });
});
