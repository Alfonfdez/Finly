# 016 — Página de detalles de transacción

- **Objetivo**
Pantalla `TransactionDetailsScreen` accesible al pulsar una transacción desde `TransactionsScreen`, `AllTransactionsScreen` o cualquier listado de transacciones. Muestra todos los datos de una transacción individual: cantidad, cuenta, categoría, fecha, comentario, y ofrece botones para eliminar o editar. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- Al pulsar una transacción en cualquier listado (`TransactionsScreen`, `AllTransactionsScreen`, `TransactionGroup`) navega a `TransactionDetails` pasando `transactionId` como parámetro.
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a la pantalla anterior.
- El título del header es "Detalles de la transacción" — clave i18n `details_title` (multilingual).

### 2. Ficha de datos

Cada campo se muestra en una fila con un label a la izquierda (gris, `textSecondary`) y el valor a la derecha:

| Label (clave i18n) | Valor | Ejemplo |
|---|---|---|
| `details_amount` | Importe formateado con divisa | `1.234,56 €` |
| `details_account` | Icono de cuenta (28×28) + nombre de la cuenta | `🏦 Banco` |
| `details_category` | Icono de categoría (28×28) + nombre de la categoría | `🍔 Restaurante` |
| `details_date` | Fecha en formato largo según idioma | `14 de julio de 2026` / `July 14, 2026` / `14 de juliol de 2026` |
| `details_comment` | Comentario de la transacción, o texto "Sin comentario" en gris si está vacío | `Cena con amigos` / _Sin comentario_ |

### 3. Fecha

- El formato largo de fecha depende del idioma activo:
  - **es:** `14 de julio de 2026`
  - **en:** `July 14, 2026`
  - **ca:** `14 de juliol de 2026`
- Se implementa como una función `formatDateLong(date, language)` en `formatters.ts`.

### 4. Comentario

- La sección "Comentario" se muestra siempre (consistencia visual con el resto de campos).
- Si `transaction.description` es `null` o cadena vacía, se muestra el texto "Sin comentario" / "No comment" / "Sense comentari" en color `textSecondary` sin fondo.
- Si hay comentario, se muestra el texto completo en color `text`.

### 5. Botón "Eliminar"

- Botón con icono `trash-outline` y texto "Eliminar" (clave `details_delete`, multilingual).
- Color: rojo (`#F87171`), fondo transparente con borde rojo.
- Al pulsarlo, abre un modal de confirmación:

**Modal de confirmación:**
- Título: `"¿Quiere eliminar la transacción?"` (clave `details_delete_title`, multilingual).
- Botón izquierdo: "No" (clave `details_delete_no`, multilingual) — cierra el modal.
- Botón derecho: "Sí" (clave `details_delete_yes`, multilingual) — elimina la transacción, refresca los datos y navega de vuelta a la pantalla anterior.

### 6. Botón "Editar" (TODO)

- Botón con icono `create-outline` y texto "Editar" (clave `details_edit`, multilingual).
- Color: color primario (`c.primary`).
- Al pulsarlo, navega a una nueva pantalla `ModifyTransaction` (TODO) con `transactionId` como parámetro.
- La implementación de `ModifyTransactionScreen` queda fuera del alcance de esta feature (se marcará como TODO).

### 7. Pie de creación

- En la parte inferior de la pantalla, alineado a la izquierda, se muestra el texto:
  `"Creado HH:mm dd MMM"` (clave `details_created`, multilingual).
- Ejemplo: `"Creado 11:50 14 jul"` / `"Created 11:50 14 Jul"` / `"Creat 11:50 14 jul"`.
- Se usa formato **24h** (`HH:mm`) para la hora.
- `transaction.date` se almacena como `YYYY-MM-DD HH:mm:ss`; se extrae la hora y el día para formatear.
- El año se muestra siempre: `"Creado 11:50 14 jul 2026"`.

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles deben usar `t()` del sistema i18n existente. No se permite ningún string hardcodeado.
- **Tema**: la pantalla debe usar `useConfig().activeColors` para colores (no hardcodeados).
- **Texto**: la pantalla debe usar `useFontSize()` para escalado de texto.
- **Formato monetario**: usar `formatCurrency()` con divisa y separador de `ConfigContext`.
- **Navegación**: la pantalla se añade al Stack navigator con `transactionId` como parámetro de ruta.
- **Refresco automático**: las pantallas de listado (`TransactionsScreen`, `AllTransactionsScreen`) usan `useFocusEffect` para incrementar un `refreshTrigger` que fuerza a `useTransactionFilters` a recargar los datos al volver (ej: tras eliminar una transacción).

---

## Criterios de aceptación

- [ ] Al pulsar una transacción en cualquier listado, navega a la pantalla de detalles.
- [ ] El header muestra flecha de retroceso y título "Detalles de la transacción" en el idioma activo.
- [ ] La fila "Cantidad" muestra el importe formateado con el color del tipo (verde ingreso / rojo gasto) y signo (+/-).
- [ ] La sección "Cuenta" muestra icono + nombre de la cuenta.
- [ ] La sección "Categoría" muestra icono + nombre de la categoría.
- [ ] La sección "Fecha" muestra la fecha en formato largo según el idioma.
- [ ] La sección "Comentario" se muestra siempre; si está vacío, aparece "Sin comentario" en gris.
- [ ] El botón "Eliminar" muestra un modal de confirmación con "No" y "Sí".
- [ ] Al confirmar "Sí", la transacción se elimina y se vuelve a la pantalla anterior.
- [ ] El botón "Editar" navega a `ModifyTransaction` con `transactionId` (TODO).
- [ ] El pie muestra "Creado HH:mm dd MMM aaaa" en 24h con el idioma activo (el año siempre visible).
- [ ] Todos los textos cambian al cambiar el idioma en configuración.
- [ ] La pantalla respeta el tema activo (oscuro/claro).
- [ ] La pantalla respeta el tamaño de texto configurado.
