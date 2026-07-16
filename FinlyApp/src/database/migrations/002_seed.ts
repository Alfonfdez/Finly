import { type SQLiteDatabase } from 'expo-sqlite';

export async function seed002(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR IGNORE INTO users (id, name, email, currency) VALUES (?, ?, ?, ?)`,
      1, 'User', null, '€'
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO accounts (id, user_id, name, initial_balance, icon, color) VALUES (?, ?, ?, ?, ?, ?)`,
      1, 1, 'My Wallet', 0, 'wallet-outline', '#22D3EE'
    );

    const categories: [number, string, string, string, string][] = [
      [1, 'Salary', 'briefcase-outline', '#22D3EE', 'income'],
      [2, 'Freelance', 'code-slash-outline', '#A78BFA', 'income'],
      [3, 'Investments', 'trending-up-outline', '#34D399', 'income'],
      [4, 'Gift', 'gift-outline', '#FB7185', 'income'],
      [5, 'Other', 'ellipsis-horizontal-outline', '#94A3B8', 'income'],
      [6, 'Food', 'cart-outline', '#F87171', 'expense'],
      [7, 'Transport', 'bus-outline', '#FBBF24', 'expense'],
      [8, 'Leisure', 'musical-notes-outline', '#F472B6', 'expense'],
      [9, 'Housing', 'home-outline', '#60A5FA', 'expense'],
      [10, 'Health', 'heart-outline', '#34D399', 'expense'],
      [11, 'Travel', 'airplane-outline', '#38BDF8', 'expense'],
      [12, 'Education', 'school-outline', '#34D399', 'expense'],
      [13, 'Family', 'people-outline', '#F472B6', 'expense'],
      [14, 'Shopping', 'bag-outline', '#FBBF24', 'expense'],
      [15, 'Clothing', 'shirt-outline', '#C084FC', 'expense'],
      [16, 'Exercise', 'fitness-outline', '#22D3EE', 'expense'],
      [17, 'Entertainment', 'film-outline', '#E879F9', 'expense'],
      [18, 'Others', 'ellipsis-horizontal-outline', '#94A3B8', 'expense'],
    ];

    for (const [id, name, icon, color, type] of categories) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
        id, 1, name, icon, color, type
      );
    }
  });
}
