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
  add_title: 'Add transaction',
  add_amount_placeholder: 'Amount',
  add_amount_error: 'The amount entered is not valid',
  add_account: 'Account',
  add_categories: 'Categories',
  add_more: 'More',
  add_day: 'Day',
  add_today: 'Today',
  add_yesterday: 'Yesterday',
  add_day_before: 'Day before yesterday',
  add_selected: 'Selected',
  add_tags: 'Tags',
  add_tag_search: 'Search and create tags',
  add_tag_new: 'Add tag',
  add_tag_modal_title: 'Add tag',
  add_tag_name_placeholder: 'Tag name',
  add_comment: 'Comment',
  add_photo: 'Photo',
  add_photo_title: 'Add photo',
  add_photo_camera: 'Take photo',
  add_photo_gallery: 'Add from gallery',
  add_submit: 'Add',

  // Add category
  add_cat_title: 'Add category',
  add_cat_search: 'Search category',
  add_cat_no_results: 'No results found',
  add_cat_create: 'Create',

  // Categories (mock data - multilingual)
  cat_salary: 'Salary',
  cat_freelance: 'Freelance',
  cat_food: 'Food',
  cat_transport: 'Transport',
  cat_leisure: 'Leisure',
  cat_housing: 'Housing',
  cat_health: 'Health',
  cat_investments: 'Investments',

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

  // Day letters (for circle icons)
  day_mon_letter: 'M',
  day_sun_letter: 'S',

  // Currencies
  currency_euro: 'Euro',
  currency_dollar: 'Dollar',
  currency_pound: 'Pound',
  currency_yen: 'Yen',

  // Languages
  lang_en: 'English',
  lang_es: 'Español',
  lang_ca: 'Català',

  // Accessibility
  a11y_show_expenses: 'Show expenses',
  a11y_show_income: 'Show income',
  a11y_select_account: 'Select account',
  a11y_category: 'Category',
  a11y_period: 'Period',
};

export type Idioma = typeof en;
