# 013 — Página de crear cuenta

- **Objetivo**
  Pantalla accesible desde el botón flotante "+" (FAB) en `AccountsScreen` (011) que permita al usuario crear una nueva cuenta con nombre, icono, color y nota opcional. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde el botón flotante "+" (FAB) en `AccountsScreen` (011).
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a `AccountsScreen`.
- El título del header es "Crear cuenta" (multilingual).

### 2. Nombre de la cuenta

- Título: "Nombre de la cuenta" (multilingual).
- Input de texto con placeholder "Nombre de la cuenta" (multilingual).
- Máximo 30 caracteres con contador "0/30".
- **Validación**: no se permite nombre vacío. Si está vacío, se muestra texto de error en rojo y el botón "Crear" permanece deshabilitado.
- **Validación de duplicados**: al escribir, se verifica que no exista ya una cuenta con el mismo nombre (case-insensitive).
  - "Cuenta", "cuenta" y "CUENTA" se consideran duplicados.
  - Si hay duplicado, se muestra un texto de error en rojo debajo del input: "Ya existe una cuenta con este nombre" (multilingual) y el botón "Crear" permanece deshabilitado.
  - La verificación se ejecuta con un debounce de 300ms para no consultar en cada pulsación de tecla.

### 3. Símbolos (iconos)

- Título: "Símbolos" (multilingual).
- Grid de 4 columnas × filas dinámicas (ScrollView vertical si no caben todos).
- Se muestran ~20 iconos Ionicons predefinidos para cuentas con fondo gris plano (`#334155` en tema oscuro).
- Al pulsar un icono, se resalta con un borde de color primario y el fondo cambia ligeramente.
- Solo un icono puede estar seleccionado a la vez (radios, no checkboxes).
- Iconos predefinidos (~20):

| # | Icono (Ionicons) | # | Icono (Ionicons) |
|---|---|---|---|
| 1 | `wallet-outline` | 11 | `trending-up-outline` |
| 2 | `cash-outline` | 12 | `trending-down-outline` |
| 3 | `card-outline` | 13 | `pie-chart-outline` |
| 4 | `business-outline` | 14 | `bar-chart-outline` |
| 5 | `home-outline` | 15 | `analytics-outline` |
| 6 | `shield-outline` | 16 | `stats-chart-outline` |
| 7 | `layers-outline` | 17 | `briefcase-outline` |
| 8 | `scan-outline` | 18 | `storefront-outline` |
| 9 | `swap-horizontal-outline` | 19 | `pricetag-outline` |
| 10 | `receipt-outline` | 20 | `ellipsis-horizontal-outline` |

- Al seleccionar un icono, el color de fondo del icono cambia al color seleccionado en la sección de color para mostrar al usuario cómo queda el icono.

### 4. Color

- Título: "Color" (multilingual).
- Grid de 1 fila × 8 columnas.
- Las 6 primeras posiciones son colores predefinidos con forma circular.
- La 7.ª posición es un "+" con color gris que abre un **modal** con un selector de colores dinámico.
- Al pulsar un color, se resalta con un anillo/borde más oscuro y un checkmark superpuesto.
- Solo un color puede estar seleccionado a la vez.
- Si se elige un color del picker, la 7.ª posición se actualiza con ese color personalizado.
- Colores predefinidos:

| # | Color | Hex |
|---|---|---|
| 1 | Cian (primario) | `#22D3EE` |
| 2 | Rojo | `#F87171` |
| 3 | Verde | `#34D399` |
| 4 | Amarillo | `#FBBF24` |
| 5 | Rosa | `#F472B6` |
| 6 | Azul | `#60A5FA` |
| 7 | + (abre picker) | gris `#94A3B8` |

#### Modal de colores (reanimated-color-picker)

- Se abre al pulsar "+" en la grid de colores.
- Usa la librería `reanimated-color-picker` con:
  - Panel1 (selector de saturación/brillo)
  - HueSlider (selector de tono)
  - OpacitySlider (selector de opacidad)
  - Preview (muestra el color seleccionado en formato hex)
- Botones OK/Cancel para confirmar o cancelar la selección.
- Al pulsar OK, el color queda seleccionado en la grid principal y el círculo personalizado se actualiza.

### 5. Nota (descripción)

- Título: "Nota" (multilingual).
- Input de texto multilínea para una descripción opcional de la cuenta.
- Máximo 200 caracteres con contador "0/200".
- Valor por defecto: vacío.

### 6. Botón "Crear"

- Botón "Crear" (multilingual) en la parte inferior.
- El botón está deshabilitado (gris) si se cumple ALGUNA de estas condiciones:
  - El nombre está vacío.
  - El nombre ya existe (duplicado case-insensitive).
  - No se ha seleccionado un icono.
  - No se ha seleccionado un color.
- Texto de ayuda dinámico en rojo según lo que falte (solo se muestra el primer requisito incumplido, en orden de prioridad):
  1. "Introduzca un nombre para la cuenta" (si nombre vacío)
  2. "Ya existe una cuenta con este nombre" (si nombre duplicado)
  3. "Selecciona un icono" (si falta icono)
  4. "Selecciona un color" (si falta color)
  5. "Selecciona un icono y un color" (si faltan ambos)
- Al pulsar "Crear", se crea la cuenta en la base de datos (SQLite nativo / localStorage web) y se navega de vuelta a `AccountsScreen` (011).

### 7. Comportamiento al crear

- La cuenta se inserta en la tabla `accounts` con:
  - `user_id`: 1 (usuario por defecto)
  - `name`: el nombre introducido por el usuario.
  - `icon`: el icono seleccionado.
  - `color`: el color seleccionado.
  - `initial_balance`: 0 (por defecto).
  - `description`: la nota introducida por el usuario (o vacío).
- Tras la inserción, se navega a `AccountsScreen` (011).

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles (títulos, placeholders, botones, errores) deben usar `t()` del sistema i18n existente.
- **Configuración**: la pantalla debe usar `useConfig().activeColors` para colores (no hardcodeados).
- **Texto**: la pantalla debe usar `useFontSize()` para escalado de texto.
- **Navegación**: la pantalla se añade al `HomeStack` en `AppNavigator.tsx`.
- **Persistencia**: la cuenta se guarda en el repositorio `accountRepository` (SQLite nativo o localStorage web).
- **Iconos**: usar `@expo/vector-icons` (Ionicons) como en el resto de la app.
- **Validación de duplicados**: se debe añadir una función `existsByName(name: string, excludeId?: number)` al `accountRepo` y `webAccountRepo` que devuelva `true` si ya existe una cuenta con ese nombre (case-insensitive) para el usuario. El parámetro `excludeId` se usa en 012 para excluir la cuenta actual de la comprobación.

---

## Criterios de aceptación

- [ ] El botón flotante "+" (FAB) de `AccountsScreen` (011) navega a `CreateAccountScreen`.
- [ ] El header muestra flecha de retroceso y título "Crear cuenta" en el idioma activo.
- [ ] El input de nombre aparece lo primero debajo del header, con placeholder "Nombre de la cuenta".
- [ ] El input tiene un máximo de 30 caracteres con contador "0/30".
- [ ] El botón "Crear" está deshabilitado si el nombre está vacío.
- [ ] Si el nombre está vacío, se muestra "Introduzca un nombre para la cuenta" en rojo.
- [ ] La validación de duplicados verifica case-insensitive contra cuentas existentes.
- [ ] Si hay duplicado, se muestra "Ya existe una cuenta con este nombre" en rojo y el botón se deshabilita.
- [ ] Se muestran ~20 iconos en un grid de 4 columnas con scroll vertical.
- [ ] Al pulsar un icono, se selecciona y se resalta visualmente.
- [ ] Solo un icono puede estar seleccionado a la vez.
- [ ] Al seleccionar un icono, el color de fondo del icono cambia al color seleccionado.
- [ ] Se muestran 6 colores en un grid 1×7 + "+" en la 7.ª posición.
- [ ] Al pulsar un color, se selecciona y se resalta con anillo + checkmark.
- [ ] El "+" abre un modal con selector de colores (reanimated-color-picker).
- [ ] Al seleccionar un color en el modal, se cierra y el color queda seleccionado.
- [ ] Se muestra "Nota" con input multilínea, máximo 200 caracteres, contador 0/200.
- [ ] El botón "Crear" está deshabilitado si falta nombre, icono o color (o nombre duplicado).
- [ ] El texto de ayuda en rojo aparece con el mensaje adecuado según lo que falte (solo el primer incumplimiento).
- [ ] Al pulsar "Crear", se crea la cuenta con `initial_balance: 0` y se navega de vuelta.
- [ ] Todos los textos cambian al cambiar el idioma en configuración.
- [ ] La pantalla respeta el tema activo (oscuro/claro).
- [ ] La pantalla respeta el tamaño de texto configurado.
