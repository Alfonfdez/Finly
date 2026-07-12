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
| 1 | Fecha de hoy (dd MMM) | "Hoy" | Seleccionado si el día activo es hoy |
| 2 | Fecha de ayer (dd MMM) | "Ayer" | Seleccionado si el día activo es ayer |
| 3 | Fecha dinámica o "Anteayer" | "Anteayer" / "Seleccionado" | Ver regla abajo |

**Formato de fechas:**
- Espacios 1 y 2: "dd MMM" (ej: "12 Jul", "11 Jul").
- Espacio 3: "dd MMM" si el año es el actual (ej: "10 Jul"), "dd MMM yyyy" si es otro año (ej: "10 Jul 2025").

**Lógica de selección según el estado de la pantalla principal:**

| Pestaña principal | Fecha seleccionada | Espacio 1 (Hoy) | Espacio 2 (Ayer) | Espacio 3 (Dinámico) |
|---|---|---|---|---|
| Día | Hoy | Seleccionado | - | "Anteayer", no seleccionado |
| Día | Ayer | - | Seleccionado | "Anteayer", no seleccionado |
| Día | Otro día | - | - | Esa fecha, **seleccionado** |
| Semana / Mes / Año | Cualquiera | Seleccionado | - | "Anteayer", no seleccionado |
| Período | Rango > 1 día | Seleccionado | - | "Anteayer", no seleccionado |
| Período | Rango = 1 día = hoy | Seleccionado | - | "Anteayer", no seleccionado |
| Período | Rango = 1 día = ayer | - | Seleccionado | "Anteayer", no seleccionado |
| Período | Rango = 1 día = otro | - | - | Esa fecha, **seleccionado** |

**Inicialización al abrir "Añadir transacción":**
- Si la pestaña activa es Período y el rango es de 1 día: el día heredado es `fechaPersonalizada.inicio`.
- En cualquier otro caso: el día heredado es `fechaSeleccionada` de la pantalla principal.

**Al interactuar con el selector de día:**
- El componente DaySelector es un componente controlado: recibe `diaSeleccionado` como prop y llama a `onSelect(fecha)` al pulsar.
- Al seleccionar un día, se actualiza el estado local y la lógica se recalcula inmediatamente.
- El botón de calendario abre un modal `CalendarModal` (reutilizar componente existente) para seleccionar una fecha libre.

- A la derecha del grid, un icono de calendario que abre un modal similar al `DayPicker` del calendario para seleccionar una fecha.

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

- [x] El botón "+" del Home navega a la pantalla de añadir transacción.
- [x] El header muestra flecha de retroceso y título "Añadir transacción" en el idioma activo.
- [x] Los tabs "Gastos"/"Ingresos" muestran el tipo heredado del Home.
- [x] El input de cantidad valida máximo 2 decimales y muestra error en rojo si no es válido.
- [x] El icono de calculadora está visible pero no funcional (TODO).
- [x] La cuenta mostrada coincide con la seleccionada en el Home.
- [x] El modal de cuentas permite cambiar la cuenta seleccionada.
- [x] Se muestran 7 categorías más usadas en un grid 4×2 + botón "Más".
- [x] El botón "Más" está visible pero no funcional (TODO).
- [x] Los 3 días muestran las fechas correctas según la regla descrita.
- [x] El botón de calendario abre el modal de selección de día.
- [x] La sección de etiquetas permite buscar, crear y seleccionar etiquetas.
- [x] El modal de "Añadir etiqueta" valida 20 caracteres máximo.
- [x] El campo de comentario permite hasta 4096 caracteres con contador.
- [x] El botón de foto abre el modal con las dos opciones (TODO).
- [ ] El botón "Añadir" crea la transacción y vuelve al Home.
- [x] Todos los textos cambian al cambiar el idioma en configuración.
- [x] La pantalla respeta el tema activo (oscuro/claro).
- [x] La pantalla respeta el tamaño de texto configurado.
