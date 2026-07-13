# 006 — Página de crear categoría

- **Objetivo**
Pantalla accesible desde el botón "Crear" en la última posición del grid de `AddCategoryScreen` que permita al usuario crear una nueva categoría personalizada con nombre, tipo, icono y color. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde el botón "Crear" en el grid de `AddCategoryScreen`.
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a `AddCategoryScreen`.
- El título del header es "Crear categoría" (multilingual).

### 2. Nombre de la categoría

- Lo primero debajo del header es un input de texto con placeholder "Nombre de la categoría" (multilingual).
- El nombre es obligatorio: si está vacío, el botón "Añadir" está deshabilitado.
- Si el nombre está vacío y el usuario intenta pulsar "Añadir" (o mientras el input está vacío), se muestra un texto de ayuda en rojo: "Introduzca un nombre para la categoría" (multilingual).
- **Validación de duplicados**: al escribir, se verifica que no exista ya una categoría con el mismo nombre (case-insensitive) en la base de datos, independientemente del tipo (gasto/ingreso).
  - "Food", "food" y "FOOD" se consideran duplicados, tanto si son gastos como ingresos.
  - Si hay duplicado, se muestra un texto de error en rojo debajo del input: "Ya existe una categoría con este nombre" (multilingual) y el botón "Añadir" permanece deshabilitado.
  - La verificación se ejecuta con un debounce de 300ms para no consultar en cada pulsación de tecla.
- Máximo 30 caracteres para el nombre con contador dinámico "0/30".

### 3. Tipo (gasto / ingreso)

- Dos botones radio: "Gastos" y "Ingresos" (multilingual).
- "Gastos" seleccionado por defecto.
- El icono del botón radio seleccionado debe mostrar un círculo relleno con el color primario; el no seleccionado un círculo vacío.

### 4. Símbolos (iconos)

- Título: "Símbolos" (multilingual).
- Grid de 4 columnas × filas dinámicas (ScrollView vertical si no caben todos).
- Se muestran ~40 iconos Ionicons predefinidos con fondo gris plano (`#334155` en tema oscuro).
- Al pulsar un icono, se resalta con un borde de color primario y el fondo cambia ligeramente.
- Solo un icono puede estar seleccionado a la vez (radios, no checkboxes).
- Iconos predefinidos (40):

| # | Icono (Ionicons) | # | Icono (Ionicons) |
|---|---|---|---|
| 1 | `wallet-outline` | 21 | `cash-outline` |
| 2 | `cart-outline` | 22 | `card-outline` |
| 3 | `bus-outline` | 23 | `pricetag-outline` |
| 4 | `home-outline` | 24 | `storefront-outline` |
| 5 | `musical-notes-outline` | 25 | `coffee-outline` |
| 6 | `game-controller-outline` | 26 | `car-outline` |
| 7 | `bag-outline` | 27 | `bicycle-outline` |
| 8 | `film-outline` | 28 | `train-outline` |
| 9 | `restaurant-outline` | 29 | `key-outline` |
| 10 | `heart-outline` | 30 | `book-outline` |
| 11 | `fitness-outline` | 31 | `barbell-outline` |
| 12 | `school-outline` | 32 | `globe-outline` |
| 13 | `airplane-outline` | 33 | `compass-outline` |
| 14 | `shirt-outline` | 34 | `map-outline` |
| 15 | `gift-outline` | 35 | `star-outline` |
| 16 | `briefcase-outline` | 36 | `notifications-outline` |
| 17 | `code-slash-outline` | 37 | `football-outline` |
| 18 | `trending-up-outline` | 38 | `wine-outline` |
| 19 | `dice-outline` | 39 | `ellipsis-horizontal-outline` |
| 20 | `people-outline` | 40 | `phone-portrait-outline` |

### 5. Color

- Título: "Color" (multilingual).
- Grid de 1 fila × 8 columnas.
- Las 7 primeras posiciones son colores predefinidos con forma circular.
- La 8.ª posición es un "+" con color gris que abre un **modal** con un selector de colores expandido.
- Al pulsar un color, se resalta con un anillo/borde más oscuro y un checkmark superpuesto.
- Solo un color puede estar seleccionado a la vez.
- Colores predefinidos:

| # | Color | Hex |
|---|---|---|
| 1 | Cian (primario) | `#22D3EE` |
| 2 | Rojo | `#F87171` |
| 3 | Verde | `#34D399` |
| 4 | Amarillo | `#FBBF24` |
| 5 | Rosa | `#F472B6` |
| 6 | Azul | `#60A5FA` |
| 7 | Púrpura (acento) | `#A78BFA` |
| 8 | + (abre modal) | gris `#94A3B8` |

#### Modal de colores

- Se abre al pulsar "+" en la grid de colores.
- Muestra una paleta ampliada de ~20 colores en un grid de 4 columnas × 5 filas.
- Colores del modal:

| # | Hex | # | Hex |
|---|---|---|---|
| 1 | `#22D3EE` | 11 | `#FB923C` |
| 2 | `#F87171` | 12 | `#E879F9` |
| 3 | `#34D399` | 13 | `#C084FC` |
| 4 | `#FBBF24` | 14 | `#38BDF8` |
| 5 | `#F472B6` | 15 | `#4ADE80` |
| 6 | `#60A5FA` | 16 | `#FB7185` |
| 7 | `#A78BFA` | 17 | `#FCA5A5` |
| 8 | `#94A3B8` | 18 | `#86EFAC` |
| 9 | `#FCD34D` | 19 | `#FDE68A` |
| 10 | `#6EE7B7` | 20 | `#A5B4FC` |

- Al seleccionar un color en el modal, se cierra automáticamente y el color queda seleccionado en la grid principal.
- Botón "Cancelar" para cerrar sin seleccionar.

### 6. Botón "Añadir"

- Botón "Añadir" (multilingual) en la parte inferior.
- El botón está deshabilitado (gris) si se cumple ALGUNA de estas condiciones:
  - El nombre está vacío.
  - El nombre ya existe (duplicado case-insensitive en el mismo tipo).
  - No se ha seleccionado un icono.
  - No se ha seleccionado un color.
- Texto de ayuda dinámico en rojo según lo que falte (solo se muestra el primer requisito incumplido, en orden de prioridad):
  1. "Introduzca un nombre para la categoría" (si nombre vacío)
  2. "Ya existe una categoría con este nombre" (si nombre duplicado)
  3. "Selecciona un icono" (si falta icono)
  4. "Selecciona un color" (si falta color)
  5. "Selecciona un icono y un color" (si faltan ambos)
- Al pulsar "Añadir", se crea la categoría en la base de datos (SQLite nativo / localStorage web) y se navega de vuelta a `AddCategoryScreen` con la categoría recién creada seleccionada.

### 7. Comportamiento al crear

- La categoría se inserta en la tabla `categories` con:
  - `user_id`: 1 (usuario por defecto)
  - `name`: el nombre introducido por el usuario.
  - `icon`: el icono seleccionado.
  - `color`: el color seleccionado.
  - `type`: el tipo seleccionado (gasto/ingreso).
- Tras la inserción, se navega a `AddCategoryScreen` con `{ type, categoryId }` para que la categoría nueva aparezca seleccionada (usando el mismo patrón `setPendingCategory` de `AddTransactionScreen`).

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles (títulos, placeholders, botones, errores) deben usar `t()` del sistema i18n existente.
- **Configuración**: la pantalla debe usar `useConfig().activeColors` para colores (no hardcodeados).
- **Texto**: la pantalla debe usar `useFontSize()` para escalado de texto.
- **Navegación**: la pantalla se añade al `HomeStack` en `AppNavigator.tsx`.
- **Persistencia**: la categoría se guarda en el repositorio `categoryRepository` (SQLite nativo o localStorage web).
- **Iconos**: usar `@expo/vector-icons` (Ionicons) como en el resto de la app.
- **Validación de duplicados**: se debe añadir una función `existsByName(name: string, type: TransactionType)` al `categoryRepo` y `webCategoryRepo` que devuelva `true` si ya existe una categoría con ese nombre (case-insensitive) para el mismo tipo y usuario.

---

## Criterios de aceptación

- [ ] El botón "Crear" de `AddCategoryScreen` navega a `CreateCategoryScreen`.
- [ ] El header muestra flecha de retroceso y título "Crear categoría" en el idioma activo.
- [ ] El input de nombre aparece lo primero debajo del header, con placeholder "Nombre de la categoría".
- [ ] El input tiene un máximo de 30 caracteres con contador "0/30".
- [ ] El botón "Añadir" está deshabilitado si el nombre está vacío.
- [ ] Si el nombre está vacío, se muestra "Introduzca un nombre para la categoría" en rojo.
- [ ] La validación de duplicados verifica case-insensitive contra categorías existentes (independientemente del tipo).
- [ ] Si hay duplicado, se muestra "Ya existe una categoría con este nombre" en rojo y el botón se deshabilita.
- [ ] Al cambiar el tipo, se re-ejecuta la validación de duplicado de nombre.
- [ ] Los radios "Gastos"/"Ingresos" funcionan correctamente, "Gastos" seleccionado por defecto.
- [ ] Se muestran ~40 iconos en un grid de 4 columnas con scroll vertical.
- [ ] Al pulsar un icono, se selecciona y se resalta visualmente.
- [ ] Solo un icono puede estar seleccionado a la vez.
- [ ] Se muestran 7 colores en un grid 1×8 + "+" en la 8.ª posición.
- [ ] Al pulsar un color, se selecciona y se resalta con anillo + checkmark.
- [ ] El "+" abre un modal con ~20 colores expandidos en grid 4×5.
- [ ] Al seleccionar un color en el modal, se cierra y el color queda seleccionado.
- [ ] El botón "Añadir" está deshabilitado si falta nombre, icono o color (o nombre duplicado).
- [ ] El texto de ayuda en rojo aparece con el mensaje adecuado según lo que falte (solo el primer incumplimiento).
- [ ] Al pulsar "Añadir", se crea la categoría y se navega de vuelta con la categoría seleccionada.
- [ ] Todos los textos cambian al cambiar el idioma en configuración.
- [ ] La pantalla respeta el tema activo (oscuro/claro).
- [ ] La pantalla respeta el tamaño de texto configurado.
