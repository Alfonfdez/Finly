import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { ColorPalette, darkColors, lightColors } from '../constants/themes';
import { configRepository } from '../database';
import { setLanguage } from '../i18n';
import { isWeb } from '../utils/platform';
import { type Language } from '../utils/language';
import { withAlpha } from '../utils/color';
import { THEMES, type ConfigIconShape, type DecimalSeparator, type FirstDay, type Period, type TextSize, type Theme } from '../constants/types';
import { DEFAULT_CONFIG } from '../database/configDefaults';

export interface Config {
  theme: Theme;
  firstDayOfWeek: FirstDay;
  currency: string;
  decimalSeparator: DecimalSeparator;
  language: Language;
  textSize: TextSize;
  categoryIconShape: ConfigIconShape;
  accountIconShape: ConfigIconShape;
  homeDefaultAccountId: number | null;
  homeDefaultPeriod: Exclude<Period, 'custom'>;
  addDefaultAccountId: number | null;
  addShowLabels: boolean;
  addShowComments: boolean;
  addShowPhoto: boolean;
  hideBalances: boolean;
}

interface ConfigContextType {
  config: Config;
  activeColors: ColorPalette;
  updateConfig: (partial: Partial<Config>) => void;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}

function resolveTheme(theme: Theme): Exclude<Theme, 'system'> {
  if (theme === THEMES.system) {
    return Appearance.getColorScheme() === THEMES.dark ? THEMES.dark : THEMES.light;
  }
  return theme;
}

function resolveColors(theme: Theme): ColorPalette {
  return resolveTheme(theme) === THEMES.dark ? darkColors : lightColors;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const configRef = useRef(config);
  configRef.current = config;
  const [loading, setLoading] = useState(true);
  const [activeColors, setActiveColors] = useState<ColorPalette>(darkColors);

  useEffect(() => {
    (async () => {
      try {
        const loaded = await configRepository.get();
        setConfig(loaded);
        setActiveColors(resolveColors(loaded.theme));
        setLanguage(loaded.language);
      } catch {
        setActiveColors(resolveColors(DEFAULT_CONFIG.theme));
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setActiveColors(resolveColors(config.theme));
  }, [config.theme]);

  useEffect(() => {
    if (config.theme !== THEMES.system) return;
    const sub = Appearance.addChangeListener(() => {
      setActiveColors(resolveColors(THEMES.system));
    });
    return () => sub?.remove();
  }, [config.theme]);

  useEffect(() => {
    if (!isWeb) return;
    const styleId = 'finly-scrollbar-style';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = `
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: ${activeColors.background}; }
      ::-webkit-scrollbar-thumb { background: ${withAlpha(activeColors.primary, 25)}; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: ${withAlpha(activeColors.primary, 50)}; }
      * { scrollbar-width: thin; scrollbar-color: ${withAlpha(activeColors.primary, 25)} ${activeColors.background}; }
    `;
  }, [activeColors]);

  const updateConfig = useCallback(async (partial: Partial<Config>) => {
    const updated = { ...configRef.current, ...partial };
    if (partial.language) setLanguage(partial.language);
    configRepository.save(partial).catch(() => {});
    setConfig(updated);
    if (partial.theme) setActiveColors(resolveColors(partial.theme));
  }, []);

  const value = useMemo(
    () => ({ config, activeColors, updateConfig, loading }),
    [config, activeColors, updateConfig, loading]
  );

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}
