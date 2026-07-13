import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { ColorPalette, darkColors, lightColors } from '../constants/themes';
import { configRepository } from '../database';
import { setLanguage } from '../i18n';

export interface Config {
  theme: 'dark' | 'light' | 'system';
  firstDayOfWeek: 0 | 1;
  currency: string;
  decimalSeparator: ',' | '.';
  language: 'es' | 'en' | 'ca';
  textSize: 'small' | 'medium' | 'large';
}

const CONFIG_DEFAULT: Config = {
  theme: 'dark',
  firstDayOfWeek: 1,
  currency: '€',
  decimalSeparator: ',',
  language: 'es',
  textSize: 'medium',
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
