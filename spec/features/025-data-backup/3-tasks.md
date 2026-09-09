# Tasks — 025 Data Export / Import (Backup)

Execution order. Mark each task when completed.

---

### Phase 1 — DB layer

[x] T1 — Create `src/database/backup.ts`:
  - `buildBackup(db: DatabaseHandle, schemaVersion: number): Promise<BackupSnapshot>` — `SELECT *` from the 7 tables, serialize with metadata (`app`, `kind`, `formatVersion`, `exportedAt`, `schema`).
  - `parseBackup(json: string): BackupSnapshot` — JSON.parse + top-level Zod (`app === 'Finly'`, `kind === 'backup'`, `formatVersion === 1`, `schema` int) + per-collection row schemas (reuse `userSchema`, `accountSchema`, `categorySchema`, `tagSchema`, `transactionSchema`, `transactionTagSchema`; config rows as `{ key, value }` strings).
  - `applyBackup(db: DatabaseHandle, snapshot: BackupSnapshot): Promise<void>` — transactional wipe + ordered insert; FK/PK violations roll back.
  - Export `BACKUP_FORMAT_VERSION = 1`, `SCHEMA_VERSION` check, and the `BackupSnapshot` type.

[x] T2 — Update `src/database/index.ts`:
  - Add `exportBackup()` (build + serialize) and `importBackup(json: string)` (parse + apply) facades using `getDatabase()`.

---

### Phase 2 — File I/O

[x] T3 — Install deps: `npx expo install expo-sharing expo-document-picker`.

[x] T4 — Create `src/utils/backupIO.ts` (native):
  - `saveBackupFile(json: string): Promise<void>` — write `finly-backup-YYYY-MM-DD.json` to `Paths.document.uri` via `expo-file-system` `File`, then `Sharing.shareAsync(uri)`.
  - `pickBackupFile(): Promise<string | null>` — `DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true })`; read text with the `File` API; return null when canceled.

[x] T5 — Create `src/utils/backupIO.web.ts` (web):
  - `saveBackupFile(json: string): Promise<void>` — `Blob` + `URL.createObjectURL` + hidden `<a download>` click + `revokeObjectURL`, guarded by `typeof document !== 'undefined'`.
  - `pickBackupFile(): Promise<string | null>` — programmatic `<input type="file" accept="application/json">`, `FileReader.readAsText`; resolve null on cancel.

---

### Phase 3 — UI

[x] T6 — Update `src/screens/settings/DataScreen.tsx`:
  - Add "Export data" (`download-outline`, primary) and "Import data" (`cloud-upload-outline`) `SettingsRow`s above the delete rows.
  - Export: `exportBackup()` → `saveBackupFile()` → success/failure `Alert`.
  - Import: `pickBackupFile()` → `importBackup(json)` guarded by a `ConfirmationModal` ("replaces all current data") → on success `resetAll()` + `updateConfig(await configRepository.get())`; invalid file / failure → error `Alert`, data unchanged.

[x] T7 — Add i18n keys to `src/i18n/{en,es,ca}.ts`:
  - `settings_export_data`, `settings_import_data`,
  - `settings_export_success_title`, `settings_export_success_message`,
  - `settings_export_error_title`, `settings_export_error_message`,
  - `settings_import_confirm_title`, `settings_import_confirm_message`,
  - `settings_import_success_title`, `settings_import_success_message`,
  - `settings_import_error_title`, `settings_import_error_message`,
  - `settings_import_invalid_title`, `settings_import_invalid_message`.

---

### Phase 4 — Tests

[x] T8 — Add `tests/database/backup.test.ts` (real in-memory sql.js DB):
  - Round-trip: populate → `buildBackup` → wipe tables → `applyBackup` → assert all 7 tables identical (incl. photo data URIs and tag links).
  - Empty DB export/import is valid.
  - Invalid JSON, wrong `formatVersion`, `schema` > current, malformed row → `applyBackup` rejects and data is unchanged (rollback).
  - FK-violating snapshot (transaction referencing a missing account) → rejects and data is unchanged.

[x] T9 — Update `tests/database/dbDrift.test.ts`: assert the backup's collection list matches the `001_initial` tables.

[x] T10 — `npm run test:all` green (typecheck + lint + tests).

---

### Phase 5 — Docs

[x] T11 — Update `spec/constitution/3-roadmap.md`: add a `025-data-backup` completed entry.

[x] T12 — Update `spec/constitution/7-platform-differences.md`: add matrix row "Data export / import (backup)" — all platforms; web = browser download/file-input, native = share sheet/document picker.

[x] T13 — Update `docs/harnesses.md`: note backup covered by DB-level tests + web verification.

[x] T14 — Update `docs/changelog.md`: record the 025 implementation.

---

### Phase 6 — Verification

[x] T15 — Web verification loop (Playwright, 375px viewport):
  - Settings → Data: Export and Import rows visible.
  - Export → a `finly-backup-*.json` file downloads; open it and confirm all 7 collections.
  - Add a transaction (with a photo) → Import the downloaded file → data restored (photo thumbnail renders), state/config reflect the backup.
  - Import an invalid file → error shown, data unchanged.
  - Cancel import → no change.
  - Theme and text size respected; Spanish UI switch shows translated labels.

[ ] T16 — Native Maestro flow `flow-025-data-backup.yaml`:
  - Data → Export → share sheet opens (system UI: mark "share sheet interaction not automatable"; assert the JSON file was written).
  - Import via document picker (assert picker interaction / note automation limits).
