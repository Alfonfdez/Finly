# 001 — Tasks

## Phase 1 — Database self-healing

- [x] T1 — Add `deleteDatabaseAsync` import to `src/database/database.ts`.
- [x] T2 — Extract `isDatabaseConsistent(database)` helper that checks for the `tags` table in `sqlite_master`.
- [x] T3 — Extract `deleteDatabaseFile()` helper that nullifies the cached `db` reference and calls `deleteDatabaseAsync(DATABASE_NAME)`.
- [x] T4 — Replace the existing ad-hoc tags check in `initDatabase()` with the new recovery flow: check consistency -> delete if stale -> recursive call to reinitialize.

## Phase 2 — Verification

- [ ] T5 — Run `npx expo lint` and `npx tsc --noEmit` to verify no type or lint errors.
- [ ] T6 — On Expo Go (phone): verify fresh install creates "My Wallet" account with 0 euro.
- [ ] T7 — On Expo Go (phone): verify that if DB is in stale state (version 4 but no tags table), the app self-heals and loads correct seed data.

## Phase 3 — Documentation

- [ ] T8 — Update `docs/changelog.md` with the database self-healing entry.
