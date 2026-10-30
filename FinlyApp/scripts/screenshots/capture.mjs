import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIXED_TIME, SCREENS, SET } from './manifest.mjs';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const REPO_ROOT = path.resolve(APP_ROOT, '..');
const FIXTURE_PATH = path.join(APP_ROOT, 'scripts', 'screenshots', 'fixture.json');
const DEFAULT_URL = 'http://localhost:8081';
const DEFAULT_OUT = path.join(REPO_ROOT, 'images', 'screenshots');
const STARTUP_TIMEOUT_MS = 180000;

function parseArgs(argv) {
  const opts = {
    url: DEFAULT_URL,
    out: DEFAULT_OUT,
    set: SET,
    only: null,
    server: true,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--url') opts.url = argv[++i];
    else if (arg === '--out') opts.out = path.resolve(argv[++i]);
    else if (arg === '--set') opts.set = argv[++i];
    else if (arg === '--only') opts.only = argv[++i];
    else if (arg === '--no-server') opts.server = false;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

async function urlIsUp(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

function startServer() {
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'cmd.exe' : 'npx';
  const args = isWindows
    ? ['/d', '/s', '/c', 'npx expo start --web --port 8081']
    : ['expo', 'start', '--web', '--port', '8081'];
  const child = spawn(command, args, {
    cwd: APP_ROOT,
    env: { ...process.env, CI: '1' },
    stdio: 'ignore',
    windowsHide: true,
  });
  return child;
}

function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

async function waitForServer(url, child) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await urlIsUp(url)) return;
    if (child && child.exitCode !== null) {
      throw new Error(`Expo exited before the server was ready (code ${child.exitCode}).`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${url}. Start it manually or pass --url.`);
}

async function importFixture(helpers, opts) {
  const { page } = helpers;
  await helpers.reload();
  await helpers.drawer('Settings');
  await page.getByText('Data', { exact: true }).filter({ visible: true }).last().click();
  const importRow = page.getByText('Import data', { exact: true }).filter({ visible: true }).last();
  await importRow.waitFor({ timeout: 30000 });
  const chooserPromise = page.waitForEvent('filechooser', { timeout: 15000 });
  await importRow.click();
  const chooser = await chooserPromise;
  await chooser.setFiles(FIXTURE_PATH);
  const confirm = page.getByRole('button', { name: 'Import', exact: true });
  await confirm.waitFor({ timeout: 15000 });
  await confirm.click();
  await page.waitForTimeout(2500);
  await helpers.reload();
  try {
    await helpers.waitTotal();
  } catch (error) {
    await page.screenshot({ path: path.join(opts.out, 'debug-import.png'), animations: 'disabled' });
    console.error('body text after import:', (await page.locator('body').innerText()).slice(0, 800));
    throw error;
  }
}

async function shot(page, filePath, keepScroll = false) {
  await page.mouse.move(2, 2);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.waitForTimeout(150);
  if (!keepScroll) {
    for (let i = 0; i < 2; i += 1) {
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        for (const el of document.querySelectorAll('*')) {
          const overflow = getComputedStyle(el).overflowY;
          if (overflow === 'auto' || overflow === 'scroll') el.scrollTop = 0;
        }
      });
      await page.waitForTimeout(250);
    }
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: filePath, animations: 'disabled' });
  console.log(`captured ${path.relative(REPO_ROOT, filePath)}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  mkdirSync(opts.out, { recursive: true });

  let server = null;
  if (opts.server && !(await urlIsUp(opts.url))) {
    console.log('starting Expo web on port 8081...');
    server = startServer();
    await waitForServer(opts.url, server);
    console.log('Expo web ready');
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'Europe/Madrid',
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('dialog', dialog => {
    console.log(`dialog: ${dialog.message()}`);
    void dialog.accept().catch(() => {});
  });
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => consoleErrors.push(String(error)));

  const helpers = {
    page,
    async reload() {
      await page.clock.setFixedTime(new Date(FIXED_TIME));
      await page.goto(opts.url, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: 'Open menu' }).waitFor({ timeout: 120000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
    },
    async waitHome() {
      await page.getByText('Home', { exact: true }).first().waitFor();
      await page.waitForTimeout(300);
    },
    async waitTotal() {
      await page.getByText(/4[.,]923[.,]06/).first().waitFor({ timeout: 30000 });
      await page.waitForTimeout(300);
    },
    async openDrawer() {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.waitForTimeout(500);
    },
    async drawer(label) {
      await helpers.openDrawer();
      await page.getByText(label, { exact: true }).filter({ visible: true }).last().click();
      await page.waitForTimeout(500);
    },
    async waitList(testId) {
      await page.getByTestId(testId).waitFor({ timeout: 60000 });
      await page.waitForTimeout(300);
    },
    async scrollToTop() {
      for (let i = 0; i < 2; i += 1) {
        await page.evaluate(() => {
          window.scrollTo(0, 0);
          for (const el of document.querySelectorAll('*')) {
            const overflow = getComputedStyle(el).overflowY;
            if (overflow === 'auto' || overflow === 'scroll') el.scrollTop = 0;
          }
        });
        await page.waitForTimeout(300);
      }
    },
    async scrollToTestId(testId) {
      await page.getByTestId(testId).evaluate(node => node.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(500);
    },
    async openEditTransaction() {
      await page.getByText('Edit', { exact: true }).filter({ visible: true }).last().click();
      await page.getByLabel('Amount input').waitFor({ timeout: 30000 });
      await helpers.scrollToTop();
    },
    async openCreateRecurring() {
      await page.getByRole('button', { name: 'Add recurring rule' }).filter({ visible: true }).click();
      await page.getByLabel('Amount input').waitFor({ timeout: 30000 });
      await page.getByLabel('Amount input').fill('39,99');
      await page.getByRole('button', { name: 'Category Utilities', exact: true }).filter({ visible: true }).click();
      await page.getByTestId('repeat-name').fill('Internet');
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.waitForTimeout(100);
      await helpers.scrollToTestId('repeat-options');
    },
    async openModifyRecurring() {
      await page.getByText('Rent', { exact: true }).filter({ visible: true }).first().click();
      await page.getByTestId('repeat-name').waitFor({ timeout: 30000 });
      await helpers.scrollToTestId('repeat-options');
    },
    async openCreateAccount() {
      await page.getByRole('button', { name: 'Add', exact: true }).filter({ visible: true }).click();
      await page.getByPlaceholder('Account name').fill('Travel fund');
      await page.locator('textarea').first().fill('Summer trip');
      await page.getByLabel('Initial balance input').fill('500,00');
      await page.getByLabel('cash-outline').filter({ visible: true }).click();
      await page.getByLabel('#60A5FA').filter({ visible: true }).click();
      await page.waitForTimeout(600);
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.waitForTimeout(100);
      await helpers.scrollToTop();
    },
    async openModifyAccount(name) {
      await page.getByText(name, { exact: true }).filter({ visible: true }).first().click();
      await page.getByPlaceholder('Account name').waitFor();
      await helpers.scrollToTop();
    },
    async openCreateCategory() {
      await page.getByText('Create', { exact: true }).filter({ visible: true }).last().click();
      await page.getByPlaceholder('Category name').fill('Coffee');
      await page.getByLabel('restaurant-outline').filter({ visible: true }).click();
      await page.getByLabel('#FBBF24').filter({ visible: true }).click();
      await page.waitForTimeout(600);
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.waitForTimeout(100);
      await helpers.scrollToTop();
    },
    async openModifyCategory(name) {
      await page.getByText(name, { exact: true }).filter({ visible: true }).first().click();
      await page.getByPlaceholder('Category name').waitFor();
      await helpers.scrollToTop();
    },
    async openCreateTag() {
      await page.getByRole('button', { name: 'Add', exact: true }).filter({ visible: true }).click();
      await page.getByPlaceholder('Tag name').fill('travel');
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.waitForTimeout(250);
    },
    async openModifyTag(name) {
      await page.getByText(name, { exact: true }).filter({ visible: true }).first().click();
      await page.getByLabel('Tag name').waitFor();
      await helpers.scrollToTop();
    },
    async openModifyComment(text) {
      await page.getByText(text, { exact: true }).filter({ visible: true }).first().click();
      await page.getByRole('textbox', { name: 'Comment' }).waitFor();
      await helpers.scrollToTop();
    },
    async addForm() {
      await page.getByRole('button', { name: 'Add expense or income' }).click();
      const amount = page.getByLabel('Amount input');
      await amount.waitFor({ timeout: 30000 });
      await amount.fill('12,40');
      await page.getByText('Groceries', { exact: true }).filter({ visible: true }).click();
      await page.getByText('food', { exact: true }).filter({ visible: true }).click();
      await page.getByText('work', { exact: true }).filter({ visible: true }).click();
      await page.getByLabel('Comment input').fill('Lunch with friends');
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.waitForTimeout(150);
      await helpers.scrollToTop();
      await page.waitForTimeout(300);
    },
    async openDatePicker() {
      await page.getByRole('button', { name: 'Select day' }).dispatchEvent('click');
      await page.waitForTimeout(1200);
      await helpers.scrollToTop();
      await page.waitForTimeout(400);
    },
    async openCategoryFilter() {
      await page.getByTestId('all-transactions-category-filter').click();
      await page.getByText('All expenses', { exact: true }).filter({ visible: true }).waitFor();
      await page.getByText('All expenses', { exact: true }).filter({ visible: true }).click();
      await page.waitForTimeout(300);
    },
    async openDetails(text) {
      await page.getByRole('button', { name: 'Search' }).filter({ visible: true }).click();
      const search = page.getByPlaceholder('Search transactions');
      await search.waitFor();
      await search.fill(text);
      const row = page.getByText(text, { exact: true }).filter({ visible: true }).first();
      await row.waitFor();
      await row.click();
      await page.getByText('Photos', { exact: true }).filter({ visible: true }).first().waitFor();
      await page.waitForTimeout(400);
    },
    async settings(sub) {
      await helpers.drawer('Settings');
      if (sub) {
        await page.getByText(sub, { exact: true }).filter({ visible: true }).last().click();
        await page.waitForTimeout(500);
      }
    },
  };

  const captureOrder = [
    ...SCREENS.filter(screen => screen.phase === 'empty'),
    ...SCREENS.filter(screen => screen.phase === 'fixture'),
  ];
  const needsFixture = !opts.only || SCREENS.find(screen => screen.key === opts.only)?.phase === 'fixture';
  try {
    let imported = false;
    for (const screen of captureOrder) {
      if (needsFixture && screen.phase === 'fixture' && !imported) {
        await importFixture(helpers, opts);
        imported = true;
      }
      if (opts.only && screen.key !== opts.only) continue;
      try {
        await screen.run(helpers);
        const keepScroll = screen.key === '06-a-create-recurring' || screen.key === '06-b-modify-recurring';
        await shot(page, path.join(opts.out, `${screen.name ?? `${opts.set}-${screen.key}`}.png`), keepScroll);
      } catch (error) {
        await page.screenshot({ path: path.join(opts.out, 'debug-fail.png'), animations: 'disabled' });
        console.error('body text on failure:', (await page.locator('body').innerText()).slice(0, 1200));
        throw error;
      }
    }

    if (consoleErrors.length > 0) {
      console.error('Console errors during capture:');
      for (const error of consoleErrors) console.error(`- ${error}`);
      throw new Error('Screenshot run produced console errors.');
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    stopServer(server);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
