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

  it('does not go before January 1900', async () => {
    const view = await render(<MonthGrid date={new Date(1900, 0, 1)} onSelect={vi.fn()} />);

    await fireEvent.press(view.getByLabelText('Previous year'));

    expect(view.getByText('1900')).toBeTruthy();
  });
});
