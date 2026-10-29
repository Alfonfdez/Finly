import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { resetStub, setConfig } from './helpers/configStub';
import DonutChart from '../../src/components/DonutChart';
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

vi.mock('react-native-svg', () => {
  const Container = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    default: (props: { children?: ReactNode }) => <Container {...props} />,
    Svg: (props: { children?: ReactNode }) => <Container {...props} />,
    G: ({ children }: { children?: ReactNode }) => <>{children}</>,
    Circle: () => null,
    Path: () => null,
  };
});

const config = { currency: '€', decimalSeparator: ',' } as const;

const data: CategoryWithTotal[] = [
  { id: 900, name: 'Groceries', icon: 'cart', color: '#22D3EE', type: 'expense', total: 60, percentage: 60 },
  { id: 901, name: 'Clothing', icon: 'shirt', color: '#A78BFA', type: 'expense', total: 40, percentage: 40 },
];

describe('DonutChart', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('shows the period total in the middle', async () => {
    const view = await render(<DonutChart data={data} total={100} />);
    expect(view.getByText(formatAmount(100, config))).toBeTruthy();
    expect(flattenStyle(view.getByText(formatAmount(100, config)).props.style).color).toBe('#E2E8F0');
  });

  it('exposes a text alternative for the chart', async () => {
    const view = await render(<DonutChart data={data} total={100} />);
    expect(view.getByLabelText(/Groceries 60,0%/)).toBeTruthy();
  });

  it('shows the mask instead of the total when hidden', async () => {
    const view = await render(<DonutChart data={data} total={100} hidden />);
    expect(view.getByText(HIDDEN_BALANCE)).toBeTruthy();
    expect(flattenStyle(view.getByText(HIDDEN_BALANCE).props.style).color).toBe('#94A3B8');
    expect(view.queryByText(formatAmount(100, config))).toBeNull();
  });
});
