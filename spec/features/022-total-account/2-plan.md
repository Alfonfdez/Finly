# Implementation Plan — 022 Total Account

## Architecture

### Modified Files

- **database/types.ts**: Add `is_total?: number` to `Account` interface.
- **database/migrations/001_initial.ts**: Add `is_total INTEGER NOT NULL DEFAULT 0` column to `accounts` CREATE TABLE.
- **database/migrations/002_seed.ts**: Add Total account (id=2, name="Total", icon=`layers-outline`, color=`#475569`, `is_total=1`). Update "My Wallet" insert to include `is_total`.
- **database/webStorage.ts**:
  - Add Total account to seed.
  - `webAccountRepo.list()`: sort with Total first.
  - `webAccountRepo.delete()`: skip if `is_total`.
  - `webAccountRepo.create()`: default `is_total: 0`.
- **database/repositories/accountRepo.ts**:
  - `list()`: `ORDER BY is_total DESC, name`.
- **database/repositories/transactionRepo.ts** (& webStorage):
  - `totalByPeriod()`: accept `accountId: number | null`. When `null`, query all accounts (no `account_id` filter).
- **constants/types.ts**: Add `TOTAL_ACCOUNT_ID = 2` constant.
- **constants/types.ts**: Add `totalAccount` derived object to AppContext type.
- **i18n/en.ts, es.ts, ca.ts**: Add `account_total: 'Total'`.
- **i18n/index.ts**: Add `2: 'account_total'` to `ACCOUNT_I18N_KEYS`.
- **context/AppContext.tsx**:
  - `loadTransactions()` / `refresh()`: if `activeAccount.is_total`, skip `account_id` filter.
  - `accountsWithBalance`: fix Total's balance to sum of all non-total accounts.
  - `totalIncomeAll`/`totalExpensesAll`: pass `null` as accountId when Total is active.
- **screens/HomeScreen.tsx**: No changes needed (Total account renders like any other account via existing `activeAccount` data).
- **screens/AddTransactionScreen.tsx**: Filter `accountsWithBalance` → `.filter(a => !a.is_total)`.
- **screens/ModifyTransactionScreen.tsx**: Same filter as AddTransactionScreen.
- **screens/ModifyAccountScreen.tsx**:
  - When `account.is_total`: disable name field, hide delete button, save only icon/color/note.
  - Skip duplicate validation for Total.
- **spec/features/002-db-design/1-spec.md**: Add `is_total` column to accounts schema.
- **spec/features/011-accounts-screen/1-spec.md**: Update to mention Total account card.
- **spec/features/012-modify-delete-account-screen/1-spec.md**: Add Total account behavior (read-only name, no delete).
- **spec/constitution/3-roadmap.md**: Add 022 entry.

### Reused Components

- `AccountModal` — unchanged. Callers filter accounts before passing.
- `ModifyAccountScreen` — conditional behavior for `is_total`.

### Navigation Flow

```
HomeScreen → account selector → "Total" selected → all accounts mode
AccountsScreen → tap Total card → ModifyAccountScreen { accountId: 2 }
  ├── Name: read-only (i18n "Total")
  ├── Icon: editable
  ├── Color: editable
  ├── Note: editable
  ├── Delete: hidden
  └── Save: update icon, color, note only
```

### i18n

| Key | EN | ES | CA |
|-----|----|----|----|
| `account_total` | Total | Total | Total |

---

## Dependencies

- Existing `accountRepository`, `transactionRepository`.
- Existing `AccountModal`, `ModifyAccountScreen`.
- `useConfig()`, `useFontSize()`, i18n.

## Estimate

- **Tasks**: 8 tasks in 3 phases
- **Estimated time**: 1-2 hours
