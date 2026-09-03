import { eq, inArray, sql } from 'drizzle-orm';
import { getDrizzle, withTransaction } from '../drizzle/engine';
import { transactionTags, transactions } from '../drizzle/schema';
import { runResultOf } from '../drizzle/proxy';
import type { Transaction } from '../types';
import { dbTimestamp } from '../../utils/formatters';
import { deleteTransactionPhotos, deleteAllTransactionPhotos } from '../photoCleanup';

export const transactionWrites = {
  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const db = await getDrizzle();
    const result = await db
      .insert(transactions)
      .values({
        account_id: data.account_id,
        category_id: data.category_id,
        type: data.type,
        amount: data.amount,
        description: data.description ?? null,
        photo: data.photo ?? null,
        date: data.date,
      })
      .run();
    return { ...data, id: runResultOf(result).lastInsertRowId, created_at: dbTimestamp(), updated_at: null };
  },

  async update(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const db = await getDrizzle();
    const set: Partial<typeof transactions.$inferInsert> = {};
    if (data.account_id !== undefined) set.account_id = data.account_id;
    if (data.category_id !== undefined) set.category_id = data.category_id;
    if (data.type !== undefined) set.type = data.type;
    if (data.amount !== undefined) set.amount = data.amount;
    if (data.description !== undefined) set.description = data.description;
    if (data.photo !== undefined) set.photo = data.photo;
    if (data.date !== undefined) set.date = data.date;
    if (Object.keys(set).length === 0) return;
    await db
      .update(transactions)
      .set({ ...set, updated_at: sql`datetime('now', 'localtime')` })
      .where(eq(transactions.id, id))
      .run();
  },

  async delete(id: number): Promise<void> {
    await deleteTransactionPhotos('id', id);
    const db = await getDrizzle();
    await db.delete(transactions).where(eq(transactions.id, id)).run();
  },

  async deleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await deleteTransactionPhotos('id', ...ids);
    await withTransaction(async (db) => {
      await db.delete(transactions).where(inArray(transactions.id, ids)).run();
    });
  },

  async deleteAllTransactions(): Promise<void> {
    await deleteAllTransactionPhotos();
    await withTransaction(async (db) => {
      await db.delete(transactions).run();
    });
  },

  async updateComment(oldComment: string, newComment: string): Promise<number> {
    const db = await getDrizzle();
    const result = await db
      .update(transactions)
      .set({ description: newComment.trim(), updated_at: sql`datetime('now', 'localtime')` })
      .where(sql`TRIM(${transactions.description}) = ${oldComment.trim()}`)
      .run();
    return runResultOf(result).changes;
  },

  async deleteComment(comment: string): Promise<number> {
    const db = await getDrizzle();
    const result = await db
      .update(transactions)
      .set({ description: null, updated_at: sql`datetime('now', 'localtime')` })
      .where(sql`TRIM(${transactions.description}) = ${comment.trim()}`)
      .run();
    return runResultOf(result).changes;
  },

  async deleteComments(comments: string[]): Promise<number> {
    if (comments.length === 0) return 0;
    const db = await getDrizzle();
    const result = await db
      .update(transactions)
      .set({ description: null, updated_at: sql`datetime('now', 'localtime')` })
      .where(sql`TRIM(${transactions.description}) IN ${comments.map(c => c.trim())}`)
      .run();
    return runResultOf(result).changes;
  },

  async createWithTags(
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>,
    tagIds: number[]
  ): Promise<Transaction> {
    return await withTransaction(async (db) => {
      const created = await transactionWrites.create(data);
      if (tagIds.length > 0) {
        await db
          .insert(transactionTags)
          .values(tagIds.map(tagId => ({ transaction_id: created.id, tag_id: tagId })))
          .run();
      }
      return created;
    });
  },

  async updateWithTags(
    id: number,
    data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>,
    tagIds: number[]
  ): Promise<void> {
    await withTransaction(async (db) => {
      await transactionWrites.update(id, data);
      await db.delete(transactionTags).where(eq(transactionTags.transaction_id, id)).run();
      if (tagIds.length > 0) {
        await db
          .insert(transactionTags)
          .values(tagIds.map(tagId => ({ transaction_id: id, tag_id: tagId })))
          .run();
      }
    });
  },
};
