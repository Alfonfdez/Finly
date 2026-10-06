import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import RepeatSection from '../../src/components/RepeatSection';

type Props = ComponentProps<typeof RepeatSection>;

function renderSection(overrides: Partial<Props> = {}) {
  const props: Props = {
    enabled: true,
    onToggle: vi.fn(),
    frequency: 'monthly',
    onChangeFrequency: vi.fn(),
    interval: 1,
    onChangeInterval: vi.fn(),
    startDay: new Date(2026, 1, 2),
    endDate: null,
    onOpenEndDate: vi.fn(),
    onClearEndDate: vi.fn(),
    skipFirst: false,
    onChangeSkipFirst: vi.fn(),
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

  it('hides the options when disabled', async () => {
    const { view } = renderSection({ enabled: false });
    const v = await view;
    expect(v.getByText('Recurring')).toBeTruthy();
    expect(v.queryByText('Daily')).toBeNull();
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

  it('increments and decrements the interval', async () => {
    const { props, view } = renderSection({ interval: 3 });
    const v = await view;
    await fireEvent.press(v.getByLabelText('+'));
    expect(props.onChangeInterval).toHaveBeenCalledWith(4);
    await fireEvent.press(v.getByLabelText('-'));
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
    const field = v.getByTestId('repeat-end-date');
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

  it('toggles repeat on switch change', async () => {
    const { props, view } = renderSection({ enabled: false });
    await fireEvent((await view).getByRole('switch'), 'valueChange', true);
    expect(props.onToggle).toHaveBeenCalledWith(true);
  });

  it('hides only the switch in rule mode but keeps the title', async () => {
    const { view } = renderSection({ showToggle: false });
    const v = await view;
    expect(v.getByText('Recurring')).toBeTruthy();
    expect(v.queryByRole('switch')).toBeNull();
  });

  it('highlights the options block only when enabled', async () => {
    const disabled = await renderSection({ enabled: false });
    expect((await disabled.view).queryByTestId('repeat-options')).toBeNull();

    const enabled = await renderSection({ enabled: true });
    expect((await enabled.view).getByTestId('repeat-options')).toBeTruthy();
  });

  it('shows the skip-first checkbox only when allowed', async () => {
    const hidden = await renderSection();
    expect((await hidden.view).queryByText('Skip the first occurrence')).toBeNull();

    const shown = await renderSection({ showSkipFirst: true });
    expect((await shown.view).getByText('Skip the first occurrence')).toBeTruthy();
  });

  it('toggles skip first', async () => {
    const { props, view } = renderSection({ showSkipFirst: true, skipFirst: false });
    await fireEvent.press((await view).getByText('Skip the first occurrence'));
    expect(props.onChangeSkipFirst).toHaveBeenCalledWith(true);
  });

  it('renders the recurring name field with its value', async () => {
    const { view } = renderSection({ name: 'Rent' });
    expect((await view).getByDisplayValue('Rent')).toBeTruthy();
  });

  it('shows the recurring name error', async () => {
    const { view } = renderSection({ name: '', nameError: 'taken' });
    expect((await view).getByText('That name is already used by another recurring')).toBeTruthy();
  });

  it('shows the first transaction date only when skipping the first occurrence', async () => {
    const off = await renderSection({ showSkipFirst: true, skipFirst: false });
    expect((await off.view).queryByText(/^First transaction:/)).toBeNull();

    const on = await renderSection({
      showSkipFirst: true,
      skipFirst: true,
      frequency: 'monthly',
      startDay: new Date(2026, 9, 6),
    });
    expect((await on.view).getByText('First transaction: November 6, 2026')).toBeTruthy();
  });
});
