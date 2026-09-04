import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CreateCategoryScreen from '../../src/screens/CreateCategoryScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Category } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };
const routeParams: Record<string, unknown> = {};

const mockCategoryExists = vi.fn(async (_userId: number, name: string, _excludeId?: number) => false);
const mockCategoryCreate = vi.fn(async (_data: unknown) => ({ id: 3 }) as Category);

vi.mock('reanimated-color-picker', () => ({
  default: ({ children }: { children?: ReactNode }) => children ?? null,
  Panel1: () => null,
  HueSlider: () => null,
  OpacitySlider: () => null,
  Preview: () => null,
}));

vi.mock('../../src/database', () => ({
  categoryRepository: {
    existsByName: (userId: number, name: string, excludeId?: number) =>
      mockCategoryExists(userId, name, excludeId),
    create: (data: unknown) => mockCategoryCreate(data),
  },
}));

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useNavigation: () => nav,
    useRoute: () => ({ params: routeParams }),
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(cb, [cb]);
    },
  };
});

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

describe('CreateCategoryScreen', () => {
  beforeEach(() => {
    nav.goBack.mockClear();
    mockCategoryExists.mockClear().mockResolvedValue(false);
    mockCategoryCreate.mockClear();
    setAppData({ categories: [] });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('renders the category name field with Expense/Income options and Add disabled', async () => {
    const view = await render(<CreateCategoryScreen />);
    expect(view.getByPlaceholderText('Category name')).toBeTruthy();
    expect(view.getByText('Expense')).toBeTruthy();
    expect(view.getByText('Income')).toBeTruthy();
    expect(view.getByText('Add')).toBeDisabled();
  });

  it('shows the icon+color hint once a name is typed and keeps Add disabled', async () => {
    const view = await render(<CreateCategoryScreen />);
    await fireEvent.changeText(view.getByPlaceholderText('Category name'), 'Food');
    expect(view.getByText('Select an icon and a color')).toBeTruthy();
    expect(view.getByText('Add')).toBeDisabled();
  });
});
