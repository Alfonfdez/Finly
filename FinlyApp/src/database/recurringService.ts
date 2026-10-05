import { withTransaction } from './drizzle/engine';
import { recurringRepo } from './repositories/recurringRepo';
import { listDueOccurrences, nextDueOnOrAfter, todayDateOnly, MAX_CATCH_UP_OCCURRENCES } from '../utils/recurrence';

/**
 * Materialize every due occurrence for all active recurring rules.
 *
 * Runs on app start, on foreground and on the midnight timer. Safe to call
 * repeatedly: a partial unique index on (recurring_rule_id, recurrence_date)
 * plus the hasOccurrence guard make it idempotent. The list is bounded per rule
 * to avoid runaway generation.
 *
 * @returns the number of transactions created in this run.
 */
export async function materializeDueRecurring(now: Date = new Date()): Promise<number> {
  const today = todayDateOnly(now);
  const rules = await recurringRepo.listDue(today);
  if (rules.length === 0) return 0;

  let created = 0;

  for (const rule of rules) {
    const tagIds = await recurringRepo.getTagIds(rule.id);
    const { occurrences, nextDue } = listDueOccurrences(
      rule,
      rule.next_due,
      today,
      MAX_CATCH_UP_OCCURRENCES,
    );

    await withTransaction(async () => {
      for (const occurrence of occurrences) {
        if (await recurringRepo.hasOccurrence(rule.id, occurrence)) continue;
        await recurringRepo.insertOccurrence(rule, occurrence, tagIds);
        created += 1;
      }
      if (nextDue !== rule.next_due) {
        await recurringRepo.updateNextDue(rule.id, nextDue);
      }
    });
  }

  return created;
}

/**
 * Resume a paused rule. Occurrences missed while paused are intentionally NOT
 * created: the cursor jumps to the first occurrence on/after today, then the
 * current/next occurrence is materialized immediately.
 *
 * @returns the number of transactions created by the immediate reconciliation.
 */
export async function resumeRecurringRule(ruleId: number, now: Date = new Date()): Promise<number> {
  const rule = await recurringRepo.getById(ruleId);
  if (!rule) return 0;

  const today = todayDateOnly(now);
  const nextDue = rule.next_due < today ? nextDueOnOrAfter(rule, today) : rule.next_due;

  await recurringRepo.reactivate(ruleId, nextDue);
  return materializeDueRecurring(now);
}
