# 005 — Página de añadir categoría

- **Objetivo**
Pantalla accesible desde el botón "Más" de la sección de categorías en `AddTransactionScreen` que permita al usuario ver las categorías del tipo activo (gasto o ingreso) y seleccionar una para añadirla a la transacción. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde el botón "Más" en la sección de categorías de `AddTransactionScreen`.
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a `AddTransactionScreen`.
- El título del header es "Añadir categoría" (multilingual).

### 2. Tipo de categorías a mostrar

- La pantalla recibe el tipo activo de la pantalla anterior (`AddTransactionScreen`): "gasto" o "ingreso".
- Solo se muestran las categorías que coincidan con el tipo activo.
- Si el usuario cambia de pestaña en `AddTransactionScreen` y vuelve a abrir "Añadir categoría", se muestran las categorías del nuevo tipo.

### 3. Búsqueda

- A la derecha del título, un botón de búsqueda (icono de lupa).
- Al pulsar el botón de búsqueda, debajo del título aparece un input de texto.
- El input tiene placeholder "Buscar categoría" (multilingual).
- A la derecha del input, un botón "x" para cerrar la búsqueda sin seleccionar categoría.

**Lógica de búsqueda:**
- La búsqueda es por caracteres contenidos en el nombre de la categoría.
- No distingue entre mayúsculas y minúsculas.
- Ejemplo: escribir "d" muestra todas las categorías que contengan la letra "d" en su nombre.
- Ejemplo: escribir "du" muestra solo las categorías que contengan ambas letras "d" y "u" (en cualquier orden).
- Si no hay coincidencias, se muestra un icono de búsqueda no encontrada y el texto "No se ha encontrado nada" (multilingual).

### 4. Grid de categorías

- Debajo de la barra de título (y del buscador si está abierto), se muestran las categorías del tipo activo en un grid de 4 columnas × N filas.
- Cada categoría se muestra como: icono con fondo de color de la categoría + nombre debajo.
- El grid es scrollable verticalmente si hay muchas categorías.
- Al pulsar sobre una categoría, se navega de vuelta a `AddTransactionScreen` con la categoría seleccionada como primera categoría en el grid de categorías.

### 5. Botón "Crear"

- En la última posición del grid, se muestra un botón "Crear" (multilingual) con icono "+".
- Al pulsar el botón "Crear", se navega a una nueva pantalla "Crear categoría" (TODO: implementación futura).

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles (títulos, placeholders, botones, mensajes de error) deben usar `t()` del sistema i18n existente. No se permite ningún string hardcodeado.
- **Configuración**: la pantalla debe usar `useConfig().coloresActivos` para colores (no hardcodeados).
- **Texto**: la pantalla debe usar `useFontSize()` para escalado de texto.
- **Navegación**: la pantalla se añade al `HomeStack` en `AppNavigator.tsx`.
- **Persistencia**: las categorías se cargan desde el repositorio existente (SQLite nativo o localStorage web).

---

## Criterios de aceptación

- [x] El botón "Más" del `AddTransactionScreen` navega a la pantalla de añadir categoría.
- [x] El header muestra flecha de retroceso y título "Añadir categoría" en el idioma activo.
- [x] Se muestran solo las categorías del tipo activo (gasto o ingreso).
- [x] El botón de búsqueda abre/cierra el input de búsqueda debajo del título.
- [x] La búsqueda filtra categorías por caracteres contenidos en el nombre (case-insensitive).
- [x] Si no hay coincidencias, se muestra icono de búsqueda no encontrada + "No se ha encontrado nada".
- [x] El botón "x" del input cierra la búsqueda sin seleccionar categoría.
- [x] Se muestran las categorías en un grid 4×N con icono y nombre.
- [x] El botón "Crear" está en la última posición del grid.
- [x] Al pulsar una categoría, se navega de vuelta a `AddTransactionScreen` con esa categoría seleccionada.
- [x] Todos los textos cambian al cambiar el idioma en configuración.
- [x] La pantalla respeta el tema activo (oscuro/claro).
- [x] La pantalla respeta el tamaño de texto configurado.
