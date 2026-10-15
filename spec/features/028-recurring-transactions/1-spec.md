# 028 — Recurring Transactions

- **Goal**
  Let users create a recurring expense or income once (for example "100 € on the 2nd of every month") and have the app automatically record each due occurrence as a normal transaction — with the same account, category, amount, comment and tags — so ongoing charges/income are tracked without re-entering them. Materialization is best-effort and local: it runs when the app is opened or foregrounded (back-filling every occurrence missed since the last run) and while the app stays open across a due instant.

---

## Terminology

The recurring UI and code follow this lexicon — **dates are *occurrences*, records are *transactions***:

| Term | Meaning | Used for |
|---|---|---|
| **Recurring rule** (*rule*) | The saved definition (frequency, amount, account, category, tags, start/end). | The entity the user creates, edits, deletes and lists ("Edit recurring rule", "Delete 3 recurring rules?"). |
| **Occurrence** | A scheduled **date** the rule fires on — a slot, not a record. | Schedule concepts: first/next, skip, counts of skipped/missed ("4 occurrences will be skipped"). |
| **Transaction** | A **record** in the transaction lists. A *generated* (or *recurring*) *transaction* is one created by a rule. | Anything the user counts, keeps, edits or deletes ("1 transaction will be created", "its past transactions will be kept"). |
| **Create / generate** | Turn a due occurrence into a transaction (code: *materialize*). | The UI verb ("N transactions will be created"). |
| **Next due** | The next occurrence the rule will create (the rule's cursor). | The "Next: `<date>`" label. |
| **Cursor** (`next_due`) | The stored pointer to the next occurrence to materialize: the first occurrence after today once reconciled, or the start date for a rule that has never run. | Edit anchoring and the "Next:" labels. |
| **Skipped** | An occurrence deliberately not created (Future only / pause). | "occurrences will be skipped". |
| **Missed** | An occurrence already due but not created yet (the app was closed); it is created on the next run. | The catch-up window ("adds the missed transactions"). |
| **Paused / Active / Ended** | The rule's states. | The rule's status. |

- **Rule of thumb:** dates are **occurrences**, records are **transactions** — never call a record an "occurrence" or a date a "transaction".
- The bare **"Recurring"** is the *feature/section* name (drawer item, screen title, the repeat card title, the transaction-details row label, the view-picker title); **"recurring rule"** is the *entity*.
- English copy follows this lexicon first; the other 8 languages are aligned once the wording is final.

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
  - **Last day** (monthly/yearly only): the anchor is the 31st (clamped to each month's last day) and the **first occurrence is the last day of the start month** (start any day of October → first on Oct 31). A rule anchored on the 31st is the same schedule, so no extra column is stored.
- Optional **end date**: no occurrences are generated after it. (Occurrence-count ends and "this occurrence only" exceptions are out of scope for v1.)

### 5. Creating a recurring rule

- `TransactionForm` in **rule mode** (the Create/Edit recurring screens) shows a **Repeat** section — always rendered, with no enable toggle:
  - A **compulsory, unique name** field at the top of the section (trimmed, case-insensitive; checked against the user's other rules). It is stored on the rule and shown as the rule's title. The field shows only a **red border** on error (gated: a freshly-opened form is not shown in red; it arms once the field is changed or blurred). Focusing the field scrolls the section to the top on native so the input stays visible above the keyboard. An **amount of 0** is flagged with a red border (the digits keep their normal color; the field is never red on a freshly-opened form). The form's **bottom hint is a checklist**: whenever the save is blocked it lists **every** unmet condition at once, one sentence each (category, amount, account, end date, and the rule name — required or taken), rendered in a fixed-height slot **between Delete and Save** so the two buttons never move (see `spec/constitution/6-screens.md`, Form validation & bottom action area).
  - Frequency selector (Daily / Weekly / Monthly / Yearly), an "every N" stepper, and an optional end date (reusing `CalendarModal` with bounds `minDate = the day after the start date` and `maxDate = null`; the end date may be in the past when the start is in the past).
  - A **Last day of the month** checkbox (shown for monthly/yearly) anchors the rule on each month's last day, starting on the last day of the start month; the summary reads "Every month on the last day" (yearly: "Every year on the last day of `<month>`").
  - The date field is labelled **Start date** (the `DaySelector`, relabeled from "Day" in rule mode) and accepts **any** date — past, present or future (its day picker passes `maxDate = null`); it defaults to the day currently selected in the form.
  - A human-readable summary is shown, phrased per frequency and localized (e.g. "Every month on day 6", "Every week on Monday", "Every year on October 6"; Spanish: "Cada año el 6 de octubre"), with an "until `<date>`" clause appended when an end date is set.
  - A **Summary info block** (always shown) consolidates: the summary line, the **first transaction** date, and **how many transactions will be created on save** (occurrences up to today within the end date; "No transactions will be created now" when the first one is in the future).
- Saving creates a `recurring_rules` row + tag links **and** reconciliation immediately materializes any occurrence that is already due: a **past/today start** back-fills every occurrence from the start up to today, while a **future start** creates nothing until it becomes due (the cursor stays at the start date).
- The account/category/amount/comment/tags come from the same form fields; a recurring rule does not store a photo (the photo section is hidden in rule mode).
- The **add-transaction** form does **not** offer a Repeat section: it always saves a single plain transaction. Recurring rules are created only from the Recurring screen's create flow.

### 6. Management screen

- A new **Recurring** screen is reachable from the Drawer.
- It lists every rule with: the rule **name** (title), category icon + name, a human-readable frequency summary, the next due date (or **Ended**), the **creation date** and the **number of generated transactions**, plus type, amount and an active toggle (pause/resume). Empty state when there are none.
- A FAB opens the create flow (the transaction form in rule mode). Tapping a rule opens its edit flow.
- The screen has **Select** and **Search** header actions (like the other list screens). Search filters the rules by **name, category, comment and frequency**. Select enters multi-select (rows show a checkbox, the active toggle is hidden) and **bulk-deletes** the selected rules; their generated transactions are kept (`ON DELETE SET NULL`). A **Select all** / **Deselect all** row above the list (`select_all` / `deselect_all`, with the visible count `items_count`) selects every visible rule in one tap.
- The list can be **sorted** by **next due** (default, ascending), **name**, **amount** or **created** through a horizontally scrollable `SortToggle` row below the search bar; each field has a natural default direction (next due/name ascending, amount/created descending) and tapping the active field flips it. Sorting is **session-only** (not persisted).
- The list can be **filtered by status** with a `RecurringStatusChip` (in the same row as the sort toggle): **All** (default), **Active**, **Paused**, **Ended** — multi-select, session-only. "All" and the concrete statuses are mutually exclusive (picking a status clears All; picking All clears the statuses); selecting every status collapses back to All. The chip label shows "All", the single status, or the joined statuses ("Active + Ended"). A rule's status is **ended** when it has no occurrence left within its end date (which wins over the active flag — see the Ended state below), otherwise **active**/**paused** from the `active` flag.
- The list can be **filtered by type** with an **All / Expenses / Income** `TabBar` at the top (like All transactions), keeping only the rules whose `type` matches, and **by account** with an `AccountTrigger` above the sort row (like the transactions screens) opening the account modal; the **Total** account shows every account's rules. Both default to showing every rule (All / Total) and are **session-only**; they compose with the status filter, the search and the sort.
- Pausing sets `active = 0` (stops materialization, keeps the link and the details chip). Resuming sets `active = 1` and sets `next_due` to the next occurrence on/after today, so occurrences missed during the pause are intentionally **not** created.
- **Ended state:** a rule with an end date and **no occurrence remaining on/after today within it** is shown as **Ended** — the toggle is off and **disabled** (dimmed), labelled **Ended**, and cannot be resumed (resuming could never generate an occurrence). The state is derived from the schedule (not persisted), so editing the end date into the future revives the rule and re-enables the toggle. Ended rules are skipped by reconciliation.

### 7. Editing a rule

- Editing a rule first **reconciles** the old schedule (so every occurrence due up to now exists with the old values), then updates the rule **in place** (including its editable, unique **name**) and reconciles again so the change takes effect immediately (no reopen needed).
- The **Apply changes to** (scope) control lives inside the recurring card, directly above the **Summary info block**, so the block reflects the chosen scope. The screen footer keeps only the Delete button.

**Cursor & edit semantics.** Every rule stores `start_date` (the first/anchored occurrence) and `next_due` (the **cursor**: the next occurrence not yet materialized). After reconciliation the cursor is the first occurrence **after today**; for a rule that has never run it still equals `start_date`.

- The cursor after a save is set by the scope:
  - **Future only** (default): the new schedule's first occurrence **on/after today** — occurrences before today are **skipped**, and already-generated transactions are unchanged. Because it anchors at *today* (not at the rule's old next occurrence), a schedule change (e.g. **monthly → daily**) takes effect **today**.
  - **Future + past**: re-anchors at the rule's cursor — or the earliest recorded skipped occurrence — so any **missed window is back-filled**, **and** bulk-updates every transaction the rule generated to the new account/category/amount/comment/tags/**type** (dates are never changed; **nothing is deleted**). It is offered only when it can affect the past (a detail field changed, or a missed/skipped window exists). The Summary's back-fill count covers only the occurrences **not already generated** (the screen loads the rule's existing occurrence dates), so it matches exactly what the save creates — e.g. recovering a 2-day skip on a rule that already generated today reports **2**, not 3.
  - **Already-generated today:** when today's occurrence already exists (it did under the rule's *previous* schedule), **Future only** starts at the *next* occurrence instead of re-counting today; the Summary matches what the save will create.
  - **Recoverable skip:** a **Future only** save records the earliest skipped occurrence on the rule (`skipped_from`). While that window is within the end date, the edit screen enables **Future + past** again; choosing it re-anchors the cursor to `skipped_from` (back-filling the skipped occurrences, no duplicates) and clears the record. Skip windows caused by **pause/resume** are intentionally not recorded (they stay permanent).
  - Saving with **Future only** while it would skip occurrences asks for a confirmation first (reporting how many), so a skip is never silent.
- **Editing the Start date.** A rule that has **never generated or skipped** an occurrence (its cursor still equals its start date) is treated as **not-yet-started**: editing its **Start date** re-anchors it from the new start, so moving the start to today (or an earlier date) makes it due and generates from there — occurrences before today are still skipped and recorded as recoverable. Editing the start date **earlier** on a rule that has **already generated** transactions does **not** recreate the past occurrences (the cursor keeps its position); the card shows a hint. Moving the start **later** simply shifts the future.

**Edit scenarios** (`existing` = already-generated transactions; `window` = occurrences the new schedule implies in `cursor..today`):

| Scenario | Future only | Future + past |
|---|---|---|
| Detail change on a caught-up rule | existing untouched; nothing generated now | existing rewritten; the missed `window` (if any) back-filled |
| Timing change (frequency / interval / end) on a caught-up rule | takes effect **today**; existing untouched | takes effect today; `window` back-filled; existing details unchanged |
| Fresh rule (future start) — Start date → **today** | re-anchors; generates today's occurrence | same (nothing before today) |
| Fresh rule — Start date → **earlier past date** | generates from today; the earlier window is *skipped* and recorded recoverable | back-fills from the new start |
| Fresh rule — Start date → **later future date** | nothing until due | nothing until due |
| Started rule — Start date → **earlier** | no earlier dates created; hint shown | no earlier dates created; existing details rewritten |
| Extend end date | adds from today | back-fills the missed `window` |
| Shorten end date | never deletes; may become **Ended** | same |
| Recoverable skip → Future + past | — | re-anchors to `skipped_from`, back-fills, clears the record |
| Pause → Resume | cursor → first on/after today; the pause window stays skipped | — |

- Changing or shortening the end date never deletes already-generated transactions; it only affects what is generated from now on. A rule whose end date has passed is shown as **Ended** (no future occurrences) and its pause/resume toggle is disabled; extending (or clearing) the end date revives it.
- Editing an individual generated transaction from the transaction lists remains a one-off edit and does **not** change the rule. The modify form shows a **Recurring** notice at the top (repeat icon + title, "created by a recurring rule. Saving changes only affects this transaction, not the rule") with an **Edit recurring rule** button that opens the rule editor.

### 8. Generated transactions and details

- Generated transactions are ordinary transactions (they appear in every list, total and chart on their scheduled date).
- `TransactionDetailsScreen` always shows a **Recurring** row with the name of the rule that generated the transaction (or the shared `—` placeholder for a non-recurring one). When the transaction belongs to a rule the whole row is **pressable** (an `create-outline` affordance next to the name) and opens that rule's edit screen directly; without a rule the row is inert. It has no toggle — pausing/resuming is done from the Recurring screen.
- Photos are per-transaction and are not copied from any template.
- If a rule edit rewrites this transaction while its modify form is open (detected via the row's `updated_at`), the form **refreshes**: an untouched form silently adopts the new values, while a form with unsaved input keeps the user's edits and shows an extra **"updated by its recurring rule"** line with a **Use the rule's values** button that re-loads the row's values and discards the draft. A non-recurring transaction has no such notice, so it always adopts the row's values.

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

- [x] The recurring create/edit form shows a **Repeat** section (name / Daily / Weekly / Monthly / Yearly + "every N" + optional end date) with a readable summary; the add-transaction form does not.
- [x] Every recurring rule has a compulsory, unique **name** (trimmed, case-insensitive), shown as the rule's title and editable when editing.
- [x] The Recurring screen shows each rule's name, creation date, generated-transaction count and next due (or **Ended**).
- [x] The recurring create/edit form labels the date field **Start date** and accepts any date (past, present or future); the plain add/modify transaction date picker still allows only today/past.
- [x] The recurring **End date** picker allows only dates strictly after the start date, and the transaction date picker still allows only today/past.
- [x] The Repeat section always shows a **Summary** info block — the summary line, the first/next transaction date, and how many transactions will be created on save — which updates when the edit scope changes.
- [x] Saving with a repeat creates a rule and materializes any already-due occurrence as a transaction (correct account, category, type, amount, comment and tags).
- [x] On app start / foreground, every due occurrence since the last run is created, each dated on its scheduled day (missed months/years are back-filled).
- [x] Re-running reconciliation never duplicates an occurrence (idempotent via the unique occurrence index).
- [x] While the app is open across a due instant, the occurrence is created without reopening the app.
- [x] Monthly rules clamp short months (31 → last day) and yearly rules clamp Feb 29 in non-leap years.
- [x] A monthly/yearly rule can anchor on the **last day of the month**; the first occurrence is the last day of the start month and the summary reads "on the last day".
- [x] A Drawer "Recurring" screen lists rules with frequency summary, next due date and an active toggle; empty state shown when there are none.
- [x] The Recurring screen has Select and Search header actions; search filters by name, category, comment and frequency; Select bulk-deletes the selected rules (their generated transactions are kept).
- [x] A Select all / Deselect all row above the list selects every visible rule in one tap.
- [x] The Recurring list can be sorted by next due (default), name, amount or created.
- [x] The Recurring list can be filtered by status (All / Active / Paused / Ended, multi-select with an All toggle that is mutually exclusive with the statuses); the chip label reflects the selection.
- [x] The Recurring list can be filtered by type (All / Expenses / Income tabs) and by account (the Total account shows every account's rules); both default to showing every rule and compose with the status filter, search and sort.
- [x] The transaction search (All transactions, Transactions) also matches the recurring rule name.
- [x] A rule can be paused (stops materialization, misses during the pause are not created) and resumed.
- [x] A rule with no occurrence left within its end date shows an off, disabled **Ended** toggle that cannot be resumed; extending the end date into the future revives it (toggle operable again).
- [x] Editing a rule "Future only" applies to future occurrences only; "Future + past" back-fills the missed window and bulk-updates its generated transactions' account/category/amount/comment/tags/type (never their dates, never deleting them); the change is reconciled immediately on save.
- [x] "Future + past" is offered only when it can affect the past (a detail field changed or a missed window exists); shortening the end date never deletes generated transactions, and a finished rule shows "Ended".
- [x] A window skipped by a "Future only" edit can be recovered later by re-opening the edit and choosing "Future + past" (the skipped occurrences are back-filled and the record cleared); "Future only" warns before skipping.
- [x] Moving the **Start date** of a not-yet-started rule (never generated) re-anchors it from the new start (moving it to today generates from today); moving a started rule's start earlier keeps the past occurrences skipped and shows a hint.
- [x] A timing change (e.g. monthly → daily) takes effect from **today** under "Future only" (not at the rule's stale next occurrence), and an already-generated today is not re-counted — the Summary matches exactly what the save creates.
- [x] In the edit form, the "Apply changes to" scope sits inside the recurring card above the Summary block; the block reflects the scope (next transaction + count, skipped occurrences, or back-filled count — counting only occurrences not already generated), and the footer keeps only Delete.
- [x] Editing an individual generated transaction does not change its rule.
- [x] A rule edit that rewrites an open transaction's modify form refreshes it: an untouched form adopts the new values automatically, while a form with unsaved input keeps the draft and shows a notice with a **Use the rule's values** action that adopts the rule's values.
- [x] Transaction details always show a Recurring row with the rule name (or `—`), pressable to open the rule's edit screen when the transaction belongs to a rule; pausing/resuming is done from the Recurring screen.
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
