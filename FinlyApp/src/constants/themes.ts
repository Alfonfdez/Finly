export interface PaletaColores {
  fondo: string;
  fondoAlto: string;
  texto: string;
  textoSuave: string;
  primario: string;
  acento: string;
  verde: string;
  rojo: string;
  borde: string;
}

export const coloresDark: PaletaColores = {
  fondo: '#0F172A',
  fondoAlto: '#1E293B',
  texto: '#E2E8F0',
  textoSuave: '#94A3B8',
  primario: '#22D3EE',
  acento: '#A78BFA',
  verde: '#34D399',
  rojo: '#F87171',
  borde: '#334155',
};

export const coloresLight: PaletaColores = {
  fondo: '#FFFFFF',
  fondoAlto: '#F1F5F9',
  texto: '#1E293B',
  textoSuave: '#64748B',
  primario: '#0891B2',
  acento: '#7C3AED',
  verde: '#059669',
  rojo: '#DC2626',
  borde: '#E2E8F0',
};
