import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import MonthNav from '../../src/components/calendars/MonthNav';
import { resetStub, setConfig } from './helpers/configStub';

describe('MonthNav', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('shows the current-month jump only when it is at least two months away', async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (currentMonth < 3) return;

    const onChange = vi.fn();
    const view = await render(
      <MonthNav year={currentYear} month={currentMonth - 2} onChange={onChange} />,
    );

    await fireEvent.press(view.getByLabelText('Go to the current period'));
    expect(onChange).toHaveBeenCalledWith(currentYear, currentMonth);
  });

  it('hides the current-month jump at the penultimate and current months', async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (currentMonth > 1) {
      const penultimate = await render(
        <MonthNav year={currentYear} month={currentMonth - 1} onChange={vi.fn()} />,
      );
      expect(penultimate.queryByLabelText('Go to the current period')).toBeNull();
    }

    const current = await render(
      <MonthNav year={currentYear} month={currentMonth} onChange={vi.fn()} />,
    );
    expect(current.queryByLabelText('Go to the current period')).toBeNull();
  });
});
