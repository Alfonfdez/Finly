import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import DayPicker from '../../src/components/calendars/DayPicker';

// A fixed far-future month keeps these assertions independent of the real clock.
const JUNE_2099 = new Date(2099, 5, 15);

describe('DayPicker year navigation + bounds', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('defaults to no future dates and disables the forward year arrow', async () => {
    const onSelect = vi.fn();
    const view = await render(<DayPicker date={JUNE_2099} onSelect={onSelect} />);

    expect(view.getByText('2099')).toBeTruthy();

    // Future day is not selectable.
    await fireEvent.press(view.getByLabelText('20 June'));
    expect(onSelect).not.toHaveBeenCalled();

    // Forward year arrow is disabled → the displayed year does not change.
    await fireEvent.press(view.getByLabelText('Next year'));
    expect(view.getByText('2099')).toBeTruthy();
  });

  it('allows future years and days when maxDate is null', async () => {
    const onSelect = vi.fn();
    const view = await render(<DayPicker date={JUNE_2099} onSelect={onSelect} maxDate={null} />);

    await fireEvent.press(view.getByLabelText('20 June'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].getFullYear()).toBe(2099);

    // Forward year arrow is enabled → year advances.
    await fireEvent.press(view.getByLabelText('Next year'));
    expect(view.getByText('2100')).toBeTruthy();
  });

  it('follows the date prop when it changes (reopening on a different month)', async () => {
    const view = await render(<DayPicker date={new Date(2099, 8, 2)} onSelect={() => {}} maxDate={null} />);
    expect(view.getByText('September 2099')).toBeTruthy();

    await view.rerender(<DayPicker date={new Date(2099, 9, 2)} onSelect={() => {}} maxDate={null} />);
    expect(view.getByText('October 2099')).toBeTruthy();
  });
});
