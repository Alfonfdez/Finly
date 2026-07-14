# 008 — Página de categorías

- **Objetivo**
Pantalla accesible desde el Drawer (menú hamburguesa) que muestre todas las categorías existentes organizadas por tipo (gasto/ingreso) y permita navegar a la creación de nuevas categorías o a la modificación de categorías existentes. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde el ítem "Categorías" del Drawer Navigator (menú hamburguesa), actualmente placeholder en "Coming soon".
- El header tiene un botón de menú hamburguesa a la izquierda para abrir/cerrar el Drawer.
- El título del header es "Categorías" (multilingual).

### 2. Tabs de tipo

- Dos tabs debajo del header: "Gastos" / "Ingresos" (multilingual).
- Se reutiliza el componente `TypeTabs` existente.
- "Gastos" seleccionado por defecto.
- Al cambiar de tab, se muestran las categorías del tipo seleccionado.

### 3. Grid de categorías

- Debajo de los tabs, se muestran las categorías del tipo activo en un grid de 4 columnas × N filas (scroll vertical si no caben).
- Cada categoría se muestra como: icono con fondo del color de la categoría + nombre debajo.
- El grid es scrollable verticalmente si hay muchas categorías.
- Al pulsar sobre una categoría, se navega a la pantalla "Modificar categoría" (009) con la categoría seleccionada como parámetro (`categoryId`).

### 4. Botón "Crear"

- En la última posición del grid, se muestra un botón "+" con texto "Crear" (multilingual).
- Al pulsar el botón "Crear", se navega a la pantalla "Crear categoría" existente (006), pasando el tipo activo como parámetro.

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles (títulos, tabs, botones) deben usar `t()` del sistema i18n existente. No se permite ningún string hardcodeado.
- **Configuración**: la pantalla debe usar `useConfig().activeColors` para colores (no hardcodeados).
- **Texto**: la pantalla debe usar `useFontSize()` para escalado de texto.
- **Navegación**: la pantalla se añade al `HomeStack` en `AppNavigator.tsx` y el DrawerItem "Categorías" se conecta para navegar a ella.
- **Persistencia**: las categorías se cargan desde el repositorio existente (`categoryRepository`), filtradas por tipo y usuario activo.

---

## Criterios de aceptación

- [ ] El Drawer muestra "Categorías" y al pulsarlo navega a la pantalla de categorías.
- [ ] El header muestra botón de menú hamburguesa y título "Categorías" en el idioma activo.
- [ ] Se muestran dos tabs "Gastos"/"Ingresos" con "Gastos" seleccionado por defecto.
- [ ] Al cambiar de tab, se muestran las categorías del tipo correspondiente en un grid 4×N.
- [ ] Cada categoría muestra icono con fondo de color + nombre debajo.
- [ ] El grid es scrollable verticalmente si hay muchas categorías.
- [ ] El botón "Crear" (icono "+" + texto) está en la última posición del grid.
- [ ] Al pulsar "Crear", se navega a "Crear categoría" (006) con el tipo activo.
- [ ] Al pulsar una categoría, se navega a "Modificar categoría" (009) con la categoría seleccionada.
- [ ] Todos los textos cambian al cambiar el idioma en configuración.
- [ ] La pantalla respeta el tema activo (oscuro/claro).
- [ ] La pantalla respeta el tamaño de texto configurado.
