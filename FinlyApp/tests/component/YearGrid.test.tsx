import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import YearGrid from '../../src/components/calendars/YearGrid';
import { resetStub, setConfig } from './helpers/configStub';
import { CALENDAR_MIN_YEAR, YEARS_PER_PAGE } from '../../src/constants/calendar';

describe('YearGrid', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('uses fixed 12-year pages anchored at 1900', async () => {
    const view = await render(<YearGrid date={new Date(2026, 5, 15)} onSelect={vi.fn()} />);

    expect(view.getByText('2020 - 2031')).toBeTruthy();
    expect(view.getByLabelText('2020')).toBeTruthy();
    expect(view.getByLabelText('2031')).toBeTruthy();
  });

  it('selects a year without moving the grid page', async () => {
    const onSelect = vi.fn();
    const view = await render(<YearGrid date={new Date(2026, 5, 15)} onSelect={onSelect} />);

    await fireEvent.press(view.getByText('2023'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].getFullYear()).toBe(2023);

    await view.rerender(<YearGrid date={new Date(2023, 5, 15)} onSelect={onSelect} />);
    expect(view.getByText('2020 - 2031')).toBeTruthy();
  });

  it('shows the current-page jump only before the penultimate page', async () => {
    const currentPageStart = CALENDAR_MIN_YEAR
      + Math.floor((new Date().getFullYear() - CALENDAR_MIN_YEAR) / YEARS_PER_PAGE) * YEARS_PER_PAGE;
    const farStart = currentPageStart - YEARS_PER_PAGE * 2;
    const view = await render(<YearGrid date={new Date(farStart, 0, 1)} onSelect={vi.fn()} />);

    await fireEvent.press(view.getByLabelText('Go to the current period'));
    expect(view.getByText(`${currentPageStart} - ${currentPageStart + YEARS_PER_PAGE - 1}`)).toBeTruthy();

    const penultimate = await render(<YearGrid date={new Date(currentPageStart - YEARS_PER_PAGE, 0, 1)} onSelect={vi.fn()} />);
    expect(penultimate.queryByLabelText('Go to the current period')).toBeNull();

    const current = await render(<YearGrid date={new Date(currentPageStart, 0, 1)} onSelect={vi.fn()} />);
    expect(current.queryByLabelText('Go to the current period')).toBeNull();
  });

  it('disables years before the minimum date', async () => {
    const onSelect = vi.fn();
    const view = await render(
      <YearGrid
        date={new Date(2026, 5, 15)}
        onSelect={onSelect}
        minDate={new Date(2023, 0, 1)}
      />,
    );

    const beforeMin = view.getByLabelText('2020');
    expect(beforeMin.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(beforeMin);
    expect(onSelect).not.toHaveBeenCalled();

    const firstValid = view.getByLabelText('2023');
    expect(firstValid.props.accessibilityState).toMatchObject({ disabled: false });
    await fireEvent.press(firstValid);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('disables the previous page on 1900-1911', async () => {
    const view = await render(<YearGrid date={new Date(1900, 0, 1)} onSelect={vi.fn()} />);

    expect(view.getByText('1900 - 1911')).toBeTruthy();
    await fireEvent.press(view.getByLabelText('Previous years'));
    expect(view.getByText('1900 - 1911')).toBeTruthy();
  });
});
