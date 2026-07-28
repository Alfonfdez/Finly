import { type SQLiteDatabase } from 'expo-sqlite';
import { SEED_USER_DATA, SEED_ACCOUNTS, SEED_CATEGORIES } from '../seedData';

export async function seedData(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR IGNORE INTO users (id, name, email, currency) VALUES (?, ?, ?, ?)`,
      SEED_USER_DATA.id, SEED_USER_DATA.name, SEED_USER_DATA.email, SEED_USER_DATA.currency
    );

    for (const account of SEED_ACCOUNTS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO accounts (id, user_id, name, initial_balance, icon, color, description, is_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        account.id, account.user_id, account.name, account.initial_balance, account.icon, account.color, account.description ?? null, account.is_total ?? null
      );
    }

    for (const cat of SEED_CATEGORIES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
        cat.id, cat.user_id, cat.name, cat.icon, cat.color, cat.type
      );
    }
  });
}
