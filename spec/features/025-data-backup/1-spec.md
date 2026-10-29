# 025 — Data Export / Import (Backup)

- **Goal**
  Let users export the entire app database to a portable JSON snapshot file and restore it from that file on any platform (iOS, Android, web). The feature lives in the Data section of Settings, next to the existing "Delete all data" flow, and gives users a way to back up and restore their accounts, categories, tags, transactions (including photos), and configuration.

---

## Functional requirements

### 1. Platform scope

- Export and import are available on **iOS, Android, and web**.
- **The Android app data is excluded from the OS-level backup** (`expo.android.allowBackup: false` in `app.json`, which prebuild turns into `android:allowBackup="false"`). The SQLite database is app-private (`files/SQLite/Finly.db`), and while Android's auto-backup included it, installing the app again restored a snapshot taken **before** an in-app Factory Reset — bringing back accounts, recurring rules, tags and transactions that no longer existed locally. With the flag off, a reinstall always starts from the seeded, empty database, and this JSON backup is the only way to move data.
- The backup is a single **JSON snapshot** (not a raw `.db` file): one shared code path through the unified `DatabaseHandle`, so behavior is identical on every platform.
- **Android:** the exported file is written to the **public Downloads folder** via `MediaStore.Downloads` (the `finly-share` module, Android 10+; on older Android it falls back to the share sheet). A system alert confirms the local save and offers a **Share** action that opens the system share sheet only on demand — the file's save never depends on a share outcome. `expo-sharing` is unused on Android.
- **iOS:** the exported file is written to `documentDirectory` via `expo-file-system` and shared through the system share sheet (the `finly-share` module resolves the outcome truthfully via `completionWithItemsHandler.completed`). Import picks a `.json` file via `expo-document-picker` on both.
- **Web:** the exported file is downloaded via a `Blob` + `<a download>` click; import uses a programmatic `<input type="file" accept="application/json">` read with `FileReader.readAsText` (same pattern as the photo gallery picker).

### 2. Snapshot format

- A backup file is a JSON object with this shape:

```json
{
  "app": "Finly",
  "kind": "backup",
  "formatVersion": 1,
  "exportedAt": "2026-08-08T10:00:00.000Z",
  "schema": 4,
  "data": {
    "users": [],
    "accounts": [],
    "categories": [],
    "transactions": [],
    "tags": [],
    "transaction_tags": [],
    "recurring_rules": [],
    "recurring_rule_tags": [],
    "config": []
  }
}
```

- `data.config` holds the raw `{ key, value }` rows of the `config` table (the app-level parsed `Config` shape is derived, not stored).
- `data.transactions[].photo` is the existing `TEXT` column (JSON array of file URIs on native / data URIs on web). Web data URIs are embedded and portable; native backups store only the file URIs, so native photos survive an import on the same installation but not an uninstall/reinstall or another device. Embedding native photo bytes is deferred to a follow-up feature.
- `schema` records the `SCHEMA_VERSION` at export time (informational + forward-compat guard).

### 3. Export

- Reading the backup: `buildBackup()` runs `SELECT *` on the **9 tables** (`users`, `accounts`, `categories`, `transactions`, `tags`, `transaction_tags`, `recurring_rules`, `recurring_rule_tags`, `config`) via the `DatabaseHandle`, **inside one read transaction**, so a catch-up or rule edit committing between the queries cannot produce a mixed snapshot.
- The file is named `finly-backup-YYYY-MM-DD.json`.
- Exporting with zero rows is valid (produces a snapshot with empty collections).
- The user is informed of success or failure with an alert.
- **Feedback by platform:** On Android the export writes the file to Downloads and shows the alert "Backup saved — Your backup has been saved to the Downloads folder." with **[Share]** and **[Done]** actions; sharing is a separate on-demand step (`saveBackupFile`, fire-and-forget) whose outcome (complete vs cancel) is never reported, because Android share targets return no reliable result — so no modal can ever be false. On iOS the feedback reflects the real share-sheet outcome (`saved`/`dismissed` from `finly-share`): a completed share shows the success alert and cancelling shows none. On web the file downloads and the feedback is shown as a browser dialog (react-native-web's `Alert` is a no-op, so the shared `alertInfo`/`alertError` helpers fall back to `window.alert`). A failure shows the error alert on all platforms.

### 4. Import

- The selected file is parsed and validated before anything is touched:
  - Top-level shape: `app === 'Finly'`, `kind === 'backup'`, `formatVersion === 1`.
  - `schema <= SCHEMA_VERSION` (refuse backups from a newer app version).
  - Each collection is validated with the existing row Zod schemas (`userSchema`, `accountSchema`, `categorySchema`, `tagSchema`, `transactionSchema`, `transactionTagSchema`, `recurringRuleSchema`, `recurringRuleTagSchema`; the recurring ones default to `[]` so pre-028 backups stay importable); config rows are validated as `{ key: string, value: string }`.
- Import requires an explicit confirmation modal: it **replaces all current data** and cannot be undone.
- The write runs inside a single transaction: delete all rows in FK-safe order, then insert in dependency order (users → accounts/categories/tags → transactions → transaction_tags → config).
- Referential integrity is enforced by `PRAGMA foreign_keys = ON`: a snapshot with missing parent rows or duplicate PKs fails the transaction and **rolls back** — existing data is unchanged.
- Import uses the same serialized transaction queue as reconciliation (`runExclusiveDb`), so it can never interleave with a catch-up run; the Data screen keeps the confirmation dialog open (spinner, no cancel, no second confirm) until the import settles.
- On success the app state is reloaded: `resetAll()` (accounts/categories/tags/transactions) and `updateConfig(await configRepository.get())` so theme, language, currency, and default selections reflect the backup. If the database import applied but this refresh fails, the app shows a dedicated "import applied, refresh failed" alert instead of a false success or a false "import failed"; the user is told to reopen the app.
- **Native photo cleanup:** factory reset, delete-all-data and import collect the old photo URIs before the destructive write and delete those files only after it commits. Import keeps any URI still referenced by the imported snapshot, so a same-device backup never loses a reused file.
- Failure (invalid file, wrong version, schema violation) shows an error and leaves data untouched.
- **Incomplete snapshots are rejected before any write**: a backup must contain the app user (`id = USER_ID = 1`), at least one account, and one expense + one income category (a genuine export always does - the app cannot work without them). It fails with the dedicated "Incomplete backup" alert instead of importing and leaving the app unusable (previously the empty `users` table made category creation fail with an FK error until the next launch self-healed it).
- **Imported recurring rules are validated**: `interval` within `1..REPEAT_MAX_INTERVAL`, every date field a real date-only string (`YYYY-MM-DD`), and `start_date <= end_date`; a violation rejects the file as invalid before any write.
- **Recurring rule safety:** `next_due` must not precede `start_date`, `weekday` is 0..6, `day_of_month` 1..31, `month` 1..12 and `active` is 0/1; violations reject the file before any write.
- **Referential integrity:** transaction/rule accounts and categories, generated transactions' rules, and both tag-link tables must resolve inside the snapshot. Transactions/rules pointing at the Total account are rejected.
- **Generated transactions:** a transaction with `recurring_rule_id` must reference a rule in the snapshot and carry a valid date-only `recurrence_date`.
- **Photo values are validated before import:** each parsed `photo` entry must be a base64 image data URI (broad `data:image/*;base64,...` so 2.1 web backups with HEIC/GIF remain importable) or an app-created file URI named `photo_<timestamp>_<counter>.(jpg|jpeg|png|webp)`. Remote URLs, arbitrary file paths, DB/backup filenames and traversal paths are rejected. Both legacy root photos and the new `photos/` directory are accepted.
- **Import limits:** reject backups above the file-size limit, total-row limit, per-transaction `MAX_PHOTOS` count, per-photo URI length or per-config-value length.
- **Strict import shape:** IDs must be positive safe integers; collection IDs, tag links and config keys must be unique; unknown config keys are rejected; transaction time components must be valid; recurring `next_due`/`skipped_from` must be on schedule and a rule's catch-up backlog must not exceed the materialization cap.
- **Photo lifecycle:** destructive operations delete a photo file only when no remaining transaction references it; a reference-read failure leaves files untouched. Photos created in a form are deleted if the form is cancelled/unmounted, while removed existing photos are cleaned by the repository after a successful update.
- **Native photo deletion allowlist:** only app-created photo files directly under the app documents root (legacy 2.1 layout) or under `documents/photos/` are ever deleted; arbitrary `file://` URIs from an imported backup are ignored.
- **`applyBackup()` re-checks completeness** even when called directly (defence in depth), and the service awaits `initDatabase()` before exporting/importing so the snapshot always comes from a migrated, self-healed database.

### 5. UI (DataScreen)

- Two rows are added above the existing delete rows:
  - **Export data** (`share-outline`, primary color) — Android: saves the backup to Downloads and alerts with optional **Share**; iOS: runs the share and reports truthfully; web: downloads the file. Failures show the error alert.
  - **Import data** (`cloud-upload-outline`) — opens the file picker, then a `ConfirmationModal` warning that all current data will be replaced, then imports.
- The rows reuse `SettingsRow` and follow the existing DataScreen styling, theme (`useConfig().activeColors`) and text size (`useFontSize()`).

---

## Non-functional requirements

- **Multilingual:** all visible texts use `t()` (en/es/ca/gl/eu/fr/de/pt/it).
- **Theme / text size:** `useConfig().activeColors` and `useFontSize()`.
- **No platform fork of business logic:** the snapshot build/apply code is pure DB logic (`src/database/backup.ts`, no React Native / Expo imports) so it is unit-testable in Node; only the file I/O is platform-split (`backupIO.ts` / `backupIO.web.ts`, same pattern as `engine.ts` / `engine.web.ts`).
- **New dependencies:** `expo-sharing` (iOS share sheet) and `expo-document-picker` (native file picking). Android's Downloads write uses the `finly-share` module's `saveToDownloadsAsync` (`MediaStore.Downloads`). Web uses built-in browser APIs only.
- **Backwards compatibility:** import requires `formatVersion === 1`; a backup exported by this version imports cleanly. No migration paths across format versions (out of scope).

---

## Acceptance criteria

- [x] DataScreen shows "Export data" and "Import data" rows on all platforms.
- [x] Export produces a versioned JSON snapshot containing all **9 tables** (including recurring rules and their tag links), read in one transaction, downloadable on web and shareable on native.
- [x] Export of an empty database is valid.
- [x] Import replaces all data: accounts, categories, tags, transactions (with photos), tag links, config, and users.
- [x] Web photo data URIs survive an export → import round-trip; native photos keep working only while their files still exist (same installation), because native backups store URI references rather than bytes.
- [x] 2.1 backups with native `photo_<timestamp>_<counter>.jpg` file URIs or web base64 image data URIs remain importable; broad image MIME subtypes are accepted.
- [x] Imported photo values are validated per parsed entry; remote URLs, DB/backup filenames, traversal paths and arbitrary file paths are rejected before any write.
- [x] If the database import applied but the config/state refresh fails, the app reports "import applied, refresh failed" instead of success or "import failed".
- [x] Oversized backups, duplicate rows/config keys, unsafe IDs, invalid times, off-schedule recurring cursors and oversized catch-up backlogs are rejected before any write.
- [x] Destructive photo cleanup keeps files still referenced by another transaction; cancelled forms delete their unsaved new photos and failed reference reads leave files untouched.
- [x] Import is gated by an explicit confirmation modal.
- [x] An invalid / corrupt / wrong-version / future-schema backup is rejected with an error and existing data is unchanged (transaction rollback).
- [x] A valid backup that is missing the required rows (the app user `id = 1`, accounts, or a category of each type) is rejected as "incomplete" before any write, with the current data untouched.
- [x] A backup whose recurring rules have an out-of-range interval, a non-date-only field or `start_date > end_date` is rejected as invalid before any write.
- [x] `buildBackup()` reads all tables in one transaction, so a backup exported while a catch-up is running is internally consistent.
- [x] After a successful import, app state and config (theme, language, currency, balances) reflect the backup.
- [x] All texts are multilingual (en/es/ca/gl/eu/fr/de/pt/it) and the screen respects theme and text size.
- [x] Export feedback is never false (unit-tested): Android saves to Downloads (`MediaStore` via `finly-share`) and alerts; the Share action is optional and its outcome is not reported; iOS reports the real share-sheet outcome (success vs cancel); failures show the error alert; Import shows no modal when the file picker is cancelled.
- [x] On web, the export/import success and error feedback appears as a browser dialog (`alertInfo`/`alertError` `window.alert` fallback), since react-native-web's `Alert` is a no-op.
- [ ] On a real device, Export on Android saves the file to the Downloads folder and shows the "Backup saved" alert with Share/Done (device-only check via the Downloads folder, not checkable on web).
- [x] A fresh Android install starts from the seeded database only: `app.json` sets `android.allowBackup: false`, the packaged manifest carries `android:allowBackup="false"`, and uninstalling before installing again no longer restores a previous snapshot.
- [x] `npm run test:all` is green (typecheck + lint + tests).
