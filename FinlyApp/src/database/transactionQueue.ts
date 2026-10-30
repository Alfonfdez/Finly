import type { DatabaseBindValue, DatabaseHandle } from './types';

/**
 * SQLite has a single connection: only one explicit transaction can be open at a
 * time. Every `withTransactionAsync` call goes through this queue, so a long
 * reconciliation run can never overlap a reset, an import or a config save
 * ("cannot start a transaction within a transaction" / phantom rollbacks).
 *
 * Never call `runExclusiveDb` from inside a task: a nested call would queue
 * behind itself and never resolve.
 */
let queue: Promise<unknown> = Promise.resolve();

export function runExclusiveDb<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** Serialize a standalone write with the same queue used by explicit transactions. */
export function runExclusiveWrite<T>(task: () => Promise<T>): Promise<T> {
  return runExclusiveDb(task);
}

type AnyAsyncFn = (...args: unknown[]) => Promise<unknown>;

/**
 * Wrap selected direct-write methods of a repository with the shared write queue.
 * Never wrap a method that is called from inside an explicit transaction: the
 * transaction already holds the queue and the nested call would deadlock.
 */
export function serializeWrites<T extends object>(repo: T, methods: readonly (keyof T)[]): T {
  const wrapped = { ...repo } as Record<string, unknown>;
  for (const method of methods) {
    const fn = repo[method];
    if (typeof fn !== 'function') continue;
    wrapped[method as string] = (...args: unknown[]) =>
      runExclusiveWrite(() => (fn as AnyAsyncFn)(...args));
  }
  return wrapped as T;
}

/** Make every explicit transaction of `handle` wait for the previous one. */
export function serializeTransactions(handle: DatabaseHandle): DatabaseHandle {
  return {
    execAsync: source => handle.execAsync(source),
    runAsync: (source, ...params) => handle.runAsync(source, ...params),
    getFirstAsync: <T = unknown>(source: string, ...params: DatabaseBindValue[]) =>
      handle.getFirstAsync<T>(source, ...params),
    getAllAsync: <T = unknown>(source: string, ...params: DatabaseBindValue[]) =>
      handle.getAllAsync<T>(source, ...params),
    withTransactionAsync: task => runExclusiveDb(() => handle.withTransactionAsync(task)),
  };
}
