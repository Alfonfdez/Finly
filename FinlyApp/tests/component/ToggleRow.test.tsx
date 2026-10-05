import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import ToggleRow from '../../src/components/settings/ToggleRow';

describe('ToggleRow', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('renders a switch that reflects the checked state', async () => {
    const view = await render(<ToggleRow checked label="Hide balances" onToggle={() => {}} />);
    expect(view.getByRole('switch').props.value).toBe(true);
    expect(view.getByText('Hide balances')).toBeTruthy();
  });

  it('fires onToggle when the switch changes', async () => {
    const onToggle = vi.fn();
    const view = await render(<ToggleRow checked={false} label="Hide balances" onToggle={onToggle} />);
    await fireEvent(view.getByRole('switch'), 'valueChange', true);
    expect(onToggle).toHaveBeenCalled();
  });

  it('fires onToggle when the label is pressed', async () => {
    const onToggle = vi.fn();
    const view = await render(<ToggleRow checked={false} label="Hide balances" onToggle={onToggle} />);
    await fireEvent.press(view.getByText('Hide balances'));
    expect(onToggle).toHaveBeenCalled();
  });
});
