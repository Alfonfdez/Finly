import type { Transaction, Category } from '../database/types';
import { getDisplayCategoryName } from '../i18n';
import { matchesAllTerms } from './search';

interface TransactionSearchContext {
  category?: Category;
  tags?: { name: string }[];
  accountName?: string;
}

export function matchesTransactionSearch(
  tx: Transaction,
  ctx: TransactionSearchContext,
  query: string
): boolean {
  const description = (tx.description ?? '').toLowerCase();
  const categoryName = ctx.category ? getDisplayCategoryName(ctx.category).toLowerCase() : '';
  const tagNames = (ctx.tags ?? []).map(tag => tag.name.toLowerCase());
  const accountName = (ctx.accountName ?? '').toLowerCase();
  return matchesAllTerms(query, description, categoryName, accountName, ...tagNames);
}
