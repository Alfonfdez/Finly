import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import TabBar from '../../src/components/TabBar';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

const tabs = [
  { key: 'all' as const, label: 'All' },
  { key: 'income' as const, label: 'Income', accessibilityLabel: 'Only income' },
  { key: 'expense' as const, label: 'Expense' },
];

describe('TabBar', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders a tab for every entry', async () => {
    const view = await render(<TabBar tabs={tabs} active="all" onChange={() => {}} />);

    expect(view.getByText('All')).toBeTruthy();
    expect(view.getByText('Income')).toBeTruthy();
    expect(view.getByText('Expense')).toBeTruthy();
  });

  it('paints the active tab with the background color', async () => {
    const view = await render(<TabBar tabs={tabs} active="income" onChange={() => {}} />);

    const activeText = view.getByText('Income');
    const style = flattenStyle(activeText.parent?.props.style);
    expect(style.backgroundColor).toBe('#0F172A');
  });

  it('colors the active tab text and leaves inactive tabs muted', async () => {
    const view = await render(<TabBar tabs={tabs} active="all" onChange={() => {}} />);

    const activeStyle = flattenStyle(view.getByText('All').parent?.props.style);
    expect(activeStyle.backgroundColor).toBe('#0F172A');
    const activeTextStyle = flattenStyle(view.getByText('All').props.style);
    expect(activeTextStyle.color).toBe('#E2E8F0');

    const inactiveTextStyle = flattenStyle(view.getByText('Expense').props.style);
    expect(inactiveTextStyle.color).toBe('#94A3B8');
    expect(flattenStyle(view.getByText('Expense').parent?.props.style).backgroundColor).toBeUndefined();

    const containerStyle = flattenStyle(view.root!.props.style);
    expect(containerStyle.backgroundColor).toBe('#1E293B');
  });

  it('uses a scaled font size on tab labels', async () => {
    const view = await render(<TabBar tabs={tabs} active="all" onChange={() => {}} />);

    expect(flattenStyle(view.getByText('All').props.style).fontSize).toBe(15);
  });

  it('fires onChange with the tab key when pressed', async () => {
    const onChange = vi.fn();
    const view = await render(<TabBar tabs={tabs} active="all" onChange={onChange} />);

    await fireEvent.press(view.getByText('Expense'));
    expect(onChange).toHaveBeenCalledWith('expense');
  });

  it('exposes the optional accessibility label per tab', async () => {
    const onChange = vi.fn();
    const view = await render(<TabBar tabs={tabs} active="all" onChange={onChange} />);

    await fireEvent.press(view.getByLabelText('Only income'));
    expect(onChange).toHaveBeenCalledWith('income');
  });
});
