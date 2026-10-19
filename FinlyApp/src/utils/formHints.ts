import { RECURRING_NAME_ERRORS, type RecurringNameError } from '../constants/types';

interface IconColorHintKeys {
  empty: string;
  iconColor: string;
  icon: string;
  color: string;
}

export function getIconColorHintText(
  name: string,
  nameError: string | null,
  selectedIcon: string | null,
  selectedColor: string | null,
  keys: IconColorHintKeys,
): string | null {
  if (name.trim().length === 0) return keys.empty;
  if (nameError) return nameError;
  if (!selectedIcon && !selectedColor) return keys.iconColor;
  if (!selectedIcon) return keys.icon;
  if (!selectedColor) return keys.color;
  return null;
}

export function getNameHintText(
  name: string,
  nameError: string | null,
  emptyKey: string,
): string | null {
  if (name.trim().length === 0) return emptyKey;
  if (nameError) return nameError;
  return null;
}

interface JoinHintsOptions {
  /** A multi-sentence checklist ends with a period; a plain list of reasons doesn't. */
  finalPeriod?: boolean;
}

/**
 * Composes a hint out of the sentences that actually apply: empty/null parts are
 * dropped and the rest are joined with ". ". Returns '' when nothing applies (the
 * bottom hint then renders nothing at all).
 */
export function joinHints(
  parts: (string | null | undefined)[],
  { finalPeriod = false }: JoinHintsOptions = {},
): string {
  const sentences = parts.filter(
    (part): part is string => typeof part === 'string' && part.trim() !== '',
  );
  if (sentences.length === 0) return '';
  return `${sentences.join('. ')}${finalPeriod ? '.' : ''}`;
}

interface TransactionHintValues {
  categoryId: number | null;
  numericAmount: number | null;
  accountId: number | undefined;
  repeatEndConflict: boolean;
  /** Rule mode only: the recurring name participates in the checklist. */
  ruleMode?: boolean;
  repeatNameError: RecurringNameError | null;
  /** Rule mode: the due backlog exceeds the catch-up limit, so the save is refused. */
  repeatTooMany?: boolean;
}

interface TransactionHintKeys {
  category: string;
  amount: string;
  account: string;
  repeatEnd: string;
  repeatName: string;
  repeatNameTaken: string;
  repeatTooMany: string;
}

/**
 * Every condition that still blocks saving a transaction (or a recurring rule, in
 * rule mode), as a checklist in display order. Pure: the labels are injected, so it
 * can be unit-tested without React or i18n.
 */
export function getTransactionFormHintText(
  values: TransactionHintValues,
  keys: TransactionHintKeys,
): string {
  const { categoryId, numericAmount, accountId, repeatEndConflict, ruleMode, repeatNameError, repeatTooMany } = values;

  return joinHints(
    [
      categoryId === null ? keys.category : null,
      numericAmount === null || numericAmount <= 0 ? keys.amount : null,
      accountId === undefined ? keys.account : null,
      repeatEndConflict ? keys.repeatEnd : null,
      ruleMode && repeatNameError === RECURRING_NAME_ERRORS.taken ? keys.repeatNameTaken : null,
      ruleMode && repeatNameError === RECURRING_NAME_ERRORS.required ? keys.repeatName : null,
      ruleMode && repeatTooMany ? keys.repeatTooMany : null,
    ],
    { finalPeriod: true },
  );
}
