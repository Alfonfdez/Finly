import { vi } from 'vitest';
import type { ReactNode } from 'react';
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
  addDefaultAccountId: null,
  addShowLabels: true,
  addShowComments: true,
  addShowPhoto: true,
  hideBalances: false,
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
};

function createStub(): ConfigStubState {
  const state: ConfigStubState = {
    config: { ...configTemplate },
    activeColors: { ...colorsTemplate },
    updateConfig: vi.fn(),
    loading: false,
    reset: () => {
      state.config = { ...configTemplate };
      state.activeColors = { ...colorsTemplate };
      state.updateConfig.mockClear();
    },
  };
  return state;
}

const g = globalThis as GlobalWithConfigStub;
g.__finlyConfigStub__ = createStub();

vi.mock('../../../src/context/ConfigContext', () => ({
  useConfig: () => (globalThis as GlobalWithConfigStub).__finlyConfigStub__,
  ConfigProvider: ({ children }: { children: ReactNode }) => children,
}));

function currentStub(): ConfigStubState {
  const stub = (globalThis as GlobalWithConfigStub).__finlyConfigStub__;
  if (!stub) throw new Error('configStub setup not loaded: register tests/component/helpers/configStub.ts in setupFiles');
  return stub;
}

export function getConfigStub(): ConfigStubState {
  return currentStub();
}

export function setConfig(partial: Partial<Config>): void {
  const stub = currentStub();
  stub.config = { ...stub.config, ...partial };
}

export function setColors(partial: Partial<ColorPalette>): void {
  const stub = currentStub();
  stub.activeColors = { ...stub.activeColors, ...partial };
}

export function resetStub(): void {
  currentStub().reset();
}
