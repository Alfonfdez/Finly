# Plan — 025 Data Export / Import (Backup)

Implementation plan. Tasks are tracked in `3-tasks.md`.

## Design

### Snapshot as JSON, not `.db` bytes

- `expo-sqlite` (native) has no public byte-export API; sql.js (web) does (`db.export()`). A JSON snapshot gives **one shared code path** through the `DatabaseHandle` on both platforms.
- Import validation reuses the existing row Zod schemas in `src/database/schemas.ts`.
- Photos already live as base64 data URIs in `transactions.photo`, so they round-trip inside the JSON with no extra work.

### Pure DB layer + platform-split I/O

| Module | Responsibility | Imports |
|--------|----------------|---------|
| `src/database/backup.ts` | `buildBackup`, `parseBackup`, `applyBackup` — reads/writes the 7 tables through `DatabaseHandle` | `zod`, `./types`, `./schemas` only → Node-testable |
| `src/database/index.ts` | re-exports `exportBackup` / `importBackup` facades | `./backup`, `./database` |
| `src/utils/backupIO.ts` (native) | write file + `Sharing.shareAsync`; `DocumentPicker` + read text | `expo-file-system`, `expo-sharing`, `expo-document-picker` |
| `src/utils/backupIO.web.ts` (web) | `Blob` + `<a download>`; `<input type="file">` + `FileReader` | browser APIs only |

### Transactional import

`applyBackup` runs inside `withTransactionAsync`:
1. Delete in FK-safe order: `transactions`, `transaction_tags`, `tags`, `categories`, `accounts`, `config`, `users`.
2. Insert in dependency order: `users`, `accounts`, `categories`, `tags`, `transactions`, `transaction_tags`, `config`.
3. Any validation or FK/PK violation rolls back — data untouched.

### Post-import reload

DataScreen calls `resetAll()` (AppContext) + `updateConfig(await configRepository.get())` (ConfigContext) so state and config reflect the backup.

### Files

- New: `spec/features/025-data-backup/{1-spec,2-plan,3-tasks}.md`
- New: `src/database/backup.ts`
- New: `src/utils/backupIO.ts`, `src/utils/backupIO.web.ts`
- New: `tests/database/backup.test.ts`
- Modified: `src/database/index.ts`
- Modified: `src/screens/settings/DataScreen.tsx`
- Modified: `src/i18n/{en,es,ca}.ts`
- Modified: `tests/database/dbDrift.test.ts` (backup collection list drift guard)
- Docs: `spec/constitution/3-roadmap.md`, `spec/constitution/7-platform-differences.md`, `docs/harnesses.md`, `docs/changelog.md`

### Dependencies

- `npx expo install expo-sharing expo-document-picker`
