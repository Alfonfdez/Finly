# 012 — Página de modificar cuenta

- **Objetivo**
  Pantalla accesible desde la pantalla de cuentas (011) que permita al usuario modificar una cuenta existente (nombre, icono, color, nota). Todos los textos son multilingües (es/en/ca).

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
- No se require validación de duplicados (pueden existir cuentas con el mismo nombre).

### 3. Símbolos (iconos)

- Título: "Símbolos" (multilingual).
- Grid de 4 columnas × filas dinámicas (ScrollView vertical si no caben todos).
- Lista de iconos Ionicons predefinidos para cuentas (~20 iconos relacionados con finanzas/banco/wallet).
- El icono actual de la cuenta debe aparecer preseleccionado al abrir la pantalla.
- Al pulsar un icono, se resalta con borde de color primario y el fondo cambia ligeramente.
- Solo un icono puede estar seleccionado a la vez.
- La selección de icono **no es obligatoria** para guardar.

### 4. Color

- Título: "Color" (multilingual).
- Misma estructura que en 006 y 009: 6 colores predefinidos + 7.ª posición para color personalizado + "+" para abrir `ColorPickerModal`.
- El color actual de la cuenta debe aparecer preseleccionado.
- La selección de color **no es obligatoria** para guardar.

#### Modal de colores

- Mismo componente `ColorPickerModal` existente.
- Se abre al pulsar "+".
- Panel1 + HueSlider + OpacitySlider + Preview + botones OK/Cancel.

### 5. Nota (descripción)

- Título: "Nota" (multilingual).
- Input de texto multilínea para una descripción opcional de la cuenta.
- Máximo 200 caracteres con contador "0/200".
- Valor por defecto: vacío o el valor actual de `description` si la cuenta tiene una.

> Nota: el campo `description` actualmente no existe en la tabla `accounts`. Se añadirá como columna opcional mediante una migración.

### 6. Botón "Guardar"

- Botón "Guardar" (multilingual) en la parte inferior.
- Deshabilitado si el nombre está vacío.
- Al pulsar:
  1. Se actualiza la cuenta en la base de datos con los valores del formulario (nombre, icono, color, descripción).
  2. Se navega de vuelta a `AccountsScreen`.

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles deben usar `t()`.
- **Configuración**: usar `useConfig().activeColors`.
- **Texto**: usar `useFontSize()`.
- **Navegación**: se añade al `HomeStack` en `AppNavigator.tsx`.
- **Persistencia**: `accountRepository.update()` (SQLite / localStorage).
- **Iconos**: `@expo/vector-icons` (Ionicons).
- **DB**: se añade columna `description TEXT` a la tabla `accounts` mediante migración.

---

## Criterios de aceptación

- [ ] El header muestra flecha de retroceso y título "Modificar cuenta" en el idioma activo.
- [ ] Se muestra "Nombre de la cuenta" con input editable, contador 0/30.
- [ ] Si el nombre está vacío, se muestra error en rojo y "Guardar" deshabilitado.
- [ ] Se muestran ~20 iconos en grid 4 columnas con el icono actual preseleccionado.
- [ ] Se muestran 6 colores predefinidos + círculo personalizado + "+".
- [ ] El "+" abre `ColorPickerModal`.
- [ ] Se muestra "Nota" con input multilínea, máximo 200 caracteres, contador 0/200.
- [ ] El botón "Guardar" está deshabilitado si el nombre está vacío.
- [ ] Al pulsar "Guardar", se actualiza la cuenta y se navega de vuelta.
- [ ] Todos los textos cambian al cambiar el idioma.
- [ ] La pantalla respeta el tema activo y el tamaño de texto.
