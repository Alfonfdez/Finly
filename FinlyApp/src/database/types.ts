import type { z } from 'zod';

import {
  accountSchema,
  categorySchema,
  configSchema,
  tagSchema,
  transactionSchema,
  transactionTagSchema,
  userSchema,
} from './schemas';

export type User = z.infer<typeof userSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type TransactionTag = z.infer<typeof transactionTagSchema>;
export type Config = z.infer<typeof configSchema>;

export type DatabaseBindValue = string | number | null | Uint8Array;

export interface DatabaseRunResult {
  lastInsertRowId: number;
  changes: number;
}

export interface DatabaseHandle {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, ...params: DatabaseBindValue[]): Promise<DatabaseRunResult>;
  getFirstAsync<T = unknown>(source: string, ...params: DatabaseBindValue[]): Promise<T | null>;
  getAllAsync<T = unknown>(source: string, ...params: DatabaseBindValue[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
