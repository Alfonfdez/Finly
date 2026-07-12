# Tareas — 004 Página de añadir transacción
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[ ] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts` para todos los textos de la pantalla (títulos, placeholders, errores, botombres de días, etiquetas, etc.).

[ ] T2 — Actualizar `src/constants/types.ts`: añadir `AddTransactionScreenProps` al `HomeStackParamList`.

[ ] T3 — Actualizar `src/navigation/AppNavigator.tsx`: añadir `AddTransactionScreen` al `HomeStack` con título multilingual y opciones de header.

[ ] T4 — Conectar el FAB "+" del `HomeScreen.tsx` para que navegue a `AddTransactionScreen`.

---

### Fase 2 — Componente TypeTabs y cabecera

[ ] T5 — Verificar que `TypeTabs.tsx` funciona correctamente con los tabs "Gastos"/"Ingresos" multilingües. Ajustar si es necesario.

[ ] T6 — Crear `AddTransactionScreen.tsx` con el header (flecha retroceso + título multilingual), los `TypeTabs` y el estado inicial del formulario.

---

### Fase 3 — Campo de cantidad

[ ] T7 — Implementar el input de cantidad con teclado numérico, validación de máximo 2 decimales y mensaje de error en rojo con texto multilingual.

[ ] T8 — Añadir el icono de calculadora a la derecha del input (UI únicamente, TODO funcional).

---

### Fase 4 — Selección de cuenta y categoría

[ ] T9 — Implementar la sección "Cuenta" que muestra la cuenta seleccionada del Home y abre `AccountModal` al pulsar.

[ ] T10 — Crear `CategoryGrid.tsx`: grid 4×2 con 7 categorías más usadas (icono + nombre) y botón "Más" con icono "+".

[ ] T11 — Integrar `CategoryGrid` en `AddTransactionScreen`. El botón "Más" es TODO (no funcional).

---

### Fase 5 — Selección de día

[ ] T12 — Crear `DaySelector.tsx`: grid 3×1 con Hoy, Ayer y posición dinámica + icono calendario.

[ ] T13 — Implementar la lógica de la tercera posición (dinámica según el día seleccionado).

[ ] T14 — Integrar `CalendarModal` existente para el botón de calendario.

---

### Fase 6 — Etiquetas

[ ] T15 — Crear `TagSection.tsx`: botón de búsqueda, input de búsqueda, lista de etiquetas existentes (toggle), botón "+ Añadir etiqueta".

[ ] T16 — Crear `AddTagModal.tsx`: modal con input "Nombre de la etiqueta", contador "0/20", botones "Cancelar"/"Añadir". Validación de 20 caracteres.

[ ] T17 — Integrar `TagSection` en `AddTransactionScreen`.

---

### Fase 7 — Comentario y foto

[ ] T18 — Crear `CommentInput.tsx`: input multiline con placeholder multilingual y contador "0/4096" dinámico.

[ ] T19 — Crear `PhotoSection.tsx`: icono "+" que abre modal con "Sacar foto" / "Añadir desde galería". UI únicamente (TODO funcional).

[ ] T20 — Integrar `CommentInput` y `PhotoSection` en `AddTransactionScreen`.

---

### Fase 8 — Botón de envío y persistencia

[ ] T21 — Añadir botón "Añadir" al final del formulario con estilo consistente.

[ ] T22 — Implementar `crearTransaccion()` en `transactionRepo.ts` con todos los campos del formulario.

[ ] T23 — Conectar el botón "Añadir" para que llame a `crearTransaccion()` y navegue de vuelta al Home.

---

### Fase 9 — Tema y accesibilidad

[ ] T24 — Aplicar `useConfig().coloresActivos` a todos los componentes nuevos para soporte de tema oscuro/claro.

[ ] T25 — Aplicar `useFontSize()` a todos los textos de la pantalla para escalado.

[ ] T26 — Añadir `accessibilityLabel` y `accessibilityRole` a todos los elementos interactivos.

---

### Verificación

[ ] T27 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar todos los criterios de aceptación de `1-spec.md`. Verificar cambio de idioma, tema y tamaño de texto.
