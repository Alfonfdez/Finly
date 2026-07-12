import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { PaletaColores, coloresDark, coloresLight } from '../constants/themes';
import { configRepository } from '../database';
import { setIdioma } from '../i18n';

export interface Configuracion {
  tema: 'oscuro' | 'claro' | 'sistema';
  primerDiaSemana: 0 | 1;
  divisa: string;
  separadorDecimal: ',' | '.';
  idioma: 'es' | 'en' | 'ca';
  tamanoTexto: 'pequeño' | 'mediano' | 'grande';
}

const CONFIG_DEFAULT: Configuracion = {
  tema: 'oscuro',
  primerDiaSemana: 1,
  divisa: '€',
  separadorDecimal: ',',
  idioma: 'es',
  tamanoTexto: 'mediano',
};

interface ConfigContextType {
  config: Configuracion;
  coloresActivos: PaletaColores;
  actualizarConfig: (parcial: Partial<Configuracion>) => void;
  cargando: boolean;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig debe usarse dentro de ConfigProvider');
  return ctx;
}

function resolverTema(tema: Configuracion['tema']): 'oscuro' | 'claro' {
  if (tema === 'sistema') {
    return Appearance.getColorScheme() === 'dark' ? 'oscuro' : 'claro';
  }
  return tema;
}

function resolverColores(tema: Configuracion['tema']): PaletaColores {
  return resolverTema(tema) === 'oscuro' ? coloresDark : coloresLight;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Configuracion>(CONFIG_DEFAULT);
  const [cargando, setCargando] = useState(true);
  const [coloresActivos, setColoresActivos] = useState<PaletaColores>(coloresDark);

  useEffect(() => {
    (async () => {
      try {
      const cargado = await configRepository.obtener();
      setConfig(cargado);
      setColoresActivos(resolverColores(cargado.tema));
      setIdioma(cargado.idioma);
      } catch {
        setColoresActivos(resolverColores(CONFIG_DEFAULT.tema));
      }
      setCargando(false);
    })();
  }, []);

  useEffect(() => {
    setColoresActivos(resolverColores(config.tema));
  }, [config.tema]);

  useEffect(() => {
    if (config.tema !== 'sistema') return;
    const sub = Appearance.addChangeListener(() => {
      setColoresActivos(resolverColores('sistema'));
    });
    return () => sub?.remove();
  }, [config.tema]);

  const actualizarConfig = async (parcial: Partial<Configuracion>) => {
    setConfig(prev => {
      const nuevo = { ...prev, ...parcial };
      setColoresActivos(resolverColores(nuevo.tema));
      if (parcial.idioma) setIdioma(parcial.idioma);
      configRepository.guardar(parcial).catch(() => {});
      return nuevo;
    });
  };

  return (
    <ConfigContext.Provider value={{ config, coloresActivos, actualizarConfig, cargando }}>
      {children}
    </ConfigContext.Provider>
  );
}
