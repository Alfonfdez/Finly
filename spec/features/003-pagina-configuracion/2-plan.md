# Plan de implementación — 003 Página de configuración

## Archivos a crear

```
src/
├── constants/
│   ├── themes.ts              ← paletas dark y light
│   └── types.ts               ← añadir Configuracion al RootStackParamList
│
├── context/
│   └── ConfigContext.tsx       ← Context + Provider para configuración
│
├── database/
│   ├── migrations/
│   │   └── 003_configuracion.ts  ← CREATE TABLE IF NOT EXISTS configuracion
│   └── repositories/
│       └── configRepo.ts       ← leer/guardar configuración
│
├── i18n/
│   ├── es.ts                  ← textos en español
│   └── en.ts                  ← textos en inglés
│
├── screens/
│   └── SettingsScreen.tsx      ← pantalla de configuración
│
└── utils/
    └── formatters.ts           ← modificar formatearMoneda para soportar divisa y separador
```

## Archivos a modificar

```
src/constants/colors.ts        ← exportar coloresDark y coloresLight
src/context/AppContext.tsx      ← consumir ConfigContext para primerDiaSemana
src/components/calendars/DayPicker.tsx  ← usar primerDia de config, corregir alineación headers/grid
src/components/calendars/WeekPicker.tsx ← usar primerDia de config
src/navigation/AppNavigator.tsx ← añadir SettingsScreen al Stack, conectar DrawerItem
src/constants/types.ts         ← añadir Configuracion y SettingsScreenProps
src/utils/formatters.ts        ← formatearMoneda con parámetros de divisa y separador
```

---

## Arquitectura

### ConfigContext

```ts
interface Configuracion {
  tema: 'oscuro' | 'claro' | 'sistema';
  primerDiaSemana: 0 | 1;        // 0=domingo, 1=lunes
  divisa: string;                 // '€', '$', '£', '¥'
  separadorDecimal: ',' | '.';
  idioma: 'es' | 'en';
  tamanoTexto: 'pequeño' | 'mediano' | 'grande';
}
```

- `ConfigProvider` envuelve la app (junto a `AppProvider`).
- Expone `config` (objeto actual) y `actualizarConfig(parcial)`.
- Al montar, carga desde storage. Al cambiar, persiste y re-renderiza.

### Paletas de colores

```ts
// themes.ts
export const coloresDark = { /* palette actual */ };
export const coloresLight = {
  fondo: '#FFFFFF',
  fondoAlto: '#F1F5F9',
  texto: '#1E293B',
  textoSuave: '#64748B',
  primario: '#0891B2',   // cyan-600 (más oscuro para contraste en fondo claro)
  ...
};
```

Se crea un hook `useTema()` que lee `config.tema` + `Appearance` del SO y devuelve la paleta activa. Todos los componentes que usan `colores` deben migrar a `useTema()` o recibir la paleta por contexto.

### i18n ligero

No se instala `i18next` ni librería externa. Se crea un objeto plano por idioma con las keys necesarias y un helper `t(key)` que lee `config.idioma`.

```ts
// es.ts
export const es = {
  tab_gastos: 'Gastos',
  tab_ingresos: 'Ingresos',
  periodo_dia: 'Día',
  ...
};
```

### Persistencia

- **SQLite**: tabla `configuracion` con columnas `clave TEXT PRIMARY KEY, valor TEXT`. Se inserta un row por cada opción. `configRepo.ts` expone `obtenerConfig()` y `guardarConfig(parcial)`.
- **localStorage** (web): un solo key `finly_config` con JSON serializado. Se usa la misma interfaz que el repo.

### Integración con calendario

- `DayPicker.tsx` acepta `primerDia` como prop (ya lo hace WeekPicker).
- Se corrige el bug de alineación: headers y grid usan el mismo `primerDia`.
- `AppContext` pasa `config.primerDiaSemana` al `CalendarPicker`.

### Integración con formatters

- `formatearMoneda(cantidad, divisa, separador)` recibe los parámetros de config.
- Con separador `,`: `Number.toLocaleString('es-ES', ...)` o formateo manual.
- Con separador `.`: `Number.toLocaleString('en-US', ...)` o formateo manual.

---

## Decisiones

- **Sin librería i18n** — el volumen de textos es pequeño; un objeto plano por idioma es suficiente y no añade dependencia.
- **ConfigContext separado de AppContext** — la configuración tiene ciclo de vida propio (persiste, se carga al inicio) y no debe mezclarse con el estado de negocio.
- **Tema como paleta exportada** — en vez de CSS variables (que no existen en RN nativo), se usa un objeto de colores que se inyecta por contexto.
- **Migración incremental de `colores`** — los componentes existentes seguirán importando `colores` de `colors.ts` durante esta feature. La migración completa a `useTema()` se hará en una feature futura para evitar un refactor masivo. Durante esta feature, el tema solo afectará a los componentes nuevos (SettingsScreen) y al DayPicker.

## Verificación

1. `npx expo start --web` — probar en navegador: tema claro/oscuro, cambiar configuración, recargar.
2. `npx expo start` + Expo Go — probar en nativo: persistencia SQLite, tema, calendario.
3. Validar todos los criterios de aceptación de `1-spec.md`.
