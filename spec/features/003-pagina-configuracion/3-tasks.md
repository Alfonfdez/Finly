# Tareas — 003 Página de configuración
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura de configuración

[ ] T1 — Crear `src/constants/themes.ts` con `coloresDark` (paleta actual) y `coloresLight` (paleta clara con fondos blancos, textos oscuros, primario cyan-600). Exportar tipo `PaletaColores`.

[ ] T2 — Crear `src/context/ConfigContext.tsx` con interfaz `Configuracion` (tema, primerDiaSemana, divisa, separadorDecimal, idioma, tamanoTexto) y valores por defecto. Implementar `ConfigProvider` que carga configuración al montar y persiste al cambiar. Expone `config` y `actualizarConfig()`.

[ ] T3 — Crear `src/database/migrations/003_configuracion.ts` con `CREATE TABLE IF NOT EXISTS configuracion (clave TEXT PRIMARY KEY, valor TEXT)`. Insertar valores por defecto si la tabla está vacía.

[ ] T4 — Crear `src/database/repositories/configRepo.ts` con `obtenerConfig(): Configuracion` y `guardarConfig(parcial: Partial<Configuracion>)`. Implementar también la versión web con localStorage key `finly_config`.

[ ] T5 — Actualizar `src/database/index.ts` para exportar `configRepository` con la misma interfaz en ambas plataformas (SQLite nativo, localStorage web).

[ ] T6 — Envolver la app con `ConfigProvider` en `App.tsx` (junto a `AppProvider`). Asegurar que la configuración se carga antes del primer render (loading state).

---

### Fase 2 — Pantalla de configuración

[ ] T7 — Actualizar `src/constants/types.ts`: añadir `Configuracion` al tipo del root stack y crear `SettingsScreenProps`. Añadir `SettingsScreen` al `HomeStack` en `AppNavigator.tsx` con título "Ajustes" y headerStyle/headerTintColor.

[ ] T8 — Conectar el DrawerItem "Ajustes" en `AppNavigator.tsx` para que navegue a `SettingsScreen` (reemplazar `onPress={() => {}}`).

[ ] T9 — Crear `src/screens/SettingsScreen.tsx` con 5 secciones: Apariencia (tema), Calendario (primer día), Formato de dinero (divisa, separador), Idioma, Texto (tamaño). Cada sección usa un `View` con encabezado y filas tipo `TouchableOpacity` que muestran el valor actual y un indicador de selección (checkmark).

[ ] T10 — Implementar la lógica de selección en cada fila: al pulsar, se muestra un sub-selector (inline o modal) con las opciones disponibles. El valor seleccionado se guarda inmediatamente en `ConfigContext`.

---

### Fase 3 — Integración del tema

[ ] T11 — Modificar `SettingsScreen.tsx` para que use la paleta de colores del tema activo (leer de `ConfigContext` + `themes.ts`). Verificar que se ve correctamente en modo oscuro y claro.

[ ] T12 — Modificar `AppNavigator.tsx` para que el Drawer y los headers del Stack usen la paleta del tema activo en vez de importar `colores` directamente.

---

### Fase 4 — Calendario

[ ] T13 — Modificar `DayPicker.tsx`: aceptar `primerDia` como prop. Corregir el bug de alineación: headers y grid deben usar el mismo cálculo de offset. Con `primerDia=1` (lunes), headers son `Lu Ma Mi Ju Vi Sa Do`; con `primerDia=0` (domingo), headers son `Do Lu Ma Mi Ju Vi Sa`.

[ ] T14 — Modificar `WeekPicker.tsx`: aceptar `primerDia` como prop y pasarla a `inicioDeSemana`/`finDeSemana`.

[ ] T15 — Actualizar `AppContext.tsx` para que `CalendarPicker` reciba `config.primerDiaSemana` del `ConfigContext`.

---

### Fase 5 — Formato de dinero e idioma

[ ] T16 — Modificar `formatearMoneda` en `src/utils/formatters.ts` para aceptar parámetros `divisa` y `separadorDecimal`. Con separador `,`: usar `toLocaleString('es-ES')` o formateo manual con `.` de miles y `,` de decimal. Con separador `.`: usar `toLocaleString('en-US')` o formateo manual con `,` de miles y `.` de decimal.

[ ] T17 — Crear `src/i18n/es.ts` y `src/i18n/en.ts` con los textos de la UI (tabs, botones, placeholders, nombres de meses, días de la semana). Crear helper `t(key)` que lee `config.idioma`.

[ ] T18 — Actualizar `DayPicker.tsx` para que los headers de días usen el idioma configurado (ej: `Lu` → `Mo` en inglés).

[ ] T19 — Actualizar `obtenerNombreMes` y `obtenerNombreMesAbrev` en `formatters.ts` para aceptar idioma y devolver nombres en español o inglés según config.

---

### Fase 6 — Tamaño de texto

[ ] T20 — Añadir función `escalarFontSize(size: number, config: Configuracion): number` en `formatters.ts` que aplique el factor de escala (Pequeño=0.85, Mediano=1.0, Grande=1.15).

[ ] T21 — Aplicar `escalarFontSize` en `SettingsScreen.tsx` como prueba de concepto. Los componentes existentes se migrarán incrementalmente en futuras features.

---

### Fase 7 — Aspecto de categorías

[ ] T22 — Añadir campo `categoryIconShape: 'square' | 'circle'` con valor por defecto `'square'` al tipo `Config` en `ConfigContext.tsx`. Añadir clave i18n `settings_category_icon_shape`, `shape_square`, `shape_circle` en los 3 idiomas.

[ ] T23 — Añadir sección "Aspecto de categorías" en `SettingsScreen.tsx` con selector de forma (Cuadrado/Círculo). Usar `updateConfig({ categoryIconShape })` al cambiar.

[ ] T24 — Actualizar componentes que renderizan iconos de categoría (`CategoryGrid`, `CategoryList`, grid de `CategoriesScreen`, grid de `AddCategoryScreen`, grid inline de `CreateCategoryScreen`, preview de `ModifyCategoryScreen`, icono de categoría en detalle de transacciones) para leer `config.categoryIconShape` y aplicar `borderRadius` cuadrado (12) o circular (mitad del tamaño).

---

### Verificación

[ ] T22 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar todos los criterios de aceptación de `1-spec.md`. Verificar persistencia entre reinicios.
