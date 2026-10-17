import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import CalendarPicker from '../../src/components/CalendarPicker';
import { PERIODS, type Period } from '../../src/constants/types';
import { formatDate } from '../../src/utils/formatters';

function dayOffset(offset: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

function iso(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function lastChange(fn: ReturnType<typeof vi.fn>): Date {
  return fn.mock.calls[fn.mock.calls.length - 1][0] as Date;
}

async function renderPicker(period: Period, date: Date) {
  const onDateChange = vi.fn();
  const view = await render(
    <CalendarPicker period={period} date={date} onDateChange={onDateChange} />,
  );
  return { view, onDateChange };
}

describe('CalendarPicker fast arrows', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('shows only the previous arrow on the current day', async () => {
    const { view } = await renderPicker(PERIODS.day, dayOffset(0));

    expect(view.getByLabelText('Previous period')).toBeTruthy();
    expect(view.queryByLabelText('Next period')).toBeNull();
    expect(view.queryByLabelText('Go to the current period')).toBeNull();
  });

  it('shows the next arrow but no jump on the previous day', async () => {
    const { view } = await renderPicker(PERIODS.day, dayOffset(-1));

    expect(view.getByLabelText('Next period')).toBeTruthy();
    expect(view.queryByLabelText('Go to the current period')).toBeNull();
  });

  it('shows the jump-to-current arrow from two days back', async () => {
    const { view } = await renderPicker(PERIODS.day, dayOffset(-2));

    expect(view.getByLabelText('Next period')).toBeTruthy();
    expect(view.getByLabelText('Go to the current period')).toBeTruthy();
  });

  it('steps back, forward and jumps to the current period', async () => {
    const { view, onDateChange } = await renderPicker(PERIODS.day, dayOffset(-2));

    await fireEvent.press(view.getByLabelText('Previous period'));
    expect(iso(lastChange(onDateChange))).toBe(iso(dayOffset(-3)));

    await fireEvent.press(view.getByLabelText('Next period'));
    expect(iso(lastChange(onDateChange))).toBe(iso(dayOffset(-1)));

    await fireEvent.press(view.getByLabelText('Go to the current period'));
    expect(iso(lastChange(onDateChange))).toBe(iso(dayOffset(0)));
  });

  it('renders no arrows for the custom period', async () => {
    const { view } = await renderPicker(PERIODS.custom, new Date());

    expect(view.queryByLabelText('Previous period')).toBeNull();
    expect(view.queryByLabelText('Next period')).toBeNull();
    expect(view.queryByLabelText('Go to the current period')).toBeNull();
  });

  it('keeps the period box opening the calendar', async () => {
    const onOpen = vi.fn();
    const today = dayOffset(0);
    const view = await render(
      <CalendarPicker period={PERIODS.day} date={today} onDateChange={vi.fn()} onOpen={onOpen} />,
    );

    await fireEvent.press(view.getByText(formatDate(today)));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
