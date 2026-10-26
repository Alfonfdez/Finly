import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import YearGrid from '../../src/components/calendars/YearGrid';
import { resetStub, setConfig } from './helpers/configStub';

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

  it('disables the previous page on 1900-1911', async () => {
    const view = await render(<YearGrid date={new Date(1900, 0, 1)} onSelect={vi.fn()} />);

    expect(view.getByText('1900 - 1911')).toBeTruthy();
    await fireEvent.press(view.getByLabelText('Previous years'));
    expect(view.getByText('1900 - 1911')).toBeTruthy();
  });
});
