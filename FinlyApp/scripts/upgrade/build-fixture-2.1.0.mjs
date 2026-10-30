import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const screenshotFixturePath = path.join(here, '..', 'screenshots', 'fixture.json');
const outputPath = path.join(here, 'fixture-2.1.0.json');

const screenshotFixture = JSON.parse(readFileSync(screenshotFixturePath, 'utf8'));
const users = screenshotFixture.data.users;
const accounts = screenshotFixture.data.accounts;
const categories = screenshotFixture.data.categories;
const tags = screenshotFixture.data.tags;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October',
];

const PHOTO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z3ZkAAAAASUVORK5CYII=';

function date(month, day) {
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} 00:00:00`;
}

function createdAt(month, day, time = '09:00:00') {
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${time}`;
}

const transactions = [];
const transactionTags = [];
let nextTransactionId = 1;

function addTransaction({
  month, day, accountId, categoryId, type, amount, description, tagId = null, photo = null, time,
}) {
  const id = nextTransactionId++;
  transactions.push({
    id,
    account_id: accountId,
    category_id: categoryId,
    type,
    amount,
    description,
    photo,
    date: date(month, day),
    created_at: createdAt(month, day, time),
    updated_at: null,
  });
  if (tagId != null) {
    transactionTags.push({ transaction_id: id, tag_id: tagId });
  }
  return id;
}

for (let month = 1; month <= MONTHS.length; month += 1) {
  const name = MONTHS[month - 1];
  addTransaction({
    month,
    day: 1,
    accountId: 1,
    categoryId: 1,
    type: 'income',
    amount: 2200 + month * 25,
    description: `${name} salary`,
    tagId: 1,
    time: '08:00:00',
  });
  addTransaction({
    month,
    day: 2,
    accountId: 1,
    categoryId: 20,
    type: 'expense',
    amount: 850,
    description: 'Monthly rent',
    tagId: 3,
    time: '09:15:00',
  });
  addTransaction({
    month,
    day: 3,
    accountId: 1,
    categoryId: 3,
    type: 'expense',
    amount: 90 + month * 3.5,
    description: 'Weekly groceries',
    tagId: 2,
    time: '18:30:00',
  });
  addTransaction({
    month,
    day: 15,
    accountId: 4,
    categoryId: 4,
    type: 'expense',
    amount: 45,
    description: 'Bus pass',
    tagId: 4,
    time: '07:45:00',
  });
  addTransaction({
    month,
    day: 20,
    accountId: 4,
    categoryId: 16,
    type: 'expense',
    amount: 30 + month * 2,
    description: month === 3 ? 'Concert tickets' : 'Dinner with friends',
    tagId: 5,
    photo: month === 3 ? PHOTO : null,
    time: '21:15:00',
  });
  if (month % 3 === 0) {
    addTransaction({
      month,
      day: 10,
      accountId: 1,
      categoryId: 2,
      type: 'income',
      amount: 350,
      description: 'Freelance project',
      tagId: 1,
      time: '12:00:00',
    });
  }
}

const config = [
  { key: 'theme', value: 'light' },
  { key: 'first_day_of_week', value: '0' },
  { key: 'currency', value: 'currency_euro' },
  { key: 'decimal_separator', value: ',' },
  { key: 'language', value: 'es' },
  { key: 'text_size', value: 'large' },
  { key: 'category_icon_shape', value: 'circle' },
  { key: 'account_icon_shape', value: 'circle' },
  { key: 'home_default_account_id', value: '1' },
  { key: 'home_default_period', value: 'week' },
  { key: 'add_default_account_id', value: '1' },
  { key: 'add_show_labels', value: 'true' },
  { key: 'add_show_comments', value: 'true' },
  { key: 'add_show_photo', value: 'true' },
  { key: 'hide_balances', value: 'true' },
];

const fixture = {
  app: 'Finly',
  kind: 'backup',
  formatVersion: 1,
  exportedAt: '2026-10-20T10:00:00+02:00',
  schema: 3,
  data: {
    users,
    accounts,
    categories,
    transactions,
    tags,
    transaction_tags: transactionTags,
    config,
  },
};

writeFileSync(outputPath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
console.log(`wrote ${path.relative(process.cwd(), outputPath)} (${transactions.length} transactions, ${transactionTags.length} tag links)`);
