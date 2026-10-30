import { useCallback } from 'react';
import { recurringRepository } from '../database';
import { USER_ID } from '../constants/types';
import { useFocusLoad } from './useFocusLoad';

function namesEqual(a: Map<number, string>, b: Map<number, string>): boolean {
  return a.size === b.size && [...a].every(([id, name]) => b.get(id) === name);
}

/** Map of recurring rule id → rule name, for labelling generated transactions. */
export function useRecurringRuleNames(): Map<number, string> {
  const load = useCallback(async () => {
    const rules = await recurringRepository.list(USER_ID);
    return new Map(rules.map(r => [r.id, r.name]));
  }, []);
  return useFocusLoad(load, new Map<number, string>(), namesEqual).data;
}
