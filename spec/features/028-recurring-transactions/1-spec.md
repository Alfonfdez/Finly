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
  - A **compulsory, unique name** field at the top of the section (trimmed, case-insensitive; checked against the user's other rules). It is stored on the rule and shown as the rule's title.
  - Frequency selector (Never / Daily / Weekly / Monthly / Yearly), an "every N" stepper, and an optional end date (reusing `CalendarModal` with bounds `minDate = the selected transaction day + 1` — or the deferred first occurrence when skipping it — and `maxDate = null`; the end date may be in the past when the start is in the past).
  - The start date defaults to the day selected in the form's `DaySelector`.
  - A human-readable summary is shown, phrased per frequency and localized (e.g. "Every month on day 6", "Every week on Monday", "Every year on October 6"; Spanish: "Cada año el 6 de octubre"), with an "until &lt;date&gt;" clause appended when an end date is set.
  - An optional **Skip the first occurrence** checkbox (shown when creating — add transaction and Create recurring — and hidden when editing an existing rule) defers the first generated occurrence by one interval (e.g. monthly from 6 Oct → first on 6 Nov): nothing is generated on the selected day and the anchor stays on it. While checked it shows the resulting first date ("First transaction: 6 Nov 2026"). The end date must be on/after that deferred first occurrence (otherwise submit is blocked with a hint).
- When Repeat is on, saving creates a `recurring_rules` row + tag links **and** reconciliation immediately materializes any occurrence that is already due (including the start date if it is today or earlier). When Repeat is off, saving behaves exactly as today (one transaction).
- The account/category/amount/comment/tags come from the same form fields; a recurring rule does not store a photo.

### 6. Management screen

- A new **Recurring** screen is reachable from the Drawer.
- It lists every rule with: the rule **name** (title), category icon + name, a human-readable frequency summary, the next due date (or **Ended**), the **creation date** and the **number of generated transactions**, plus type, amount and an active toggle (pause/resume). Empty state when there are none.
- A FAB opens the create flow (the transaction form in rule mode). Tapping a rule opens its edit flow.
- Pausing sets `active = 0` (stops materialization, keeps the link and the details chip). Resuming sets `active = 1` and sets `next_due` to the next occurrence on/after today, so occurrences missed during the pause are intentionally **not** created.
- **Ended state:** a rule with an end date and **no occurrence remaining on/after today within it** is shown as **Ended** — the toggle is off and **disabled** (dimmed), labelled **Ended**, and cannot be resumed (resuming could never generate an occurrence). The state is derived from the schedule (not persisted), so editing the end date into the future revives the rule and re-enables the toggle. Ended rules are skipped by reconciliation.

### 7. Editing a rule

- Editing a rule first **reconciles** the old schedule (so every occurrence due up to now exists with the old values), then updates the rule **in place** (including its editable, unique **name**) and reconciles again so the change takes effect immediately (no reopen needed).
- The cursor (next occurrence to materialize) is set according to the scope:
  - **Future only** (default): the next occurrence on/after today — occurrences missed since the rule's cursor are **skipped**, and already-generated transactions are unchanged.
  - **Future + past**: sets the cursor from the rule's own cursor (so any occurrences **missed since the last materialization are back-filled**) **and** bulk-updates every transaction generated by this rule to the new account/category/amount/comment/tags/**type** (dates are never changed, and **nothing is deleted**). It is offered only when it can affect the past — a detail field changed, the rule has a missed window to catch up, or a previous skip can be recovered.
  - **Recoverable skip**: a **Future only** save records the earliest skipped occurrence on the rule (`skipped_from`). While that window is within the end date, the edit screen enables **Future + past** again; choosing it re-anchors the cursor to `skipped_from` (back-filling the skipped occurrences, no duplicates) and clears the record. Skip windows caused by **pause/resume** or **skip-first** are intentionally not recorded (they stay permanent).
  - Saving with **Future only** while it would skip occurrences asks for a confirmation first (reporting how many), so a skip is never silent.
- Changing or shortening the end date never deletes already-generated transactions; it only affects what is generated from now on. A rule whose end date has passed is shown as **Ended** (no future occurrences) and its pause/resume toggle is disabled; extending (or clearing) the end date revives it.
- Editing an individual generated transaction from the transaction lists remains a one-off edit and does **not** change the rule.

### 8. Generated transactions and details

- Generated transactions are ordinary transactions (they appear in every list, total and chart on their scheduled date).
- `TransactionDetailsScreen` always shows a read-only **Recurring** row with the name of the rule that generated the transaction (or the shared `—` placeholder for a non-recurring one). It has no toggle — pausing/resuming is done from the Recurring screen.
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

- [x] A "Repeat" section is available in the add-transaction form (Never / Daily / Weekly / Monthly / Yearly + "every N" + optional end date) with a readable summary.
- [x] Every recurring rule has a compulsory, unique **name** (trimmed, case-insensitive), shown as the rule's title and editable when editing.
- [x] The Recurring screen shows each rule's name, creation date, generated-transaction count and next due (or **Ended**).
- [x] The recurring **End date** picker allows only dates strictly after the selected transaction day (which may be in the past), while the transaction date picker still allows only today/past.
- [x] A **Skip the first occurrence** option (creation only) defers the first transaction by one interval (e.g. monthly 6 Oct → 6 Nov) and generates nothing on the start day; the end date must be on/after that first occurrence or submit is blocked with a hint.
- [x] Saving with a repeat creates a rule and materializes any already-due occurrence as a transaction (correct account, category, type, amount, comment and tags).
- [x] On app start / foreground, every due occurrence since the last run is created, each dated on its scheduled day (missed months/years are back-filled).
- [x] Re-running reconciliation never duplicates an occurrence (idempotent via the unique occurrence index).
- [x] While the app is open across a due instant, the occurrence is created without reopening the app.
- [x] Monthly rules clamp short months (31 → last day) and yearly rules clamp Feb 29 in non-leap years.
- [x] A Drawer "Recurring" screen lists rules with frequency summary, next due date and an active toggle; empty state shown when there are none.
- [x] A rule can be paused (stops materialization, misses during the pause are not created) and resumed.
- [x] A rule with no occurrence left within its end date shows an off, disabled **Ended** toggle that cannot be resumed; extending the end date into the future revives it (toggle operable again).
- [x] Editing a rule "Future only" applies to future occurrences only; "Future + past" back-fills the missed window and bulk-updates its generated transactions' account/category/amount/comment/tags/type (never their dates, never deleting them); the change is reconciled immediately on save.
- [x] "Future + past" is offered only when it can affect the past (a detail field changed or a missed window exists); shortening the end date never deletes generated transactions, and a finished rule shows "Ended".
- [x] A window skipped by a "Future only" edit can be recovered later by re-opening the edit and choosing "Future + past" (the skipped occurrences are back-filled and the record cleared); "Future only" warns before skipping.
- [x] Editing an individual generated transaction does not change its rule.
- [x] Transaction details always show a read-only Recurring row with the rule name (or `—`); pausing/resuming is done from the Recurring screen.
- [x] Deleting a rule keeps every transaction it generated.
- [x] Export/import round-trips rules and tag links; a pre-028 (schema-3) backup still imports.
- [x] Migration 004 applies to an existing v2.1.0 database without touching existing rows and sets `user_version = 4`; fresh installs reach the same schema.
- [x] All texts are multilingual (9 languages) and screens respect theme and text size.
- [x] `npm run test:all` is green (typecheck + lint + tests).
- [x] Web verification via the `verification-loop` skill (375px) for the web-checkable criteria; native-only items (e.g. AppState background/foreground transitions on device) reported as not checkable on web.

---

## Out of scope (v1)

- Background execution while the app is closed (native `expo-background-task`) and notifications.
- "This occurrence only" exceptions and "after N occurrences" end conditions.
- Recurring rules that also carry a photo template.
- Server sync / multi-device.
