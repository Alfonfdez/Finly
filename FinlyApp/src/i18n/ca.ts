import { Idioma } from './en';

export const ca: Idioma = {
  // Settings
  settings_appearance: 'APARIÈNCIA',
  settings_calendar: 'CALENDARI',
  settings_money: 'FORMAT DE DINERS',
  settings_language: 'IDIOMA',
  settings_text: 'TEXT',
  settings_theme: 'Tema',
  settings_first_day: 'Primer dia de la setmana',
  settings_currency: 'Divisa',
  settings_decimal_sep: 'Separador decimal',
  settings_text_size: 'Mida del text',
  theme_dark: 'Fosc',
  theme_light: 'Clar',
  theme_system: 'Sistema',
  day_monday: 'Dilluns',
  day_sunday: 'Diumenge',
  sep_comma: 'Coma (1.234,56)',
  sep_dot: 'Punt (1,234.56)',
  size_small: 'Petit',
  size_medium: 'Mitjà',
  size_large: 'Gran',

  // Tabs
  tab_expenses: 'Despeses',
  tab_income: 'Ingressos',

  // Periods
  period_day: 'Dia',
  period_week: 'Setmana',
  period_month: 'Mes',
  period_year: 'Any',
  period_period: 'Període',

  // Calendar modal
  cal_select_day: 'Seleccionar dia',
  cal_select_week: 'Seleccionar setmana',
  cal_select_month: 'Seleccionar mes',
  cal_select_year: 'Seleccionar any',
  cal_select_period: 'Seleccionar període',
  cal_cancel: 'Cancel·lar',
  cal_ok: 'D\'acord',
  cal_all: 'Tots',
  cal_select_start: 'Seleccioneu data d\'inici',
  cal_select_end: 'Seleccioneu data de fi',
  cal_from: 'des de',
  cal_to: 'fins a',

  // Calendar picker display
  cal_month_of: (m: string, y: number) => `${m} de ${y}`,
  cal_range_from_to: (d1: string, m1: string, d2: string, m2: string, y: number) => `${d1} ${m1} – ${d2} ${m2} ${y}`,
  cal_period_from: (d: string, m: string) => `des de ${d} ${m}`,
  cal_period_to_hint: 'seleccioneu fi',

  // Day abbreviations (Sunday-first)
  days_short_sun: ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'],
  // Day abbreviations (Monday-first)
  days_short_mon: ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'],

  // Month names
  months: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
  months_short: ['Gen', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des'],

  // Home
  home_income: 'Ingressos',
  home_expenses: 'Despeses',
  home_open_menu: 'Obrir menú',
  home_view_transactions: 'Veure transaccions',
  home_add: 'Afegir despesa o ingrés',

  // Account modal
  account_select: 'Seleccionar compte',
  account_close: 'Tancar',

  // Add transaction
  add_title: 'Afegir transacció',
  add_amount_placeholder: 'Import',
  add_amount_error: 'L\'import introduït no és vàlid',
  add_account: 'Compte',
  add_categories: 'Categories',
  add_more: 'Més',
  add_day: 'Dia',
  add_today: 'Avui',
  add_yesterday: 'Ahir',
  add_day_before: 'Abans d\'ahir',
  add_selected: 'Seleccionat',
  add_tags: 'Etiquetes',
  add_tag_search: 'Cercar i crear etiquetes',
  add_tag_new: 'Afegir etiqueta',
  add_tag_modal_title: 'Afegir etiqueta',
  add_tag_name_placeholder: 'Nom de l\'etiqueta',
  add_comment: 'Comentari',
  add_photo: 'Foto',
  add_photo_title: 'Afegir foto',
  add_photo_camera: 'Fer foto',
  add_photo_gallery: 'Afegir des de la galeria',
  add_submit: 'Afegir',

  // Add category
  add_cat_title: 'Afegir categoria',
  add_cat_search: 'Cercar categoria',
  add_cat_no_results: 'No s\'ha trobat res',
  add_cat_create: 'Crear',

  // Categories (mock data - multilingual)
  cat_salary: 'Nómina',
  cat_freelance: 'Freelance',
  cat_food: 'Alimentació',
  cat_transport: 'Transport',
  cat_leisure: 'Oci',
  cat_housing: 'Habitatge',
  cat_health: 'Salut',
  cat_investments: 'Inversions',

  // Transactions
  transactions_title: 'Transaccions',
  transactions_empty: 'No hi ha transaccions',

  // Navigation
  nav_add: 'Afegir',
  nav_transactions: 'Transaccions',
  nav_settings: 'Configuració',
  nav_home: 'Inici',
  nav_accounts: 'Comptes',
  nav_categories: 'Categories',
  nav_coming_soon: 'Properes funcions',

  // Day letters (for circle icons)
  day_mon_letter: 'Dl',
  day_sun_letter: 'Dg',

  // Currencies
  currency_euro: 'Euro',
  currency_dollar: 'Dòlar',
  currency_pound: 'Lliura',
  currency_yen: 'Ien',

  // Languages
  lang_en: 'English',
  lang_es: 'Español',
  lang_ca: 'Català',

  // Accessibility
  a11y_show_expenses: 'Mostrar despeses',
  a11y_show_income: 'Mostrar ingressos',
  a11y_select_account: 'Seleccionar compte',
  a11y_category: 'Categoria',
  a11y_period: 'Període',
};
