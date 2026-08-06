import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import { TransactionRow, TransactionDateHeader } from '../../src/components/TransactionGroup';
import type { Transaction, Category } from '../../src/database/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

const category: Category = {
  id: 101,
  user_id: 1,
  name: 'Restaurants',
  icon: 'restaurant',
  color: '#F87171',
  type: 'expense',
  created_at: '2026-01-01',
};

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 1,
    account_id: 1,
    category_id: 101,
    type: 'expense',
    amount: 12.5,
    description: 'Lunch',
    photo: null,
    date: '2026-08-05 12:00:00',
    created_at: '2026-08-05 12:00:00',
    updated_at: null,
    ...overrides,
  };
}

describe('TransactionRow', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders the category name and description', async () => {
    const view = await render(<TransactionRow tx={makeTx({})} category={category} />);

    expect(view.getByText('Restaurants')).toBeTruthy();
    expect(view.getByText('Lunch')).toBeTruthy();
  });

  it('formats an expense with a minus sign and the red color', async () => {
    const view = await render(<TransactionRow tx={makeTx({ amount: 12.5 })} category={category} />);

    const amount = view.getByText('-12,50 €');
    expect(flattenStyle(amount.props.style).color).toBe('#F87171');
  });

  it('formats an income with a plus sign and the green color', async () => {
    const view = await render(<TransactionRow tx={makeTx({ type: 'income', amount: 3 })} category={category} />);

    const amount = view.getByText('+3,00 €');
    expect(flattenStyle(amount.props.style).color).toBe('#34D399');
  });

  it('renders tag chips for the transaction', async () => {
    const view = await render(<TransactionRow tx={makeTx({})} category={category} tags={[{ tag_id: 7, name: 'lunch' }]} />);

    expect(view.getByText('lunch')).toBeTruthy();
  });

  it('omits tag chips when no tags are present', async () => {
    const view = await render(<TransactionRow tx={makeTx({})} category={category} />);

    expect(view.queryByText('lunch')).toBeNull();
  });

  it('renders the category icon badge with its color', async () => {
    const view = await render(<TransactionRow tx={makeTx({})} category={category} />);

    const icon = view.root!.queryAll((i) => i.type === 'RCTText' && i.children[0] === 'restaurant')[0];
    expect(icon.props.size).toBe(18);
    expect(icon.props.color).toBe('#F87171');
  });

  it('fires onPress with the transaction id', async () => {
    const onPress = vi.fn();
    const view = await render(<TransactionRow tx={makeTx({ id: 42 })} category={category} onPress={onPress} />);

    await fireEvent.press(view.getByText('Restaurants'));
    expect(onPress).toHaveBeenCalledWith(42);
  });

  it('draws a divider under the row', async () => {
    const view = await render(<TransactionRow tx={makeTx({})} category={category} />);

    const row = view.getByText('Restaurants').parent?.parent;
    const style = flattenStyle(row?.props.style);
    expect(style.borderBottomWidth).toBe(1);
    expect(style.borderBottomColor).toBe('#334155');
  });
});

describe('TransactionDateHeader', () => {
  it('shows day and month for the current year', async () => {
    const year = new Date().getFullYear();
    const view = await render(<TransactionDateHeader date={`${year}-08-05 12:00:00`} />);

    expect(view.getByText('5 august')).toBeTruthy();
  });

  it('includes the year for other years', async () => {
    const year = new Date().getFullYear() - 1;
    const view = await render(<TransactionDateHeader date={`${year}-08-05 12:00:00`} />);

    expect(view.getByText(`5 august ${year}`)).toBeTruthy();
  });
});
