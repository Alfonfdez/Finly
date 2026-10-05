import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import YearNav from '../../src/components/calendars/YearNav';

describe('YearNav', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('disables the forward arrow at the current year by default', async () => {
    const onChange = vi.fn();
    const year = new Date().getFullYear();
    const view = await render(<YearNav year={year} onChange={onChange} />);

    await fireEvent.press(view.getByLabelText('Next year'));
    expect(onChange).not.toHaveBeenCalled();

    await fireEvent.press(view.getByLabelText('Previous year'));
    expect(onChange).toHaveBeenCalledWith(year - 1);
  });

  it('allows unlimited forward years when maxDate is null', async () => {
    const onChange = vi.fn();
    const view = await render(<YearNav year={2036} maxDate={null} onChange={onChange} />);

    await fireEvent.press(view.getByLabelText('Next year'));
    expect(onChange).toHaveBeenCalledWith(2037);
  });

  it('disables the back arrow at the minDate year', async () => {
    const onChange = vi.fn();
    const view = await render(
      <YearNav year={2026} minDate={new Date(2026, 0, 1)} maxDate={null} onChange={onChange} />
    );

    await fireEvent.press(view.getByLabelText('Previous year'));
    expect(onChange).not.toHaveBeenCalled();

    await fireEvent.press(view.getByLabelText('Next year'));
    expect(onChange).toHaveBeenCalledWith(2027);
  });
});
