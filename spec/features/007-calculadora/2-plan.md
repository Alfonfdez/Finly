# Plan de implementación — 007 Calculadora

## Arquitectura

### Componentes nuevos

- **CalculatorModal.tsx**: Modal contenedor con display, teclado de botones y botones de acción (Aceptar/Cancelar).
- **calculator.ts**: Utilidad pura para evaluar expresiones matemáticas de forma segura.

### Archivos modificados

- **AddTransactionScreen.tsx**: Añadir estado `calculatorVisible` y conectar el botón de calculadora con el modal.
- **i18n/en.ts, es.ts, ca.ts**: Añadir claves multilingües para la calculadora.
- **spec/constitution/3-roadmap.md**: Añadir feature 007.

### Dependencias externas

- Ninguna. Implementación pura con React Native.

---

## Estados de la UI

### CalculatorModal

```
┌─────────────────────────────────┐
│ Calculadora                     │  ← Header del modal
├─────────────────────────────────┤
│                                 │
│   123.45 / 5                    │  ← Display expresión
│                     = 24.69     │  ← Display resultado
│                                 │
├─────────────────────────────────┤
│   7   8   9   ÷                │
│   4   5   6   ×                │  ← Teclado calculadora
│   1   2   3   −                │
│   C   0   .   +                │
│   ⌫           =                │
├─────────────────────────────────┤
│ [Cancelar]              [Aceptar]│  ← Botones acción
└─────────────────────────────────┘
```

### Estados locales

```ts
interface CalculatorState {
  expression: string;     // expresión actual (ej: "123.45 / 5")
  result: string | null;  // resultado de evaluar la expresión
  hasError: boolean;      // true si la expresión es inválida
}
```

### Validaciones

- No se permite empezar con operador (excepto `-` para negativos).
- No se permiten dos operadores consecutivos (se reemplaza el anterior).
- No se permite más de un punto decimal por número.
- El botón `=` está deshabilitado si la expresión está vacía o tiene error.

---

## Evaluador de expresiones

### `calculator.ts`

Función pura `evaluate(expression: string): { result: number | null; error: boolean }`

**Reglas:**
- Parsea la expresión de izquierda a derecha.
- Respeta precedencia de operadores (`*` y `/` antes que `+` y `-`).
- Divide por cero → error.
- Expresión vacía o inválida → error.

**Implementación:**
- Usar `Function` constructor con sanitización de caracteres permitidos (dígitos, operadores, punto, espacios).
- O alternativamente, implementar un parser manual para mayor seguridad.

---

## Teclado de la calculadora

### Layout del grid

| Row | Col 1 | Col 2 | Col 3 | Col 4 |
|-----|-------|-------|-------|-------|
| 1 | 7 | 8 | 9 | ÷ |
| 2 | 4 | 5 | 6 | × |
| 3 | 1 | 2 | 3 | − |
| 4 | C | 0 | . | + |
| 5 | ⌫ | | | = |

### Estilos

- Botones numéricos: fondo `c.surface`, texto `c.text`.
- Botones de operación: fondo `c.primary` con texto blanco.
- Botón `=`: fondo `c.green` (o color de éxito) con texto blanco.
- Botón `C`: fondo `c.red` (o color de error) con texto blanco.
- Grid con gap uniforme (8-10px).
- Botones con border radius: 10-12px.
- Tamaño de fuente del display: 20-24px.
- Tamaño de fuente de los botones: 18-20px.

---

## Claves i18n

| Key | EN | ES | CA |
|-----|----|----|-----|
| `calc_title` | Calculator | Calculadora | Calculadora |
| `calc_accept` | Accept | Aceptar | Acceptar |
| `calc_cancel` | Cancel | Cancelar | Cancel·lar |
| `calc_error` | Error | Error | Error |

---

## Wireframe de AddTransactionScreen (sección cantidad)

```
┌─────────────────────────────────┐
│         [ ] Expense  [ ] Income │  ← TypeTabs
├─────────────────────────────────┤
│  ┌─────────────────────────┬─┐ │
│  │ 0                       │€│ │  ← Input cantidad
│  └─────────────────────────┴🧪│  ← Botón calculadora
├─────────────────────────────────┤
```

- El botón de calculadora (`🧪`) está a la derecha del símbolo de divisa.
- Al pulsarlo, se abre CalculatorModal.
