import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, userEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import RecurringViewChip from '../../src/components/RecurringViewChip';
import { RECURRING_VIEWS } from '../../src/constants/types';

describe('RecurringViewChip', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('shows the current view as the chip label', async () => {
    const view = await render(<RecurringViewChip value={RECURRING_VIEWS.recurring} onChange={() => {}} />);
    expect(view.getByLabelText('Recurring')).toBeTruthy();
  });

  it('opens the picker and reports the chosen view', async () => {
    const onChange = vi.fn();
    const view = await render(<RecurringViewChip value={RECURRING_VIEWS.all} onChange={onChange} />);

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('All'));
    await ue.press(view.getByText('One-time'));
    await ue.press(view.getByText('Select'));

    expect(onChange).toHaveBeenCalledWith(RECURRING_VIEWS.oneTime);
  });
});
