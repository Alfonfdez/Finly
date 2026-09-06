import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockConfigGet = vi.fn();
const mockConfigSave = vi.fn();
const mockGetColorScheme = vi.fn((): 'light' | 'dark' => 'light');
const mockAddChangeListener = vi.fn((_cb: () => void) => ({ remove: vi.fn() }));

vi.mock('../../src/context/ConfigContext', async () => {
  return await vi.importActual<typeof import('../../src/context/ConfigContext')>('../../src/context/ConfigContext');
});

vi.mock('../../src/database', () => ({
  configRepository: {
    get: () => mockConfigGet(),
    save: (partial: unknown) => mockConfigSave(partial),
  },
}));

vi.mock('react-native', async () => {
  const actual = await vi.importActual<typeof import('react-native')>('react-native');
  return {
    ...actual,
    Appearance: {
      getColorScheme: () => mockGetColorScheme(),
      addChangeListener: (cb: () => void) => mockAddChangeListener(cb),
    },
  };
});

import { ConfigProvider, useConfig } from '../../src/context/ConfigContext';
import { DEFAULT_CONFIG } from '../../src/database/configDefaults';
import { THEMES } from '../../src/constants/types';
import { darkColors, lightColors } from '../../src/constants/themes';
import type { Config } from '../../src/database/types';

let captured: { config: Config; activeColors: typeof darkColors; loading: boolean; updateConfig: (partial: Partial<Config>) => void } | null = null;

function Probe() {
  const ctx = useConfig();
  captured = { config: ctx.config, activeColors: ctx.activeColors, loading: ctx.loading, updateConfig: ctx.updateConfig };
  return null;
}

function renderProvider() {
  return render(<ConfigProvider><Probe /></ConfigProvider>);
}

describe('ConfigProvider', () => {
  beforeEach(() => {
    captured = null;
    mockGetColorScheme.mockReset().mockReturnValue('light');
    mockConfigGet.mockReset();
    mockConfigSave.mockReset();
    mockAddChangeListener.mockClear();
  });

  it('loads the config from the repository and applies theme colors', async () => {
    mockConfigGet.mockResolvedValue({ ...DEFAULT_CONFIG, theme: THEMES.light, language: 'es' });
    await renderProvider();
    await waitFor(() => expect(captured?.loading).toBe(false));

    expect(captured?.config.theme).toBe(THEMES.light);
    expect(captured?.activeColors).toEqual(lightColors);
  });

  it('falls back to defaults when the repository throws', async () => {
    mockConfigGet.mockRejectedValue(new Error('DB down'));
    await renderProvider();
    await waitFor(() => expect(captured?.loading).toBe(false));

    expect(captured?.config).toEqual(DEFAULT_CONFIG);
    expect(captured?.activeColors).toEqual(darkColors);
  });

  it('updateConfig persists a partial and updates the local config', async () => {
    mockConfigGet.mockResolvedValue(DEFAULT_CONFIG);
    await renderProvider();
    await waitFor(() => expect(captured?.loading).toBe(false));

    await act(async () => { await captured!.updateConfig({ firstDayOfWeek: 0 }); });
    expect(mockConfigSave).toHaveBeenCalledWith({ firstDayOfWeek: 0 });
    expect(captured!.config.firstDayOfWeek).toBe(0);
  });

  it('updateConfig changes colors immediately when the theme changes', async () => {
    mockConfigGet.mockResolvedValue(DEFAULT_CONFIG);
    await renderProvider();
    await waitFor(() => expect(captured?.loading).toBe(false));

    await act(async () => { await captured!.updateConfig({ theme: THEMES.light }); });
    expect(captured!.activeColors).toEqual(lightColors);
  });

  it('updateConfig reverts the config and colors when the save fails', async () => {
    mockConfigGet.mockResolvedValue({ ...DEFAULT_CONFIG, theme: THEMES.dark });
    mockConfigSave.mockRejectedValue(new Error('save failed'));
    await renderProvider();
    await waitFor(() => expect(captured?.loading).toBe(false));

    await act(async () => { await captured!.updateConfig({ theme: THEMES.light }); });
    expect(captured!.config.theme).toBe(THEMES.dark);
    expect(captured!.activeColors).toEqual(darkColors);
  });

  it('system theme resolves colors via OS appearance', async () => {
    mockGetColorScheme.mockReturnValue('light');
    mockConfigGet.mockResolvedValue({ ...DEFAULT_CONFIG, theme: THEMES.system });
    await renderProvider();
    await waitFor(() => expect(captured?.loading).toBe(false));

    expect(captured!.activeColors).toEqual(lightColors);
    expect(mockAddChangeListener).toHaveBeenCalled();
  });

  it('listens for OS appearance changes when system theme is active', async () => {
    mockGetColorScheme.mockReturnValue('light');
    mockConfigGet.mockResolvedValue({ ...DEFAULT_CONFIG, theme: THEMES.system });
    await renderProvider();
    await waitFor(() => expect(captured?.loading).toBe(false));

    mockGetColorScheme.mockReturnValue('dark');
    const listener = mockAddChangeListener.mock.calls[0][0] as () => void;
    await act(async () => { listener(); });
    expect(captured!.activeColors).toEqual(darkColors);
  });
});