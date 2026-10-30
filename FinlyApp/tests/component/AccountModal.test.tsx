import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import AccountModal from '../../src/components/AccountModal';
import { resetStub } from './helpers/configStub';
import type { Account } from '../../src/database/types';

const account = {
  id: 1,
  user_id: 1,
  name: 'Cash',
  icon: 'cash-outline',
  color: '#22D3EE',
  is_total: 0,
  initial_balance: 100,
  description: '',
  created_at: '2026-01-01',
  balance: 100,
} as Account & { balance: number };

describe('AccountModal', () => {
  beforeEach(() => {
    resetStub();
  });

  it('uses the standard centered header with a wallet icon and eye toggle', async () => {
    const view = await render(
      <AccountModal
        visible
        accounts={[account]}
        selectedId={account.id}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(view.getByText('Select account', { exact: false })).toBeTruthy();
    expect(view.getByText('wallet-outline', { includeHiddenElements: true })).toBeTruthy();
    expect(view.getByRole('button', { name: 'Hide amounts' })).toBeTruthy();
  });

  it('selects the account and closes', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const view = await render(
      <AccountModal
        visible
        accounts={[account]}
        selectedId={account.id}
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    await fireEvent.press(view.getByText('Select'));
    expect(onSelect).toHaveBeenCalledWith(1);

    await fireEvent.press(view.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
