import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CreateAccountScreen from '../../src/screens/CreateAccountScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Account } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };

const mockAccountExists = vi.fn(async (_userId: number, name: string, _excludeId?: number) => false);
const mockAccountCreate = vi.fn(async (_data: unknown) => ({ id: 9 }) as Account);

vi.mock('reanimated-color-picker', () => ({
  default: ({ children }: { children?: ReactNode }) => children ?? null,
  Panel1: () => null,
  HueSlider: () => null,
  OpacitySlider: () => null,
  Preview: () => null,
}));

vi.mock('../../src/database', () => ({
  accountRepository: {
    existsByName: (userId: number, name: string, excludeId?: number) =>
      mockAccountExists(userId, name, excludeId),
    create: (data: unknown) => mockAccountCreate(data),
  },
}));

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useNavigation: () => nav,
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(cb, [cb]);
    },
  };
});

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

describe('CreateAccountScreen', () => {
  beforeEach(() => {
    nav.goBack.mockClear();
    mockAccountExists.mockClear();
    mockAccountCreate.mockClear();
    mockAccountExists.mockResolvedValue(false);
    setAppData({ accounts: [] });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('renders the Name section and keeps Create disabled', async () => {
    const view = await render(<CreateAccountScreen />);
    expect(view.getByText('Name')).toBeTruthy();
    expect(view.getByPlaceholderText('Account name')).toBeTruthy();
    expect(view.getByText('Symbols')).toBeTruthy();
    expect(view.getByText('Color')).toBeTruthy();
    expect(view.getByText('Initial balance')).toBeTruthy();
    expect(view.getByText('Note')).toBeTruthy();
    expect(view.getByText('Create')).toBeDisabled();
  });

  it('reserves the hint band so Create never moves', async () => {
    const view = await render(<CreateAccountScreen />);

    const slot = view.getByTestId(TEST_IDS.formHintSlot);
    expect(StyleSheet.flatten(slot.props.style).minHeight).toBeGreaterThan(0);
    expect(view.queryByTestId(TEST_IDS.formMutedSlot)).toBeNull();
  });

  it('shows the Note counter in its section header', async () => {
    const view = await render(<CreateAccountScreen />);
    const counter = view.getByText('0/200');
    expect(StyleSheet.flatten(counter.props.style).position).toBeUndefined();
  });

  it('shows the icon+color hint once a name is typed and keeps Create disabled', async () => {
    const view = await render(<CreateAccountScreen />);
    await fireEvent.changeText(view.getByPlaceholderText('Account name'), 'Wallet');
    expect(view.getByDisplayValue('Wallet')).toBeTruthy();
    expect(view.getByText('Select an icon and a color')).toBeTruthy();
    expect(view.getByText('Create')).toBeDisabled();
  });
});
