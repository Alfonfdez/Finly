import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import WeekPicker from '../../src/components/calendars/WeekPicker';
import { resetStub, setConfig } from './helpers/configStub';
import { TEST_IDS } from '../../src/constants/testIds';

describe('WeekPicker', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en', firstDayOfWeek: 1 });
  });

  it('keeps six fixed slots and omits a week that belongs only to the next month', async () => {
    const view = await render(<WeekPicker date={new Date(2026, 4, 15)} onSelect={vi.fn()} />);

    expect(view.getAllByTestId(TEST_IDS.weekPickerRow)).toHaveLength(5);
    expect(view.getAllByTestId(TEST_IDS.weekPickerEmptyRow, { includeHiddenElements: true })).toHaveLength(1);
    expect(view.getByLabelText(/27 Apr .* 3 May/)).toBeTruthy();
    expect(view.queryByLabelText(/1 Jun .* 7 Jun/)).toBeNull();
  });

  it('keeps two blank slots for a four-week month', async () => {
    const view = await render(<WeekPicker date={new Date(2021, 1, 15)} onSelect={vi.fn()} />);

    expect(view.getAllByTestId(TEST_IDS.weekPickerRow)).toHaveLength(4);
    expect(view.getAllByTestId(TEST_IDS.weekPickerEmptyRow, { includeHiddenElements: true })).toHaveLength(2);
    expect(view.queryByLabelText(/1 Mar .* 7 Mar/)).toBeNull();
  });

  it('shows all six rows when every week contains the active month', async () => {
    const view = await render(<WeekPicker date={new Date(2026, 7, 15)} onSelect={vi.fn()} />);

    expect(view.getAllByTestId(TEST_IDS.weekPickerRow)).toHaveLength(6);
    expect(view.queryAllByTestId(TEST_IDS.weekPickerEmptyRow, { includeHiddenElements: true })).toHaveLength(0);
  });

  it('does not change the visible month when a shared week is selected', async () => {
    const onSelect = vi.fn();
    const view = await render(<WeekPicker date={new Date(2026, 9, 15)} onSelect={onSelect} />);

    await fireEvent.press(view.getByLabelText(/28 Sep .* 4 Oct/));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].getMonth()).toBe(8);

    await view.rerender(<WeekPicker date={new Date(2026, 8, 28)} onSelect={onSelect} />);
    expect(view.getByText('October 2026')).toBeTruthy();
  });

  it('does not go before January 1900', async () => {
    const view = await render(<WeekPicker date={new Date(1900, 0, 1)} onSelect={vi.fn()} />);

    await fireEvent.press(view.getByLabelText('Previous year'));

    expect(view.getByText('1900')).toBeTruthy();
  });
});
