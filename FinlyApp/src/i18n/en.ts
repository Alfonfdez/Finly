export const en = {
  // Settings
  settings_appearance: 'APPEARANCE',
  settings_calendar: 'CALENDAR',
  settings_money: 'MONEY FORMAT',
  settings_language: 'LANGUAGE',
  settings_text: 'TEXT',
  settings_theme: 'Theme',
  settings_first_day: 'First day of week',
  settings_currency: 'Currency',
  settings_decimal_sep: 'Decimal separator',
  settings_text_size: 'Text size',
  theme_dark: 'Dark',
  theme_light: 'Light',
  theme_system: 'System',
  day_monday: 'Monday',
  day_sunday: 'Sunday',
  sep_comma: 'Comma (1.234,56)',
  sep_dot: 'Dot (1,234.56)',
  size_small: 'Small',
  size_medium: 'Medium',
  size_large: 'Large',

  // Tabs
  tab_expenses: 'Expenses',
  tab_income: 'Income',

  // Periods
  period_day: 'Day',
  period_week: 'Week',
  period_month: 'Month',
  period_year: 'Year',
  period_period: 'Period',

  // Calendar modal
  cal_select_day: 'Select day',
  cal_select_week: 'Select week',
  cal_select_month: 'Select month',
  cal_select_year: 'Select year',
  cal_select_period: 'Select period',
  cal_cancel: 'Cancel',
  cal_ok: 'Ok',
  cal_all: 'All',
  cal_select_start: 'Select start date',
  cal_select_end: 'Select end date',
  cal_from: 'from',
  cal_to: 'to',

  // Calendar picker display
  cal_month_of: (m: string, y: number) => `${m} ${y}`,
  cal_range_from_to: (d1: string, m1: string, d2: string, m2: string, y: number) => `${d1} ${m1} – ${d2} ${m2} ${y}`,
  cal_period_from: (d: string, m: string) => `from ${d} ${m}`,
  cal_period_to_hint: 'select end',

  // Day abbreviations (Sunday-first)
  days_short_sun: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  // Day abbreviations (Monday-first)
  days_short_mon: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],

  // Month names
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  months_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  // Home
  home_income: 'Income',
  home_expenses: 'Expenses',
  home_open_menu: 'Open menu',
  home_view_transactions: 'View transactions',
  home_add: 'Add expense or income',

  // Account modal
  account_select: 'Select account',
  account_close: 'Close',

  // Add transaction
  add_title: 'Add Expense / Income',
  add_coming_soon: 'Form coming soon',

  // Transactions
  transactions_title: 'Transactions',
  transactions_empty: 'No transactions',

  // Navigation (static — won't update live, but correct per language)
  nav_add: 'Add',
  nav_transactions: 'Transactions',
  nav_settings: 'Settings',
  nav_home: 'Home',
  nav_accounts: 'Accounts',
  nav_categories: 'Categories',
  nav_coming_soon: 'Coming soon',
};

export type Idioma = typeof en;
