import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import CalendarModal from '../../src/components/CalendarModal';
import { PERIODS } from '../../src/constants/types';
import { t } from '../../src/i18n';
import { formatPeriodText } from '../../src/utils/formatters';

// The day picker disables future days by default, so the fixtures live in the
// previous month (always in the past, and always the same month for the grid).
const now = new Date();
const base = new Date(now.getFullYear(), now.getMonth() - 1, 15);
const picked = new Date(base.getFullYear(), base.getMonth(), 10);
const labels = t();
const baseLabel = `${base.getDate()} ${labels.months[base.getMonth()]}`;
const pickedLabel = `${picked.getDate()} ${labels.months[picked.getMonth()]}`;

describe('CalendarModal', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('shows the day title and its period subtitle, and confirms the given date', async () => {
    const onSelectDate = vi.fn();
    const onClose = vi.fn();
    const view = await render(
      <CalendarModal
        visible
        period={PERIODS.day}
        date={base}
        onSelectDate={onSelectDate}
        onClose={onClose}
      />,
    );

    expect(view.getByText(labels.cal_select_day)).toBeTruthy();
    expect(view.getByText(formatPeriodText(PERIODS.day, base, labels.months))).toBeTruthy();

    await fireEvent.press(view.getByText(labels.cal_ok));
    expect(onSelectDate).toHaveBeenCalledWith(base);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows week start and end on separate lines with both years', async () => {
    const week = new Date(2026, 6, 27);
    const view = await render(
      <CalendarModal
        visible
        period={PERIODS.week}
        date={week}
        onSelectDate={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(view.getByText('27 July 2026')).toBeTruthy();
    expect(view.getByText('2 August 2026')).toBeTruthy();
    expect(view.getByLabelText('27 Jul – 2 Aug')).toBeTruthy();
  });

  it('labels year-page navigation for screen readers', async () => {
    const view = await render(
      <CalendarModal
        visible
        period={PERIODS.year}
        date={base}
        onSelectDate={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(view.getByLabelText('Previous years')).toBeTruthy();
    expect(view.getByLabelText('Next years')).toBeTruthy();
  });

  it('confirms a day picked in the grid', async () => {
    const onSelectDate = vi.fn();
    const view = await render(
      <CalendarModal
        visible
        period={PERIODS.day}
        date={base}
        onSelectDate={onSelectDate}
        onClose={vi.fn()}
      />,
    );

    expect(view.getByLabelText(`${baseLabel}, selected`)).toBeTruthy();
    await fireEvent.press(view.getByLabelText(pickedLabel));
    expect(view.getByLabelText(`${pickedLabel}, selected`)).toBeTruthy();
    await fireEvent.press(view.getByText(labels.cal_ok));

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    const selected = onSelectDate.mock.calls[0][0] as Date;
    expect([selected.getFullYear(), selected.getMonth(), selected.getDate()])
      .toEqual([picked.getFullYear(), picked.getMonth(), picked.getDate()]);
  });

  it('cancels without selecting', async () => {
    const onSelectDate = vi.fn();
    const onClose = vi.fn();
    const view = await render(
      <CalendarModal
        visible
        period={PERIODS.day}
        date={base}
        onSelectDate={onSelectDate}
        onClose={onClose}
      />,
    );

    await fireEvent.press(view.getByLabelText(pickedLabel));
    await fireEvent.press(view.getByText(labels.cancel));

    expect(onSelectDate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('confirms the custom range through onSelectRange', async () => {
    const rangeStart = new Date(base.getFullYear() - 1, 0, 1);
    const rangeEnd = base;
    const onSelectRange = vi.fn();
    const view = await render(
      <CalendarModal
        visible
        period={PERIODS.custom}
        date={rangeEnd}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onSelectDate={vi.fn()}
        onSelectRange={onSelectRange}
        onClose={vi.fn()}
      />,
    );

    expect(view.getByText(labels.cal_select_period)).toBeTruthy();
    await fireEvent.press(view.getByText(labels.cal_ok));

    expect(onSelectRange).toHaveBeenCalledWith(rangeStart, rangeEnd);
  });

  it('forwards minDate to the day grid', async () => {
    const onSelectDate = vi.fn();
    const minDate = new Date(base.getFullYear(), base.getMonth(), 10);
    const view = await render(
      <CalendarModal
        visible
        period={PERIODS.day}
        date={base}
        minDate={minDate}
        onSelectDate={onSelectDate}
        onClose={vi.fn()}
      />,
    );

    await fireEvent.press(view.getByLabelText(`5 ${labels.months[base.getMonth()]}`));
    expect(onSelectDate).not.toHaveBeenCalled();
    await fireEvent.press(view.getByLabelText(`12 ${labels.months[base.getMonth()]}`));
    await fireEvent.press(view.getByText(labels.cal_ok));
    expect(onSelectDate).toHaveBeenCalledTimes(1);
  });

  it('disables OK while the custom range is waiting for its end date', async () => {
    const onSelectRange = vi.fn();
    const customDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const customDayLabel = `${customDay.getDate()} ${labels.months[customDay.getMonth()]}`;
    const view = await render(
      <CalendarModal
        visible
        period={PERIODS.custom}
        date={base}
        rangeStart={base}
        rangeEnd={base}
        onSelectDate={vi.fn()}
        onSelectRange={onSelectRange}
        onClose={vi.fn()}
      />,
    );

    const ok = view.getByRole('button', { name: labels.cal_ok });
    expect(ok).toBeEnabled();
    await fireEvent.press(view.getByLabelText(customDayLabel));
    expect(ok).toBeDisabled();

    await fireEvent.press(view.getByLabelText(`${customDayLabel}, selected`));
    expect(ok).toBeEnabled();
    await fireEvent.press(ok);
    expect(onSelectRange).toHaveBeenCalledTimes(1);
  });

  it('syncs the Month grid when the date changes while closed', async () => {
    const onSelectDate = vi.fn();
    const props = { period: PERIODS.month, onSelectDate, onClose: vi.fn() };
    const view = await render(<CalendarModal {...props} date={new Date(2026, 0, 15)} visible={false} />);

    await view.rerender(<CalendarModal {...props} date={new Date(2025, 11, 15)} visible={false} />);
    await view.rerender(<CalendarModal {...props} date={new Date(2025, 11, 15)} visible />);

    await waitFor(() => expect(view.getByText('December 2025')).toBeTruthy());
  });

  it('syncs the Week grid when the date changes while closed', async () => {
    const onSelectDate = vi.fn();
    const props = { period: PERIODS.week, onSelectDate, onClose: vi.fn() };
    const view = await render(<CalendarModal {...props} date={new Date(2026, 0, 5)} visible={false} />);

    await view.rerender(<CalendarModal {...props} date={new Date(2025, 11, 29)} visible={false} />);
    await view.rerender(<CalendarModal {...props} date={new Date(2025, 11, 29)} visible />);

    await waitFor(() => expect(view.getByText('December 2025')).toBeTruthy());
  });

  it('syncs the Year page when the date changes while closed', async () => {
    const onSelectDate = vi.fn();
    const props = { period: PERIODS.year, onSelectDate, onClose: vi.fn() };
    const view = await render(<CalendarModal {...props} date={new Date(2026, 5, 15)} visible={false} />);

    await view.rerender(<CalendarModal {...props} date={new Date(2020, 5, 15)} visible={false} />);
    await view.rerender(<CalendarModal {...props} date={new Date(2020, 5, 15)} visible />);

    await waitFor(() => expect(view.getByText('2020 - 2031')).toBeTruthy());
  });

  it('resets a pending change when it is reopened', async () => {
    const onSelectDate = vi.fn();
    const props = {
      period: PERIODS.day,
      date: base,
      onSelectDate,
      onClose: vi.fn(),
    };
    const view = await render(<CalendarModal {...props} visible />);

    await fireEvent.press(view.getByLabelText(pickedLabel));
    expect(view.getByLabelText(`${pickedLabel}, selected`)).toBeTruthy();

    await view.rerender(<CalendarModal {...props} visible={false} />);
    await view.rerender(<CalendarModal {...props} visible />);

    await fireEvent.press(view.getByText(labels.cal_ok));
    expect(onSelectDate).toHaveBeenCalledWith(base);
  });
});
