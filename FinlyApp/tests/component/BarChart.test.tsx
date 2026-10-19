import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import BarChart from '../../src/components/BarChart';
import { formatAmount, HIDDEN_BALANCE } from '../../src/utils/formatters';
import type { CategoryWithTotal } from '../../src/constants/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.assign(out, value);
  };
  walk(style);
  return out;
}

const config = { currency: '€', decimalSeparator: ',' } as const;

const data: CategoryWithTotal[] = [
  { id: 900, name: 'Groceries', icon: 'cart', color: '#22D3EE', type: 'expense', total: 60, percentage: 60 },
  { id: 901, name: 'Clothing', icon: 'shirt', color: '#A78BFA', type: 'expense', total: 40, percentage: 40 },
];

describe('BarChart', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('always shows the period total, even with data', async () => {
    const view = await render(<BarChart data={data} total={100} />);
    expect(view.getByText(formatAmount(100, config))).toBeTruthy();
    expect(flattenStyle(view.getByText(formatAmount(100, config)).props.style).color).toBe('#E2E8F0');
  });

  it('shows the mask instead of the total when hidden', async () => {
    const view = await render(<BarChart data={data} total={100} hidden />);
    expect(view.getByText(HIDDEN_BALANCE)).toBeTruthy();
    expect(flattenStyle(view.getByText(HIDDEN_BALANCE).props.style).color).toBe('#94A3B8');
    expect(view.queryByText(formatAmount(100, config))).toBeNull();
  });

  it('shows the total when there are no transactions', async () => {
    const view = await render(<BarChart data={[]} total={0} />);
    expect(view.getByText(formatAmount(0, config))).toBeTruthy();
  });

  it('lists each category with its percentage', async () => {
    const view = await render(<BarChart data={data} total={100} />);
    expect(view.getByText('Groceries')).toBeTruthy();
    expect(view.getByText('60.0%')).toBeTruthy();
    expect(view.getByText('Clothing')).toBeTruthy();
    expect(view.getByText('40.0%')).toBeTruthy();
  });

  it('renders no legend rows without data', async () => {
    const view = await render(<BarChart data={[]} total={0} />);
    expect(view.queryByText('Groceries')).toBeNull();
  });
});
