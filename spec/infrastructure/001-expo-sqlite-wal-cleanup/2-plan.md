# 001 — Implementation plan

## Architecture

### Modified files

| File | Change |
|---|---|
| `src/database/database.ts` | Replace ad-hoc tags table check with a `deleteDatabaseAsync` + full reinit recovery flow. Add `isDatabaseConsistent` and `deleteDatabaseFile` helpers. |

### New files

None. All logic fits within the existing `database.ts` module.

---

## Current state (before)

```typescript
// database.ts — current
export async function initDatabase(): Promise<SQLiteDatabase> {
  const database = getDatabase();

  let { user_version: currentVersion } = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ) ?? { user_version: 0 };

  if (currentVersion < 1) { await migrate001(database); currentVersion = 1; }
  if (currentVersion < 2) { await seed002(database); currentVersion = 2; }
  if (currentVersion < 3) { await migrate003(database); currentVersion = 3; }
  if (currentVersion < 4) { await migrate004(database); currentVersion = 4; }

  // Ad-hoc check — only covers tags, doesn't delete stale DB
  const tagsTable = await database.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='tags'"
  );
  if (!tagsTable) { await migrate004(database); }

  await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  return database;
}
```

**Problems:**
- If the DB is stale, re-running `migrate004` alone doesn't fix it — old seed data from WAL replay persists.
- No deletion of the corrupted database file.
- `db` module-level cache holds stale connection.

## Target state (after)

```typescript
// database.ts — target
import { type SQLiteDatabase, openDatabaseSync, deleteDatabaseAsync } from 'expo-sqlite';

// ...

async function isDatabaseConsistent(database: SQLiteDatabase): Promise<boolean> {
  const tagsTable = await database.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='tags'"
  );
  return !!tagsTable;
}

async function deleteDatabaseFile(): Promise<void> {
  db = null;  // Close cached connection
  await deleteDatabaseAsync(DATABASE_NAME);
}

export async function initDatabase(): Promise<SQLiteDatabase> {
  const database = getDatabase();

  let { user_version: currentVersion } = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ) ?? { user_version: 0 };

  if (currentVersion < 1) { await migrate001(database); currentVersion = 1; }
  if (currentVersion < 2) { await seed002(database); currentVersion = 2; }
  if (currentVersion < 3) { await migrate003(database); currentVersion = 3; }
  if (currentVersion < 4) { await migrate004(database); currentVersion = 4; }

  // --- Stale WAL recovery ---
  if (!(await isDatabaseConsistent(database))) {
    await deleteDatabaseFile();
    return initDatabase();  // Recursive call — starts fresh from version 0
  }

  await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  return database;
}
```

**Key decisions:**
- **Recursive call** after deletion ensures all migrations run cleanly on the fresh DB.
- **`db = null`** before deletion forces `getDatabase()` to open a fresh connection after delete.
- **Single check point** — only the tags table is verified (it's the latest migration). Future migrations can extend this pattern.

---

## Dependencies

- `expo-sqlite` — `deleteDatabaseAsync` API (available since SDK 50+).
- Current migration files (`001_initial.ts` through `004_tags.ts`) — unchanged.
- `App.tsx` — unchanged (already handles `initDatabase()` return).
- `AppContext.tsx` — unchanged (already has try/catch/finally on `loadData`).

---

## Estimate

1 file modified, ~15 lines changed. ~30 minutes including spec + verification.
