# 007 — Calculadora

- **Objetivo**
Modal con calculadora básica que permite al usuario realizar operaciones matemáticas simples y pegar el resultado en el campo de cantidad de la pantalla "Añadir Transacción". Componente reutilizable que puede usarse en otras pantallas.

---

## Requisitos funcionales

### 1. Acceso

- Se accede pulsando el botón de calculadora (icono `calculator-outline`) en el campo de cantidad de `AddTransactionScreen`.
- Se abre un modal superpuesto sobre la pantalla actual.
- No navega a otra pantalla (mantiene el contexto del formulario).

### 2. Pantalla de la calculadora

- **Display**: muestra la expresión introducida (ej: `123.45 / 5`) y el resultado actual (ej: `24.69`).
- **Botones numéricos**: `0-9` y `.` (decimal).
- **Botones de operación**: `+`, `-`, `*`, `/`.
- **Botón `=`**: evalúa la expresión y muestra el resultado.
- **Botón `C`**: limpia toda la expresión y el resultado.
- **Botón `⌫`** (backspace): elimina el último carácter de la expresión.

### 3. Lógica de la calculadora

- La expresión se construye pulsando botones y se muestra en tiempo real.
- Al pulsar `=`, se evalúa la expresión completa y se muestra el resultado.
- Si la expresión es inválida (ej: `5 + * 3`), se muestra un error y no se permite aceptar.
- Los decimales usan el separador configurado en la app (`.` o `,`).
- El resultado se redondea a 2 decimales máximo.

### 4. Botones de acción (fuera del teclado de la calculadora)

- **Aceptar** (multilingual): cierra el modal y pega el resultado en el campo de cantidad de `AddTransactionScreen`.
- **Cancelar** (multilingual): cierra el modal sin modificar el campo de cantidad.
- Los botones están en la parte inferior del modal, fuera del área de botones de la calculadora.

### 5. Comportamiento al aceptar

- El resultado numérico se convierte a string con el separador decimal de la configuración.
- Se reemplaza el valor actual del campo de cantidad con el resultado.
- El foco permanece en el campo de cantidad para que el usuario pueda seguir editando.

### 6. Integración con AddTransactionScreen

- El botón de calculadora (icono `calculator-outline`) abre el modal.
- Al cerrar el modal (aceptar o cancelar), el foco vuelve al campo de cantidad.
- La calculadora NO modifica el estado de la transacción hasta que se pulsa "Aceptar".

### 7. Tema y accesibilidad

- La calculadora usa los colores del tema activo (oscuro/claro) vía `useConfig().activeColors`.
- Los botones tienen `accessibilityLabel` descriptivo.
- El display usa un tamaño de fuente legible.

---

## Criterios de aceptación

- [ ] El botón de calculadora abre un modal con la calculadora.
- [ ] Los botones numéricos y de operación construyen la expresión correctamente.
- [ ] El botón `=` evalúa la expresión y muestra el resultado.
- [ ] El botón `C` limpia la expresión y el resultado.
- [ ] El botón `⌫` elimina el último carácter.
- [ ] El botón "Aceptar" pega el resultado en el campo de cantidad.
- [ ] El botón "Cancelar" cierra sin modificar el campo.
- [ ] La calculadora respeta el tema oscuro/claro.
- [ ] Funciona en iOS, Android y Web.

---

## Fuera de alcance (por ahora)

- Operaciones científicas (sen, cos, log, etc.).
- Historial de cálculos.
- Memoria (M+, M-, MR, MC).
- Paréntesis.
