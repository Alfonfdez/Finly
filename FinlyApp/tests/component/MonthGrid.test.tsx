import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import MonthGrid from '../../src/components/calendars/MonthGrid';
import { resetStub, setConfig } from './helpers/configStub';

describe('MonthGrid', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('browses years without changing the selected month', async () => {
    const onSelect = vi.fn();
    const view = await render(<MonthGrid date={new Date(2026, 5, 15)} onSelect={onSelect} />);

    await fireEvent.press(view.getByLabelText('Previous year'));

    expect(onSelect).not.toHaveBeenCalled();
    expect(view.getByText('2025')).toBeTruthy();
    expect(view.getByLabelText('June').props.accessibilityState).toMatchObject({ selected: false });
  });

  it('disables months before the minimum date', async () => {
    const onSelect = vi.fn();
    const view = await render(
      <MonthGrid
        date={new Date(2026, 5, 15)}
        onSelect={onSelect}
        minDate={new Date(2026, 5, 15)}
      />,
    );

    const january = view.getByLabelText('January');
    expect(january.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(january);
    expect(onSelect).not.toHaveBeenCalled();

    const june = view.getByLabelText('June');
    expect(june.props.accessibilityState).toMatchObject({ disabled: false });
    await fireEvent.press(june);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not go before January 1900', async () => {
    const view = await render(<MonthGrid date={new Date(1900, 0, 1)} onSelect={vi.fn()} />);

    await fireEvent.press(view.getByLabelText('Previous year'));

    expect(view.getByText('1900')).toBeTruthy();
  });
});
