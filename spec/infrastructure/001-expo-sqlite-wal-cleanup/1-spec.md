# 001 — Expo SQLite WAL sidecar cleanup

- **Objective**
Document a known expo-sqlite bug where `-wal` and `-shm` sidecar files persist after database deletion, causing stale data to replay into a "fresh" database. Implement a self-healing mechanism that detects and recovers from this state automatically on app startup.

---

## Background

### The bug

expo-sqlite's `deleteDatabaseAsync` / `deleteDatabaseSync` only removes the main `.db` file. When SQLite runs in WAL (Write-Ahead Logging) mode — the default — it creates two sidecar files:

- `<name>-wal` — Write-Ahead Log (pending writes)
- `<name>-shm` — Shared Memory (WAL index)

If the app crashes, is force-killed, or the database is deleted without a clean checkpoint, these files survive on disk. When a new database is created with the same name, **SQLite replays the orphaned WAL**, restoring old data into the "fresh" database.

This explains why clearing Expo Go's app data or even uninstalling the app sometimes does not reset the database — the sidecar files persist in Expo Go's internal storage and are replayed on next open.

**Upstream issue:** [expo/expo#43441](https://github.com/expo/expo/issues/43441)

### Symptoms in Finly

1. User clears Expo Go data / reinstalls -> expects fresh database.
2. App starts, `initDatabase()` runs, sees `user_version = 4` (set by previous run).
3. Migrations are skipped (version already current).
4. But the WAL replay restored old seed data (e.g., old mock accounts "Ahorros", "Banco", "Efectivo") instead of the current seed ("My Wallet").
5. Tags table is missing because migration 004 never actually executed on this database instance — the version pragma was set but the WAL replay overwrote the state.

---

## Functional requirements

### 1. Stale state detection

`initDatabase()` must detect when the database is in an inconsistent state after migrations run. Detection logic:

- After all migrations complete, verify that the latest expected tables exist by querying `sqlite_master`.
- If `tags` table is missing (or any other expected table), the database is stale.
- This check is **idempotent** — it runs every time `initDatabase()` is called, with zero cost on healthy databases (single indexed query).

### 2. Self-healing recovery

When stale state is detected:

1. Close the current database connection (set cached `db` to `null`).
2. Call `SQLite.deleteDatabaseAsync(DATABASE_NAME)` — this removes the `.db` file.
3. Reopen the database via `openDatabaseSync(DATABASE_NAME)`.
4. Run all migrations from scratch (version starts at 0).
5. Set `DATABASE_VERSION` via PRAGMA.

This is a one-time operation. After recovery, subsequent startups follow the normal path.

### 3. Safety guarantees

- **Healthy databases are never affected.** The table-existence check passes instantly; no deletion occurs.
- **Normal upgrades are unaffected.** New migrations run as before; the check only triggers when tables are missing despite version being current.
- **Web platform is unaffected.** This logic only applies to native SQLite (`Platform.OS !== 'web'`).
- **The recovery is silent.** No user-facing error or dialog — the app simply rebuilds the database transparently during the splash screen.

### 4. Future-proofing

- When expo-sqlite patches the WAL sidecar bug upstream, this safety net becomes a no-op (the check always passes). It can be removed in a future cleanup.
- The detection pattern (version vs. table existence) can be extended for future migrations by adding similar checks.

---

## Non-functional requirements

- **Performance:** The table-existence check (`SELECT name FROM sqlite_master WHERE type='table' AND name='tags'`) uses an internal SQLite catalog — sub-millisecond on any device.
- **No user intervention required.** Previous workaround required manual "Clear Data" + uninstall + reinstall. This fix is fully automatic.
- **No new dependencies.** Uses only `expo-sqlite`'s existing `deleteDatabaseAsync` API.
- **Platforms:** iOS and Android only. Web uses localStorage and is not affected.

---

## Acceptance criteria

- [ ] `initDatabase()` detects stale database (version >= 4 but `tags` table missing).
- [ ] On detection, the database file is fully deleted (`.db`, `-wal`, `-shm`).
- [ ] Database is reopened and all migrations (001-004) run from scratch.
- [ ] After recovery, the app loads with the correct seed data ("My Wallet") and all tables intact.
- [ ] On a healthy database (all tables present), the check passes with no side effects.
- [ ] On a fresh install, all migrations run normally without triggering recovery.
- [ ] Web platform is not affected by this change.
- [ ] `changelog.md` is updated.
