import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import EyeToggle from '../../src/components/EyeToggle';

describe('EyeToggle', () => {
  it('shows the eye icon when balances are hidden', async () => {
    const view = await render(<EyeToggle isHidden onToggle={() => {}} />);

    expect(view.getByText('eye-outline')).toBeTruthy();
  });

  it('shows the eye-off icon when balances are visible', async () => {
    const view = await render(<EyeToggle isHidden={false} onToggle={() => {}} />);

    expect(view.getByText('eye-off-outline')).toBeTruthy();
  });

  it('passes the icon color through', async () => {
    const view = await render(<EyeToggle isHidden color="#A78BFA" onToggle={() => {}} />);

    expect(view.getByText('eye-outline').props.color).toBe('#A78BFA');
  });

  it('fires onToggle when pressed', async () => {
    const onToggle = vi.fn();
    const view = await render(<EyeToggle isHidden onToggle={onToggle} />);

    await fireEvent.press(view.getByText('eye-outline'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('enlarges the tap target around the icon', async () => {
    const view = await render(<EyeToggle isHidden onToggle={() => {}} />);

    expect(view.root!.props.hitSlop).toBe(8);
  });
});
