export const DEFAULT_CURRENCY = '€';

interface CurrencyOption {
  value: string;
  labelKey: 'currency_euro' | 'currency_dollar' | 'currency_pound' | 'currency_yen';
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: DEFAULT_CURRENCY, labelKey: 'currency_euro' },
  { value: '$', labelKey: 'currency_dollar' },
  { value: '£', labelKey: 'currency_pound' },
  { value: '¥', labelKey: 'currency_yen' },
];
