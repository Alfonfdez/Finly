import { type SQLiteDatabase } from 'expo-sqlite';

export async function seed002(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO users (id, name, email, currency) VALUES (?, ?, ?, ?)`,
      1, 'Demo User', null, '€'
    );

    await db.runAsync(
      `INSERT INTO accounts (id, user_id, name, initial_balance, icon, color) VALUES (?, ?, ?, ?, ?, ?)`,
      1, 1, 'Cash', 0, 'wallet-outline', '#22D3EE'
    );
    await db.runAsync(
      `INSERT INTO accounts (id, user_id, name, initial_balance, icon, color) VALUES (?, ?, ?, ?, ?, ?)`,
      2, 1, 'Bank', 0, 'business-outline', '#A78BFA'
    );
    await db.runAsync(
      `INSERT INTO accounts (id, user_id, name, initial_balance, icon, color) VALUES (?, ?, ?, ?, ?, ?)`,
      3, 1, 'Savings', 0, 'cash-outline', '#34D399'
    );

    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      1, 1, 'Salary', 'briefcase-outline', '#22D3EE', 'income'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      2, 1, 'Freelance', 'code-slash-outline', '#A78BFA', 'income'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      3, 1, 'Food', 'cart-outline', '#F87171', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      4, 1, 'Transport', 'bus-outline', '#FBBF24', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      5, 1, 'Leisure', 'musical-notes-outline', '#F472B6', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      6, 1, 'Housing', 'home-outline', '#60A5FA', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      7, 1, 'Health', 'heart-outline', '#34D399', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      8, 1, 'Investments', 'trending-up-outline', '#A78BFA', 'income'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      9, 1, 'Travel', 'airplane-outline', '#38BDF8', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      10, 1, 'Videogame', 'game-controller-outline', '#A78BFA', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      11, 1, 'Game', 'dice-outline', '#FB923C', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      12, 1, 'Restaurant', 'restaurant-outline', '#F87171', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      13, 1, 'Education', 'school-outline', '#34D399', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      14, 1, 'Family', 'people-outline', '#F472B6', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      15, 1, 'Shopping', 'bag-outline', '#FBBF24', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      16, 1, 'Clothing', 'shirt-outline', '#C084FC', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      17, 1, 'Exercise', 'fitness-outline', '#22D3EE', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      18, 1, 'Others', 'ellipsis-horizontal-outline', '#94A3B8', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      19, 1, 'Entertainment', 'film-outline', '#E879F9', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      20, 1, 'Gifts', 'gift-outline', '#FB7185', 'expense'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      21, 1, 'Gift', 'gift-outline', '#FB7185', 'income'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      22, 1, 'Other', 'ellipsis-horizontal-outline', '#94A3B8', 'income'
    );
    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?, ?)`,
      23, 1, 'Interests', 'wallet-outline', '#4ADE80', 'income'
    );

    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      1, 1, 1, 'income', 2100.00, 'July Salary', '2026-07-01 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      2, 1, 2, 'income', 500.00, 'Web project', '2026-07-05 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      3, 2, 3, 'expense', 85.50, 'Weekly groceries', '2026-07-03 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      4, 2, 4, 'expense', 30.00, 'Gasoline', '2026-07-04 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      5, 1, 5, 'expense', 45.00, 'Cinema', '2026-07-06 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      6, 2, 6, 'expense', 650.00, 'July Rent', '2026-07-01 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      7, 1, 3, 'expense', 42.30, 'Restaurant', '2026-07-07 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      8, 2, 7, 'expense', 25.00, 'Pharmacy', '2026-07-08 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      9, 3, 8, 'income', 200.00, 'Dividends', '2026-07-10 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      10, 1, 5, 'expense', 12.50, 'Coffee shop', '2026-07-10 00:00:00'
    );
  });
}
