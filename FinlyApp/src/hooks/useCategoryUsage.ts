import { useEffect, useState } from 'react';
import { transactionRepository } from '../database';
import type { Category } from '../database/types';

/** Lifetime transaction count per category, shared by Categories and Add category. */
export function useCategoryUsage(categories: readonly Category[]): ReadonlyMap<number, number> {
  const [usage, setUsage] = useState<ReadonlyMap<number, number>>(() => new Map());

  useEffect(() => {
    let active = true;
    if (categories.length === 0) {
      setUsage(new Map());
      return () => { active = false; };
    }
    transactionRepository.countByCategoryIdsMap(categories.map(category => category.id))
      .then((counts) => {
        if (!active) return;
        setUsage(new Map(Object.entries(counts).map(([id, count]) => [Number(id), Number(count)])));
      })
      .catch(() => { if (active) setUsage(new Map()); });
    return () => { active = false; };
  }, [categories]);

  return usage;
}
