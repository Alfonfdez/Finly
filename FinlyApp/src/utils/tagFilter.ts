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
