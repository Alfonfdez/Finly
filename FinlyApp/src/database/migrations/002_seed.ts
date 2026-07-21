import { type SQLiteDatabase } from 'expo-sqlite';

export async function seedData(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR IGNORE INTO users (id, name, email, currency) VALUES (?, ?, ?, ?)`,
      1, 'User', null, '€'
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO accounts (id, user_id, name, initial_balance, icon, color, description, is_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      1, 1, 'My Wallet', 0, 'wallet-outline', '#22D3EE', 'Your default account for everyday transactions', 0
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO accounts (id, user_id, name, initial_balance, icon, color, description, is_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      2, 1, 'Total', 0, 'layers-outline', '#475569', 'Combined balance and transactions from all your accounts', 1
    );

    const categories: [number, string, string, string, string][] = [
      [1, 'Salary', 'briefcase-outline', '#22D3EE', 'income'],
      [2, 'Freelance', 'code-slash-outline', '#A78BFA', 'income'],
      [3, 'Groceries', 'basket-outline', '#F87171', 'expense'],
      [4, 'Transport', 'bus-outline', '#FBBF24', 'expense'],
      [5, 'Leisure', 'musical-notes-outline', '#F472B6', 'expense'],
      [6, 'Housing', 'home-outline', '#60A5FA', 'expense'],
      [7, 'Health', 'heart-outline', '#34D399', 'expense'],
      [8, 'Investments', 'trending-up-outline', '#34D399', 'income'],
      [9, 'Travel', 'airplane-outline', '#38BDF8', 'expense'],
      [10, 'Education', 'school-outline', '#34D399', 'expense'],
      [11, 'Family', 'people-outline', '#F472B6', 'expense'],
      [12, 'Shopping', 'bag-outline', '#FBBF24', 'expense'],
      [13, 'Clothing', 'shirt-outline', '#C084FC', 'expense'],
      [14, 'Workout', 'barbell-outline', '#22D3EE', 'expense'],
      [15, 'Others', 'ellipsis-horizontal-outline', '#94A3B8', 'expense'],
      [16, 'Entertainment', 'film-outline', '#E879F9', 'expense'],
      [17, 'Gift', 'gift-outline', '#FB7185', 'income'],
      [18, 'Other', 'ellipsis-horizontal-outline', '#94A3B8', 'income'],
      [19, 'Restaurants', 'restaurant-outline', '#FB923C', 'expense'],
      [20, 'Rent', 'key-outline', '#818CF8', 'expense'],
      [21, 'Games', 'game-controller-outline', '#2DD4BF', 'expense'],
      [22, 'Gifts', 'gift-outline', '#EC4899', 'expense'],
      [23, 'Subscriptions', 'card-outline', '#10B981', 'expense'],
      [24, 'Pets', 'paw-outline', '#F59E0B', 'expense'],
      [25, 'Insurance', 'shield-checkmark-outline', '#6366F1', 'expense'],
      [26, 'Utilities', 'flash-outline', '#EF4444', 'expense'],
      [27, 'Interest', 'pulse-outline', '#0EA5E9', 'income'],
      [28, 'Sales', 'cash-outline', '#EAB308', 'income'],
      [29, 'Refund', 'return-down-back-outline', '#8B5CF6', 'income'],
      [30, 'Bonus', 'trophy-outline', '#D946EF', 'income'],
      [31, 'Allowance', 'wallet-outline', '#22C55E', 'income'],
    ];

    for (const [id, name, icon, color, type] of categories) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
        id, 1, name, icon, color, type
      );
    }
  });
}
