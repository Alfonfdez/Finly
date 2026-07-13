import { type SQLiteDatabase } from 'expo-sqlite';

export async function seed004(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    const categories = [
      [9, 1, 'Travel', 'airplane-outline', '#38BDF8', 'expense'],
      [10, 1, 'Videogame', 'game-controller-outline', '#A78BFA', 'expense'],
      [11, 1, 'Game', 'dice-outline', '#FB923C', 'expense'],
      [12, 1, 'Restaurant', 'restaurant-outline', '#F87171', 'expense'],
      [13, 1, 'Education', 'school-outline', '#34D399', 'expense'],
      [14, 1, 'Family', 'people-outline', '#F472B6', 'expense'],
      [15, 1, 'Shopping', 'bag-outline', '#FBBF24', 'expense'],
      [16, 1, 'Clothing', 'shirt-outline', '#C084FC', 'expense'],
      [17, 1, 'Exercise', 'fitness-outline', '#22D3EE', 'expense'],
      [18, 1, 'Others', 'ellipsis-horizontal-outline', '#94A3B8', 'expense'],
      [19, 1, 'Entertainment', 'film-outline', '#E879F9', 'expense'],
      [20, 1, 'Gifts', 'gift-outline', '#FB7185', 'expense'],
      [21, 1, 'Gift', 'gift-outline', '#FB7185', 'income'],
      [22, 1, 'Other', 'ellipsis-horizontal-outline', '#94A3B8', 'income'],
      [23, 1, 'Interests', 'wallet-outline', '#4ADE80', 'income'],
    ];

    for (const [id, user_id, name, icon, color, type] of categories) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
        id, user_id, name, icon, color, type
      );
    }
  });
}
