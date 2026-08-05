import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import PeriodTabs from '../../src/components/PeriodTabs';
import { PERIODS } from '../../src/constants/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

describe('PeriodTabs', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders every period with its translated label', async () => {
    const view = await render(<PeriodTabs active={PERIODS.month} onChange={() => {}} />);

    expect(view.getByText('Day')).toBeTruthy();
    expect(view.getByText('Week')).toBeTruthy();
    expect(view.getByText('Month')).toBeTruthy();
    expect(view.getByText('Year')).toBeTruthy();
    expect(view.getByText('Period')).toBeTruthy();
  });

  it('highlights the active period with the primary color', async () => {
    const view = await render(<PeriodTabs active={PERIODS.month} onChange={() => {}} />);

    const activeStyle = flattenStyle(view.getByText('Month').parent?.props.style);
    expect(activeStyle.backgroundColor).toBe('#22D3EE');
    expect(flattenStyle(view.getByText('Month').props.style).color).toBe('#0F172A');
  });

  it('keeps inactive periods on the surface color', async () => {
    const view = await render(<PeriodTabs active={PERIODS.month} onChange={() => {}} />);

    const inactiveStyle = flattenStyle(view.getByText('Week').parent?.props.style);
    expect(inactiveStyle.backgroundColor).toBe('#1E293B');
    expect(flattenStyle(view.getByText('Week').props.style).color).toBe('#94A3B8');
  });

  it('exposes an accessibility label combining role and label', async () => {
    const view = await render(<PeriodTabs active={PERIODS.day} onChange={() => {}} />);

    expect(view.getByLabelText('Period Day')).toBeTruthy();
    expect(view.getByLabelText('Period Period')).toBeTruthy();
  });

  it('fires onChange with the period key when pressed', async () => {
    const onChange = vi.fn();
    const view = await render(<PeriodTabs active={PERIODS.month} onChange={onChange} />);

    await fireEvent.press(view.getByLabelText('Period Year'));
    expect(onChange).toHaveBeenCalledWith(PERIODS.year);
  });

  it('reports the custom period via its label', async () => {
    const onChange = vi.fn();
    const view = await render(<PeriodTabs active={PERIODS.month} onChange={onChange} />);

    await fireEvent.press(view.getByText('Period'));
    expect(onChange).toHaveBeenCalledWith(PERIODS.custom);
  });
});
