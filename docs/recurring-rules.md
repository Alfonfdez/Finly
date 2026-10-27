# Recurring rules - complete behavior guide

This is the practical, end-to-end reference for recurring rules. The normative
source is [`spec/features/028-recurring-transactions/1-spec.md`](../spec/features/028-recurring-transactions/1-spec.md);
this guide explains the same behavior with examples and scenario tables.

## 1. Vocabulary

| Term | Meaning |
|---|---|
| Rule | The saved definition: schedule + transaction template (type, account, category, amount, comment, tags). |
| Occurrence | A scheduled **date** the rule fires on. An occurrence may have no transaction. |
| Transaction | A real database record. A generated transaction is one created by a rule. |
| Cursor (`next_due`) | The next occurrence the rule still has to generate. |
| Missed | An occurrence that is due but was not generated yet (the app was closed). |
| Skipped | An occurrence deliberately not generated (Future only or pause). |
| `skipped_from` | The earliest occurrence a Future-only edit skipped, so Future + past can recover it. |
| Fresh / unmaterialized | The cursor still equals the start date and the rule has generated nothing. |
| Active / Paused / Ended | The rule state used by reconciliation and the Recurring screen. |

## 2. Core model and invariants

- A rule stores `start_date`, optional `end_date`, frequency, interval, anchor
  columns, `next_due`, `active`, and `skipped_from`.
- A generated transaction has `recurring_rule_id` and `recurrence_date`. A partial
  unique index on `(recurring_rule_id, recurrence_date)` guarantees one transaction
  per rule occurrence.
- Reconciliation generates only occurrences up to **today**. Future occurrences
  wait until they become due.
- Occurrences are never re-dated. Generated transactions are never deleted by a
  rule edit. A rule edit can rewrite their details, never their dates.
- Creating a rule, editing a rule, and resuming a rule are atomic: if any step
  fails, the rule, its cursor and its transactions are left unchanged.
- Every explicit transaction goes through the single database transaction queue.
  Reconciliation, rule edits, imports, wipes and config saves cannot interleave.
- The catch-up limit is 5,000 occurrences per rule. The same limit blocks saving a
  rule whose due backlog cannot finish in one run.

## 3. Lifecycle

### Create

1. The rule is validated (name, interval, start/end, backlog).
2. The rule row and tag links are written.
3. Reconciliation runs immediately.
4. A past or today start generates every occurrence from the start up to today.
5. A future start generates nothing; the cursor stays on the start date.

### Normal reconciliation

Runs on app start, on foreground, and on the midnight timer while the app stays
open. For every active rule with `next_due <= today`, it inserts one transaction per
occurrence and advances the cursor. Missed occurrences are back-filled on their real
scheduled dates. Re-running is safe: already-generated dates are skipped and the
unique index is the final guard.

### Pause

- Sets `active = 0`.
- Reconciliation skips the rule.
- The cursor and `skipped_from` are not changed.
- Generated transactions stay untouched.

### Resume

- Only a paused, non-ended rule can resume.
- The cursor jumps to the first occurrence on or after today. Occurrences missed
  while paused are intentionally not created.
- If the cursor actually moved, `skipped_from` is cleared: back-filling it would also
  fill the pause window, which must stay skipped.
- If the cursor did not move, the recorded skip remains recoverable.
- Reactivation and the immediate catch-up happen in one transaction. A failure leaves
  the rule paused.

### Ended

A rule is ended when it has an end date and no occurrence remains on or after today
within that end date. The state is derived, not stored. Ended rules are skipped by
reconciliation and their toggle is disabled. Extending or clearing the end date
revives the rule.

### Delete

Deleting a rule removes the rule and its tag links but keeps every generated
transaction (`ON DELETE SET NULL`). Deleting a category or account deletes its rules
too; moving a category moves its rules with its transactions.

## 4. Frequencies and dates

| Frequency | Anchor | Example | Month-end behavior |
|---|---|---|---|
| Daily | Start date + interval days | Every 3 days from 1 Oct | None |
| Weekly | Start weekday + interval weeks | Every 2 weeks on Monday | None |
| Monthly | Day of month + interval months | Every month on the 31st | Clamps to the last day of short months |
| Yearly | Month + day + interval years | Every year on 29 February | 29 Feb clamps to 28 Feb in non-leap years |

- Interval is an integer from 1 to 99.
- **Last day** (monthly/yearly): the first occurrence is the last day of the start
  month, and later occurrences land on each month's last day.
- The "Last day" checkbox is an ambiguity resolver. It is shown only when the picked
  date is a month-end where "the Nth" and "the last day" differ:
  - monthly: Feb 28 in a non-leap year, Feb 29 in a leap year, and 30 Apr/Jun/Sep/Nov;
  - yearly: 28 February in a non-leap year.
- An end date must be strictly after the built start date. A last-day rule whose
  built start would fall after the picked end date is rejected.

## 5. Cursor and edit anchoring

The cursor is the next occurrence not yet generated. After a normal catch-up it is
the first occurrence after today. For a fresh rule it equals the start date.

### Future only

- Anchors at the new schedule's first occurrence on or after today.
- Occurrences before today are skipped.
- Existing transactions are not changed.
- A schedule change takes effect today, even if the old cursor was in the future.
- If today's occurrence already exists under the previous schedule, the anchor moves
  to the next occurrence. The form checks both the previous schedule and the loaded
  generated occurrence dates.
- Shortening an end date never moves the cursor backwards. If the schedule now ends
  before the cursor, the cursor stays where it was.

### Future + past

- Re-anchors at the rule's cursor, or at the earliest recoverable `skipped_from`.
- Back-fills the missed window up to today.
- Rewrites the details of generated transactions inside the new start/end window:
  account, category, amount, comment, tags and type.
- Never changes dates and never deletes transactions.
- Transactions outside the window stay linked but unchanged.
- It is offered only when it can affect the past: a detail changed, or a missed or
  skipped window exists.
- Shortening an end date never rewinds the cursor here either.

### Paused rules

- A save cannot create occurrences.
- The Summary says nothing will be created until resume.
- Future + past is available only to rewrite existing transactions when a
  past-affecting detail changed.
- Skip recovery, the skip confirmation dialog, the >5,000 guard and scope-only saves
  are disabled.
- The cursor and `skipped_from` are preserved.

### Start date editing

- A rule is fresh only when its cursor equals its start date **and** it has generated
  nothing.
- A fresh rule re-anchors from the new start. Moving it to today generates today;
  moving it earlier skips the past window and records it as recoverable.
- A started rule keeps its cursor. Moving the start earlier does not recreate past
  occurrences; the form shows a hint.
- A started rule stays started after a Future-only edit moves its start to the future
  (`next_due === start_date`). Moving the start back to the past later does not
  back-fill.

### Skip windows and recovery

- A Future-only save that would skip occurrences records the earliest skipped
  occurrence in `skipped_from`.
- The skip count and `skipped_from` ignore dates that already have a generated
  transaction.
- While the window is within the end date, Future + past can recover it: it
  re-anchors at `skipped_from`, back-fills the missing dates, skips duplicates and
  clears the record.
- A pause/resume skip is permanent and is not recorded. Resuming past a pause window
  drops an older recoverable skip because it could no longer be filled faithfully.

## 6. Scenario matrix

`existing` = generated transactions; `window` = occurrences the new schedule implies
between the cursor and today.

| Scenario | Future only | Future + past |
|---|---|---|
| Detail change on a caught-up rule | existing untouched; nothing generated now | existing rewritten; missed window back-filled |
| Timing change (frequency, interval, end) | takes effect today; existing untouched | takes effect today; window back-filled; existing details unchanged |
| Fresh rule -> start today | re-anchors; generates today | same |
| Fresh rule -> earlier past start | generates from today; earlier window skipped and recorded | back-fills from the new start |
| Fresh rule -> later future start | nothing until due | nothing until due |
| Started rule -> earlier start | no earlier dates; hint | no earlier dates; existing details rewritten |
| Extend end date | adds from today | back-fills the missed window |
| Shorten end date | never deletes; may become Ended; cursor never rewinds | same; cursor never rewinds |
| Recoverable skip -> Future + past | not applicable | re-anchors to `skipped_from`, back-fills, clears record |
| Pause -> resume | cursor jumps to first on/after today; pause window stays skipped; old recoverable skip dropped if cursor moved | not applicable |
| Paused rule + detail change | existing untouched; nothing created | existing rewritten; nothing created |
| Paused rule + timing change only | schedule saved; existing untouched; nothing created | not offered; same result as Future only |
| Paused rule + no change | save disabled | not offered |
| Ended rule + shorten end date | stays ended; cursor stays after the old end | same; cursor never rewinds |
| Ended rule + extend end date | revives; starts from today | revives; back-fills from the cursor |
| Today already generated | starts at the next occurrence | counts only missing occurrences |

## 7. Worked examples

### Example 1 - monthly rent with a past start

Rule: 100 on the 2nd of every month, start 2026-01-02, today 2026-04-15.

- Creating it generates 2 Jan, 2 Feb, 2 Mar and 2 Apr.
- The cursor becomes 2 May.
- Reopening the app does not duplicate those four transactions.

### Example 2 - future start

Rule: daily, start 2026-10-30, today 2026-10-13.

- Creating it generates nothing.
- The Summary says no transactions will be created now.
- On 30 October the occurrence is generated and the cursor moves to 31 October.

### Example 3 - monthly on the 31st

Rule: monthly on day 31.

- January -> 31 January.
- February -> 28 February (29 in a leap year).
- April -> 30 April.

### Example 4 - yearly on 29 February

Rule: yearly on 29 February.

- Leap year -> 29 February.
- Non-leap year -> 28 February.

### Example 5 - last day of the month

Rule: monthly, start 10 October, "Last day" checked.

- The first occurrence is 31 October, not 10 October.
- Later occurrences land on the last day of each month.

### Example 6 - Future only skip and recovery

Rule: daily, cursor 1 October, today 7 October. The user edits the amount and saves
Future only.

- The save skips 1-6 October and generates 7 October.
- `skipped_from` becomes 1 October.
- The Summary reports the skipped occurrences.
- Reopening the edit and choosing Future + past back-fills 1-6 October, leaves the
  existing 7 October transaction, and clears `skipped_from`.

### Example 7 - paused detail rewrite

Rule: daily, paused, 30 generated transactions. The user changes the amount and
chooses Future + past.

- No new transaction is created.
- The 30 existing transactions are rewritten to the new amount.
- The cursor and `skipped_from` stay unchanged.
- Future + past is not offered if no past-affecting detail changed.

### Example 8 - ended rule shortened, then extended

Rule: daily, end 25 October, cursor 26 October.

- Shortening the end to 20 October does not move the cursor back to 21 October.
- The rule stays ended.
- Extending the end to 31 October revives it; Future + past can back-fill from the
  cursor.

### Example 9 - pause and resume

Rule: daily, paused from 1 October to 10 October.

- Pausing creates nothing.
- Resuming on 10 October moves the cursor to 10 October and generates that day.
- 1-9 October stay skipped forever.
- If an older recoverable skip existed, it is dropped because the cursor moved.

### Example 10 - existing occurrences in a skip window

Rule: daily, cursor 1 October, today 7 October. 1 and 2 October already have
transactions.

- Future only skips 3-6 October.
- The skip count is 4, not 6.
- `skipped_from` is 3 October, not 1 October.

## 8. UI states and messages

- **Next:** the next occurrence the rule will generate.
- **Ended:** no occurrence remains within the end date.
- **No transactions will be created now:** the next occurrence is in the future.
- **Back-fill from:** Future + past will create missing occurrences from this date.
- **Updates N past transactions:** Future + past will rewrite N existing transactions.
- **Paused:** a save creates nothing until the rule is resumed.
- **Skip occurrences?:** Future only would skip occurrences; the save waits for
  confirmation.
- **This rule has ended:** no future transactions will be created.
- **Changing the start date does not add earlier transactions:** the rule has already
  generated history.

## 9. Backup, import and reset

- Backups include `recurring_rules` and `recurring_rule_tags`.
- Older schema-3 backups still import; the new collections default to empty.
- Import, delete-all and factory reset include the recurring tables in FK-safe order.
- Rule edits and imports share the transaction queue, so they cannot interleave.
- During an import, the app suspends category-filter pruning until both the imported
  config and the refreshed category list are published, so imported filters are not
  pruned against stale categories.

## 10. Test map

| Area | Tests |
|---|---|
| Date math, anchors, clamping, cursor and edit planning | `tests/utils/recurrence.test.ts` |
| Reconciliation, edits, paused rules, resume atomicity | `tests/database/recurringService.test.ts` |
| Summary save invariant | `tests/database/recurringService.preview.test.ts` |
| Paused and skip UI paths | `tests/screens/ModifyRecurringScreen.test.tsx` |
| Paused catch-up guard | `tests/component/TransactionForm.test.tsx` |
| Paused skip recovery gate | `tests/hooks/useRecurringEditScope.test.tsx` |
| Recurring rule storage | `tests/database/recurringRepo.test.ts` |
| Import/config publication guard | `tests/screens/DataScreen.test.tsx` |
| Category-filter normalization | `tests/utils/categoryFilterSelection.test.ts`, `tests/screens/AllTransactionsScreen.test.tsx` |

## 11. References

- Normative spec: [`spec/features/028-recurring-transactions/1-spec.md`](../spec/features/028-recurring-transactions/1-spec.md)
- Concepts: [`docs/programming-concepts.md`](programming-concepts.md)
- Implementation: `src/utils/recurrence.ts`, `src/database/recurringService.ts`,
  `src/components/RepeatSection.tsx`, `src/screens/ModifyRecurringScreen.tsx`
