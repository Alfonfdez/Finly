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
});
