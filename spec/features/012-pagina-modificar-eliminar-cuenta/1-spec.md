# 012 — Página de modificar/eliminar cuenta

- **Objetivo**
  Pantalla accesible desde la pantalla de cuentas (011) que permita al usuario modificar una cuenta existente (nombre, icono, color, nota), así como eliminarla con borrado en cascada de sus transacciones. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde `AccountsScreen` (011) al pulsar una cuenta.
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a `AccountsScreen`.
- El título del header es "Modificar cuenta" (multilingual).

### 2. Nombre de la cuenta

- Título: "Nombre de la cuenta" (multilingual).
- Input de texto con el nombre actual de la cuenta.
- Máximo 30 caracteres con contador "0/30".
- **Validación**: no se permite nombre vacío. Si está vacío, se muestra texto de error en rojo y el botón "Guardar" permanece deshabilitado.
- **Validación de duplicados**: al modificar el nombre, se verifica que no exista ya otra cuenta con el mismo nombre (case-insensitive), **excluyendo la cuenta actual**. Mantener el mismo nombre no debe marcar error; solo si el nuevo nombre coincide con otra cuenta distinta.
  - "Cuenta", "cuenta" y "CUENTA" se consideran duplicados.
  - Si hay duplicado, se muestra un texto de error en rojo debajo del input: "Ya existe una cuenta con este nombre" (multilingual) y el botón "Guardar" permanece deshabilitado.
  - La verificación se ejecuta con un debounce de 300ms para no consultar en cada pulsación de tecla.

### 3. Símbolos (iconos)

- Título: "Símbolos" (multilingual).
- Grid de 4 columnas × filas dinámicas (ScrollView vertical si no caben todos).
- Lista de iconos Ionicons predefinidos para cuentas (~20 iconos relacionados con finanzas/banco/wallet).
- El icono actual de la cuenta debe aparecer preseleccionado al abrir la pantalla.
- Al pulsar un icono, se resalta con borde de color primario y el fondo cambia ligeramente.
- Solo un icono puede estar seleccionado a la vez.
- La selección de icono **no es obligatoria** para guardar.
- Al seleccionar un icono, el color de fondo del icono cambia al color seleccionado en la sección de color para mostrar al usuario cómo queda el icono.
- Iconos predefinidos (~20):

| # | Icono (Ionicons) | # | Icono (Ionicons) |
|---|---|---|---|
| 1 | `wallet-outline` | 11 | `trending-up-outline` |
| 2 | `cash-outline` | 12 | `trending-down-outline` |
| 3 | `card-outline` | 13 | `pie-chart-outline` |
| 4 | `business-outline` | 14 | `bar-chart-outline` |
| 5 | `bank-outline` | 15 | `analytics-outline` |
| 6 | `savings-outline` | 16 | `stats-chart-outline` |
| 7 | `account-balance-outline` | 17 | `briefcase-outline` |
| 8 | `credit-card-outline` | 18 | `cash-outline` |
| 9 | `money-outline` | 19 | `pricetag-outline` |
| 10 | `receipt-outline` | 20 | `ellipsis-horizontal-outline` |

### 4. Color

- Título: "Color" (multilingual).
- Grid de 1 fila × 8 columnas (misma estructura que en 009).
- Las 6 primeras posiciones son colores predefinidos con forma circular.
- La 7.ª posición muestra el color personalizado elegido del picker (si el color actual de la cuenta no está entre los 6 predefinidos) **o** el color actual de la cuenta si es un color personalizado.
- La 8.ª posición es un "+" con color gris que abre el modal de selector de colores dinámico (`ColorPickerModal` existente).
- El color actual de la cuenta debe aparecer preseleccionado al abrir la pantalla. Si el color coincide con uno de los 6 predefinidos, ese círculo se marca como seleccionado.
- Al pulsar un color, se resalta con un anillo/borde más oscuro y un checkmark superpuesto.
- Solo un color puede estar seleccionado a la vez.
- La selección de color **no es obligatoria** para guardar.
- Colores predefinidos (mismos 6 que en toda la app):

| # | Color | Hex |
|---|---|---|
| 1 | Cian (primario) | `#22D3EE` |
| 2 | Rojo | `#F87171` |
| 3 | Verde | `#34D399` |
| 4 | Amarillo | `#FBBF24` |
| 5 | Rosa | `#F472B6` |
| 6 | Azul | `#60A5FA` |

#### Modal de colores (reanimated-color-picker)

- Se abre al pulsar "+" en la grid de colores.
- Usa la librería `reanimated-color-picker` con:
  - Panel1 (selector de saturación/brillo)
  - HueSlider (selector de tono)
  - OpacitySlider (selector de opacidad)
  - Preview (muestra el color seleccionado en formato hex)
- Botones OK/Cancel para confirmar o cancelar la selección.
- Al pulsar OK, el color queda seleccionado en la grid principal y el círculo personalizado (7.ª posición) se actualiza.

### 5. Nota (descripción)

- Título: "Nota" (multilingual).
- Input de texto multilínea para una descripción opcional de la cuenta.
- Máximo 200 caracteres con contador "0/200".
- Valor por defecto: vacío o el valor actual de `description` si la cuenta tiene una.

> Nota: el campo `description` actualmente no existe en la tabla `accounts`. Se añadirá como columna opcional mediante una migración.

### 6. Botón "Eliminar"

- Botón "Eliminar" (multilingual) con estilo rojo (`c.red`), ubicado antes del botón "Guardar".
- Al pulsarlo, se abre un modal de confirmación:

**Modal de confirmación — "¿Eliminar cuenta?"**
- Título: "Eliminar la cuenta "{accountName}"" (multilingual, interpola el nombre de la cuenta).
- Mensaje: "Se eliminarán también todas las transacciones asociadas a esta cuenta" (multilingual).
- Botones: "Cancelar" (multilingual) y "Eliminar" (multilingual, color rojo).
- Al pulsar "Cancelar", se cierra el modal.
- Al pulsar "Eliminar":
  1. Se eliminan todas las transacciones asociadas a la cuenta mediante `transactionRepository.deleteByAccountId(id)`.
  2. Se elimina la cuenta de la tabla `accounts` mediante `accountRepository.delete(id)`.
  3. Se refresca la lista de cuentas (`refreshAccounts()` del `AppContext`).
  4. Se navega de vuelta a `AccountsScreen`.

### 7. Botón "Guardar"

- Botón "Guardar" (multilingual) en la parte inferior.
- Deshabilitado si se cumple ALGUNA de estas condiciones:
  - El nombre está vacío.
  - El nombre ya existe (duplicado case-insensitive excluyendo la cuenta actual).
- Texto de ayuda dinámico en rojo según lo que falte (solo se muestra el primer requisito incumplido, en orden de prioridad):
  1. "Introduzca un nombre para la cuenta" (si nombre vacío)
  2. "Ya existe una cuenta con este nombre" (si nombre duplicado)
- Al pulsar:
  1. Se actualiza la cuenta en la base de datos con los valores del formulario (nombre, icono, color, descripción).
  2. Se navega de vuelta a `AccountsScreen`.

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles deben usar `t()`.
- **Configuración**: usar `useConfig().activeColors`.
- **Texto**: usar `useFontSize()`.
- **Navegación**: se añade al `HomeStack` en `AppNavigator.tsx`.
- **Persistencia**: `accountRepository.update()` y `accountRepository.delete()` (SQLite / localStorage).
- **Borrado en cascada**: al eliminar una cuenta, se eliminan primero todas sus transacciones (`transactionRepository.deleteByAccountId`) y luego la cuenta itself. Refrescar la lista de cuentas tras el borrado.
- **Iconos**: `@expo/vector-icons` (Ionicons).
- **DB**: se añade columna `description TEXT` a la tabla `accounts` mediante migración.
- **Validación de duplicados**: usar función `existsByName(name: string, excludeId?: number)` de `accountRepo` y `webAccountRepo` (creada en 013). El parámetro `excludeId` excluye la cuenta actual de la comprobación.

---

## Criterios de aceptación

- [ ] El header muestra flecha de retroceso y título "Modificar cuenta" en el idioma activo.
- [ ] Se muestra "Nombre de la cuenta" con input editable, contador 0/30.
- [ ] Si el nombre está vacío, se muestra error en rojo y "Guardar" deshabilitado.
- [ ] La validación de duplicados excluye la cuenta actual (mantener el mismo nombre no da error).
- [ ] Si hay duplicado, se muestra "Ya existe una cuenta con este nombre" en rojo y "Guardar" deshabilitado.
- [ ] Se muestran ~20 iconos en grid 4 columnas con el icono actual preseleccionado.
- [ ] Al seleccionar un icono, el color de fondo del icono cambia al color seleccionado.
- [ ] Se muestran 6 colores predefinidos + círculo personalizado (si el color actual no es predefinido) + "+" en la 8.ª posición.
- [ ] Si el color actual coincide con uno de los 6 predefinidos, ese círculo aparece seleccionado.
- [ ] El "+" abre `ColorPickerModal` (reanimated-color-picker).
- [ ] Se muestra "Nota" con input multilínea, máximo 200 caracteres, contador 0/200.
- [ ] El botón "Guardar" está deshabilitado si el nombre está vacío o es duplicado.
- [ ] Al pulsar "Guardar", se actualiza la cuenta y se navega de vuelta.
- [ ] El botón "Eliminar" en rojo abre un modal de confirmación con "Cancelar" y "Eliminar".
- [ ] Al pulsar "Eliminar" en el modal, se borran las transacciones de la cuenta, se elimina la cuenta, se refresca la lista y se navega de vuelta.
- [ ] Todos los textos cambian al cambiar el idioma.
- [ ] La pantalla respeta el tema activo y el tamaño de texto.
