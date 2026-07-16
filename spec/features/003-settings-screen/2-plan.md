# Implementation plan — 003 Settings page

## Files to create

```
src/
├── constants/
│   ├── themes.ts              ← dark and light palettes
│   └── types.ts               ← add Configuracion to RootStackParamList
│
├── context/
│   └── ConfigContext.tsx       ← Context + Provider for settings
│
├── database/
│   ├── migrations/
│   │   └── 003_configuracion.ts  ← CREATE TABLE IF NOT EXISTS configuracion
│   └── repositories/
│       └── configRepo.ts       ← read/save settings
│
├── i18n/
│   ├── es.ts                  ← Spanish texts
│   └── en.ts                  ← English texts
│
├── screens/
│   └── SettingsScreen.tsx      ← settings screen
│
└── utils/
    └── formatters.ts           ← modify formatearMoneda to support currency and separator
```

## Files to modify

```
src/constants/colors.ts        ← export coloresDark and coloresLight
src/context/AppContext.tsx      ← consume ConfigContext for primerDiaSemana
src/components/calendars/DayPicker.tsx  ← use primerDia from config, fix headers/grid alignment
src/components/calendars/WeekPicker.tsx ← use primerDia from config
src/navigation/AppNavigator.tsx ← add SettingsScreen to Stack, connect DrawerItem
src/constants/types.ts         ← add Configuracion and SettingsScreenProps
src/utils/formatters.ts        ← formatearMoneda with currency and separator parameters
```

---

## Architecture

### ConfigContext

```ts
interface Configuracion {
  tema: 'oscuro' | 'claro' | 'sistema';
  primerDiaSemana: 0 | 1;        // 0=domingo, 1=lunes
  divisa: string;                 // '€', '$', '£', '¥'
  separadorDecimal: ',' | '.';
  idioma: 'es' | 'en';
  tamanoTexto: 'pequeño' | 'mediano' | 'grande';
  formaIconoCategoria: 'cuadrado' | 'circulo';
}
```

- `ConfigProvider` wraps the app (alongside `AppProvider`).
- Exposes `config` (current object) and `actualizarConfig(partial)`.
- On mount, loads from storage. On change, persists and re-renders.

### Color palettes

```ts
// themes.ts
export const coloresDark = { /* current palette */ };
export const coloresLight = {
  fondo: '#FFFFFF',
  fondoAlto: '#F1F5F9',
  texto: '#1E293B',
  textoSuave: '#64748B',
  primario: '#0891B2',   // cyan-600 (darker for contrast on light background)
  ...
};
```

A `useTema()` hook is created that reads `config.tema` + OS `Appearance` and returns the active palette. All components using `colores` must migrate to `useTema()` or receive the palette via context.

### Lightweight i18n

No `i18next` or external library is installed. A plain object per language is created with the necessary keys and a `t(key)` helper that reads `config.idioma`.

```ts
// es.ts
export const es = {
  tab_gastos: 'Gastos',
  tab_ingresos: 'Ingresos',
  periodo_dia: 'Día',
  ...
};
```

### Persistence

- **SQLite**: `configuracion` table with columns `clave TEXT PRIMARY KEY, valor TEXT`. One row is inserted per option. `configRepo.ts` exposes `obtenerConfig()` and `guardarConfig(partial)`.
- **localStorage** (web): a single `finly_config` key with serialized JSON. Uses the same interface as the repo.

### Calendar integration

- `DayPicker.tsx` accepts `primerDia` as a prop (WeekPicker already does).
- The alignment bug is fixed: headers and grid use the same `primerDia`.
- `AppContext` passes `config.primerDiaSemana` to `CalendarPicker`.

### Formatter integration

- `formatearMoneda(amount, currency, separator)` receives the config parameters.
- With separator `,`: `Number.toLocaleString('es-ES', ...)` or manual formatting.
- With separator `.`: `Number.toLocaleString('en-US', ...)` or manual formatting.

---

## Decisions

- **No i18n library** — the volume of texts is small; a plain object per language is sufficient and adds no dependency.
- **ConfigContext separate from AppContext** — settings have their own lifecycle (persist, load at startup) and should not be mixed with business state.
- **Theme as exported palette** — instead of CSS variables (which don't exist in native RN), a color object is injected via context.
- **Incremental `colores` migration** — existing components will continue importing `colores` from `colors.ts` during this feature. Full migration to `useTema()` will happen in a future feature to avoid a massive refactor. During this feature, the theme will only affect new components (SettingsScreen) and DayPicker.

### i18n — New keys

| Key | EN | ES | CA |
|---|---|---|---|
| `settings_category_icon_shape` | CATEGORY ICON SHAPE | ASPECTO DE CATEGORÍAS | ASPECTE DE CATEGORIES |
| `shape_square` | Square | Cuadrado | Quadrat |
| `shape_circle` | Circle | Círculo | Cercle |
| `settings_account_icon_shape` | ACCOUNT ICON SHAPE | ASPECTO DE CUENTAS | ASPECTE DE COMPTES |

---

## Verification

1. `npx expo start --web` — test in browser: light/dark theme, change settings, reload.
2. `npx expo start` + Expo Go — test on native: SQLite persistence, theme, calendar.
3. Validate all acceptance criteria from `1-spec.md`.
