# Plan de implementación — 011 Página de cuentas

## Arquitectura

### Componentes nuevos

- **AccountsScreen.tsx**: Pantalla principal con header (menú hamburguesa + título), sección de total y lista de cuentas con icono + nombre + saldo.

### Archivos modificados

- **AppNavigator.tsx**: Añadir `AccountsScreen` al `HomeStack`. Conectar el `DrawerItem` de "Cuentas" (actualmente `onPress={() => {}}`) para navegar a la nueva pantalla.
- **types.ts**: Añadir `Accounts` al `RootStackParamList` y `AccountsScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Añadir clave `accounts_total` (si no existe).

### Flujo de navegación

```
Drawer → "Cuentas" → AccountsScreen
  ├── pulsar "+" (FAB) → CreateAccountScreen (013)
  └── pulsar cuenta → ModifyAccountScreen (012) { accountId }
```

### Lista de cuentas

- FlatList con filas que muestran icono (con color de fondo), nombre, nota (si existe) y saldo.
- La nota se muestra debajo del nombre en color `textoSuave` y tamaño reducido. Si está vacía, no se renderiza.
- Cada fila es un `TouchableOpacity` que navega a `ModifyAccountScreen`.
- Estado vacío con icono `wallet-outline` + mensaje.

### Total

- Calculado sumando `getCurrentBalance()` de cada cuenta.
- Formateado con `formatCurrency()`.
- Color: `c.green` si >= 0, `c.red` si < 0.

### i18n

| Clave | EN | ES | CA |
|---|---|---|---|
| `accounts_total` | Total | Total | Total |

*(nav_accounts ya existe)*

---

## Estados de la UI

```
┌─────────────────────────────────┐
│ ☰  Cuentas                     │  ← Header con menú hamburguesa
├─────────────────────────────────┤
│ Total:                          │
│ 3.450,00 €                     │  ← Saldo total (verde/rojo)
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ icon  Cuenta 1    1.200 €  │ │  ← Fila principal (siempre)
│ │       Nota de ejemplo       │ │  ← Segunda fila (solo si nota)
│ ├─────────────────────────────┤ │
│ │ icon  Cuenta 2    2.250 €  │ │  ← Sin nota, solo una fila
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Dependencias

- `accountRepository` existente.
- `formatCurrency` existente.
- `useConfig()`, `useFontSize()`, i18n.
- Componente `AccountModal` existente (no se reutiliza, es para selección).

## Estimación

- **Tareas**: 5 tareas en 2 fases
- **Tiempo estimado**: 1-2 horas
