import type { Transaction, Category } from '../database/types';
import { getDisplayCategoryName } from '../i18n';

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
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const description = (tx.description ?? '').toLowerCase();
  const categoryName = ctx.category ? getDisplayCategoryName(ctx.category).toLowerCase() : '';
  const tagNames = (ctx.tags ?? []).map(tag => tag.name.toLowerCase());
  const accountName = (ctx.accountName ?? '').toLowerCase();
  const haystacks = [description, categoryName, accountName, ...tagNames];

  return terms.every(term => haystacks.some(haystack => haystack.includes(term)));
}
