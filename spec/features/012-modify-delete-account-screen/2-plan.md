# Implementation Plan — 012 Edit/Delete Account Page

## Architecture

### New Components

- **ModifyAccountScreen.tsx**: Screen with editable name, icon selector, color selector, note (description) and Save button.
- **ACCOUNT_ICONS**: List of ~20 Ionicons icons for accounts (in `constants/accountIcons.ts` or inline).

### Modified Files

- **AppNavigator.tsx**: Add `ModifyAccountScreen` to `HomeStack`.
- **types.ts**: Add `ModifyAccount` to `RootStackParamList` and `ModifyAccountScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Add multilingual keys.
- **database/migrations/**: Add migration 006 for `description` column in `accounts`.
- **database/types.ts**: Add `description?: string` field to `Account`.
- **accountRepo.ts / webAccountRepo.ts**: Add `description` field to `update()`.
- **transactionRepo.ts / webTransactionRepo.ts**: Add `deleteByAccountId(id)` function to delete all transactions for an account.
- **database.ts**: Update `DATABASE_VERSION` and add migration.
- **webStorage.ts**: Update `webAccountRepo.create` and `seedWebData` if needed.

### Reused Components

- `ColorGrid` + `QUICK_COLORS` (from `ColorGrid.tsx`).
- `ColorPickerModal` (from `ColorPickerModal.tsx`).
- Inline icon grid (same pattern as CreateCategoryScreen).

### Account Icons

```
wallet-outline, cash-outline, card-outline, business-outline,
bank-outline, savings-outline, account-balance-outline,
credit-card-outline, money-outline, receipt-outline,
trending-up-outline, trending-down-outline, pie-chart-outline,
bar-chart-outline, analytics-outline, stats-chart-outline,
briefcase-outline, cash-outline (dup), pricetag-outline,
ellipsis-horizontal-outline
```

*(Same list as in 013-pagina-crear-cuenta. Define in `constants/accountIcons.ts` and reuse in both screens.)*

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `modify_account_title` | Modify account | Modificar cuenta | Modificar compte |
| `modify_account_name` | Account name | Nombre de la cuenta | Nom del compte |
| `modify_account_note` | Note | Nota | Nota |
| `modify_account_save` | Save | Guardar | Guardar |
| `modify_account_error_empty` | Enter an account name | Introduzca un nombre para la cuenta | Introduïu un nom per al compte |
| `modify_account_error_duplicate` | An account with this name already exists | Ya existe una cuenta con este nombre | Ja existeix un compte amb aquest nom |
| `modify_account_delete` | Delete | Eliminar | Eliminar |
| `modify_account_delete_confirm_title` | (name) => `Delete account "${name}"` | (name) => `Eliminar la cuenta "${name}"` | (name) => `Eliminar el compte "${name}"` |
| `modify_account_delete_confirm_message` | All transactions linked to this account will also be deleted | Se eliminarán también todas las transacciones asociadas a esta cuenta | També s'eliminaran totes les transaccions associades a aquest compte |
| `modify_account_delete_confirm_cancel` | Cancel | Cancelar | Cancel·lar |
| `modify_account_delete_confirm_delete` | Delete | Eliminar | Eliminar |

*(create_account_symbols, create_account_color are reused from 013)*

### DB — New Column

```sql
ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT '';
```

### Navigation Flow

```
AccountsScreen → tap account → ModifyAccountScreen { accountId }
  ├── tap "Save" → accountRepository.update() → navigate back
  └── tap "Delete" → confirmation modal → transactionRepo.deleteByAccountId() → accountRepo.delete() → refreshAccounts() → navigate back
```

---

## Estimation

- **Tasks**: 12 tasks in 4 phases
- **Estimated time**: 2-3 hours
