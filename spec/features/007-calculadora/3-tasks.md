# Tareas — 007 Calculadora
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura

[ ] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts`: calc_title, calc_accept, calc_cancel, calc_error.

[ ] T2 — Crear `src/utils/calculator.ts` con función `evaluate(expression: string): { result: number | null; error: boolean }`. Implementar parser manual que respete precedencia de operadores y maneje decimales.

---

### Fase 2 — Componente CalculatorModal

[ ] T3 — Crear `src/components/CalculatorModal.tsx` con estructura básica: Modal, header con título, área de display (expresión + resultado), grid de botones numéricos y de operación.

[ ] T4 — Implementar teclado de la calculadora: grid 5×4 con botones 0-9, `.`, `+`, `-`, `*`, `/`, `=`, `C`, `⌫`. Estilos según tema activo (useConfig).

[ ] T5 — Implementar lógica de construcción de expresión: concatenar dígitos y operadores, validar dos operadores consecutivos, validar un solo punto decimal por número.

[ ] T6 — Implementar evaluación con botón `=`: llamar a `evaluate()`, mostrar resultado o error. Deshabilitar `=` si expresión vacía o con error.

[ ] T7 — Implementar botón `C` (limpiar todo) y botón `⌫` (backspace: eliminar último carácter).

[ ] T8 — Añadir botones de acción "Aceptar" y "Cancelar" en la parte inferior del modal, fuera del grid de la calculadora.

---

### Fase 3 — Integración

[ ] T9 — Actualizar `AddTransactionScreen.tsx`: añadir estado `calculatorVisible`, conectar botón `calculator-outline` para abrir el modal, y pasar callback `onAccept` que actualice `amountRaw` con el resultado.

[ ] T10 — Ajustar `onAccept` para usar el separador decimal de la configuración (`config.decimalSeparator`).

---

### Fase 4 — Tema y accesibilidad

[ ] T11 — Aplicar `useConfig().activeColors` a todos los elementos de la calculadora (display, botones, modal).

[ ] T12 — Añadir `accessibilityLabel` a todos los botones de la calculadora.

---

### Verificación

[ ] T13 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar:
  - Abrir calculadora desde AddTransactionScreen.
  - Realizar operaciones: suma, resta, multiplicación, división.
  - Probar decimales y backspace.
  - Aceptar resultado y verificar que se pega en el campo de cantidad.
  - Cancelar y verificar que no se modifica el campo.
  - Probar división por cero (mostrar error).
  - Cambiar tema y verificar colores.
  - Probar en iOS, Android y Web.
