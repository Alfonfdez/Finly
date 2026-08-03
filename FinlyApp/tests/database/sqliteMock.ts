import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';

type SqlParam = string | number | null;

interface MockRunResult {
  lastInsertRowId: number;
  changes: number;
}

let SQL: SqlJsStatic | null = null;
let current: MockSQLiteDatabase | null = null;

const sqlReady: Promise<void> = initSqlJs().then(sql => {
  SQL = sql;
});

export async function initSqlJsOnce(): Promise<void> {
  await sqlReady;
}

export function createMockDatabaseSync(): MockSQLiteDatabase {
  if (!SQL) throw new Error('sql.js not initialized: call initSqlJsOnce() first');
  return new MockSQLiteDatabase(new SQL.Database());
}

export class MockSQLiteDatabase {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async execAsync(source: string): Promise<void> {
    this.db.exec(source);
  }

  async runAsync(source: string, ...params: SqlParam[]): Promise<MockRunResult> {
    this.db.run(source, params);
    const rows = this.db.exec('SELECT last_insert_rowid() AS id');
    const lastInsertRowId = rows.length > 0 ? (rows[0].values[0][0] as number) : 0;
    return {
      lastInsertRowId,
      changes: this.db.getRowsModified(),
    };
  }

  async getFirstAsync<T>(source: string, ...params: SqlParam[]): Promise<T | null> {
    const rows = this.all<T>(source, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async getAllAsync<T>(source: string, ...params: SqlParam[]): Promise<T[]> {
    return this.all<T>(source, params);
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    this.db.exec('BEGIN');
    try {
      await task();
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }

  private all<T>(source: string, params: SqlParam[]): T[] {
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
}

export function openDatabaseSync(_name?: string): MockSQLiteDatabase {
  if (!current) {
    current = createMockDatabaseSync();
  }
  return current;
}

export function resetMockDatabase(): void {
  if (current) {
    current.close();
    current = null;
  }
}

export function getMockInstance(): MockSQLiteDatabase | null {
  return current;
}
