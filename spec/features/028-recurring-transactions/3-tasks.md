# Tasks — 028 Recurring Transactions

Execution order. Mark each task when completed.

---

### Phase 0 — Spec (this documentation pass)

[x] T0 — Create `spec/features/028-recurring-transactions/{1-spec,2-plan,3-tasks}.md`.
[x] T1 — Add a `028-recurring-transactions` entry to `spec/constitution/3-roadmap.md`.
[x] T2 — Document the migration/versioning plan in `spec/constitution/2-tech-stack.md` and `docs/programming-concepts.md`, and the platform behavior in `spec/constitution/7-platform-differences.md`.

---

### Phase 1 — Pure recurrence logic

[ ] T3 — Create `src/utils/recurrence.ts`:
  - `advanceOccurrence(rule, from)` for daily/weekly/monthly/yearly + `interval`, clamping via `getDaysInMonth` (monthly) and Feb-29 handling (yearly).
  - `listDueOccurrences(rule, today, cap)` from `next_due` to `today`, bounded by `end_date` and a safety cap.
  - `describeRecurrence(rule, labels)` summary text.

[ ] T4 — Add `tests/utils/recurrence.test.ts`: advancement per frequency/interval, month-end clamping (Jan 31 → Feb 28/29), leap-year yearly, catch-up list length, `end_date` exclusion, cap behavior.

---

### Phase 2 — Migration, schemas and drift

[ ] T5 — Create `src/database/migrations/004_recurring.ts` (`createRecurringSchema`) with the two tables, the two nullable `transactions` columns and the partial unique index.
[ ] T6 — Update `src/database/database.ts`: import 004, `SCHEMA_VERSION = 4`, add the `if (currentVersion < 4)` branch, and add the tables to `resetDatabase` / `clearDataKeepSettings` delete order.
[ ] T7 — Add `recurringRuleSchema`/`recurringRuleTagSchema` to `schemas.ts`; export `RecurringRule`/`RecurringRuleTag` from `types.ts`; extend `transactionSchema` with `recurring_rule_id`/`recurrence_date`.
[ ] T8 — Mirror the tables/columns in `drizzle/schema.ts` (same order/types).
[ ] T9 — Update `tests/database/dbDrift.test.ts` (`EXPECTED_COLUMNS`, `TYPE_SAMPLES`, Zod-match map, `user_version` → 4) and `tests/database/drizzleDrift.test.ts` (`DRIZZLE_TABLES`).

---

### Phase 3 — Repository

[ ] T10 — Create `src/database/repositories/recurringRepo.ts` (CRUD + tags + `listDue` + `setActive` + `updateGeneratedTransactions`), export via `index.ts`.
[ ] T11 — Extend `transactionRepo`/writes with recurring-aware insert (link + `recurrence_date`) and bulk past update.
[ ] T12 — Add contract tests: rule CRUD, due query, tag links, idempotent materialize (run twice → one row), bulk past update. Update `contractTypes.ts`/`contractSuite.ts`/`sqliteContract.test.ts`.

---

### Phase 4 — Reconciliation service + lifecycle

[ ] T13 — Create `src/database/recurringService.ts` (`materializeDueRecurring`) — transactional, bounded, idempotent.
[ ] T14 — Wire into `AppContext.tsx`: run on init (before the first fetch, then bump the version), on `AppState` `active`, and via a midnight `setTimeout`.
[ ] T15 — Add `tests/database/recurringService.test.ts`: catch-up of N missed occurrences, no duplicates on re-run, paused rules skipped, `end_date` respected, next_due advanced.

---

### Phase 5 — Form (create a rule)

[ ] T16 — Create `src/components/RepeatSection.tsx` and wire `useTransactionForm.ts` + `TransactionForm.tsx` (frequency, interval, end date, summary).
[ ] T17 — Update `AddTransactionScreen.tsx` to create a rule + tag links and reconcile when Repeat is on; unchanged behavior when off.
[ ] T18 — Component test `tests/component/RepeatSection.test.tsx`; extend `TransactionForm` tests.

---

### Phase 6 — Management screens, navigation, i18n

[ ] T19 — Create `RecurringScreen.tsx` (list, next due, active toggle, empty state, FAB) and Create/Modify screens reusing the form in rule mode.
[ ] T20 — Add routes + Drawer entry (`repeat-outline`) in `constants/types.ts` and `AppNavigator.tsx`.
[ ] T21 — Add i18n keys (`nav_recurring`, `recurring_*`, `repeat_*`) to all 9 language files.
[ ] T22 — Screen tests `tests/screens/RecurringScreen.test.tsx`.

---

### Phase 7 — Editing scope + details chip

[ ] T23 — Rule edit scope modal ("From now on" / "From now on + past generated") + bulk past update.
[ ] T24 — Transaction details "Recurring" chip + "Stop repeating" (deactivate).
[ ] T25 — Delete rule confirmation (keeps generated transactions).

---

### Phase 8 — Backup integration

[ ] T26 — Extend `backup.ts` (`snapshotSchema` optional collections, `buildBackup`, `applyBackup` order); keep `BACKUP_FORMAT_VERSION = 1`.
[ ] T27 — Update `tests/database/backup.test.ts`: rule round-trip, old schema-3 backup still imports, newer-schema rejection unchanged.

---

### Phase 9 — Docs, verification, release

[ ] T28 — Update `spec/constitution/3-roadmap.md` (Status), `spec/constitution/2-tech-stack.md`, `AGENTS.md` (migration count / `SCHEMA_VERSION 4`), `docs/harnesses.md` baseline, `docs/changelog.md`.
[ ] T29 — `npm run test:all` green.
[ ] T30 — `verification-loop` on web (375px): create a rule, back-date to trigger catch-up, verify generated transactions/chip, edit scope, pause/delete, export/import round-trip. Native-only items reported as not checkable on web.
[ ] T31 — Flip acceptance criteria `[ ]` → `[x]` in `1-spec.md` after verification.
[ ] T32 — Release prep (on request): 2.2.0, `versionCode` 2 → 3, READMEs, changelog.
