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
credit-card-outline, money-outline, currency-euro-outline,
currency-dollar-outline, currency-pound-outline, currency-yen-outline,
receipt-outline, trending-up-outline, trending-down-outline,
pie-chart-outline, bar-chart-outline, analytics-outline,
stats-chart-outline
```

### i18n

| Clave | EN | ES | CA |
|---|---|---|---|
| `modify_account_title` | Modify account | Modificar cuenta | Modificar compte |
| `modify_account_name` | Account name | Nombre de la cuenta | Nom del compte |
| `modify_account_note` | Note | Nota | Nota |
| `modify_account_save` | Save | Guardar | Guardar |

*(create_cat_symbols, create_cat_color, create_cat_error_name_empty se reutilizan)*

### DB — Nueva columna

```sql
ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT '';
```

### Flujo de navegación

```
AccountsScreen → pulsar cuenta → ModifyAccountScreen { accountId }
  └── pulsar "Guardar" → accountRepository.update() → navegar de vuelta
```

---

## Estimación

- **Tareas**: 12 tareas en 4 fases
- **Tiempo estimado**: 2-3 horas
