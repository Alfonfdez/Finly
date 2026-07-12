# 004 — Página de añadir transacción

- **Objetivo**
Pantalla accesible desde el botón "+" del Home que permita al usuario registrar un nuevo gasto o ingreso. La transacción se crea con tipo (gasto/ingreso), cantidad, cuenta, categoría, día, etiquetas, comentario y foto opcional. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- El botón "+" (FAB) del HomeScreen navega a `AddTransactionScreen`.
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver al Home.
- El título del header es "Añadir transacción" (multilingual).

### 2. Selector de tipo (tabs)

- Dos tabs: "Gastos" / "Ingresos" (multilingual).
- El tab seleccionado por defecto coincide con el último tipo usado en la pantalla principal (HomeScreen).
- Al cambiar de tab, se actualiza el tipo de transacción a crear.

### 3. Campo de cantidad

- Input numérico con teclado de números.
- Validación: máximo 2 decimales.
- Si el usuario introduce más de 2 decimales:
  - El borde del input se muestra en rojo.
  - Se muestra el texto de error: "La cantidad que se ha introducido no es válida" (multilingual).
- En el lado derecho del input, un icono de calculadora que abre una pantalla "Calculadora" (TODO: implementación futura).

### 4. Selección de cuenta

- Título: "Cuenta" (multilingual).
- Debajo se muestra el nombre de la cuenta seleccionada.
- La cuenta por defecto es la cuenta seleccionada en la pantalla principal (HomeScreen).
- Al pulsar sobre el nombre de la cuenta, se abre un modal (`AccountModal`) para seleccionar otra cuenta.

### 5. Selección de categoría

- Título: "Categorías" (multilingual).
- Grid de 4 columnas × 2 filas (8 posiciones):
  - Las 7 primeras posiciones muestran las categorías más usadas (icono + nombre debajo).
  - La octava posición muestra un icono "+" con el texto "Más" (multilingual).
- Al pulsar "Más", se abre una nueva pantalla "Añadir categoría" (TODO: implementación futura).

### 6. Selección de día

- Título: "Día" (multilingual).
- Grid de 3 columnas × 1 fila:

| Pos. | Contenido | Texto debajo | Selección |
|------|-----------|--------------|-----------|
| 1 | Fecha de hoy (dd MM) | "Hoy" | Seleccionado si el día activo es hoy |
| 2 | Fecha de ayer (dd MM) | "Ayer" | Seleccionado si el día activo es ayer |
| 3 | Fecha dinámica o "Anteayer" | "Anteayer" / "Seleccionado" | Ver regla abajo |

**Regla de la tercera posición:**
- Si el día activo (seleccionado desde el Home o desde el botón calendario) es **hoy** o **ayer**: la tercera posición muestra "Anteayer" (fecha de hace 2 días) y **no** está seleccionada.
- Si el día activo es **otro día** (ni hoy ni ayer): la tercera posición muestra la fecha activa y el texto "Seleccionado" (multilingual), y **sí** está seleccionada.

- A la derecha del grid, un icono de calendario que abre un modal similar al `DayPicker` del calendario para seleccionar una fecha.
- El día seleccionado por defecto coincide con el día seleccionado en la pantalla principal.

### 7. Etiquetas

- Título: "Etiquetas" (multilingual).
- A la derecha del título, un botón de búsqueda que muestra/oculta una línea de búsqueda debajo.
- **Línea de búsqueda**: input text con placeholder "Buscar y crear etiquetas" (multilingual) y un botón "x" a la derecha para cerrar sin crear ni seleccionar.
- Debajo de la búsqueda, los botones de etiquetas ya existentes para seleccionar.
- A la derecha, un botón "+ Añadir etiqueta" (multilingual) que abre un modal:

**Modal "Añadir etiqueta":**
- Título: "Añadir etiqueta" (multilingual).
- Input text con placeholder "Nombre de la etiqueta" (multilingual).
- Debajo del input: contador dinámico "0/20" que se actualiza al escribir (máximo 20 caracteres).
- Botones: "Cancelar" / "Añadir" (multilingual).

### 8. Comentario

- Título: "Comentario" (multilingual).
- Input text multiline con placeholder "Comentario" (multilingual).
- Debajo: contador dinámico "0/4096" que se actualiza al escribir (máximo 4096 caracteres).

### 9. Foto

- Título: "Foto" (multilingual).
- Icono "+" grande en un cuadrado que, al pulsarlo, abre un modal:

**Modal "Añadir foto":**
- Título: "Añadir foto" (multilingual).
- Opción 1: "Sacar foto" (multilingual) — abre la cámara (requiere permisos).
- Opción 2: "Añadir desde galería" (multilingual) — abre la galería (requiere permisos).
- TODO: implementación futura de permisos y captura de imagen. Por ahora solo se muestra el modal con las opciones.

### 10. Botón de envío

- Botón "Añadir" (multilingual) en la parte inferior.
- Al pulsarlo, crea la transacción con todos los datos introducidos y vuelve al Home.

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles (títulos, placeholders, errores, botones, nombres de días) deben usar `t()` del sistema i18n existente. No se permite ningún string hardcodeado.
- **Persistencia**: la transacción se guarda en la tabla `transacciones` de SQLite (nativo) o localStorage (web).
- **Configuración**: la divisa, separador decimal y idioma se leen del `ConfigContext` existente.
- **Tema**: la pantalla debe usar `useConfig().coloresActivos` para colores (no hardcodeados).
- **Texto**: la pantalla debe usar `useFontSize()` para escalado de texto.

---

## Criterios de aceptación

- [ ] El botón "+" del Home navega a la pantalla de añadir transacción.
- [ ] El header muestra flecha de retroceso y título "Añadir transacción" en el idioma activo.
- [ ] Los tabs "Gastos"/"Ingresos" muestran el tipo heredado del Home.
- [ ] El input de cantidad valida máximo 2 decimales y muestra error en rojo si no es válido.
- [ ] El icono de calculadora está visible pero no funcional (TODO).
- [ ] La cuenta mostrada coincide con la seleccionada en el Home.
- [ ] El modal de cuentas permite cambiar la cuenta seleccionada.
- [ ] Se muestran 7 categorías más usadas en un grid 4×2 + botón "Más".
- [ ] El botón "Más" está visible pero no funcional (TODO).
- [ ] Los 3 días muestran las fechas correctas según la regla descrita.
- [ ] El botón de calendario abre el modal de selección de día.
- [ ] La sección de etiquetas permite buscar, crear y seleccionar etiquetas.
- [ ] El modal de "Añadir etiqueta" valida 20 caracteres máximo.
- [ ] El campo de comentario permite hasta 4096 caracteres con contador.
- [ ] El botón de foto abre el modal con las dos opciones (TODO).
- [ ] El botón "Añadir" crea la transacción y vuelve al Home.
- [ ] Todos los textos cambian al cambiar el idioma en configuración.
- [ ] La pantalla respeta el tema activo (oscuro/claro).
- [ ] La pantalla respeta el tamaño de texto configurado.
