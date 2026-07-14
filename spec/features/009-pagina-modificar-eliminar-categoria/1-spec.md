# 009 — Página de modificar/eliminar categoría

- **Objetivo**
Pantalla accesible desde la pantalla de categorías (008) que permita al usuario modificar una categoría existente (nombre, icono, color), así como eliminarla con reasignación de transacciones a otra categoría del mismo tipo. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde el grid de `CategoriesScreen` (008) al pulsar una categoría.
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a `CategoriesScreen`.
- El título del header es "Modificar categoría" (multilingual).

### 2. Icono y nombre de la categoría

- Fila horizontal: a la izquierda, el icono de la categoría con su color de fondo actual. A la derecha, un input de texto con el nombre actual de la categoría.
- El nombre es editable. Máximo 30 caracteres con contador "0/30".
- **Validación de duplicados**: al modificar el nombre, se verifica que no exista ya otra categoría con el mismo nombre (case-insensitive), **excluyendo la categoría actual**. Es decir, mantener el mismo nombre no debe marcar error; solo si el nuevo nombre coincide con otra categoría distinta.
  - "Food", "food" y "FOOD" se consideran duplicados.
  - Si hay duplicado, se muestra un texto de error en rojo debajo del input y el botón "Guardar" permanece deshabilitado.
  - La verificación se ejecuta con un debounce de 300ms.
- Si el nombre está vacío, el botón "Guardar" está deshabilitado.

### 3. Tipo

- Título: "Tipo" (multilingual).
- Muestra el tipo de la categoría: "Gastos" si es `expense`, "Ingresos" si es `income`.
- El tipo no es editable (solo informativo).

### 4. Símbolos (iconos)

- Título: "Símbolos" (multilingual).
- Grid de 4 columnas × filas dinámicas (ScrollView vertical si no caben todos).
- Mismos ~40 iconos Ionicons predefinidos que en la pantalla de crear categoría (006), con fondo gris.
- El icono actual de la categoría debe aparecer preseleccionado al abrir la pantalla.
- Al pulsar un icono, se resalta con un borde de color primario y el fondo cambia ligeramente.
- Solo un icono puede estar seleccionado a la vez.
- La selección de icono **no es obligatoria** para guardar; si el usuario solo quiere cambiar el nombre, puede dejar el icono actual.
- Al seleccionar un icono, el color de fondo del icono cambia al color seleccionado en la sección de color para mostrar al usuario cómo queda el icono.

### 5. Color

- Título: "Color" (multilingual).
- Grid de 1 fila × 8 columnas.
- Las 6 primeras posiciones son colores predefinidos con forma circular.
- La 7.ª posición muestra el color personalizado elegido del picker (si el color actual de la categoría no está entre los 6 predefinidos) **o** el color actual de la categoría si es un color personalizado.
- La 8.ª posición es un "+" con color gris que abre el modal de selector de colores dinámico (`ColorPickerModal` existente).
- El color actual de la categoría debe aparecer preseleccionado al abrir la pantalla. Si el color coincide con uno de los 6 predefinidos, ese círculo se marca como seleccionado.
- Al pulsar un color, se resalta con un anillo/borde más oscuro y un checkmark superpuesto.
- Solo un color puede estar seleccionado a la vez.
- La selección de color **no es obligatoria** para guardar.

#### Modal de colores (reanimated-color-picker)

- Mismo componente `ColorPickerModal` existente (creado en 006).
- Se abre al pulsar "+".
- Panel1 + HueSlider + OpacitySlider + Preview + botones OK/Cancel.
- Al pulsar OK, el color queda seleccionado y el círculo personalizado se actualiza.

### 6. Botón "Eliminar"

- Botón "Eliminar" (multilingual) con estilo rojo (`c.red`), ubicado antes del botón "Guardar".
- Al pulsarlo, se abre un modal de confirmación:

**Modal de confirmación 1 — "¿Eliminar categoría?"**
- Título: "Eliminar la categoría "{categoryName}"" (multilingual, interpola el nombre de la categoría).
- Mensaje: "Todas las transacciones vinculadas a esta categoría se moverán a una categoría que usted elija" (multilingual).
- Botones: "Cancelar" (multilingual) y "Borrar" (multilingual, color rojo).
- Al pulsar "Cancelar", se cierra el modal.
- Al pulsar "Borrar", se abre un segundo modal.

**Modal de confirmación 2 — "Seleccionar categoría de destino"**
- Título: "Seleccione la categoría" (multilingual).
- Lista de categorías del **mismo tipo** que la categoría a eliminar (excluyendo la categoría actual), con:
  - Radio button (selección única).
  - Icono de la categoría.
  - Nombre de la categoría.
- Solo una categoría puede seleccionarse a la vez.
- Botones: "Cancelar" (multilingual) y "Seleccionar" (multilingual).
- Al pulsar "Cancelar", se cierra el modal y se vuelve a la pantalla de modificar.
- Al pulsar "Seleccionar":
  1. Se actualizan todas las transacciones con `category_id = {categoríaEliminada}` a `category_id = {categoríaSeleccionada}`.
  2. Se elimina la categoría de la tabla `categories`.
  3. Se navega de vuelta a `CategoriesScreen` (008).

### 7. Botón "Guardar"

- Botón "Guardar" (multilingual) en la parte inferior.
- El botón está deshabilitado (gris) si se cumple ALGUNA de estas condiciones:
  - El nombre está vacío.
  - El nombre ya existe (duplicado case-insensitive excluyendo la actual).
- La selección de icono y color **no es obligatoria** — si el usuario no los modifica, se conservan los valores actuales.
- Al pulsar "Guardar":
  1. Se actualiza la categoría en la base de datos con los nuevos valores (nombre, icono, color).
  2. Se navega de vuelta a `CategoriesScreen`.

### 8. Comportamiento al guardar

- Se actualiza la fila en la tabla `categories` con los valores del formulario.
- Solo se actualizan los campos que el usuario ha modificado: nombre (si cambió), icono (si cambió), color (si cambió).
- Tras la actualización, se navega a `CategoriesScreen` y se refrescan las categorías.

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles (títulos, placeholders, botones, errores, modales) deben usar `t()` del sistema i18n existente.
- **Configuración**: la pantalla debe usar `useConfig().activeColors` para colores (no hardcodeados).
- **Texto**: la pantalla debe usar `useFontSize()` para escalado de texto.
- **Navegación**: la pantalla se añade al `HomeStack` en `AppNavigator.tsx`.
- **Persistencia**: la categoría se actualiza/elimina en el repositorio `categoryRepository` (SQLite nativo o localStorage web).
- **Reasignación**: al eliminar, las transacciones se reasignan mediante `transactionRepository` y luego se elimina la categoría.
- **Iconos**: usar `@expo/vector-icons` (Ionicons) como en el resto de la app.

---

## Criterios de aceptación

- [ ] El header muestra flecha de retroceso y título "Modificar categoría" en el idioma activo.
- [ ] Se muestra el icono actual de la categoría con su color de fondo + input con el nombre actual.
- [ ] El input de nombre tiene un máximo de 30 caracteres con contador "0/30".
- [ ] La validación de duplicados excluye la categoría actual (mantener el mismo nombre no da error).
- [ ] Si hay duplicado, se muestra "Ya existe una categoría con este nombre" en rojo.
- [ ] Si el nombre está vacío, el botón "Guardar" está deshabilitado.
- [ ] Se muestra el tipo de la categoría (solo informativo, no editable).
- [ ] Se muestran ~40 iconos en un grid de 4 columnas con el icono actual preseleccionado.
- [ ] Al seleccionar un icono, el color de fondo del icono cambia al color seleccionado.
- [ ] Se muestran los colores con el color actual preseleccionado.
- [ ] El 7.º círculo de color muestra el color personalizado si el actual no está entre los 6 predefinidos.
- [ ] El "+" abre el modal `ColorPickerModal` existente.
- [ ] El botón "Guardar" está deshabilitado si el nombre está vacío o es duplicado.
- [ ] El botón "Eliminar" en rojo abre un modal de confirmación con "Cancelar" y "Borrar".
- [ ] Al pulsar "Borrar", se abre un segundo modal con lista de categorías del mismo tipo (radio + icono + nombre).
- [ ] Al pulsar "Seleccionar", se reasignan las transacciones y se elimina la categoría.
- [ ] Al pulsar "Guardar", se actualiza la categoría y se navega de vuelta a CategoriesScreen.
- [ ] Todos los textos cambian al cambiar el idioma en configuración.
- [ ] La pantalla respeta el tema activo (oscuro/claro).
- [ ] La pantalla respeta el tamaño de texto configurado.
