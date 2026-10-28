# 2.1.0 to 2.2.0 upgrade testing

This fixture reproduces a real pre-2.2.0 database without running the old app:
`FinlyApp/scripts/upgrade/fixture-2.1.0.json`.

It is a **schema-3** backup:

- users, accounts, categories, transactions, tags and tag links
- 4 accounts, 31 categories, 53 transactions across January-October 2026
- 5 tags, repeated comments and one data-URI photo
- only the 15 config keys that existed in 2.1.0
- no recurring tables or transaction recurrence columns
- custom theme, Spanish, EUR, comma decimals, Sunday-first, large text and hidden balances

Regenerate it with:

```bash
cd FinlyApp
node scripts/upgrade/build-fixture-2.1.0.mjs
```

The tooling test validates the fixture with the current backup parser, checks
that no recurring data is present, checks the 2.1.0 config key set and verifies
all foreign-key references:

```bash
npx vitest run tests/tooling/upgradeFixture.test.ts
```

## Upgrade procedure

1. Install the **EAS-signed 2.1.0 APK** (`versionCode 2`).
2. Import `fixture-2.1.0.json` through Settings -> Data -> Import.
3. Confirm the data and custom config are visible in 2.1.0.
4. Export from 2.1.0 and keep that file as the canonical old-version backup.
5. Install the **EAS 2.2.0 APK** (`versionCode 3`) over it without uninstalling.
6. Verify:
   - old transactions, accounts, categories, tags, comments and photo survive
   - theme, language, currency, decimal separator, first day, text size, Home/Add defaults and hidden balances survive
   - new 2.2.0 config keys use their defaults
   - the Recurring screen opens empty and a new rule can be created
   - a 2.2.0 export contains `schema: 4` and recurring collections
   - the canonical 2.1.0 export still imports
7. Set sort preferences in 2.2.0, reload and confirm they persist.

Sort preferences cannot be part of the 2.1.0 fixture because 2.1.0 did not
persist them; they are verified after the upgrade.
