import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import type { DatabaseBindValue, DatabaseHandle, DatabaseRunResult } from './types';

export const DB_FILE_KEY = 'sqlite';

export interface DatabaseStorage {
  get(): Promise<Uint8Array | null>;
  set(data: Uint8Array): Promise<void>;
}

let sqlReady: SqlJsStatic | null = null;
let sqlPromise: Promise<SqlJsStatic> | null = null;

export function initSqlJsEngine(locateFile?: (file: string) => string): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = (locateFile ? initSqlJs({ locateFile }) : initSqlJs()).then((sql) => {
      sqlReady = sql;
      return sql;
    });
  }
  return sqlPromise;
}

export function getSqlJsStatic(): SqlJsStatic | null {
  return sqlReady;
}

export class SqlJsDatabase implements DatabaseHandle {
  private readonly db: Database;
  private readonly storage: DatabaseStorage | null;
  private readonly onPersistError?: (error: unknown) => void;
  private inTransaction = 0;
  private persistQueue: Promise<void> = Promise.resolve();

  constructor(
    db: Database,
    storage: DatabaseStorage | null = null,
    onPersistError?: (error: unknown) => void,
  ) {
    this.db = db;
    this.storage = storage;
    this.onPersistError = onPersistError;
    this.db.exec('PRAGMA foreign_keys = ON;');
  }

  async execAsync(source: string): Promise<void> {
    this.db.exec(source);
    await this.persistIfCommitted();
  }

  async runAsync(source: string, ...params: DatabaseBindValue[]): Promise<DatabaseRunResult> {
    this.db.run(source, params);
    const result: DatabaseRunResult = {
      lastInsertRowId: this.lastInsertRowId(),
      changes: this.db.getRowsModified(),
    };
    await this.persistIfCommitted();
    return result;
  }

  async getFirstAsync<T>(source: string, ...params: DatabaseBindValue[]): Promise<T | null> {
    const rows = this.all<T>(source, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async getAllAsync<T>(source: string, ...params: DatabaseBindValue[]): Promise<T[]> {
    return this.all<T>(source, params);
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    // BEGIN first: a failed BEGIN must not leave the counter raised, or every
    // later persist would be skipped for the rest of the session.
    this.db.exec('BEGIN');
    this.inTransaction += 1;
    let failure: { error: unknown } | null = null;
    try {
      await task();
      this.db.exec('COMMIT');
    } catch (error) {
      failure = { error };
      this.db.exec('ROLLBACK');
    } finally {
      this.inTransaction -= 1;
    }

    const persist = this.persistIfCommitted();
    if (failure) {
      // A persistence failure must not hide the transaction's own error.
      await persist.catch(() => {});
      throw failure.error;
    }
    await persist;
  }

  close(): void {
    this.db.close();
  }

  private lastInsertRowId(): number {
    const rows = this.db.exec('SELECT last_insert_rowid() AS id');
    return rows.length > 0 ? (rows[0].values[0][0] as number) : 0;
  }

  private all<T>(source: string, params: DatabaseBindValue[]): T[] {
    const stmt = this.db.prepare(source);
    try {
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
      }
      return rows;
    } finally {
      stmt.free();
    }
  }

  private persistIfCommitted(): Promise<void> {
    const storage = this.storage;
    if (this.inTransaction > 0 || !storage) return Promise.resolve();
    const bytes = this.db.export();
    this.db.exec('PRAGMA foreign_keys = ON;');
    const write = () => storage.set(bytes);
    const run = this.persistQueue.then(async () => {
      try {
        await write();
      } catch {
        // Retry once (transient quota/failure), then surface it instead of
        // pretending the change was saved.
        try {
          await write();
        } catch (error) {
          this.onPersistError?.(error);
          throw error;
        }
      }
    });
    // Keep the queue usable after a failed snapshot; the rejected operation still
    // reaches its caller, while the next write can persist the full current DB.
    this.persistQueue = run.catch(() => {});
    return run;
  }
}

export async function createSqlJsDatabase(
  bytes: Uint8Array | null,
  storage: DatabaseStorage | null = null,
  locateFile?: (file: string) => string,
  onPersistError?: (error: unknown) => void,
): Promise<SqlJsDatabase> {
  const SQL = await initSqlJsEngine(locateFile);
  return new SqlJsDatabase(new SQL.Database(bytes ?? undefined), storage, onPersistError);
}
