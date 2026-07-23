import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { ColorPalette, darkColors, lightColors } from '../constants/themes';
import { configRepository } from '../database';
import { setLanguage } from '../i18n';
import { isWeb } from '../utils/platform';
import type { Language } from '../utils/language';

export interface Config {
  theme: 'dark' | 'light' | 'system';
  firstDayOfWeek: 0 | 1;
  currency: string;
  decimalSeparator: ',' | '.';
  language: Language;
  textSize: 'small' | 'medium' | 'large';
  categoryIconShape: 'square' | 'circle';
  accountIconShape: 'square' | 'circle';
  homeDefaultAccountId: number | null;
  homeDefaultPeriod: 'day' | 'week' | 'month' | 'year';
  addDefaultAccountId: number | null;
  addShowLabels: boolean;
  addShowComments: boolean;
  addShowPhoto: boolean;
  hideBalances: boolean;
}

const CONFIG_DEFAULT: Config = {
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

function resolveTheme(theme: Config['theme']): 'dark' | 'light' {
  if (theme === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return theme;
}

function resolveColors(theme: Config['theme']): ColorPalette {
  return resolveTheme(theme) === 'dark' ? darkColors : lightColors;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(CONFIG_DEFAULT);
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
        setActiveColors(resolveColors(CONFIG_DEFAULT.theme));
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setActiveColors(resolveColors(config.theme));
  }, [config.theme]);

  useEffect(() => {
    if (config.theme !== 'system') return;
    const sub = Appearance.addChangeListener(() => {
      setActiveColors(resolveColors('system'));
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
      ::-webkit-scrollbar-thumb { background: ${activeColors.primary}40; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: ${activeColors.primary}80; }
      * { scrollbar-width: thin; scrollbar-color: ${activeColors.primary}40 ${activeColors.background}; }
    `;
  }, [activeColors]);

  const updateConfig = async (partial: Partial<Config>) => {
    setConfig(prev => {
      const updated = { ...prev, ...partial };
      setActiveColors(resolveColors(updated.theme));
      if (partial.language) setLanguage(partial.language);
      configRepository.save(partial).catch(() => {});
      return updated;
    });
  };

  return (
    <ConfigContext.Provider value={{ config, activeColors, updateConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}
