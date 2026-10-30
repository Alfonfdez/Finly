import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { getConfigStub, resetStub, setConfig } from './helpers/configStub';
import { recurringCardColors, recurringCardErrorColors } from '../../src/components/componentStyles';
import RepeatSection from '../../src/components/RepeatSection';
import { TEST_IDS } from '../../src/constants/testIds';
import { REPEAT_NAME_MAX_LENGTH } from '../../src/constants/types';

// Pin "today" so the summary info block is deterministic.
vi.mock('../../src/utils/recurrence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/recurrence')>();
  return { ...actual, todayDateOnly: () => '2026-10-06' };
});

type Props = ComponentProps<typeof RepeatSection>;

function renderSection(overrides: Partial<Props> = {}) {
  const props: Props = {
    frequency: 'monthly',
    onChangeFrequency: vi.fn(),
    interval: 1,
    onChangeInterval: vi.fn(),
    startDay: new Date(2026, 1, 2),
    endDate: null,
    onOpenEndDate: vi.fn(),
    onClearEndDate: vi.fn(),
    name: 'Rent',
    onChangeName: vi.fn(),
    nameError: null,
    ...overrides,
  };
  return { props, view: render(<RepeatSection {...props} />) };
}

describe('RepeatSection', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('shows the frequency, interval, end date and summary when enabled', async () => {
    const { view } = renderSection();
    const v = await view;
    expect(v.getByText('Daily')).toBeTruthy();
    expect(v.getByText('Weekly')).toBeTruthy();
    expect(v.getByText('Monthly')).toBeTruthy();
    expect(v.getByText('Yearly')).toBeTruthy();
    expect(v.getByText('No end date')).toBeTruthy();
    expect(v.getByText('Every month on day 2')).toBeTruthy();
  });

  it('changes the frequency on chip press', async () => {
    const { props, view } = renderSection();
    await fireEvent.press((await view).getByText('Weekly'));
    expect(props.onChangeFrequency).toHaveBeenCalledWith('weekly');
  });

  it('reports focus and blur of the name field', async () => {
    const onNameFocus = vi.fn();
    const onNameBlur = vi.fn();
    const { view } = renderSection({ onNameFocus, onNameBlur });
    const input = (await view).getByTestId(TEST_IDS.repeatName);

    await act(async () => { fireEvent(input, 'focus'); });
    expect(onNameFocus).toHaveBeenCalledTimes(1);
    await act(async () => { fireEvent(input, 'blur'); });
    expect(onNameBlur).toHaveBeenCalledTimes(1);
  });

  it('shows the name character counter', async () => {
    const { view } = renderSection();

    expect((await view).getByText(`4/${REPEAT_NAME_MAX_LENGTH}`)).toBeTruthy();
  });

  it('turns the name counter red and bold at the limit', async () => {
    const { view } = renderSection({ name: 'x'.repeat(REPEAT_NAME_MAX_LENGTH) });
    const counter = (await view).getByText(`${REPEAT_NAME_MAX_LENGTH}/${REPEAT_NAME_MAX_LENGTH}`);
    const style = StyleSheet.flatten(counter.props.style) as { color?: string; fontWeight?: string };

    expect(style.color).toBe('#F87171');
    expect(style.fontWeight).toBe('700');
  });

  it('keeps a name already longer than the limit intact and flags the counter', async () => {
    const longName = 'x'.repeat(45);
    const { view } = renderSection({ name: longName });
    const v = await view;

    expect(v.getByText(`45/${REPEAT_NAME_MAX_LENGTH}`)).toBeTruthy();
    expect(v.getByTestId(TEST_IDS.repeatName).props.maxLength).toBe(45);
  });

  it('increments and decrements the interval', async () => {
    const { props, view } = renderSection({ interval: 3 });
    const v = await view;
    await fireEvent.press(v.getByLabelText('Increase'));
    expect(props.onChangeInterval).toHaveBeenCalledWith(4);
    await fireEvent.press(v.getByLabelText('Decrease'));
    expect(props.onChangeInterval).toHaveBeenCalledWith(2);
  });

  it('opens the end-date picker and shows the selected date', async () => {
    const { props, view } = renderSection({ endDate: new Date(2026, 11, 31) });
    const v = await view;
    expect(v.getByText('December 31, 2026')).toBeTruthy();
    await fireEvent.press(v.getByText('December 31, 2026'));
    expect(props.onOpenEndDate).toHaveBeenCalledTimes(1);
  });

  it('renders the end-date field with a calendar icon that opens the picker', async () => {
    const { props, view } = renderSection();
    const v = await view;
    const field = v.getByTestId(TEST_IDS.repeatEndDate);
    expect(field).toBeTruthy();
    expect(v.getByText('calendar-outline')).toBeTruthy();
    await fireEvent.press(field);
    expect(props.onOpenEndDate).toHaveBeenCalledTimes(1);
  });

  it('keeps the clear slot present even without an end date', async () => {
    const { view } = renderSection({ endDate: null });
    const v = await view;
    expect(v.getByText('close-circle', { includeHiddenElements: true })).toBeTruthy();
  });

  it('clears the end date when the clear button is pressed', async () => {
    const { props, view } = renderSection({ endDate: new Date(2026, 11, 31) });
    const v = await view;
    await fireEvent.press(v.getByText('close-circle'));
    expect(props.onClearEndDate).toHaveBeenCalledTimes(1);
  });

  it('always renders the options block and the title', async () => {
    const { view } = renderSection();
    const v = await view;
    expect(v.getByText('Recurring')).toBeTruthy();
    expect(v.getByTestId(TEST_IDS.repeatOptions)).toBeTruthy();
    expect(v.queryByRole('switch')).toBeNull();
  });

  it('renders the recurring name field with its value', async () => {
    const { view } = renderSection({ name: 'Rent' });
    expect((await view).getByDisplayValue('Rent')).toBeTruthy();
  });

  it('marks the name field with a red border when there is an error', async () => {
    const { view } = renderSection({ name: '', nameError: 'taken' });
    const input = (await view).getByTestId(TEST_IDS.repeatName);
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#F87171');
  });

  it('always shows the first transaction date', async () => {
    const view = await renderSection({ frequency: 'monthly', startDay: new Date(2026, 9, 6) });
    expect((await view.view).getByText('First transaction: October 6, 2026')).toBeTruthy();
  });

  it('summarizes what will be created on save', async () => {
    const view = await renderSection({ frequency: 'monthly', startDay: new Date(2026, 9, 6) });
    expect((await view.view).getByText('Summary')).toBeTruthy();
    expect((await view.view).getByText('1 transaction will be created')).toBeTruthy();
  });

  it('reports nothing created when the first occurrence is in the future', async () => {
    const view = await renderSection({ frequency: 'monthly', startDay: new Date(2026, 10, 6) });
    expect((await view.view).getByText('No transactions will be created now')).toBeTruthy();
  });

  it('applies a denser schedule from today, not from the stale cursor', async () => {
    // Monthly rule (cursor 1 Nov) densified to daily: the change takes effect today.
    const densified = await renderSection({
      frequency: 'daily',
      ruleNextDue: '2026-11-01',
      startDay: new Date(2026, 8, 1),
      previousSchedule: { frequency: 'monthly', interval: 1, day_of_month: 1, start_date: '2026-09-01', end_date: null },
    });
    expect((await densified.view).getByText('Next: October 6, 2026')).toBeTruthy();
    expect((await densified.view).getByText('1 transaction will be created')).toBeTruthy();
  });

  it('does not re-count an already-generated today when the schedule is unchanged', async () => {
    const unchanged = await renderSection({
      frequency: 'daily',
      ruleNextDue: '2026-10-07',
      startDay: new Date(2026, 9, 6),
      previousSchedule: { frequency: 'daily', interval: 1, start_date: '2026-10-06', end_date: null },
    });
    expect((await unchanged.view).getByText('Next: October 7, 2026')).toBeTruthy();
    expect((await unchanged.view).getByText('No transactions will be created now')).toBeTruthy();
  });

  it('records the skipped window when a fresh rule start moves into the past', async () => {
    const movedPast = await renderSection({
      frequency: 'daily',
      ruleNextDue: '2026-10-30',
      ruleUnmaterialized: true,
      startDay: new Date(2026, 9, 1),
    });
    expect((await movedPast.view).getByText('Next: October 6, 2026')).toBeTruthy();
    expect((await movedPast.view).getByText('5 occurrences will be skipped')).toBeTruthy();
  });

  it('hints that past occurrences are not recreated when the start moves earlier', async () => {
    const withHint = await renderSection({ ruleNextDue: '2026-11-02', ruleStartMovedEarlier: true });
    expect((await withHint.view).getByText('Changing the start date doesn\'t add earlier transactions.')).toBeTruthy();

    const withoutHint = await renderSection({ ruleNextDue: '2026-11-02' });
    expect((await withoutHint.view).queryByText('Changing the start date doesn\'t add earlier transactions.')).toBeNull();
  });

  it('offers the last-day checkbox only on a month-end date where the choice matters', async () => {
    // Feb 28 of a non-leap year and 30 Apr are the ambiguous month-ends.
    const monthlyFeb28 = await renderSection({ frequency: 'monthly', startDay: new Date(2027, 1, 28) });
    expect((await monthlyFeb28.view).getByText('Last day of the month')).toBeTruthy();

    const monthlyApr30 = await renderSection({ frequency: 'monthly', startDay: new Date(2026, 3, 30) });
    expect((await monthlyApr30.view).getByText('Last day of the month')).toBeTruthy();
  });

  it('hides the last-day checkbox on an ordinary day or an unambiguous month-end', async () => {
    const monthly17 = await renderSection({ frequency: 'monthly', startDay: new Date(2026, 0, 17) });
    expect((await monthly17.view).queryByText('Last day of the month')).toBeNull();

    // Monthly on the 31st already clamps to the last day of every month.
    const monthly31 = await renderSection({ frequency: 'monthly', startDay: new Date(2026, 0, 31) });
    expect((await monthly31.view).queryByText('Last day of the month')).toBeNull();

    // Feb 28 of a leap year is not that month's last day.
    const monthlyFeb28Leap = await renderSection({ frequency: 'monthly', startDay: new Date(2028, 1, 28) });
    expect((await monthlyFeb28Leap.view).queryByText('Last day of the month')).toBeNull();

    // Yearly: only 28 February of a non-leap year is ambiguous.
    const yearlyApr30 = await renderSection({ frequency: 'yearly', startDay: new Date(2026, 3, 30) });
    expect((await yearlyApr30.view).queryByText('Last day of the month')).toBeNull();

    const yearlyFeb28Leap = await renderSection({ frequency: 'yearly', startDay: new Date(2028, 1, 28) });
    expect((await yearlyFeb28Leap.view).queryByText('Last day of the month')).toBeNull();

    const weekly = await renderSection({ frequency: 'weekly', startDay: new Date(2027, 1, 28) });
    expect((await weekly.view).queryByText('Last day of the month')).toBeNull();
  });

  it('toggles last day', async () => {
    const { props, view } = renderSection({
      frequency: 'monthly',
      startDay: new Date(2027, 1, 28),
      lastDay: false,
      onChangeLastDay: vi.fn(),
    });
    await fireEvent.press((await view).getByText('Last day of the month'));
    expect(props.onChangeLastDay).toHaveBeenCalledWith(true);
  });

  it('summarizes a last-day rule from the last day of the start month', async () => {
    const view = await renderSection({ frequency: 'monthly', startDay: new Date(2026, 0, 15), lastDay: true });
    const v = await view.view;
    expect(v.getByText('Every month on the last day')).toBeTruthy();
    expect(v.getByText('First transaction: January 31, 2026')).toBeTruthy();
  });

  it('lists the month-by-month days when the occurrence day varies', async () => {
    const view = await renderSection({ frequency: 'monthly', startDay: new Date(2026, 0, 31) });
    expect((await view.view).getByText(
      '31 in Jan, Mar, May, Jul, Aug, Oct, Dec · 30 in Apr, Jun, Sep, Nov · 28 in Feb (29 in leap years)',
    )).toBeTruthy();
  });

  it('keeps the primary tint while the rule is allowed', async () => {
    const { view } = renderSection();
    const v = await view;
    const style = StyleSheet.flatten(v.getByTestId(TEST_IDS.repeatOptions).props.style);
    const c = getConfigStub().activeColors;
    expect(style.borderColor).toBe(recurringCardColors(c).borderColor);
    expect(style.backgroundColor).toBe(recurringCardColors(c).backgroundColor);
  });

  it('turns the card red while the rule exceeds the catch-up limit', async () => {
    const { view } = renderSection({ tooMany: true });
    const v = await view;
    const style = StyleSheet.flatten(v.getByTestId(TEST_IDS.repeatOptions).props.style);
    const c = getConfigStub().activeColors;
    expect(style.borderColor).toBe(recurringCardErrorColors(c).borderColor);
    expect(style.backgroundColor).toBe(recurringCardErrorColors(c).backgroundColor);
  });

  it('says nothing is created while the rule is paused', async () => {
    const paused = await renderSection({
      frequency: 'monthly',
      startDay: new Date(2026, 0, 2),
      ruleNextDue: '2026-09-02',
      ruleActive: false,
      scope: 'futureAndPast',
    });
    expect((await paused.view).getByText('This rule is paused: no transactions are created until you resume it.')).toBeTruthy();
  });
});
