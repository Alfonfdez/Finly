import { vi } from 'vitest';
import { act, type ReactNode } from 'react';
import type { Config } from '../../../src/context/ConfigContext';
import type { ColorPalette } from '../../../src/constants/themes';

interface ConfigStubState {
  config: Config;
  activeColors: ColorPalette;
  updateConfig: ReturnType<typeof vi.fn>;
  loading: boolean;
  reset: () => void;
}

interface GlobalWithConfigStub {
  __finlyConfigStub__?: ConfigStubState;
}

const configTemplate: Config = {
  theme: 'dark',
  firstDayOfWeek: 1,
  currency: '€',
  decimalSeparator: ',',
  language: 'en',
  textSize: 'medium',
  categoryIconShape: 'square',
  accountIconShape: 'square',
  homeDefaultAccountId: null,
  homeDefaultPeriod: 'month',
  homeChartType: 'donut',
  addDefaultAccountId: null,
  addShowLabels: true,
  addShowComments: true,
  addShowPhoto: true,
  modifyShowLabels: true,
  modifyShowComments: true,
  modifyShowPhoto: true,
  createRecurringDefaultAccountId: null,
  createRecurringShowLabels: true,
  createRecurringShowComments: true,
  editRecurringShowLabels: true,
  editRecurringShowComments: true,
  hideBalances: false,
  tagsSortBy: 'created',
  tagsSortDirection: 'asc',
  commentsSortBy: 'name',
  commentsSortDirection: 'asc',
  recurringSortBy: 'nextDue',
  recurringSortDirection: 'asc',
  transactionsSortBy: 'date',
  transactionsSortDirection: 'desc',
  allTransactionsSortBy: 'date',
  allTransactionsSortDirection: 'desc',
  accountsSortBy: 'name',
  accountsSortDirection: 'asc',
  categoriesSortBy: 'name',
  categoriesSortDirection: 'asc',
};

const colorsTemplate: ColorPalette = {
  background: '#0F172A',
  surface: '#1E293B',
  text: '#E2E8F0',
  textSecondary: '#94A3B8',
  primary: '#22D3EE',
  accent: '#A78BFA',
  green: '#34D399',
  red: '#F87171',
  border: '#334155',
  switchTrackOff: '#475569',
  switchThumb: '#F8FAFC',
};

const configListeners = new Set<() => void>();

function notifyConfigChanged(): void {
  for (const listener of configListeners) listener();
}

function subscribeConfig(listener: () => void): () => void {
  configListeners.add(listener);
  return () => { configListeners.delete(listener); };
}

function createStub(): ConfigStubState {
  const state: ConfigStubState = {
    config: { ...configTemplate },
    activeColors: { ...colorsTemplate },
    updateConfig: vi.fn((partial: Partial<Config>) => {
      state.config = { ...state.config, ...partial };
      notifyConfigChanged();
    }),
    loading: false,
    reset: () => {
      state.config = { ...configTemplate };
      state.activeColors = { ...colorsTemplate };
      state.updateConfig.mockClear();
      notifyConfigChanged();
    },
  };
  return state;
}

const g = globalThis as GlobalWithConfigStub;
g.__finlyConfigStub__ = createStub();

vi.mock('../../../src/context/ConfigContext', async () => {
  const React = await import('react');
  return {
    // Subscribing makes the stub re-render like the real provider when a
    // screen persists a preference through updateConfig().
    useConfig: () => {
      React.useSyncExternalStore(subscribeConfig, () => (globalThis as GlobalWithConfigStub).__finlyConfigStub__?.config);
      return (globalThis as GlobalWithConfigStub).__finlyConfigStub__;
    },
    ConfigProvider: ({ children }: { children: ReactNode }) => children,
  };
});

function currentStub(): ConfigStubState {
  const stub = (globalThis as GlobalWithConfigStub).__finlyConfigStub__;
  if (!stub) throw new Error('configStub setup not loaded: register tests/component/helpers/configStub.ts in setupFiles');
  return stub;
}

export function getConfigStub(): ConfigStubState {
  return currentStub();
}

export function setConfig(partial: Partial<Config>): void {
  act(() => {
    const stub = currentStub();
    stub.config = { ...stub.config, ...partial };
    notifyConfigChanged();
  });
}

export function setColors(partial: Partial<ColorPalette>): void {
  act(() => {
    const stub = currentStub();
    stub.activeColors = { ...stub.activeColors, ...partial };
    notifyConfigChanged();
  });
}

export function resetStub(): void {
  act(() => {
    currentStub().reset();
  });
}
