# Release screenshots

The `v3.4` screenshot set (30 screens) in `images/screenshots/` is generated from a committed mock backup, so every release can be re-shot with the same data and layout.

## Run it

From `FinlyApp/`:

```bash
npm run screenshots
```

The script:

1. starts the Expo web dev server on port 8081 if nothing is listening there (and always stops the server it started);
2. launches the installed Chrome through `playwright-core`;
3. opens a fresh browser context (new IndexedDB) at `375x812`, DPR 1, English, dark theme, `Europe/Madrid`;
4. freezes the browser clock at **2026-10-21 12:00**;
5. captures the two empty-state screens first, imports `scripts/screenshots/fixture.json` through Settings -> Data -> Import, then captures the populated screens in manifest order;
6. writes `images/screenshots/v3.4-*.png` and fails on unexpected console errors.

Options:

```bash
npm run screenshots -- --only 03-add-transaction   # one screen (fixture imported when needed)
npm run screenshots -- --set v4                    # future release set
npm run screenshots -- --no-server                 # use an already running dev server
npm run screenshots -- --url http://localhost:8081 --out ../images/screenshots
```

## Fixture

`FinlyApp/scripts/screenshots/fixture.json` is a real backup file (format version 1, schema 4):

- four accounts: My Wallet, Savings, Credit Card and the seeded Total;
- all 31 seeded categories;
- 16 October 2026 transactions (income 2,450.00, expenses 1,476.94, net 973.06);
- five tags (`work`, `food`, `home`, `commute`, `fun`);
- repeated comments for visible usage counts;
- three recurring rules: Rent and Subscriptions active, Gym paused;
- the English/dark/EUR configuration used by the captures.

Rules:

- Keep the dates fixed (the browser clock matches them).
- Keep IDs and foreign keys internally consistent.
- The fixture must remain importable: `tests/tooling/screenshots.test.ts` runs it through `parseBackup` and checks every reference.
- If the seed data or backup schema changes, update the fixture and re-run the capture.

## Naming and versioning

- Every file is `<set>-<index>-<slug>.png`, e.g. `v3.4-01-b-home.png`; sub-screens use `<index><letter>` (`05-a`, `05-b`, ...).
- A set is tied to a release (`v3.4` for 2.2.0); bump `SET` in `manifest.mjs` for the next release, and every image gets a new name so GitHub renders it as a new file.
- The README screenshot order must match `SCREENS` exactly; the tooling test enforces it.
- Old sets stay in the repo for history; READMEs point at the current one.

## Adding or changing a screen

1. Add an entry to `FinlyApp/scripts/screenshots/manifest.mjs` with a stable `key`, a `phase` (`empty` or `fixture`) and a `run` function using the helpers (`reload`, `drawer`, `settings`, `openDetails`, ...). Add `name` only for a deliberate filename override.
2. Add the image block (alt text + caption) to all 9 `README*.md` files.
3. Run `npm run screenshots -- --only <key>`, inspect the PNG, then run the full set.
4. Run `npm run test:all` (the tooling test also checks that all 9 READMEs reference the exact ordered manifest files).

## Checklist

- 375x812, DPR 1.
- English, dark theme, medium text, EUR/comma.
- No focus caret, no hover state, no clipped content, no browser scrollbars.
- No console errors during the run.
- All 9 READMEs reference the same 30 files in manifest order and every path exists.
