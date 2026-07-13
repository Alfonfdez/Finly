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
- **Validación de duplicados**: al escribir, se verifica que no exista ya una categoría con el mismo nombre (case-insensitive).
  - "Food", "food" y "FOOD" se consideran duplicados.
  - La verificación se hace contra todas las categorías existentes del mismo tipo (gasto/ingreso) en la base de datos.
  - Si hay duplicado, se muestra un texto de error en rojo debajo del input: "Ya existe una categoría con este nombre" (multilingual) y el botón "Añadir" permanece deshabilitado.
  - La verificación se ejecuta con un debounce de 300ms para no consultar en cada pulsación de tecla.
- Máximo 30 caracteres para el nombre con contador dinámico "0/30".

### 3. Tipo (gasto / ingreso)

- Dos botones radio: "Gastos" y "Ingresos" (multilingual).
- "Gastos" seleccionado por defecto.
- Al cambiar el tipo, se re-ejecuta la validación de duplicado de nombre (ya que los duplicados se verifican dentro del mismo tipo).
- El icono del botón radio seleccionado debe mostrar un círculo relleno con el color primario; el no seleccionado un círculo vacío.

### 4. Símbolos (iconos)

- Título: "Símbolos" (multilingual).
- Grid de 4 columnas × 4 filas (16 posiciones).
- Las 15 primeras posiciones muestran iconos predefinidos (Ionicons) con un fondo gris plano (`#334155`).
- La 16.ª posición (última) muestra "..." con un color distintivo (acento `#A78BFA`) para indicar que al pulsarlo navega a una nueva pantalla "Catálogo de iconos" (TODO: implementación futura).
- Al pulsar un icono, se resalta con un borde de color primario y el fondo cambia ligeramente.
- Solo un icono puede estar seleccionado a la vez (radios, no checkboxes).
- Iconos predefinidos para el grid 4×4:

| # | Icono (Ionicons) | # | Icono (Ionicons) |
|---|---|---|---|
| 1 | `wallet-outline` | 9 | `restaurant-outline` |
| 2 | `cart-outline` | 10 | `heart-outline` |
| 3 | `bus-outline` | 11 | `fitness-outline` |
| 4 | `home-outline` | 12 | `school-outline` |
| 5 | `musical-notes-outline` | 13 | `airplane-outline` |
| 6 | `game-controller-outline` | 14 | `shirt-outline` |
| 7 | `bag-outline` | 15 | `gift-outline` |
| 8 | `film-outline` | 16 | `...` (navegar a catálogo) |

### 5. Color

- Título: "Color" (multilingual).
- Grid de 1 fila × 8 columnas.
- Las 7 primeras posiciones son colores predefinidos con forma circular.
- La 8.ª posición es un "+" con color gris que abre una nueva pantalla "Seleccionar color" con un selector de color (TODO: implementación futura).
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
| 8 | + (selector) | gris `#94A3B8` |

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
- [ ] La validación de duplicados verifica case-insensitive contra categorías del mismo tipo.
- [ ] Si hay duplicado, se muestra "Ya existe una categoría con este nombre" en rojo y el botón se deshabilita.
- [ ] Al cambiar el tipo, se re-ejecuta la validación de duplicado de nombre.
- [ ] Los radios "Gastos"/"Ingresos" funcionan correctamente, "Gastos" seleccionado por defecto.
- [ ] Se muestran 15 iconos en un grid 4×4 con fondo gris + "..." en la 16.ª posición.
- [ ] Al pulsar un icono, se selecciona y se resalta visualmente.
- [ ] Solo un icono puede estar seleccionado a la vez.
- [ ] El "..." navega a "Catálogo de iconos" (TODO, muestra placeholder o alert).
- [ ] Se muestran 7 colores en un grid 1×8 + "+" en la 8.ª posición.
- [ ] Al pulsar un color, se selecciona y se resalta con anillo + checkmark.
- [ ] El "+" navega a "Seleccionar color" (TODO, muestra placeholder o alert).
- [ ] El botón "Añadir" está deshabilitado si falta nombre, icono o color (o nombre duplicado).
- [ ] El texto de ayuda en rojo aparece con el mensaje adecuado según lo que falte (solo el primer incumplimiento).
- [ ] Al pulsar "Añadir", se crea la categoría y se navega de vuelta con la categoría seleccionada.
- [ ] Todos los textos cambian al cambiar el idioma en configuración.
- [ ] La pantalla respeta el tema activo (oscuro/claro).
- [ ] La pantalla respeta el tamaño de texto configurado.
