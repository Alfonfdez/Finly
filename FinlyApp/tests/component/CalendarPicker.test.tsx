import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import CalendarPicker from '../../src/components/CalendarPicker';
import { PERIODS, type Period } from '../../src/constants/types';
import { setLanguage } from '../../src/i18n';
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
    setLanguage('en');
    setConfig({ language: 'en' });
  });

  it('shows a calendar icon in the period button', async () => {
    const { view } = await renderPicker(PERIODS.day, dayOffset(0));
    expect(view.getByText('calendar-outline', { includeHiddenElements: true })).toBeTruthy();
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

  it('shows the custom range on two centred lines', async () => {
    const view = await render(
      <CalendarPicker
        period={PERIODS.custom}
        date={new Date(2026, 9, 17)}
        onDateChange={vi.fn()}
        rangeStart={new Date(2026, 0, 1)}
        rangeEnd={new Date(2026, 9, 17)}
      />,
    );

    const start = view.getByText('From 1 January');
    const end = view.getByText('to 17 October 2026');
    expect(StyleSheet.flatten(start.props.style).textAlign).toBe('center');
    expect(StyleSheet.flatten(end.props.style).textAlign).toBe('center');
  });

  it('localises the custom range with capitalised months', async () => {
    setLanguage('es');
    setConfig({ language: 'es' });
    const view = await render(
      <CalendarPicker
        period={PERIODS.custom}
        date={new Date(2026, 9, 22)}
        onDateChange={vi.fn()}
        rangeStart={new Date(2026, 0, 1)}
        rangeEnd={new Date(2026, 9, 22)}
      />,
    );

    expect(view.getByText('Desde el 1 de Enero')).toBeTruthy();
    expect(view.getByText('hasta el 22 de Octubre de 2026')).toBeTruthy();
  });

  it('applies Catalan contractions in the custom range', async () => {
    setLanguage('ca');
    setConfig({ language: 'ca' });
    const view = await render(
      <CalendarPicker
        period={PERIODS.custom}
        date={new Date(2026, 9, 22)}
        onDateChange={vi.fn()}
        rangeStart={new Date(2026, 0, 1)}
        rangeEnd={new Date(2026, 9, 22)}
      />,
    );

    expect(view.getByText('Des de l\'1 de Gener')).toBeTruthy();
    expect(view.getByText('fins al 22 d\'Octubre de 2026')).toBeTruthy();
  });

  it('adds the start year only when the custom range crosses a year boundary', async () => {
    const view = await render(
      <CalendarPicker
        period={PERIODS.custom}
        date={new Date(2026, 0, 5)}
        onDateChange={vi.fn()}
        rangeStart={new Date(2025, 11, 20)}
        rangeEnd={new Date(2026, 0, 5)}
      />,
    );

    expect(view.getByText('From 20 December 2025')).toBeTruthy();
    expect(view.getByText('to 5 January 2026')).toBeTruthy();
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
