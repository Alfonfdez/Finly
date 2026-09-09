# 025 — Data Export / Import (Backup)

- **Goal**
  Let users export the entire app database to a portable JSON snapshot file and restore it from that file on any platform (iOS, Android, web). The feature lives in the Data section of Settings, next to the existing "Delete all data" flow, and gives users a way to back up and restore their accounts, categories, tags, transactions (including photos), and configuration.

---

## Functional requirements

### 1. Platform scope

- Export and import are available on **iOS, Android, and web**.
- The backup is a single **JSON snapshot** (not a raw `.db` file): one shared code path through the unified `DatabaseHandle`, so behavior is identical on every platform.
- **Native:** the exported file is written to `documentDirectory` via `expo-file-system` and shared through the system share sheet (`expo-sharing`). Import picks a `.json` file via `expo-document-picker`.
- **Web:** the exported file is downloaded via a `Blob` + `<a download>` click; import uses a programmatic `<input type="file" accept="application/json">` read with `FileReader.readAsText` (same pattern as the photo gallery picker).

### 2. Snapshot format

- A backup file is a JSON object with this shape:

```json
{
  "app": "Finly",
  "kind": "backup",
  "formatVersion": 1,
  "exportedAt": "2026-08-08T10:00:00.000Z",
  "schema": 3,
  "data": {
    "users": [],
    "accounts": [],
    "categories": [],
    "transactions": [],
    "tags": [],
    "transaction_tags": [],
    "config": []
  }
}
```

- `data.config` holds the raw `{ key, value }` rows of the `config` table (the app-level parsed `Config` shape is derived, not stored).
- `data.transactions[].photo` is the existing `TEXT` column (JSON array of file URIs on native / data URIs on web), so photos round-trip inside the backup with no extra storage work.
- `schema` records the `SCHEMA_VERSION` at export time (informational + forward-compat guard).

### 3. Export

- Reading the backup: `buildBackup()` runs `SELECT *` on the 7 tables (`users`, `accounts`, `categories`, `transactions`, `tags`, `transaction_tags`, `config`) via the `DatabaseHandle` and serializes them.
- The file is named `finly-backup-YYYY-MM-DD.json`.
- Exporting with zero rows is valid (produces a snapshot with empty collections).
- The user is informed of success or failure with an alert.

### 4. Import

- The selected file is parsed and validated before anything is touched:
  - Top-level shape: `app === 'Finly'`, `kind === 'backup'`, `formatVersion === 1`.
  - `schema <= SCHEMA_VERSION` (refuse backups from a newer app version).
  - Each collection is validated with the existing row Zod schemas (`userSchema`, `accountSchema`, `categorySchema`, `tagSchema`, `transactionSchema`, `transactionTagSchema`); config rows are validated as `{ key: string, value: string }`.
- Import requires an explicit confirmation modal: it **replaces all current data** and cannot be undone.
- The write runs inside a single transaction: delete all rows in FK-safe order, then insert in dependency order (users → accounts/categories/tags → transactions → transaction_tags → config).
- Referential integrity is enforced by `PRAGMA foreign_keys = ON`: a snapshot with missing parent rows or duplicate PKs fails the transaction and **rolls back** — existing data is unchanged.
- On success the app state is reloaded: `resetAll()` (accounts/categories/tags/transactions) and `updateConfig(await configRepository.get())` so theme, language, currency, and default selections reflect the backup.
- Failure (invalid file, wrong version, schema violation) shows an error and leaves data untouched.

### 5. UI (DataScreen)

- Two rows are added above the existing delete rows:
  - **Export data** (`download-outline`, primary color) — runs the export and reports success/failure.
  - **Import data** (`cloud-upload-outline`) — opens the file picker, then a `ConfirmationModal` warning that all current data will be replaced, then imports.
- The rows reuse `SettingsRow` and follow the existing DataScreen styling, theme (`useConfig().activeColors`) and text size (`useFontSize()`).

---

## Non-functional requirements

- **Multilingual:** all visible texts use `t()` (en/es/ca).
- **Theme / text size:** `useConfig().activeColors` and `useFontSize()`.
- **No platform fork of business logic:** the snapshot build/apply code is pure DB logic (`src/database/backup.ts`, no React Native / Expo imports) so it is unit-testable in Node; only the file I/O is platform-split (`backupIO.ts` / `backupIO.web.ts`, same pattern as `engine.ts` / `engine.web.ts`).
- **New dependencies:** `expo-sharing` (native share sheet) and `expo-document-picker` (native file picking). Web uses built-in browser APIs only.
- **Backwards compatibility:** import requires `formatVersion === 1`; a backup exported by this version imports cleanly. No migration paths across format versions (out of scope).

---

## Acceptance criteria

- [x] DataScreen shows "Export data" and "Import data" rows on all platforms.
- [x] Export produces a versioned JSON snapshot containing all 7 tables, downloadable on web and shareable on native.
- [x] Export of an empty database is valid.
- [x] Import replaces all data: accounts, categories, tags, transactions (with photos), tag links, config, and users.
- [x] A transaction's photos (file URIs on native / data URIs on web) survive an export → import round-trip.
- [x] Import is gated by an explicit confirmation modal.
- [x] An invalid / corrupt / wrong-version / future-schema backup is rejected with an error and existing data is unchanged (transaction rollback).
- [x] After a successful import, app state and config (theme, language, currency, balances) reflect the backup.
- [x] All texts are multilingual (en/es/ca) and the screen respects theme and text size.
- [x] `npm run test:all` is green (typecheck + lint + tests).
