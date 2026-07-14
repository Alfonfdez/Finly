# Plan de implementación — 012 Página de modificar cuenta

## Arquitectura

### Componentes nuevos

- **ModifyAccountScreen.tsx**: Pantalla con nombre editable, selector de icono, selector de color, nota (descripción) y botón Guardar.
- **ACCOUNT_ICONS**: Lista de ~20 iconos Ionicons para cuentas (en `constants/accountIcons.ts` o inline).

### Archivos modificados

- **AppNavigator.tsx**: Añadir `ModifyAccountScreen` al `HomeStack`.
- **types.ts**: Añadir `ModifyAccount` al `RootStackParamList` y `ModifyAccountScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Añadir claves multilingües.
- **database/migrations/**: Añadir migración 006 para columna `description` en `accounts`.
- **database/types.ts**: Añadir campo `description?: string` a `Account`.
- **accountRepo.ts / webAccountRepo.ts**: Añadir campo `description` a `update()`.
- **transactionRepo.ts / webTransactionRepo.ts**: Añadir función `deleteByAccountId(id)` para eliminar todas las transacciones de una cuenta.
- **database.ts**: Actualizar `DATABASE_VERSION` y añadir migración.
- **webStorage.ts**: Actualizar `webAccountRepo.create` y `seedWebData` si es necesario.

### Componentes reutilizados

- `ColorGrid` + `QUICK_COLORS` (de `ColorGrid.tsx`).
- `ColorPickerModal` (de `ColorPickerModal.tsx`).
- Grid inline de iconos (mismo patrón que CreateCategoryScreen).

### Iconos para cuentas

```
wallet-outline, cash-outline, card-outline, business-outline,
bank-outline, savings-outline, account-balance-outline,
credit-card-outline, money-outline, receipt-outline,
trending-up-outline, trending-down-outline, pie-chart-outline,
bar-chart-outline, analytics-outline, stats-chart-outline,
briefcase-outline, cash-outline (dup), pricetag-outline,
ellipsis-horizontal-outline
```

*(Misma lista que en 013-pagina-crear-cuenta. Definir en `constants/accountIcons.ts` y reutilizar en ambas pantallas.)*

### i18n

| Clave | EN | ES | CA |
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

*(create_account_symbols, create_account_color se reutilizan de 013)*

### DB — Nueva columna

```sql
ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT '';
```

### Flujo de navegación

```
AccountsScreen → pulsar cuenta → ModifyAccountScreen { accountId }
  ├── pulsar "Guardar" → accountRepository.update() → navegar de vuelta
  └── pulsar "Eliminar" → modal confirmación → transactionRepo.deleteByAccountId() → accountRepo.delete() → refreshAccounts() → navegar de vuelta
```

---

## Estimación

- **Tareas**: 12 tareas en 4 fases
- **Tiempo estimado**: 2-3 horas
