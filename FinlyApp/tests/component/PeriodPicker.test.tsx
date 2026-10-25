import { useState } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import PeriodPicker from '../../src/components/calendars/PeriodPicker';
import { setLanguage } from '../../src/i18n';

const TODAY = new Date(2026, 9, 23, 12, 0, 0);

interface HarnessProps {
  initialStart: Date;
  initialEnd: Date;
  onChange?: (start: Date, end: Date) => void;
}

function Harness({ initialStart, initialEnd, onChange }: HarnessProps) {
  const [range, setRange] = useState({ start: initialStart, end: initialEnd });
  return (
    <PeriodPicker
      tempStart={range.start}
      tempEnd={range.end}
      onTempRangeChange={(start, end) => {
        setRange({ start, end });
        onChange?.(start, end);
      }}
    />
  );
}

async function renderPicker(initialStart = new Date(2026, 0, 2), initialEnd = new Date(2026, 9, 22), onChange?: (start: Date, end: Date) => void) {
  const view = await render(
    <Harness initialStart={initialStart} initialEnd={initialEnd} onChange={onChange} />,
  );
  return view;
}

function checkbox(view: Awaited<ReturnType<typeof render>>, label: string) {
  return view.getByRole('checkbox', { name: new RegExp(label) });
}

describe('PeriodPicker presets', () => {
  beforeEach(() => {
    resetStub();
    setLanguage('en');
    setConfig({ language: 'en' });
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('checks this year automatically when the range matches', async () => {
    const view = await renderPicker(new Date(2026, 0, 1), TODAY);
    expect(checkbox(view, 'This year').props.accessibilityState.checked).toBe(true);
  });

  it('selects a preset, keeps the calendar visible and checks the preset', async () => {
    const onChange = vi.fn();
    const view = await renderPicker(undefined, undefined, onChange);

    await fireEvent.press(view.getByText('30 days'));

    const [start, end] = onChange.mock.calls[0];
    expect(start).toEqual(new Date(2026, 8, 24));
    expect(end).toEqual(TODAY);
    expect(checkbox(view, '30 days').props.accessibilityState.checked).toBe(true);
    expect(view.getByLabelText('Previous month')).toBeTruthy();
    expect(view.getByText('Select start date')).toBeTruthy();
  });

  it('unchecks the preset after changing a date in the calendar', async () => {
    const view = await renderPicker(new Date(2026, 8, 24), TODAY);
    expect(checkbox(view, '30 days').props.accessibilityState.checked).toBe(true);

    await fireEvent.press(view.getByLabelText(/^5 October/));

    expect(checkbox(view, '30 days').props.accessibilityState.checked).toBe(false);
    expect(view.getByLabelText('Previous month')).toBeTruthy();
  });

  it('checks a preset after manually selecting the same range', async () => {
    vi.setSystemTime(new Date(2026, 0, 31, 12, 0, 0));
    const view = await renderPicker(new Date(2026, 0, 10), new Date(2026, 0, 20));

    await fireEvent.press(view.getByLabelText(/^2 January/));
    await fireEvent.press(view.getByLabelText(/^31 January/));

    expect(checkbox(view, '30 days').props.accessibilityState.checked).toBe(true);
  });

  it('starts a new range after the end date is selected', async () => {
    const onChange = vi.fn();
    const view = await renderPicker(undefined, undefined, onChange);

    await fireEvent.press(view.getByLabelText(/^5 October/));
    expect(view.getByText('Select end date')).toBeTruthy();

    await fireEvent.press(view.getByLabelText(/^10 October/));
    expect(view.getByText('Select start date')).toBeTruthy();

    await fireEvent.press(view.getByLabelText(/^20 October/));
    expect(view.getByText('Select end date')).toBeTruthy();

    const [lastStart, lastEnd] = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastStart).toEqual(new Date(2026, 9, 20));
    expect(lastEnd).toEqual(new Date(2026, 9, 20));
  });

  it('selects the 90-day and 12-month presets from today', async () => {
    const onChange = vi.fn();
    const view = await renderPicker(undefined, undefined, onChange);

    await fireEvent.press(view.getByText('90 days'));
    let [start, end] = onChange.mock.calls[0];
    expect(start).toEqual(new Date(2026, 6, 26));
    expect(end).toEqual(TODAY);

    await fireEvent.press(view.getByText('12 months'));
    [start, end] = onChange.mock.calls[1];
    expect(start).toEqual(new Date(2025, 9, 23));
    expect(end).toEqual(TODAY);
  });

  it('keeps an active preset checked when pressed again', async () => {
    const view = await renderPicker();

    await fireEvent.press(view.getByText('30 days'));
    expect(checkbox(view, '30 days').props.accessibilityState.checked).toBe(true);

    await fireEvent.press(view.getByText('30 days'));
    expect(checkbox(view, '30 days').props.accessibilityState.checked).toBe(true);
  });
});
