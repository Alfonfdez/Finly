import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import { type ColorPalette, darkColors, lightColors } from '../constants/themes';
import { configRepository } from '../database';
import { setLanguage } from '../i18n';
import { ERROR_PREFIXES, logError, showErrorAlert } from '../utils/errors';
import { isWeb } from '../utils/platform';
import { withAlpha } from '../utils/color';
import { THEMES, type Theme } from '../constants/types';
import { DEFAULT_CONFIG } from '../database/configDefaults';
import { type Config } from '../database/types';

export type { Config };

interface ConfigContextType {
  config: Config;
  activeColors: ColorPalette;
  updateConfig: (partial: Partial<Config>) => Promise<void>;
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
  const configRef = useRef<Config>(DEFAULT_CONFIG);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [activeColors, setActiveColors] = useState<ColorPalette>(darkColors);

  useEffect(() => {
    (async () => {
      try {
        const loaded = await configRepository.get();
        configRef.current = loaded;
        setConfig(loaded);
        setActiveColors(resolveColors(loaded.theme));
        setLanguage(loaded.language);
      } catch (error) {
        logError(ERROR_PREFIXES.configLoad, error);
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
    return () => { style?.remove(); };
  }, [activeColors]);

  const updateConfig = useCallback(async (partial: Partial<Config>) => {
    const previous = configRef.current;
    const updated = { ...previous, ...partial };
    configRef.current = updated;
    if (partial.language) setLanguage(partial.language);
    setConfig(updated);
    if (partial.theme) setActiveColors(resolveColors(partial.theme));

    // Serialize saves so a slow earlier write cannot land after a newer one.
    const save = saveQueue.current.then(() => configRepository.save(partial));
    saveQueue.current = save.catch(() => {});

    try {
      await save;
    } catch (error) {
      logError(ERROR_PREFIXES.configSave, error);
      // A failed write may belong to an older update while a newer one is still
      // queued. Wait for the queue, then trust the DB instead of leaving an
      // optimistic value that was never persisted.
      await saveQueue.current.catch(() => {});
      try {
        const persisted = await configRepository.get();
        configRef.current = persisted;
        setConfig(persisted);
        setActiveColors(resolveColors(persisted.theme));
        setLanguage(persisted.language);
      } catch (reloadError) {
        logError(ERROR_PREFIXES.configLoad, reloadError);
        // The DB is unreadable: roll back only fields that still hold this
        // update's optimistic value, preserving any newer updates.
        const rolledBack = { ...configRef.current };
        for (const key of Object.keys(partial) as (keyof Config)[]) {
          if (rolledBack[key] === updated[key]) {
            (rolledBack as Record<string, unknown>)[key] = previous[key];
          }
        }
        configRef.current = rolledBack;
        setConfig(rolledBack);
        setActiveColors(resolveColors(rolledBack.theme));
        setLanguage(rolledBack.language);
      }
      showErrorAlert();
    }
  }, []);

  const value = useMemo(
    () => ({ config, activeColors, updateConfig, loading }),
    [config, activeColors, updateConfig, loading],
  );

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}
