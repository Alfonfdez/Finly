import { getDatabase } from '../database';
import { Configuracion } from '../../context/ConfigContext';

const CONFIG_DEFAULTS: Configuracion = {
  tema: 'oscuro',
  primerDiaSemana: 1,
  divisa: '€',
  separadorDecimal: ',',
  idioma: 'es',
  tamanoTexto: 'mediano',
};

function parseConfig(rows: { clave: string; valor: string }[]): Configuracion {
  const map = Object.fromEntries(rows.map(r => [r.clave, r.valor]));
  return {
    tema: (map.tema as Configuracion['tema']) ?? CONFIG_DEFAULTS.tema,
    primerDiaSemana: map.primerDiaSemana === '0' ? 0 : 1,
    divisa: map.divisa ?? CONFIG_DEFAULTS.divisa,
    separadorDecimal: (map.separadorDecimal as Configuracion['separadorDecimal']) ?? CONFIG_DEFAULTS.separadorDecimal,
    idioma: (map.idioma as Configuracion['idioma']) ?? CONFIG_DEFAULTS.idioma,
    tamanoTexto: (map.tamanoTexto as Configuracion['tamanoTexto']) ?? CONFIG_DEFAULTS.tamanoTexto,
  };
}

export const configRepo = {
  async obtener(): Promise<Configuracion> {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ clave: string; valor: string }>('SELECT clave, valor FROM configuracion');
    return rows.length > 0 ? parseConfig(rows) : CONFIG_DEFAULTS;
  },

  async guardar(parcial: Partial<Configuracion>): Promise<void> {
    const db = getDatabase();
    for (const [clave, valor] of Object.entries(parcial)) {
      if (valor === undefined) continue;
      const val = String(valor);
      await db.runAsync(
        'INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor',
        clave,
        val
      );
    }
  },
};
