import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import RecurringRow from '../../src/components/RecurringRow';
import type { Category, RecurringRule } from '../../src/database/types';

const category: Category = {
  id: 1,
  user_id: 1,
  name: 'Food',
  icon: 'cart',
  color: '#22D3EE',
  type: 'expense',
  created_at: '2026-01-01',
};

const rule: RecurringRule = {
  id: 1,
  user_id: 1,
  name: 'Rent',
  type: 'expense',
  account_id: 1,
  category_id: 1,
  amount: 50,
  description: null,
  frequency: 'monthly',
  interval: 1,
  weekday: null,
  day_of_month: 5,
  month: null,
  start_date: '2026-10-05',
  end_date: null,
  next_due: '2026-11-05',
  skipped_from: null,
  active: 1,
  created_at: '2026-10-05',
  updated_at: null,
};

describe('RecurringRow', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('renders the name, summary, next due, meta and amount', async () => {
    const view = await render(
      <RecurringRow rule={rule} category={category} count={3} today="2026-10-06" onPress={vi.fn()} onToggleActive={vi.fn()} />,
    );
    expect(view.getByText('Rent')).toBeTruthy();
    expect(view.getByText('Every month on day 5')).toBeTruthy();
    expect(view.getByText('Next: November 5, 2026')).toBeTruthy();
    expect(view.getByText('Food · Created 5 Oct 2026 · 3 transactions')).toBeTruthy();
    expect(view.getByText('-50,00 €')).toBeTruthy();
    expect(view.getByText('Active')).toBeTruthy();
  });

  it('shows "Ended" on the toggle and disables it when the rule has finished', async () => {
    const view = await render(
      <RecurringRow
        rule={{ ...rule, end_date: '2026-09-30', next_due: '2026-10-01' }}
        category={category}
        count={3}
        today="2026-10-06"
        onPress={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );
    expect(view.getAllByText('Ended')).toHaveLength(2);
    expect(view.getByLabelText('Ended').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('shows the amount with a + sign for income', async () => {
    const view = await render(
      <RecurringRow rule={{ ...rule, type: 'income' }} category={category} count={0} today="2026-10-06" onPress={vi.fn()} onToggleActive={vi.fn()} />,
    );
    expect(view.getByText('+50,00 €')).toBeTruthy();
  });

  it('calls onPress on tap and onToggleActive on switch change', async () => {
    const onPress = vi.fn();
    const onToggleActive = vi.fn();
    const view = await render(
      <RecurringRow rule={rule} category={category} count={0} today="2026-10-06" onPress={onPress} onToggleActive={onToggleActive} />,
    );
    await fireEvent.press(view.getByText('Rent'));
    expect(onPress).toHaveBeenCalledTimes(1);
    await fireEvent(view.getByRole('switch'), 'valueChange', false);
    expect(onToggleActive).toHaveBeenCalledWith(false);
  });
});
