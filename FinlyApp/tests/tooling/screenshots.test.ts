import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseBackup } from '../../src/database/backup';

const APP_ROOT = process.env.FINLY_APP_ROOT ?? process.cwd();
const REPO_ROOT = path.resolve(APP_ROOT, '..');
const FIXTURE_PATH = path.join(APP_ROOT, 'scripts', 'screenshots', 'fixture.json');
const README_RE = /^README(\.[a-z]{2})?\.md$/;
const IMAGE_RE = /!\[[^\]]*\]\((images\/screenshots\/[^)]+)\)/g;

const readmes = readdirSync(REPO_ROOT).filter(name => README_RE.test(name)).sort();

function screenshotRefs(name: string): string[] {
  const content = readFileSync(path.join(REPO_ROOT, name), 'utf8');
  return [...content.matchAll(IMAGE_RE)].map(match => match[1]);
}

describe('screenshot workflow', () => {
  it('defines a valid, self-consistent backup fixture', () => {
    const backup = parseBackup(readFileSync(FIXTURE_PATH, 'utf8'));
    const {
      users,
      accounts,
      categories,
      transactions,
      tags,
      transaction_tags: transactionTags,
      recurring_rules: recurringRules,
      recurring_rule_tags: recurringRuleTags,
    } = backup.data;

    expect(backup.schema).toBe(4);
    expect(users).toHaveLength(1);
    expect(users[0].id).toBe(1);
    expect(accounts.some(account => account.is_total === 1)).toBe(true);
    expect(categories.some(category => category.type === 'expense')).toBe(true);
    expect(categories.some(category => category.type === 'income')).toBe(true);
    expect(recurringRules).toHaveLength(3);
    expect(transactions.every(transaction => transaction.date.startsWith('2026-10'))).toBe(true);

    const accountIds = new Set(accounts.map(account => account.id));
    const categoryIds = new Set(categories.map(category => category.id));
    const tagIds = new Set(tags.map(tag => tag.id));
    const transactionIds = new Set(transactions.map(transaction => transaction.id));
    const ruleIds = new Set(recurringRules.map(rule => rule.id));

    for (const transaction of transactions) {
      expect(accountIds.has(transaction.account_id)).toBe(true);
      expect(categoryIds.has(transaction.category_id)).toBe(true);
      if (transaction.recurring_rule_id != null) {
        expect(ruleIds.has(transaction.recurring_rule_id)).toBe(true);
        expect(transaction.recurrence_date).not.toBeNull();
      }
    }
    for (const link of transactionTags) {
      expect(transactionIds.has(link.transaction_id)).toBe(true);
      expect(tagIds.has(link.tag_id)).toBe(true);
    }
    for (const rule of recurringRules) {
      expect(accountIds.has(rule.account_id)).toBe(true);
      expect(categoryIds.has(rule.category_id)).toBe(true);
      expect(rule.interval).toBeGreaterThanOrEqual(1);
      expect(rule.interval).toBeLessThanOrEqual(99);
    }
    for (const link of recurringRuleTags) {
      expect(ruleIds.has(link.rule_id)).toBe(true);
      expect(tagIds.has(link.tag_id)).toBe(true);
    }
  });

  it('keeps the 9 READMEs on the same existing screenshot set', () => {
    expect(readmes).toHaveLength(9);

    const sets = readmes.map(name => ({ name, refs: screenshotRefs(name) }));
    const expected = sets[0].refs;

    expect(expected).toHaveLength(20);
    expect(expected.every(ref => /\/v3(\.1)?-/.test(ref))).toBe(true);
    expect(expected).toContain('images/screenshots/v3.1-02-hamburger.png');
    for (const entry of sets) {
      expect(entry.refs).toEqual(expected);
      for (const ref of entry.refs) {
        expect(existsSync(path.join(REPO_ROOT, ref)), `${entry.name}: ${ref}`).toBe(true);
      }
    }
  });
});
