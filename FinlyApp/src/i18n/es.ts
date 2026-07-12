import { Idioma } from './en';

export const es: Idioma = {
  // Settings
  settings_appearance: 'APARIENCIA',
  settings_calendar: 'CALENDARIO',
  settings_money: 'FORMATO DE DINERO',
  settings_language: 'IDIOMA',
  settings_text: 'TEXTO',
  settings_theme: 'Tema',
  settings_first_day: 'Primer día de semana',
  settings_currency: 'Divisa',
  settings_decimal_sep: 'Separador decimal',
  settings_text_size: 'Tamaño del texto',
  theme_dark: 'Oscuro',
  theme_light: 'Claro',
  theme_system: 'Sistema',
  day_monday: 'Lunes',
  day_sunday: 'Domingo',
  sep_comma: 'Coma (1.234,56)',
  sep_dot: 'Punto (1,234.56)',
  size_small: 'Pequeño',
  size_medium: 'Mediano',
  size_large: 'Grande',

  // Tabs
  tab_expenses: 'Gastos',
  tab_income: 'Ingresos',

  // Periods
  period_day: 'Día',
  period_week: 'Semana',
  period_month: 'Mes',
  period_year: 'Año',
  period_period: 'Período',

  // Calendar modal
  cal_select_day: 'Seleccionar día',
  cal_select_week: 'Seleccionar semana',
  cal_select_month: 'Seleccionar mes',
  cal_select_year: 'Seleccionar año',
  cal_select_period: 'Seleccionar período',
  cal_cancel: 'Cancelar',
  cal_ok: 'Ok',
  cal_all: 'Todos',
  cal_select_start: 'Seleccione fecha de inicio',
  cal_select_end: 'Seleccione fecha de fin',
  cal_from: 'desde',
  cal_to: 'hasta',

  // Calendar picker display
  cal_month_of: (m: string, y: number) => `${m} de ${y}`,
  cal_range_from_to: (d1: string, m1: string, d2: string, m2: string, y: number) => `${d1} ${m1} – ${d2} ${m2} ${y}`,
  cal_period_from: (d: string, m: string) => `desde ${d} ${m}`,
  cal_period_to_hint: 'seleccione fin',

  // Day abbreviations (Sunday-first)
  days_short_sun: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
  // Day abbreviations (Monday-first)
  days_short_mon: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],

  // Month names
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  months_short: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],

  // Home
  home_income: 'Ingresos',
  home_expenses: 'Gastos',
  home_open_menu: 'Abrir menú',
  home_view_transactions: 'Ver transacciones',
  home_add: 'Añadir gasto o ingreso',

  // Account modal
  account_select: 'Seleccionar cuenta',
  account_close: 'Cerrar',

  // Add transaction
  add_title: 'Añadir Gasto / Ingreso',
  add_coming_soon: 'Formulario próximamente',

  // Transactions
  transactions_title: 'Transacciones',
  transactions_empty: 'No hay transacciones',

  // Navigation
  nav_add: 'Añadir',
  nav_transactions: 'Transacciones',
  nav_settings: 'Ajustes',
  nav_home: 'Inicio',
  nav_accounts: 'Cuentas',
  nav_categories: 'Categorías',
  nav_coming_soon: 'Futuras funciones',
};
