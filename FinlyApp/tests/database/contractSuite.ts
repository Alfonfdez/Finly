import { describe, it, expect, beforeEach } from 'vitest';
import { UNTAGGED_ID } from '../../src/database/helpers';
import { UNTAGGED_LABEL, MAX_SUGGESTIONS, THEMES, TRANSACTION_TYPES } from '../../src/constants/types';
import { DEFAULT_CONFIG } from '../../src/database/configDefaults';
import type { ContractBackend, NewAccount, NewCategory, NewTransaction } from './contractTypes';
import type { Transaction } from '../../src/database/types';

const USER = 1;

function account(name: string, overrides: Partial<NewAccount> = {}): NewAccount {
  return {
    user_id: USER,
    name,
    initial_balance: 0,
    icon: 'wallet-outline',
    color: '#22D3EE',
    description: '',
    is_total: 0,
    ...overrides,
  };
}

function category(name: string, overrides: Partial<NewCategory> = {}): NewCategory {
  return {
    user_id: USER,
    name,
    icon: 'tag-outline',
    color: '#A78BFA',
    type: 'expense',
    ...overrides,
  };
}

function tx(overrides: Partial<NewTransaction>): NewTransaction {
  return {
    account_id: 0,
    category_id: 0,
    type: TRANSACTION_TYPES.expense,
    amount: 10,
    description: null,
    photo: null,
    date: '2026-01-01',
    ...overrides,
  };
}

export function runContractSuite(
  name: string,
  createBackend: () => Promise<ContractBackend>
): void {
  describe(`contract: ${name}`, () => {
    let backend: ContractBackend;

    beforeEach(async () => {
      backend = await createBackend();
    });

    const sortedDescriptions = (list: Transaction[]): string[] =>
      list.map(t => t.description ?? '').sort();

    // Inner breakdown arrays are not order-guaranteed by either backend; compare
    // them sorted with the untagged pseudo-row always last.
    const sortBreakdown = (rows: { tag_id: number }[]): { tag_id: number }[] =>
      [...rows].sort((x, y) => {
        const xu = x.tag_id === UNTAGGED_ID ? 1 : 0;
        const yu = y.tag_id === UNTAGGED_ID ? 1 : 0;
        return xu - yu || x.tag_id - y.tag_id;
      });

    describe('seed data', () => {
      it('mirrors seed accounts with the total first', async () => {
        const accounts = await backend.account.list(USER);
        expect(accounts.map(a => ({ name: a.name, is_total: a.is_total ?? 0 }))).toEqual([
          { name: 'Total', is_total: 1 },
          { name: 'My Wallet', is_total: 0 },
        ]);
      });

      it('seeds 31 categories sorted by name', async () => {
        const categories = await backend.category.list(USER);
        expect(categories).toHaveLength(31);
        const names = categories.map(c => c.name);
        expect([...names].sort()).toEqual(names);
        expect(categories.find(c => c.name === 'Salary')?.type).toBe('income');
        expect(categories.find(c => c.name === 'Groceries')?.type).toBe('expense');
      });

      it('starts with empty tags, transactions and links', async () => {
        expect(await backend.tag.list(USER)).toEqual([]);
        expect(await backend.transaction.list()).toEqual([]);
        expect(await backend.transaction.getTagsByTransactionIds([])).toEqual([]);
      });

      it('config.get() returns the defaults', async () => {
        expect(await backend.config.get()).toEqual(DEFAULT_CONFIG);
      });
    });

    describe('accounts', () => {
      it('creates, reads back and updates an account', async () => {
        const created = await backend.account.create(account('Cash', { initial_balance: 100 }));
        expect(await backend.account.getById(created.id)).toMatchObject({
          name: 'Cash',
          initial_balance: 100,
          user_id: USER,
          is_total: 0,
        });
        expect((await backend.account.list(USER)).some(a => a.id === created.id)).toBe(true);

        await backend.account.update(created.id, { name: 'Cash 2', initial_balance: 250 });
        const updated = await backend.account.getById(created.id);
        expect(updated?.name).toBe('Cash 2');
        expect(updated?.initial_balance).toBe(250);
      });

      it('existsByName is case-insensitive and respects excludeId', async () => {
        const created = await backend.account.create(account('Savings'));
        expect(await backend.account.existsByName('savings')).toBe(true);
        expect(await backend.account.existsByName('SAVINGS')).toBe(true);
        expect(await backend.account.existsByName('savings', created.id)).toBe(false);
        expect(await backend.account.existsByName('my wallet')).toBe(true);
        expect(await backend.account.existsByName('unknown')).toBe(false);
      });

      it('computes balances from initial balance and transactions', async () => {
        const savings = await backend.account.create(account('Savings', { initial_balance: 100 }));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const grocery = (await backend.category.list(USER, 'expense')).find(c => c.name === 'Groceries')!;
        await backend.transaction.create(tx({ account_id: savings.id, category_id: salary.id, type: 'income', amount: 50, date: '2026-01-05' }));
        await backend.transaction.create(tx({ account_id: savings.id, category_id: grocery.id, type: 'expense', amount: 20, date: '2026-01-06' }));

        const balances = await backend.account.getBalances();
        const row = balances.find(b => b.account_id === savings.id);
        expect(row?.balance).toBe(130);
        expect(balances).toHaveLength(2); // both non-total accounts, total excluded
      });

      it('delete removes its transactions and tag links but keeps the total account', async () => {
        const acc = await backend.account.create(account('Temp'));
        const tag = await backend.tag.create({ user_id: USER, name: 'x' });
        const grocery = (await backend.category.list(USER, 'expense')).find(c => c.name === 'Groceries')!;
        const transaction = await backend.transaction.createWithTags(
          tx({ account_id: acc.id, category_id: grocery.id, amount: 10, date: '2026-02-01' }),
          [tag.id]
        );
        expect(await backend.transaction.getTagsByTransactionId(transaction.id)).toEqual([tag.id]);

        await backend.account.delete(acc.id);
        expect(await backend.account.getById(acc.id)).toBeNull();
        expect(await backend.transaction.getById(transaction.id)).toBeNull();
        expect(await backend.transaction.getTagsByTransactionId(transaction.id)).toEqual([]);
      });

      it('cannot delete the total pseudo-account', async () => {
        const total = (await backend.account.list(USER)).find(a => (a.is_total ?? 0) === 1)!;
        await backend.account.delete(total.id);
        expect(await backend.account.getById(total.id)).not.toBeNull();
      });

      it('sorts names case-insensitively after the total account', async () => {
        await backend.account.create(account('alpha'));
        await backend.account.create(account('Beta'));
        const names = (await backend.account.list(USER)).map(a => a.name);
        expect(names).toEqual(['Total', 'alpha', 'Beta', 'My Wallet']);
      });
    });

    describe('categories', () => {
      it('creates, filters by type and updates a category', async () => {
        const created = await backend.category.create(category('Hobbies', { type: 'expense' }));
        const incomes = await backend.category.list(USER, 'income');
        const expenses = await backend.category.list(USER, 'expense');
        expect(incomes.some(c => c.name === 'Hobbies')).toBe(false);
        expect(expenses.some(c => c.name === 'Hobbies')).toBe(true);

        await backend.category.update(created.id, { name: 'Hobbies 2', type: 'income' });
        const after = (await backend.category.list(USER, 'income')).find(c => c.id === created.id);
        expect(after?.name).toBe('Hobbies 2');
      });

      it('existsByName is case-insensitive and respects excludeId', async () => {
        const created = await backend.category.create(category('Hobbies'));
        expect(await backend.category.existsByName('hobbies')).toBe(true);
        expect(await backend.category.existsByName('hobbies', created.id)).toBe(false);
        expect(await backend.category.existsByName('unknown')).toBe(false);
      });

      it('delete removes the category and its transactions', async () => {
        const cat = await backend.category.create(category('Temp'));
        const acc = await backend.account.create(account('A'));
        const created = await backend.transaction.create(tx({ account_id: acc.id, category_id: cat.id, amount: 5, date: '2026-03-01' }));

        await backend.category.delete(cat.id);
        expect((await backend.category.list(USER)).some(c => c.id === cat.id)).toBe(false);
        expect(await backend.transaction.getById(created.id)).toBeNull();
      });

      it('reassignAndDelete moves transactions to the new category', async () => {
        const oldCat = await backend.category.create(category('Old'));
        const newCat = await backend.category.create(category('New'));
        const acc = await backend.account.create(account('A'));
        const created = await backend.transaction.create(tx({ account_id: acc.id, category_id: oldCat.id, amount: 5, date: '2026-03-02' }));

        await backend.category.reassignAndDelete(oldCat.id, newCat.id);
        expect((await backend.category.list(USER)).some(c => c.id === oldCat.id)).toBe(false);
        const moved = await backend.transaction.getById(created.id);
        expect(moved?.category_id).toBe(newCat.id);
      });

      it('sorts names case-insensitively', async () => {
        await backend.category.create(category('alpha', { type: 'income' }));
        await backend.category.create(category('Beta', { type: 'income' }));
        const incomes = (await backend.category.list(USER, 'income')).map(c => c.name);
        expect(incomes.indexOf('alpha')).toBeGreaterThan(-1);
        expect(incomes.indexOf('Beta')).toBeGreaterThan(-1);
        expect(incomes.indexOf('alpha')).toBeLessThan(incomes.indexOf('Beta'));
      });
    });

    describe('tags', () => {
      it('creates, lists and updates tags ordered by id', async () => {
        const t1 = await backend.tag.create({ user_id: USER, name: 'travel' });
        const t2 = await backend.tag.create({ user_id: USER, name: 'work' });
        const list = await backend.tag.list(USER);
        expect(list.map(t => t.id)).toEqual([t1.id, t2.id]);

        await backend.tag.update(t1.id, { name: 'vacation' });
        expect((await backend.tag.list(USER)).find(t => t.id === t1.id)?.name).toBe('vacation');
      });

      it('existsByName is user-scoped and excludeId aware', async () => {
        const tag = await backend.tag.create({ user_id: USER, name: 'travel' });
        expect(await backend.tag.existsByName(USER, 'TRAVEL')).toBe(true);
        expect(await backend.tag.existsByName(USER, 'travel', tag.id)).toBe(false);
        expect(await backend.tag.existsByName(999, 'travel')).toBe(false);
      });

      it('deleteMany removes several tags and their transaction links', async () => {
        const tagA = await backend.tag.create({ user_id: USER, name: 'a' });
        const tagB = await backend.tag.create({ user_id: USER, name: 'b' });
        const tagC = await backend.tag.create({ user_id: USER, name: 'c' });
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const t1 = await backend.transaction.createWithTags(
          tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 10, date: '2026-04-02' }),
          [tagA.id, tagB.id]
        );
        const t2 = await backend.transaction.createWithTags(
          tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 10, date: '2026-04-03' }),
          [tagC.id]
        );

        await backend.tag.deleteMany([tagA.id, tagB.id]);
        expect((await backend.tag.list(USER)).map(t => t.id)).toEqual([tagC.id]);
        expect(await backend.transaction.getTagsByTransactionId(t1.id)).toEqual([]);
        expect(await backend.transaction.getTagsByTransactionId(t2.id)).toEqual([tagC.id]);
      });
    });

    describe('transactions', () => {
      it('creates and reads back a transaction; update sets updated_at', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const created = await backend.transaction.create(
          tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1000, description: 'salary', date: '2026-01-15' })
        );
        expect(created.updated_at).toBeNull();

        const read = await backend.transaction.getById(created.id);
        expect(read).toMatchObject({
          account_id: acc.id,
          category_id: salary.id,
          type: 'income',
          amount: 1000,
          description: 'salary',
          date: '2026-01-15',
        });

        await backend.transaction.update(created.id, { amount: 1100, description: 'salary+bonus' });
        const updated = await backend.transaction.getById(created.id);
        expect(updated?.amount).toBe(1100);
        expect(updated?.description).toBe('salary+bonus');
        expect(updated?.updated_at).toBeTruthy();
      });

      it('lists filtered by account, category, type, dates and category ids', async () => {
        const accA = await backend.account.create(account('A'));
        const accB = await backend.account.create(account('B'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const grocery = (await backend.category.list(USER, 'expense')).find(c => c.name === 'Groceries')!;

        const rows: { account_id: number; category_id: number; type: 'income' | 'expense'; amount: number; date: string; description: string }[] = [
          { account_id: accA.id, category_id: salary.id, type: 'income', amount: 100, date: '2026-01-10', description: 'p1' },
          { account_id: accA.id, category_id: grocery.id, type: 'expense', amount: 20, date: '2026-01-11', description: 'p2' },
          { account_id: accB.id, category_id: grocery.id, type: 'expense', amount: 30, date: '2026-01-12', description: 'p3' },
          { account_id: accB.id, category_id: salary.id, type: 'income', amount: 200, date: '2026-01-13', description: 'p4' },
        ];
        for (const r of rows) {
          await backend.transaction.create(tx(r));
        }

        const byAccount = await backend.transaction.list({ account_id: accA.id });
        expect(byAccount.map(t => t.description)).toEqual(['p2', 'p1']); // date DESC
        expect(sortedDescriptions(await backend.transaction.list({ category_id: grocery.id }))).toEqual(['p2', 'p3']);
        expect(sortedDescriptions(await backend.transaction.list({ type: 'income' }))).toEqual(['p1', 'p4']);
        expect(sortedDescriptions(await backend.transaction.list({ start_date: '2026-01-11', end_date: '2026-01-12' }))).toEqual(['p2', 'p3']);
        expect(await backend.transaction.list({ category_ids: [salary.id, grocery.id] })).toHaveLength(4);
      });

      it('filters by tags, untagged and combinations', async () => {
        const acc = await backend.account.create(account('A'));
        const grocery = (await backend.category.list(USER, 'expense')).find(c => c.name === 'Groceries')!;
        const tagA = await backend.tag.create({ user_id: USER, name: 'a' });
        const tagB = await backend.tag.create({ user_id: USER, name: 'b' });

        await backend.transaction.createWithTags(tx({ account_id: acc.id, category_id: grocery.id, amount: 10, date: '2026-05-01', description: 'A' }), [tagA.id]);
        await backend.transaction.createWithTags(tx({ account_id: acc.id, category_id: grocery.id, amount: 10, date: '2026-05-02', description: 'B' }), [tagB.id]);
        await backend.transaction.createWithTags(tx({ account_id: acc.id, category_id: grocery.id, amount: 10, date: '2026-05-03', description: 'AB' }), [tagA.id, tagB.id]);
        await backend.transaction.create(tx({ account_id: acc.id, category_id: grocery.id, amount: 10, date: '2026-05-04', description: 'none' }));

        expect(sortedDescriptions(await backend.transaction.list({ tagIds: [tagA.id] }))).toEqual(['A', 'AB']);
        expect(sortedDescriptions(await backend.transaction.list({ tagIds: [tagB.id] }))).toEqual(['AB', 'B']);
        expect(sortedDescriptions(await backend.transaction.list({ tagIds: [UNTAGGED_ID] }))).toEqual(['none']);
        expect(sortedDescriptions(await backend.transaction.list({ tagIds: [tagA.id, UNTAGGED_ID] }))).toEqual(['A', 'AB', 'none']);
      });

      it('totalByPeriod sums by type within a range, with and without an account', async () => {
        const accA = await backend.account.create(account('A'));
        const accB = await backend.account.create(account('B'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        await backend.transaction.create(tx({ account_id: accA.id, category_id: salary.id, type: 'income', amount: 100, date: '2026-06-01' }));
        await backend.transaction.create(tx({ account_id: accB.id, category_id: salary.id, type: 'income', amount: 50, date: '2026-06-02' }));
        await backend.transaction.create(tx({ account_id: accB.id, category_id: salary.id, type: 'income', amount: 25, date: '2026-07-01' }));

        expect(await backend.transaction.totalByPeriod(null, 'income', '2026-06-01', '2026-06-30')).toBe(150);
        expect(await backend.transaction.totalByPeriod(accA.id, 'income', '2026-06-01', '2026-06-30')).toBe(100);
        expect(await backend.transaction.totalByPeriod(accA.id, 'income', '2026-07-01', '2026-07-31')).toBe(0);
        expect(await backend.transaction.totalByPeriod(null, 'expense', '2026-01-01', '2026-12-31')).toBe(0);
      });

      it('createWithTags and getTagsByTransactionIds resolve tag names', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const tagA = await backend.tag.create({ user_id: USER, name: 'alpha' });
        const tagB = await backend.tag.create({ user_id: USER, name: 'beta' });
        const created = await backend.transaction.createWithTags(
          tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 10, date: '2026-08-01' }),
          [tagA.id, tagB.id]
        );
        const links = await backend.transaction.getTagsByTransactionIds([created.id]);
        expect(links.map(l => l.name).sort()).toEqual(['alpha', 'beta']);
        expect(links.map(l => l.tag_id).sort()).toEqual([tagA.id, tagB.id]);
      });

      it('updateWithTags replaces the tag links', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const tagA = await backend.tag.create({ user_id: USER, name: 'a' });
        const tagB = await backend.tag.create({ user_id: USER, name: 'b' });
        const created = await backend.transaction.createWithTags(
          tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 10, date: '2026-08-02' }),
          [tagA.id]
        );

        await backend.transaction.updateWithTags(created.id, { amount: 20 }, [tagB.id]);
        expect(await backend.transaction.getTagsByTransactionId(created.id)).toEqual([tagB.id]);
        expect((await backend.transaction.getById(created.id))?.amount).toBe(20);
      });

      it('deleteAllTransactions clears transactions and links but keeps accounts and tags', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const tag = await backend.tag.create({ user_id: USER, name: 'x' });
        const created = await backend.transaction.createWithTags(
          tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 10, date: '2026-08-03' }),
          [tag.id]
        );

        await backend.transaction.deleteAllTransactions();
        expect(await backend.transaction.list()).toEqual([]);
        expect(await backend.transaction.getTagsByTransactionIds([created.id])).toEqual([]);
        expect(await backend.tag.list(USER)).toHaveLength(1);
        expect(await backend.account.getById(acc.id)).not.toBeNull();
      });

      it('searchComments returns distinct, sorted, capped matches', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const descriptions = ['coffee', 'coffee', 'coffee shop', 'coffee latte', 'iced coffee', 'tea', 'mocha latte'];
        for (const description of descriptions) {
          await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-01', description }));
        }
        expect(await backend.transaction.searchComments('coffee')).toEqual([
          'coffee',
          'coffee latte',
          'coffee shop',
          'iced coffee',
        ]);
        expect(await backend.transaction.searchComments('zzz')).toEqual([]);
      });

      it(`searchComments caps results at ${MAX_SUGGESTIONS}`, async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        for (const suffix of ['', ' a', ' b', ' c', ' d', ' e']) {
          await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-02', description: `coffee${suffix}` }));
        }
        const result = await backend.transaction.searchComments('coffee');
        expect(result).toHaveLength(MAX_SUGGESTIONS);
      });

      it('searchComments trims and dedupes whitespace variants', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-03', description: 'coffee' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-04', description: '  coffee  ' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-05', description: 'coffee shop' }));
        expect(await backend.transaction.searchComments('coffee')).toEqual(['coffee', 'coffee shop']);
      });

      it('getDistinctComments groups trimmed comments with counts, ignoring blanks', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-06', description: 'coffee' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-07', description: '  coffee  ' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-08', description: 'Lunch' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-09', description: '   ' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-10', description: null }));

        const comments = await backend.transaction.getDistinctComments();
        const normalized = comments.map(c => ({ description: c.description.toLowerCase(), count: c.count }));
        expect(normalized).toEqual([
          { description: 'coffee', count: 2 },
          { description: 'lunch', count: 1 },
        ]);
      });

      it('countByDescription counts matching trimmed comments', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-11', description: 'coffee' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-12', description: '  coffee  ' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-13', description: 'tea' }));

        expect(await backend.transaction.countByDescription('coffee')).toBe(2);
        expect(await backend.transaction.countByDescription(' tea ')).toBe(1);
        expect(await backend.transaction.countByDescription('zzz')).toBe(0);
      });

      it('updateComment renames a comment across matching transactions and reports changed rows', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const t1 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-14', description: 'coffee' }));
        const t2 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-15', description: '  coffee  ' }));
        const t3 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-16', description: 'tea' }));

        const changed = await backend.transaction.updateComment('coffee', 'cafe');
        expect(changed).toBe(2);
        expect((await backend.transaction.getById(t1.id))?.description).toBe('cafe');
        expect((await backend.transaction.getById(t2.id))?.description).toBe('cafe');
        expect((await backend.transaction.getById(t3.id))?.description).toBe('tea');
        expect((await backend.transaction.getById(t1.id))?.updated_at).toBeTruthy();
      });

      it('updating a comment to another existing case-variant merges them into one', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-17', description: 'food' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-18', description: 'Food' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-19', description: 'rent' }));

        const changed = await backend.transaction.updateComment('food', 'Food');
        expect(changed).toBe(1);

        const comments = await backend.transaction.getDistinctComments();
        const normalized = comments.map(c => ({ description: c.description.toLowerCase(), count: c.count }));
        expect(normalized).toEqual([
          { description: 'food', count: 2 },
          { description: 'rent', count: 1 },
        ]);
      });

      it('deleteComment removes the comment from its transactions and reports the count', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const t1 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-20', description: 'coffee' }));
        const t2 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-21', description: '  coffee  ' }));
        const t3 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-22', description: 'tea' }));

        const removed = await backend.transaction.deleteComment('coffee');
        expect(removed).toBe(2);
        expect((await backend.transaction.getById(t1.id))?.description).toBeNull();
        expect((await backend.transaction.getById(t2.id))?.description).toBeNull();
        expect((await backend.transaction.getById(t3.id))?.description).toBe('tea');
        expect(await backend.transaction.getDistinctComments()).toEqual([{ description: 'tea', count: 1 }]);
      });

      it('deleteComments removes several comments at once and reports the total', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const t1 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-23', description: 'coffee' }));
        const t2 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-24', description: '  tea  ' }));
        const t3 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-25', description: 'juice' }));
        const t4 = await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 1, date: '2026-09-26', description: 'tea' }));

        const removed = await backend.transaction.deleteComments(['coffee', ' tea ']);
        expect(removed).toBe(3);
        expect((await backend.transaction.getById(t1.id))?.description).toBeNull();
        expect((await backend.transaction.getById(t2.id))?.description).toBeNull();
        expect((await backend.transaction.getById(t4.id))?.description).toBeNull();
        expect((await backend.transaction.getById(t3.id))?.description).toBe('juice');
        expect(await backend.transaction.getDistinctComments()).toEqual([{ description: 'juice', count: 1 }]);
      });

      it('breakdownByCategoriesAndTags splits tagged and untagged sums per category', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const grocery = (await backend.category.list(USER, 'expense')).find(c => c.name === 'Groceries')!;
        const tagA = await backend.tag.create({ user_id: USER, name: 'alpha' });
        const tagB = await backend.tag.create({ user_id: USER, name: 'beta' });

        await backend.transaction.createWithTags(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 100, date: '2026-10-01' }), [tagA.id]);
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 50, date: '2026-10-02' }));
        await backend.transaction.createWithTags(tx({ account_id: acc.id, category_id: grocery.id, type: 'expense', amount: 30, date: '2026-10-03' }), [tagB.id]);
        await backend.transaction.createWithTags(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 999, date: '2026-12-31' }), [tagA.id]);

        const income = await backend.transaction.breakdownByCategoriesAndTags(null, [salary.id], 'income', '2026-10-01', '2026-10-31');
        expect(sortBreakdown(income.get(salary.id) ?? [])).toEqual([
          { tag_id: tagA.id, name: 'alpha', total: 100 },
          { tag_id: UNTAGGED_ID, name: UNTAGGED_LABEL, total: 50 },
        ]);
        expect(income.get(grocery.id)).toBeUndefined();

        const expense = await backend.transaction.breakdownByCategoriesAndTags(null, [grocery.id], 'expense', '2026-10-01', '2026-10-31');
        expect(sortBreakdown(expense.get(grocery.id) ?? [])).toEqual([{ tag_id: tagB.id, name: 'beta', total: 30 }]);

        const onlyTagA = await backend.transaction.breakdownByCategoriesAndTags(null, [salary.id], 'income', '2026-10-01', '2026-10-31', [tagA.id]);
        expect(sortBreakdown(onlyTagA.get(salary.id) ?? [])).toEqual([{ tag_id: tagA.id, name: 'alpha', total: 100 }]);

        const onlyUntagged = await backend.transaction.breakdownByCategoriesAndTags(null, [salary.id], 'income', '2026-10-01', '2026-10-31', [UNTAGGED_ID]);
        expect(sortBreakdown(onlyUntagged.get(salary.id) ?? [])).toEqual([{ tag_id: UNTAGGED_ID, name: UNTAGGED_LABEL, total: 50 }]);
      });

      it('getCategoryUsageCounts counts in-window transactions and orders by count', async () => {
        const acc = await backend.account.create(account('A'));
        const salary = (await backend.category.list(USER, 'income')).find(c => c.name === 'Salary')!;
        const freelance = (await backend.category.list(USER, 'income')).find(c => c.name === 'Freelance')!;
        const investments = (await backend.category.list(USER, 'income')).find(c => c.name === 'Investments')!;
        const grocery = (await backend.category.list(USER, 'expense')).find(c => c.name === 'Groceries')!;
        const start = '2026-11-01';

        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 10, date: '2026-11-05' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 20, date: '2026-11-06' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: freelance.id, type: 'income', amount: 30, date: '2026-11-07' }));
        await backend.transaction.create(tx({ account_id: acc.id, category_id: salary.id, type: 'income', amount: 40, date: '2026-10-31' })); // before window
        await backend.transaction.create(tx({ account_id: acc.id, category_id: grocery.id, type: 'expense', amount: 50, date: '2026-11-08' })); // wrong type

        const counts = await backend.transaction.getCategoryUsageCounts(USER, 'income', start, acc.id);
        expect(counts.find(c => c.id === salary.id)?.count).toBe(2);
        expect(counts.find(c => c.id === freelance.id)?.count).toBe(1);
        expect(counts.find(c => c.id === investments.id)?.count).toBe(0);
        expect(counts).toHaveLength((await backend.category.list(USER, 'income')).length);
        const ordered = counts.every((c, i) => i === 0 || counts[i - 1].count >= c.count);
        expect(ordered).toBe(true);
      });
    });

    describe('config', () => {
      it('save persists and merges over defaults', async () => {
        const before = await backend.config.get();
        expect(before.theme).toBe(DEFAULT_CONFIG.theme);

        await backend.config.save({
          theme: THEMES.light,
          hideBalances: true,
          homeDefaultAccountId: 3,
        });
        const after = await backend.config.get();
        expect(after.theme).toBe(THEMES.light);
        expect(after.hideBalances).toBe(true);
        expect(after.homeDefaultAccountId).toBe(3);
        expect(after.currency).toBe(DEFAULT_CONFIG.currency);
        expect(after.language).toBe(DEFAULT_CONFIG.language);
        expect(after.firstDayOfWeek).toBe(DEFAULT_CONFIG.firstDayOfWeek);
      });
    });

    describe('deleteAll', () => {
      it('empties each store', async () => {
        await backend.account.create(account('A'));
        await backend.category.create(category('X'));
        await backend.tag.create({ user_id: USER, name: 'y' });

        await backend.account.deleteAll();
        await backend.category.deleteAll();
        await backend.tag.deleteAll();

        expect(await backend.account.list(USER)).toEqual([]);
        expect(await backend.category.list(USER)).toEqual([]);
        expect(await backend.tag.list(USER)).toEqual([]);
      });
    });
  });
}
