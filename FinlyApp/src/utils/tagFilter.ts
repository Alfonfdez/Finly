import { UNTAGGED_ID } from '../constants/types';

/** Whether a tag id is the synthetic "Untagged" pseudo-tag (not a real tag). */
export function isUntaggedTag(tagId: number): boolean {
  return tagId === UNTAGGED_ID;
}

export function toggleTagInArray(prev: number[], id: number): number[] {
  if (isUntaggedTag(id)) {
    return prev.includes(UNTAGGED_ID) ? [] : [UNTAGGED_ID];
  }
  if (prev.includes(UNTAGGED_ID)) {
    return [id];
  }
  if (prev.includes(id)) {
    return prev.filter(i => i !== id);
  }
  return [...prev, id];
}

/**
 * Whether a transaction's tag ids match the active tag filter. The synthetic
 * "Untagged" pseudo-tag matches transactions with no tags; a regular id matches
 * transactions carrying it; several selected ids match as an OR. An empty filter
 * matches everything.
 */
export function matchesTagFilter(activeTagIds: readonly number[], transactionTagIds: readonly number[]): boolean {
  if (activeTagIds.length === 0) return true;
  if (activeTagIds.includes(UNTAGGED_ID) && transactionTagIds.length === 0) return true;
  const regularIds = activeTagIds.filter(id => !isUntaggedTag(id));
  return transactionTagIds.some(id => regularIds.includes(id));
}
