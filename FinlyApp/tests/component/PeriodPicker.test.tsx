import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import PeriodPicker from '../../src/components/calendars/PeriodPicker';
import { setLanguage } from '../../src/i18n';

const TODAY = new Date(2026, 9, 23, 12, 0, 0);

async function renderPicker() {
  const onTempRangeChange = vi.fn();
  const view = await render(
    <PeriodPicker
      tempStart={new Date(2026, 0, 1)}
      tempEnd={TODAY}
      onTempRangeChange={onTempRangeChange}
    />,
  );
  return { view, onTempRangeChange };
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

  it('selects this year and hides the manual picker', async () => {
    const { view, onTempRangeChange } = await renderPicker();

    expect(view.getByText('Select start date')).toBeTruthy();
    await fireEvent.press(view.getByText('This year'));

    expect(onTempRangeChange).toHaveBeenCalledTimes(1);
    const [start, end] = onTempRangeChange.mock.calls[0];
    expect(start).toEqual(new Date(2026, 0, 1));
    expect(end).toEqual(TODAY);
    expect(view.queryByText('Select start date')).toBeNull();
  });

  it('selects 30 days including today', async () => {
    const { view, onTempRangeChange } = await renderPicker();

    await fireEvent.press(view.getByText('30 days'));

    const [start, end] = onTempRangeChange.mock.calls[0];
    expect(start).toEqual(new Date(2026, 8, 24));
    expect(end).toEqual(TODAY);
  });

  it('selects 90 days including today', async () => {
    const { view, onTempRangeChange } = await renderPicker();

    await fireEvent.press(view.getByText('90 days'));

    const [start, end] = onTempRangeChange.mock.calls[0];
    expect(start).toEqual(new Date(2026, 6, 26));
    expect(end).toEqual(TODAY);
  });

  it('selects the last 12 calendar months', async () => {
    const { view, onTempRangeChange } = await renderPicker();

    await fireEvent.press(view.getByText('12 months'));

    const [start, end] = onTempRangeChange.mock.calls[0];
    expect(end).toEqual(TODAY);
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(9);
    expect(start.getDate()).toBe(23);
  });

  it('keeps one preset active and unchecks it when pressed again', async () => {
    const { view, onTempRangeChange } = await renderPicker();

    await fireEvent.press(view.getByText('30 days'));
    await fireEvent.press(view.getByText('90 days'));
    expect(onTempRangeChange).toHaveBeenCalledTimes(2);
    expect(view.queryByText('Select start date')).toBeNull();

    await fireEvent.press(view.getByText('90 days'));
    expect(view.getByText('Select start date')).toBeTruthy();
  });
});
