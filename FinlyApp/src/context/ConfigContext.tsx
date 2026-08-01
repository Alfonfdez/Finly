import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { ColorPalette, darkColors, lightColors } from '../constants/themes';
import { configRepository } from '../database';
import { setLanguage } from '../i18n';
import { isWeb } from '../utils/platform';
import { LANGUAGES, type Language } from '../utils/language';
import { withAlpha } from '../utils/color';
import { CONFIG_ICON_SHAPES, PERIODS, TEXT_SIZES, THEMES, DECIMAL_SEPARATORS, FIRST_DAYS, type ConfigIconShape, type DecimalSeparator, type FirstDay, type Period, type TextSize, type Theme } from '../constants/types';
import { DEFAULT_CURRENCY } from '../constants/currencies';

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

const CONFIG_DEFAULT: Config = {
  theme: THEMES.dark,
  firstDayOfWeek: FIRST_DAYS.monday,
  currency: DEFAULT_CURRENCY,
  decimalSeparator: DECIMAL_SEPARATORS.comma,
  language: LANGUAGES.en,
  textSize: TEXT_SIZES.medium,
  categoryIconShape: CONFIG_ICON_SHAPES.square,
  accountIconShape: CONFIG_ICON_SHAPES.square,
  homeDefaultAccountId: null,
  homeDefaultPeriod: PERIODS.month,
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
  const [config, setConfig] = useState<Config>(CONFIG_DEFAULT);
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
        setActiveColors(resolveColors(CONFIG_DEFAULT.theme));
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

  const updateConfig = async (partial: Partial<Config>) => {
    const updated = { ...configRef.current, ...partial };
    if (partial.language) setLanguage(partial.language);
    configRepository.save(partial).catch(() => {});
    setConfig(updated);
    if (partial.theme) setActiveColors(resolveColors(partial.theme));
  };

  return (
    <ConfigContext.Provider value={{ config, activeColors, updateConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}
