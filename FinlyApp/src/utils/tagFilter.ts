import { UNTAGGED_ID } from '../constants/types';

export function toggleTagInArray(prev: number[], id: number): number[] {
  if (id === UNTAGGED_ID) {
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
