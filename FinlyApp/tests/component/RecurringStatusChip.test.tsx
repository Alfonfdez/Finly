import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, userEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import RecurringStatusChip from '../../src/components/RecurringStatusChip';

describe('RecurringStatusChip', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('shows "All" when no status is selected', async () => {
    const view = await render(<RecurringStatusChip selected={[]} onChange={vi.fn()} />);
    expect(view.getByLabelText('All')).toBeTruthy();
  });

  it('shows the joined labels when several statuses are selected', async () => {
    const view = await render(<RecurringStatusChip selected={['active', 'ended']} onChange={vi.fn()} />);
    expect(view.getByLabelText('Active + Ended')).toBeTruthy();
  });

  it('toggles statuses (All unchecks) and applies them', async () => {
    const onChange = vi.fn();
    const view = await render(<RecurringStatusChip selected={[]} onChange={onChange} />);
    const ue = userEvent.setup();

    await ue.press(view.getByLabelText('All'));
    await ue.press(view.getByText('Active'));
    await ue.press(view.getByText('Ended'));
    await ue.press(view.getByText('Apply (2)'));

    expect(onChange).toHaveBeenCalledWith(['active', 'ended']);
  });

  it('collapses back to All when every status is selected', async () => {
    const onChange = vi.fn();
    const view = await render(<RecurringStatusChip selected={[]} onChange={onChange} />);
    const ue = userEvent.setup();

    await ue.press(view.getByLabelText('All'));
    await ue.press(view.getByText('Active'));
    await ue.press(view.getByText('Paused'));
    await ue.press(view.getByText('Ended'));
    await ue.press(view.getByText('Apply (All)'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('discards changes on Cancel', async () => {
    const onChange = vi.fn();
    const view = await render(<RecurringStatusChip selected={[]} onChange={onChange} />);
    const ue = userEvent.setup();

    await ue.press(view.getByLabelText('All'));
    await ue.press(view.getByText('Paused'));
    await ue.press(view.getByText('Cancel'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
