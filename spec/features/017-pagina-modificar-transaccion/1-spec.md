# 017 — Página de modificar transacción

- **Objetivo**
Pantalla `ModifyTransactionScreen` accesible desde el botón "Editar" de `TransactionDetailsScreen`. Permite modificar los datos de una transacción existente: tipo (gasto/ingreso), cantidad, cuenta, categoría, día, etiquetas, comentario y foto. Todos los textos son multilingües (es/en/ca). La pantalla se precarga con los datos actuales de la transacción.

---

## Requisitos funcionales

### 1. Acceso y navegación

- El botón "Editar" de `TransactionDetailsScreen` navega a `ModifyTransaction` pasando `transactionId` como parámetro.
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a `TransactionDetailsScreen`.
- El título del header es "Modificar transacción" — clave i18n `modify_title` (multilingual).

### 2. Selector de tipo (tabs)

- Dos tabs reutilizables: "Gastos" / "Ingresos" (multilingual) — componente `TypeTabs` existente.
- El tab seleccionado por defecto coincide con el tipo de la transacción que se está editando.
- Al cambiar de tab, se actualiza el tipo, se resetea la categoría seleccionada y se recarga el grid de categorías para ese tipo.
- El tipo se muestra como informativo (la transacción guarda el tipo original), pero **sí se permite cambiar** el tipo y se actualizará al guardar.

### 3. Campo de cantidad

- Input numérico con teclado de números.
- Muestra la **cantidad actual** de la transacción formateada al cargar la pantalla.
- Al enfocar el input, se limpia para permitir escribir directamente.
- El valor formateado con separadores de miles solo se muestra cuando hay un valor introducido.
- Validación: máximo 9 dígitos enteros y 2 decimales (máx 999.999.999,99).
- Misma lógica de `parseAmountInput()` y `formatAmountDisplay()` que en `AddTransactionScreen`.
- Si el usuario introduce formato inválido (ambos separadores a la vez), se ignora la entrada.
- A la derecha del input, se muestra el símbolo de la divisa seleccionada en configuración (€, $, £, ¥).
- A la derecha del símbolo de divisa, un icono de calculadora (`calculator-outline`) que abre `CalculatorModal` (reutilizar componente existente).

### 4. Selección de cuenta

- Título: "Cuenta" (multilingual) — clave i18n `add_account` (existente).
- Debajo se muestra el nombre de la cuenta de la transacción actual.
- Al pulsar sobre el nombre de la cuenta, se abre `AccountModal` (componente existente) para seleccionar otra cuenta.
- La lista de cuentas se carga desde `accountsWithBalance`.

### 5. Selección de categoría

- Título: "Categorías" (multilingual) — clave i18n `add_categories` (existente).
- Grid de 4 columnas × 2 filas (8 posiciones) — componente `CategoryGrid` existente.
- **La primera posición del grid muestra la categoría actual de la transacción** (icono + nombre), tenga la prioridad que tenga. El resto de posiciones se rellenan con las siguientes categorías más usadas o por orden alfabético, excluyendo la ya mostrada.
- La octava posición muestra siempre el botón "+" con texto "Más" (multilingual) — clave i18n `add_more` (existente).
- Al pulsar "Más":
  - Si el tipo activo tiene **más de 7 categorías**: navega a `AddCategoryScreen` para seleccionar entre las existentes.
  - Si el tipo activo tiene **7 o menos categorías**: navega directamente a `CreateCategoryScreen` para crear una nueva.
- Al pulsar una categoría se selecciona y se marca visualmente.

### 6. Selección de día

- Título: "Día" (multilingual) — clave i18n `add_day` (existente).
- Grid de 3 columnas × 1 fila — componente `DaySelector` existente.
- El día seleccionado por defecto es el **día de la transacción** que se está editando.

| Pos. | Contenido | Texto debajo |
|------|-----------|--------------|
| 1 | Fecha de hoy (dd MMM) | "Hoy" |
| 2 | Fecha de ayer (dd MMM) | "Ayer" |
| 3 | Fecha dinámica (dd MMM [yyyy]) | "Anteayer" o "Seleccionado" |

- Si el día de la transacción es hoy → posición 1 seleccionada.
- Si el día de la transacción es ayer → posición 2 seleccionada.
- Si el día de la transacción es otro → posición 3 muestra esa fecha y está seleccionada.
- A la derecha del grid, icono de calendario que abre `CalendarModal` para seleccionar cualquier fecha.

### 7. Etiquetas

- Título: "Etiquetas" (multilingual) — clave i18n `add_tags` (existente).
- **Las etiquetas actualmente asociadas a la transacción aparecen preseleccionadas** al cargar la pantalla.
- NOTA: Las etiquetas no se persisten actualmente en la BD. La sección se incluye por coherencia visual con `AddTransactionScreen`, pero el estado de etiquetas seleccionadas no afecta al guardado. Se marcará como TODO en la spec.
- Botón de búsqueda que muestra/oculta input con placeholder "Buscar y crear etiquetas".
- Botón "+ Añadir etiqueta" que abre modal para crear nueva etiqueta (mismo comportamiento que 004).

### 8. Comentario

- Título: "Comentario" (multilingual) — clave i18n `add_comment` (existente).
- Input text multiline que se **precarga con el comentario actual** de la transacción (`transaction.description`).
- Placeholder: "Comentario" (multilingual).
- Contador dinámico "0/4096" que se actualiza al escribir (máximo 4096 caracteres).
- Autocompletado: búsqueda debounced de comentarios existentes (misma lógica que `AddTransactionScreen`).

### 9. Foto

- Título: "Foto" (multilingual) — clave i18n `add_photo` (existente).
- Icono "+" grande en un cuadrado que, al pulsarlo, abre un modal.
- **Modal "Añadir foto":**
  - Título: "Añadir foto" (multilingual).
  - Opción 1: "Sacar foto" (multilingual).
  - Opción 2: "Añadir desde galería" (multilingual).
- TODO: implementación futura de permisos y captura de imagen. Por ahora solo UI.

### 10. Botón de guardado

- Botón "Guardar" (multilingual) — clave i18n `modify_save` (nueva).
- **Validación para habilitar el botón:**
  - Una categoría debe estar seleccionada (`categoryId !== null`).
  - La cantidad debe ser un número válido mayor que 0 (`numericAmount > 0`).
  - Debe haber un día seleccionado.
  - Debe haber una cuenta seleccionada.
- Si el botón está deshabilitado, se muestra texto de ayuda dinámico en rojo (reutilizar hint existente de 004).
- Al pulsar "Guardar":
  1. Recoge todos los datos del formulario.
  2. Llama a `transactionRepository.update(transactionId, data)` con los campos modificados.
  3. Llama a `refresh()` del AppContext para recargar transacciones.
  4. Navega de vuelta a la pantalla anterior (`navigation.goBack()`).

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles deben usar `t()` del sistema i18n existente. No se permite ningún string hardcodeado.
- **Persistencia**: la modificación se guarda en la tabla `transactions` de SQLite (nativo) o localStorage (web) mediante `transactionRepository.update()`.
- **Configuración**: la divisa, separador decimal e idioma se leen del `ConfigContext` existente.
- **Tema**: la pantalla debe usar `useConfig().activeColors` para colores (no hardcodeados).
- **Texto**: la pantalla debe usar `useFontSize()` para escalado de texto.
- **Navegación**: la pantalla ya está registrada en el Stack navigator con `transactionId` como parámetro.
- **Refresco automático**: al volver al listado tras guardar, `useFocusEffect` + `refreshTrigger` recarga los datos automáticamente.

---

## Criterios de aceptación

- [ ] El botón "Editar" de TransactionDetailsScreen navega a ModifyTransaction con el `transactionId`.
- [ ] El header muestra flecha de retroceso y título "Modificar transacción" en el idioma activo.
- [ ] Los tabs "Gastos"/"Ingresos" muestran el tipo de la transacción actual como seleccionado.
- [ ] Al cambiar de tipo, se resetea la categoría seleccionada y se recarga el grid.
- [ ] El input de cantidad se precarga con el valor actual de la transacción.
- [ ] El input de cantidad valida máximo 9 enteros y 2 decimales.
- [ ] El icono de calculadora abre el CalculatorModal y al aceptar pega el resultado.
- [ ] La cuenta mostrada es la cuenta de la transacción actual.
- [ ] El modal de cuentas permite cambiar la cuenta seleccionada.
- [ ] El grid de categorías muestra la categoría actual en la primera posición.
- [ ] Se muestran 7 categorías + botón "Más" en el grid.
- [ ] El botón "Más" navega a Añadir/Crear categoría según el número de categorías.
- [ ] El selector de día se precarga con el día de la transacción actual.
- [ ] Los 3 días muestran las fechas correctas y la selección inicial coincide.
- [ ] El botón de calendario abre el modal de selección de día.
- [ ] La sección de etiquetas existe pero las etiquetas preseleccionadas no afectan al guardado (TODO).
- [ ] El campo de comentario se precarga con el comentario actual de la transacción.
- [ ] El campo de comentario permite hasta 4096 caracteres con contador.
- [ ] El autocompletado de comentarios funciona igual que en AddTransaction.
- [ ] El botón de foto abre el modal con las dos opciones (TODO).
- [ ] El botón "Guardar" está deshabilitado si falta categoría, cantidad válida, día o cuenta.
- [ ] El texto de ayuda se muestra cuando el botón está deshabilitado.
- [ ] Al pulsar "Guardar", se actualiza la transacción y se vuelve a la pantalla anterior.
- [ ] Los datos se refrescan al volver al listado (useFocusEffect).
- [ ] Todos los textos cambian al cambiar el idioma en configuración.
- [ ] La pantalla respeta el tema activo (oscuro/claro).
- [ ] La pantalla respeta el tamaño de texto configurado.
