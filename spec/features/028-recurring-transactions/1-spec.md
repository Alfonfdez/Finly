# 028 — Recurring Transactions

- **Goal**
  Let users create a recurring expense or income once (for example "100 € on the 2nd of every month") and have the app automatically record each due occurrence as a normal transaction — with the same account, category, amount, comment and tags — so ongoing charges/income are tracked without re-entering them. Materialization is best-effort and local: it runs when the app is opened or foregrounded (back-filling every occurrence missed since the last run) and while the app stays open across a due instant.

---

## Functional requirements

### 1. Scope and platforms

- Recurring rules are available on **iOS, Android and web** (the reconciliation logic and the rule storage run through the shared `DatabaseHandle`, so behavior is identical on both engines).
- There is no server: "automatic" means the app materializes due occurrences **on app start**, **on app foreground** (`AppState`), and **while the app is open** across the due instant (a timer). A closed app catches up the next time it is opened.
- Running occurrences while the app is fully closed (OS background task) and push/notifications are **out of scope** for this feature.

### 2. Data model

- New table `recurring_rules`:
  - `id`, `user_id` (FK users, cascade), `type` (`expense`/`income`), `account_id` (FK accounts, cascade), `category_id` (FK categories, cascade), `amount` (> 0), `description` (comment template, nullable).
  - Schedule: `frequency` (`daily`/`weekly`/`monthly`/`yearly`), `interval` (>= 1, "every N"), and the anchor columns `weekday?` (weekly), `day_of_month?` (monthly/yearly), `month?` (yearly).
  - `start_date` (first occurrence, date-only), `end_date?` (optional last occurrence, date-only), `next_due` (date-only, the next occurrence to materialize), `active` (1/0), `created_at`, `updated_at`.
- New junction table `recurring_rule_tags(rule_id, tag_id)` holds the tag template (both FKs cascade).
- `transactions` gains two nullable columns:
  - `recurring_rule_id` (FK `recurring_rules`, `ON DELETE SET NULL`) — provenance of a generated transaction.
  - `recurrence_date` (date-only) — the scheduled day of the generated occurrence.
  - A **partial unique index** on `(recurring_rule_id, recurrence_date) WHERE recurring_rule_id IS NOT NULL` guarantees at most one transaction per rule occurrence (idempotency).
- Rules reference their account/category by id; deleting an account or category cascades (deletes) its rules, consistent with how transactions already cascade.
- The special "Total" account is excluded from the rule account picker (like the add-transaction form).

### 3. Reconciliation (catch-up materialization)

- A reconciliation routine runs on app start (after DB init), on foreground, and on the timer; each run is a single DB transaction.
- For every **active** rule with `next_due <= today`, it walks from `next_due` forward, inserting one transaction per occurrence (`date` = occurrence day at `00:00:00`, tag links copied from `recurring_rule_tags`, `recurring_rule_id`/`recurrence_date` set), then advances `next_due` past the last inserted occurrence.
- **Missed occurrences are back-filled**: opening the app one year after a monthly rule was created creates the 12 missed transactions, each dated on its real day.
- Idempotency is guaranteed by the unique index: a re-run never duplicates an occurrence. The loop is bounded per rule per run (a safety cap, e.g. 500 occurrences) to avoid runaway generation.
- Occurrences are only generated up to `today`; future occurrences are generated later when they become due.
- A rule that is `active = 0` (paused) is skipped; generated transactions are never modified by reconciliation afterwards.

### 4. Frequencies and schedule semantics

- Supported frequencies: **daily, weekly, monthly, yearly**, each with an "every N" interval (covers biweekly = weekly ×2, quarterly = monthly ×3, every-2-months, etc.).
- Anchor semantics:
  - Daily: `start_date + interval` days.
  - Weekly: anchored to the start weekday (or an explicit weekday); + `interval` weeks.
  - Monthly: the day-of-month from the start date; short months **clamp** to their last day (31 → 28/29/30) using the existing `getDaysInMonth`.
  - Yearly: month + day from the start date; Feb 29 clamps to Feb 28 in non-leap years.
- Optional **end date**: no occurrences are generated after it. (Occurrence-count ends and "this occurrence only" exceptions are out of scope for v1.)

### 5. Creating a recurring rule

- `TransactionForm` gains a **Repeat** section (a toggle) available when adding a transaction:
  - Frequency selector (Never / Daily / Weekly / Monthly / Yearly), an "every N" stepper, and an optional end date (reusing the existing `CalendarModal`).
  - The start date defaults to the day selected in the form's `DaySelector`.
  - A human-readable summary is shown (e.g. "Every 2 months on the 2nd, from 2 Oct 2026").
- When Repeat is on, saving creates a `recurring_rules` row + tag links **and** reconciliation immediately materializes any occurrence that is already due (including the start date if it is today or earlier). When Repeat is off, saving behaves exactly as today (one transaction).
- The account/category/amount/comment/tags come from the same form fields; a recurring rule does not store a photo.

### 6. Management screen

- A new **Recurring** screen is reachable from the Drawer.
- It lists every rule with: category icon + name, type, amount, a human-readable frequency summary, the next due date, and an active toggle (pause/resume). Empty state when there are none.
- A FAB opens the create flow (the transaction form in rule mode). Tapping a rule opens its edit flow.
- Pausing sets `active = 0` (stops materialization, keeps the link and the details chip). Resuming sets `active = 1` and sets `next_due` to the next occurrence on/after today, so occurrences missed during the pause are intentionally **not** created.

### 7. Editing a rule

- Editing a rule first **reconciles** (so every occurrence due up to now exists with the old values), then updates the rule **in place**. Future occurrences use the new values; already-generated transactions are not touched.
- The edit screen offers two scope choices:
  - **From now on** (default): only future occurrences change.
  - **From now on + past generated**: additionally bulk-updates every transaction generated by this rule to the new account/category/amount/comment/tags in one action.
- Editing an individual generated transaction from the transaction lists remains a one-off edit and does **not** change the rule.

### 8. Generated transactions and details

- Generated transactions are ordinary transactions (they appear in every list, total and chart on their scheduled date).
- `TransactionDetailsScreen` shows a **Recurring** chip when `recurring_rule_id` is set, with a **Stop repeating** action (deactivates the rule).
- Photos are per-transaction and are not copied from any template.

### 9. Deleting a rule

- Deleting a rule (confirmation modal) removes the rule + its tag links but **keeps every transaction it generated** (the FK is `ON DELETE SET NULL`, so they remain as normal history). Batch/past edits are no longer possible after deletion.

### 10. Backup and reset

- The backup snapshot includes two new collections, `recurring_rules` and `recurring_rule_tags`, so rules round-trip on export/import.
- Backwards compatibility: existing **v1 / schema-3 backups must still import**. The new collections are optional and default to `[]` on parse; `BACKUP_FORMAT_VERSION` stays `1`.
- `resetDatabase`, `clearDataKeepSettings` and `applyBackup` include the new tables in their FK-safe delete/insert order.

### 11. Database migration and versioning

- A new **additive** migration `004_recurring` creates `recurring_rules`/`recurring_rule_tags`, adds the two nullable columns to `transactions`, and creates the partial unique index.
- `SCHEMA_VERSION` goes **3 → 4**; the runner (`PRAGMA user_version`) applies `if (currentVersion < 4)` once, inside the existing migration transaction.
- Because existing v2.1.0 users have `user_version = 3`, only the new branch runs and **existing rows are never modified or deleted**; new columns are nullable with no default. Fresh installs run 001→004 in one transaction.
- All schema surfaces are updated in lockstep: `schemas.ts` (Zod), `types.ts` (`z.infer`), `drizzle/schema.ts`, and the drift tests.

---

## Non-functional requirements

- **Multilingual:** all visible texts use `t()`; new keys are added to all **9** language files (`en/es/ca/gl/eu/fr/de/pt/it`), with parity enforced by `tests/i18n/parity.test.ts`.
- **Theme / text size:** screens use `useConfig().activeColors` and `useFontSize()`.
- **Pure logic is Node-testable:** recurrence date math lives in `src/utils/recurrence.ts` (no React Native / Expo imports); the reconciliation and repository layers use only `DatabaseHandle`/Drizzle.
- **No new dependencies.**
- **Data safety:** the migration is additive and idempotent; reconciliation is transactional; the unique occurrence index makes materialization idempotent; old backups remain importable.
- **Performance:** reconciliation is a bounded loop per rule; the unique index and `(recurring_rule_id, recurrence_date)` lookups keep it cheap.

---

## Acceptance criteria

- [ ] A "Repeat" section is available in the add-transaction form (Never / Daily / Weekly / Monthly / Yearly + "every N" + optional end date) with a readable summary.
- [ ] Saving with a repeat creates a rule and materializes any already-due occurrence as a transaction (correct account, category, type, amount, comment and tags).
- [ ] On app start / foreground, every due occurrence since the last run is created, each dated on its scheduled day (missed months/years are back-filled).
- [ ] Re-running reconciliation never duplicates an occurrence (idempotent via the unique occurrence index).
- [ ] While the app is open across a due instant, the occurrence is created without reopening the app.
- [ ] Monthly rules clamp short months (31 → last day) and yearly rules clamp Feb 29 in non-leap years.
- [ ] A Drawer "Recurring" screen lists rules with frequency summary, next due date and an active toggle; empty state shown when there are none.
- [ ] A rule can be paused (stops materialization, misses during the pause are not created) and resumed.
- [ ] Editing a rule "From now on" changes only future occurrences; "From now on + past generated" bulk-updates its generated transactions.
- [ ] Editing an individual generated transaction does not change its rule.
- [ ] Transaction details show a Recurring chip with a "Stop repeating" action.
- [ ] Deleting a rule keeps every transaction it generated.
- [ ] Export/import round-trips rules and tag links; a pre-028 (schema-3) backup still imports.
- [ ] Migration 004 applies to an existing v2.1.0 database without touching existing rows and sets `user_version = 4`; fresh installs reach the same schema.
- [ ] All texts are multilingual (9 languages) and screens respect theme and text size.
- [ ] `npm run test:all` is green (typecheck + lint + tests).
- [ ] Web verification via the `verification-loop` skill (375px) for the web-checkable criteria; native-only items (e.g. AppState background/foreground transitions on device) reported as not checkable on web.

---

## Out of scope (v1)

- Background execution while the app is closed (native `expo-background-task`) and notifications.
- "This occurrence only" exceptions and "after N occurrences" end conditions.
- Recurring rules that also carry a photo template.
- Server sync / multi-device.
