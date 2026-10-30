import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import PersonalizationScreen from '../../src/screens/settings/PersonalizationScreen';
import { buildAppMock, resetAppStub } from '../component/helpers/appStub';
import { getConfigStub, resetStub } from '../component/helpers/configStub';

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

describe('PersonalizationScreen', () => {
  beforeEach(() => {
    resetStub();
  });

  afterEach(() => {
    resetStub();
    resetAppStub();
  });

  it('renders personalization and privacy options', async () => {
    const view = await render(<PersonalizationScreen />);
    expect(view.getAllByText('Home screen').length).toBeGreaterThan(0);
    expect(view.getAllByText('Add transaction').length).toBeGreaterThan(0);
    expect(view.getAllByText('Modify transaction').length).toBeGreaterThan(0);
    expect(view.getAllByText('New recurring rule').length).toBeGreaterThan(0);
    expect(view.getAllByText('Edit recurring rule').length).toBeGreaterThan(0);
    expect(view.getAllByText('Default account').length).toBeGreaterThan(0);
    expect(view.getAllByText('Default period').length).toBeGreaterThan(0);
    expect(view.getByText('Hide balances and totals')).toBeTruthy();
    // Add and Modify each have Labels/Comments/Photo; New and Edit rule each have Labels/Comments.
    expect(view.getAllByText('Labels')).toHaveLength(4);
    expect(view.getAllByText('Comments')).toHaveLength(4);
    expect(view.getAllByText('Photo')).toHaveLength(2);
    expect(view.getAllByRole('checkbox')).toHaveLength(10);
  });

  it('toggles the modify and recurring optional fields', async () => {
    const view = await render(<PersonalizationScreen />);
    // Add: 0-2, Modify: 3-5, New rule: 6-7, Edit rule: 8-9.
    const boxes = view.getAllByRole('checkbox');
    const ue = userEvent.setup();
    await ue.press(boxes[3]);
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ modifyShowLabels: false });
    await ue.press(boxes[5]);
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ modifyShowPhoto: false });
    await ue.press(boxes[6]);
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ createRecurringShowLabels: false });
    await ue.press(boxes[9]);
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ editRecurringShowComments: false });
  });

  it('toggles hide balances', async () => {
    const view = await render(<PersonalizationScreen />);
    await fireEvent.press(view.getByRole('switch', { name: 'Hide balances and totals' }));
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ hideBalances: true });
  });
});
