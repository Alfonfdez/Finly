# Tareas — 017 Modificar transacción

Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura i18n

[ ] T1 — Añadir claves i18n `modify_title`, `modify_save`, `modify_error_title`, `modify_error_message` a `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts`.

---

### Fase 2 — Reemplazar pantalla placeholder

[ ] T2 — Reemplazar `ModifyTransactionScreen.tsx` (placeholder TODO) por la implementación completa:
  - Importar `useRoute`, `useNavigation`, `useApp`, `useConfig`, `useFontSize`, `t()`.
  - Obtener `transactionId` de `route.params`.
  - Encontrar la transacción desde `useApp().transactions`.
  - Encontrar categoría y cuenta asociadas.
  - Precargar estado local con los datos de la transacción.

[ ] T3 — Implementar header (flecha retroceso + título "Modificar transacción" multilingual) usando `useLayoutEffect` + `navigation.setOptions` o el header del Stack navigator.

---

### Fase 3 — Secciones del formulario

[ ] T4 — Implementar tabs "Gastos/Ingresos" con `TypeTabs`, precargado con el tipo de la transacción. Al cambiar de tipo, resetear `categoryId` y recargar el grid.

[ ] T5 — Implementar campo de cantidad:
  - Precargar con `String(transaction.amount)` parseado.
  - Input con validación (`parseAmountInput`, `formatAmountDisplay`).
  - Símbolo de divisa a la derecha.
  - Icono de calculadora que abre `CalculatorModal`.

[ ] T6 — Implementar sección "Cuenta":
  - Mostrar nombre de la cuenta actual de la transacción.
  - Al pulsar, abrir `AccountModal` para cambiar.

[ ] T7 — Implementar grid de categorías con `CategoryGrid`:
  - La categoría actual de la transacción debe aparecer en la primera posición.
  - Rellenar con las siguientes categorías del mismo tipo (hasta 7).
  - Botón "Más" con lógica condicional (>7 → AddCategory, ≤7 → CreateCategory).

[ ] T8 — Implementar selector de día con `DaySelector`:
  - Precargar con el día de `transaction.date`.
  - Icono de calendario que abre `CalendarModal`.

[ ] T9 — Implementar sección de etiquetas con `TagSection`:
  - Estado de etiquetas seleccionadas vacío (TODO persistencia).
  - Botón de búsqueda y creación funcional.

[ ] T10 — Implementar campo de comentario con `CommentInput`:
  - Precargar con `transaction.description || ''`.
  - Autocompletado con búsqueda debounced de comentarios existentes.

[ ] T11 — Implementar sección de foto con `PhotoSection`:
  - Mismo comportamiento que 004 (TODO funcional).

---

### Fase 4 — Botón de guardado y persistencia

[ ] T12 — Implementar validación del botón "Guardar":
  - Habilitado solo si: categoría seleccionada, cantidad > 0, día seleccionado, cuenta seleccionada.
  - Texto de ayuda dinámico cuando deshabilitado (reutilizar hints de 004).

[ ] T13 — Conectar botón "Guardar":
  - Llamar a `transactionRepository.update(transactionId, data)`.
  - Llamar a `refresh()` del AppContext.
  - Navegar de vuelta (`navigation.goBack()`).
  - Manejar errores con Alert.

---

### Fase 5 — Tema y accesibilidad

[ ] T14 — Verificar que todos los colores usan `useConfig().activeColors` (no hardcodeados).

[ ] T15 — Verificar que todos los textos usan `fs()` para escalado.

[ ] T16 — Verificar que `npx tsc --noEmit` compila sin errores (o `npx expo lint`).

---

### Fase 6 — Verificación

[ ] T17 — Verificación: probar en web y nativo:
  - Navegar desde detalles a modificar.
  - Verificar precarga correcta de todos los campos.
  - Cambiar tipo, cantidad, cuenta, categoría, día, comentario.
  - Guardar y verificar que los cambios persisten.
  - Verificar que el listado se refresca al volver.
  - Verificar que cambiar idioma actualiza todos los textos.
  - Verificar que el tema oscuro/claro funciona.
  - Verificar que el escalado de texto funciona.
