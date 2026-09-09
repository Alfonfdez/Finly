export const DEFAULT_CURRENCY = 'currency_euro';

type CurrencyLabelKey =
  | 'currency_euro' | 'currency_usd' | 'currency_gbp' | 'currency_jpy' | 'currency_chf'
  | 'currency_cad' | 'currency_aud' | 'currency_nzd' | 'currency_sek' | 'currency_nok'
  | 'currency_dkk' | 'currency_pln' | 'currency_czk' | 'currency_huf' | 'currency_ron'
  | 'currency_try' | 'currency_brl' | 'currency_inr' | 'currency_krw' | 'currency_cny'
  | 'currency_thb' | 'currency_sgd' | 'currency_myr' | 'currency_php' | 'currency_idr'
  | 'currency_vnd' | 'currency_zar' | 'currency_ils' | 'currency_aed' | 'currency_sar';

interface CurrencyOption {
  symbol: string;
  labelKey: CurrencyLabelKey;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { symbol: '€', labelKey: 'currency_euro' },
  { symbol: '$', labelKey: 'currency_usd' },
  { symbol: '£', labelKey: 'currency_gbp' },
  { symbol: '¥', labelKey: 'currency_jpy' },
  { symbol: 'CHF', labelKey: 'currency_chf' },
  { symbol: 'C$', labelKey: 'currency_cad' },
  { symbol: 'A$', labelKey: 'currency_aud' },
  { symbol: 'NZ$', labelKey: 'currency_nzd' },
  { symbol: 'kr', labelKey: 'currency_sek' },
  { symbol: 'kr', labelKey: 'currency_nok' },
  { symbol: 'kr', labelKey: 'currency_dkk' },
  { symbol: 'zł', labelKey: 'currency_pln' },
  { symbol: 'Kč', labelKey: 'currency_czk' },
  { symbol: 'Ft', labelKey: 'currency_huf' },
  { symbol: 'lei', labelKey: 'currency_ron' },
  { symbol: '₺', labelKey: 'currency_try' },
  { symbol: 'R$', labelKey: 'currency_brl' },
  { symbol: '₹', labelKey: 'currency_inr' },
  { symbol: '₩', labelKey: 'currency_krw' },
  { symbol: '¥', labelKey: 'currency_cny' },
  { symbol: '฿', labelKey: 'currency_thb' },
  { symbol: 'S$', labelKey: 'currency_sgd' },
  { symbol: 'RM', labelKey: 'currency_myr' },
  { symbol: '₱', labelKey: 'currency_php' },
  { symbol: 'Rp', labelKey: 'currency_idr' },
  { symbol: '₫', labelKey: 'currency_vnd' },
  { symbol: 'R', labelKey: 'currency_zar' },
  { symbol: '₪', labelKey: 'currency_ils' },
  { symbol: 'AED', labelKey: 'currency_aed' },
  { symbol: 'SAR', labelKey: 'currency_sar' },
];

export function getCurrencySymbol(key: string): string {
  return CURRENCY_OPTIONS.find(c => c.labelKey === key)?.symbol ?? key;
}
