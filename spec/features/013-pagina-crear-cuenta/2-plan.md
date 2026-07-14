# Plan de implementación — 013 Página de crear cuenta

## Arquitectura

### Componentes nuevos

- **CreateAccountScreen.tsx**: Pantalla con nombre editable, selector de icono, selector de color, nota (descripción) y botón Crear.
- **ACCOUNT_ICONS**: Lista de ~20 iconos Ionicons para cuentas (reutilizar `constants/accountIcons.ts` de 012; si 012 aún no existe, crear el archivo aquí).

### Archivos modificados

- **AppNavigator.tsx**: Añadir `CreateAccountScreen` al `HomeStack`.
- **types.ts**: Añadir `CreateAccount` al `RootStackParamList` y `CreateAccountScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Añadir claves multilingües.
- **accountRepo.ts / webAccountRepo.ts**: Añadir función `existsByName(name: string, excludeId?: number)` para validación de duplicados. El parámetro `excludeId` se usa en 012 para excluir la cuenta actual.
- **database.ts / webStorage.ts**: Añadir `create()` si no existe.

### Componentes reutilizados

- `ColorGrid` + `QUICK_COLORS` (de `ColorGrid.tsx`).
- `ColorPickerModal` (de `ColorPickerModal.tsx`).
- Grid inline de iconos (mismo patrón que CreateCategoryScreen / ModifyAccountScreen).

### i18n

| Clave | EN | ES | CA |
|---|---|---|---|
| `create_account_title` | Create account | Crear cuenta | Crear compte |
| `create_account_name` | Account name | Nombre de la cuenta | Nom del compte |
| `create_account_note` | Note | Nota | Nota |
| `create_account_button` | Create | Crear | Crear |
| `create_account_error_empty` | Enter an account name | Introduzca un nombre para la cuenta | Introduïu un nom per al compte |
| `create_account_error_duplicate` | An account with this name already exists | Ya existe una cuenta con este nombre | Ja existeix un compte amb aquest nom |
| `create_account_error_icon` | Select an icon | Selecciona un icono | Selecciona una icona |
| `create_account_error_color` | Select a color | Selecciona un color | Selecciona un color |
| `create_account_error_icon_color` | Select an icon and a color | Selecciona un icono y un color | Selecciona una icona i un color |

*(nav_accounts ya existe)*

### Flujo de navegación

```
AccountsScreen (011) → pulsar "+" (FAB) → CreateAccountScreen (013)
  └── pulsar "Crear" → accountRepository.create() → navegar de vuelta a AccountsScreen
```

---

## Estados de la UI

```
┌─────────────────────────────────┐
│ ←  Crear cuenta                │  ← Header con retroceso
├─────────────────────────────────┤
│ Nombre de la cuenta             │
│ [_____________________________] │  ← Input con contador 0/30
├─────────────────────────────────┤
│ Símbolos                        │
│ ┌────┬────┬────┬────┐          │
│ │ 💰 │ 💵 │ 💳 │ 🏢 │          │  ← Grid 4 columnas
│ ├────┼────┼────┼────┤          │
│ │ 🏦 │ 🏧 │ ...              │
│ └────┴────┴────┴────┘          │
├─────────────────────────────────┤
│ Color                           │
│ ● ● ● ● ● ● +                  │  ← 6 predefinidos + picker
├─────────────────────────────────┤
│ Nota                            │
│ [_____________________________] │  ← Input multilínea 0/200
├─────────────────────────────────┤
│ [          Crear           ]    │  ← Botón habilitado/deshabilitado
└─────────────────────────────────┘
```

## Dependencias

- `accountRepository` existente.
- `ColorGrid`, `ColorPickerModal` existentes.
- `useConfig()`, `useFontSize()`, i18n.
- `@expo/vector-icons` (Ionicons).

## Estimación

- **Tareas**: 10 tareas en 3 fases
- **Tiempo estimado**: 1.5-2 horas
