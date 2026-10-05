# Plan — 028 Recurring Transactions

Implementation plan. Tasks are tracked in `3-tasks.md`. Decisions (agreed): in-place edit after reconcile, form section + Drawer management screen, on-open/foreground + midnight-while-open materialization, daily/weekly/monthly/yearly + interval, delete keeps generated transactions.

## Design

### Data model (migration 004, additive)

```sql
CREATE TABLE IF NOT EXISTS recurring_rules (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK(type IN ('expense','income')),
  account_id   INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount       REAL NOT NULL CHECK(amount > 0),
  description  TEXT,
  frequency    TEXT NOT NULL CHECK(frequency IN ('daily','weekly','monthly','yearly')),
  interval     INTEGER NOT NULL DEFAULT 1 CHECK(interval >= 1),
  weekday      INTEGER,      -- weekly anchor 0..6
  day_of_month INTEGER,      -- monthly/yearly anchor 1..31
  month        INTEGER,      -- yearly anchor 1..12
  start_date   TEXT NOT NULL,-- date-only YYYY-MM-DD
  end_date     TEXT,         -- nullable
  next_due     TEXT NOT NULL,-- date-only, next occurrence to materialize
  active       INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at   TEXT
);

CREATE TABLE IF NOT EXISTS recurring_rule_tags (
  rule_id INTEGER NOT NULL REFERENCES recurring_rules(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (rule_id, tag_id)
);

ALTER TABLE transactions ADD COLUMN recurring_rule_id INTEGER REFERENCES recurring_rules(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN recurrence_date   TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_recurrence
  ON transactions(recurring_rule_id, recurrence_date)
  WHERE recurring_rule_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recurring_rules_user ON recurring_rules(user_id);
```

- New columns are nullable with no default (the only SQLite-safe `ALTER ADD COLUMN` form) so existing rows are untouched.
- The partial unique index is the idempotency guarantee for materialization.

### Migration & versioning strategy

- `database.ts`: import `004_recurring`, `SCHEMA_VERSION = 4`, add `if (currentVersion < 4) { await createRecurringSchema(database); await database.execAsync('PRAGMA user_version = 4'); }` inside the existing `withTransactionAsync`.
- Existing users (`user_version = 3`) run only the new branch — no reads/writes to existing rows.
- Fresh DBs run 001→004 in one transaction.
- Update in lockstep: `schemas.ts` (Zod `recurringRuleSchema`, `recurringRuleTagSchema`), `types.ts` (`z.infer`), `drizzle/schema.ts`, and the drift tests (`dbDrift` `EXPECTED_COLUMNS`/`TYPE_SAMPLES`/Zod-match map/`user_version` → 4, `drizzleDrift` table map).
- `resetDatabase` / `clearDataKeepSettings` / `applyBackup` get the new tables in FK-safe delete/insert order.

### Recurrence math (pure)

`src/utils/recurrence.ts` (no RN/Expo imports):
- `advanceOccurrence(rule, fromDate): string` — next scheduled date per frequency + interval + anchors, reusing `getDaysInMonth` for clamping.
- `listDueOccurrences(rule, today, cap): string[]` — occurrences from `rule.next_due` to `today` (bounded by `end_date` and `cap`).
- `describeRecurrence(rule, labels)` — human summary for the list/form.
- `addDays`/`addMonths`/`addYears` helpers if not already present (checked: only `getDaysInMonth` exists).

### Reconciliation service

`src/database/recurringService.ts`:
- `materializeDueRecurring(): Promise<number>` — for each active rule with `next_due <= today`: in one DB transaction, insert the due transactions (+ tag links) and advance `next_due`. Returns the number created.
- Triggered from `AppContext` on init (before the first fetch, then bump the transactions version), from an `AppState` `change → active` listener, and from a `setTimeout` scheduled to the next due instant while foregrounded.
- Idempotent and transactional; bounded per rule.

### Repository

`src/database/repositories/recurringRepo.ts`: `list`, `getById`, `createWithTags`, `updateWithTags`, `setActive`, `remove`, `listDue(today)`, `getTagsByRuleId(s)`, plus the bulk-past edit (`updateGeneratedTransactions(ruleId, patch)`).

### UI

| Piece | Where |
|-------|-------|
| `RepeatSection` (toggle + frequency + interval + end date + summary) | `src/components/RepeatSection.tsx`, rendered by `TransactionForm` |
| Rule state + submit | `src/hooks/useTransactionForm.ts` (new props/args; `onSubmitRule`) |
| Recurring list | `src/screens/RecurringScreen.tsx` (Drawer root) |
| Create / edit (scope modal) | `src/screens/CreateRecurringScreen.tsx` / `ModifyRecurringScreen.tsx` (reuse `TransactionForm` in rule mode) |
| Recurring chip + Stop repeating | `src/screens/TransactionDetailsScreen.tsx` |
| Navigation / routes | `src/constants/types.ts`, `src/navigation/AppNavigator.tsx` (Drawer `repeat-outline`) |

### Backup

- `backup.ts`: add `recurring_rules` + `recurring_rule_tags` to `snapshotSchema.data` as `.optional().default([])` (keeps v1/schema-3 backups importable), to `buildBackup`, and to `applyBackup` delete/insert order. `BACKUP_FORMAT_VERSION` stays `1`.

### Files

- **New:**
  - `src/database/migrations/004_recurring.ts`
  - `src/database/repositories/recurringRepo.ts`
  - `src/database/recurringService.ts`
  - `src/utils/recurrence.ts`
  - `src/components/RepeatSection.tsx`
  - `src/screens/RecurringScreen.tsx`, `src/screens/CreateRecurringScreen.tsx`, `src/screens/ModifyRecurringScreen.tsx`
  - `tests/utils/recurrence.test.ts`, `tests/database/recurringRepo.test.ts`, `tests/database/recurringService.test.ts`, `tests/component/RepeatSection.test.tsx`, `tests/screens/RecurringScreen.test.tsx`
- **Modified:**
  - `src/database/database.ts`, `schemas.ts`, `types.ts`, `drizzle/schema.ts`, `backup.ts`, `index.ts`
  - `src/database/repositories/transactionRepo*.ts` (recurring insert/link + bulk past update)
  - `src/hooks/useTransactionForm.ts`, `src/components/TransactionForm.tsx`, `src/screens/AddTransactionScreen.tsx`, `src/screens/ModifyTransactionScreen.tsx`, `src/screens/TransactionDetailsScreen.tsx`
  - `src/context/AppContext.tsx` (init + `AppState` + timer)
  - `src/navigation/AppNavigator.tsx`, `src/constants/types.ts`
  - `src/i18n/{en,es,ca,gl,eu,fr,de,pt,it}.ts`
  - `tests/database/{dbDrift,drizzleDrift,backup,contractSuite,contractTypes,sqliteContract,resetDatabase}.ts`
- **Docs:** `spec/constitution/3-roadmap.md`, `spec/constitution/2-tech-stack.md`, `spec/constitution/7-platform-differences.md`, `AGENTS.md` (migrations count / SCHEMA_VERSION), `docs/programming-concepts.md`, `docs/harnesses.md`, `docs/changelog.md`

### Dependencies

None new (no Expo/native packages added).

### Release

Backwards-compatible feature → **Finly 2.2.0** on release: `version`/`ios.buildNumber` → 2.2.0, `android.versionCode` 2 → 3.
