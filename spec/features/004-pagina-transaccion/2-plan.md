# Plan de implementación — 004 Página de añadir transacción

## Archivos a crear

```
src/
├── screens/
│   └── AddTransactionScreen.tsx    ← pantalla principal (reemplazar placeholder actual)
│
├── components/
│   ├── TypeTabs.tsx                ← tabs Gastos/Ingresos (ya existe, verificar uso)
│   ├── AccountModal.tsx            ← modal de selección de cuenta (ya existe)
│   ├── CategoryGrid.tsx            ← grid 4×2 de categorías + botón "Más"
│   ├── DaySelector.tsx             ← grid 3×1 de días (Hoy, Ayer, dinámico) + icono calendario
│   ├── TagSection.tsx              ← sección de etiquetas (búsqueda, creación, selección)
│   ├── AddTagModal.tsx             ← modal para crear nueva etiqueta
│   ├── PhotoSection.tsx            ← sección de foto con modal de opciones
│   └── CommentInput.tsx            ← campo de comentario con contador
```

## Archivos a modificar

```
src/
├── i18n/
│   ├── en.ts                       ← añadir claves para AddTransaction
│   ├── es.ts                       ← añadir claves para AddTransaction
│   └── ca.ts                       ← añadir claves para AddTransaction
│
├── navigation/
│   └── AppNavigator.tsx            ← añadir AddTransactionScreen al HomeStack
│
├── screens/
│   └── HomeScreen.tsx              ← conectar FAB "+" a navegación
│
├── constants/
│   └── types.ts                    ← añadir AddTransactionScreenProps
│
└── database/
    └── repositories/
        └── transactionRepo.ts      ← añadir función crearTransaccion()
```

---

## Arquitectura

### AddTransactionScreen

Pantalla principal que orquesta todas las sub-secciones. Estado local:

```ts
interface AddTransactionState {
  tipo: 'gasto' | 'ingreso';       // heredado del Home o cambiable por tabs
  cantidad: string;                 // input texto, se parsea al enviar
  cuentaId: number;                 // ID de la cuenta seleccionada
  categoriaId: number;              // ID de la categoría seleccionada
  dia: Date;                        // día seleccionado (default: hoy)
  etiquetas: number[];              // IDs de etiquetas seleccionadas
  comentario: string;               // texto libre
  fotoUri: string | null;           // URI de la foto (futuro)
}
```

### TypeTabs

Componente reutilizable (ya existe `TypeTabs.tsx`). Recibe `tipo` y `onChange`. Muestra "Gastos" / "Ingresos" según idioma.

### CategoryGrid

- Recibe `categorias: Categoria[]` (las 7 más usadas) y `onSelect(id)`.
- Grid 4×2: 7 categorías + 1 botón "Más".
- Cada celda muestra icono (emoji o componente) + nombre debajo.
- El botón "Más" tiene icono "+" y texto "Más".

### DaySelector

- Recibe `diaSeleccionado: Date` y `onChange(fecha: Date)`.
- Calcula las 3 posiciones:
  - Pos 1: `hoy` → texto "Hoy".
  - Pos 2: `ayer` → texto "Ayer".
  - Pos 3: lógica dinámica (ver spec).
- Icono de calendario que abre `CalendarModal` (reutilizar componente existente).
- Usa `formatearFecha(fecha, 'dd MM')` para mostrar las fechas.

### TagSection

- Recibe `etiquetasDisponibles: Etiqueta[]`, `etiquetasSeleccionadas: number[]`, `onToggle(id)`, `onCrear(nombre)`.
- Botón de búsqueda que muestra/oculta input.
- Input con placeholder "Buscar y crear etiquetas" y botón "x".
- Lista de botones de etiquetas existentes (toggle selección).
- Botón "+ Añadir etiqueta" que abre `AddTagModal`.

### AddTagModal

- Modal con input "Nombre de la etiqueta", contador "0/20", botones "Cancelar"/"Añadir".
- Validación: máximo 20 caracteres, nombre no vacío.
- Al confirmar, llama a `onCrear(nombre)` y cierra.

### PhotoSection

- Icono "+" grande que abre modal con opciones.
- Modal: "Añadir foto" → "Sacar foto" / "Añadir desde galería".
- TODO: implementación de permisos y captura. Por ahora solo UI.

### CommentInput

- Input multiline con placeholder "Comentario".
- Contador dinámico "0/4096" que se actualiza al escribir.

### Navegación

```ts
// types.ts
type HomeStackParamList = {
  Home: undefined;
  AddTransaction: undefined;
  Settings: undefined;
};

// AppNavigator.tsx — HomeStack
<Stack.Screen name="AddTransaction" component={AddTransactionScreen}
  options={{ title: t().add_transaction_title }} />
```

El FAB del HomeScreen usa `navigation.navigate('AddTransaction')`.

### i18n

Nuevas claves en todos los archivos de idioma:

```ts
// Claves necesarias (ejemplo en español)
add_transaction_title: 'Añadir transacción',
tab_expenses: 'Gastos',
tab_income: 'Ingresos',
add_amount_placeholder: 'Cantidad',
add_amount_error: 'La cantidad que se ha introducido no es válida',
add_account: 'Cuenta',
add_categories: 'Categorías',
add_more: 'Más',
add_day: 'Día',
add_today: 'Hoy',
add_yesterday: 'Ayer',
add_day_before_yesterday: 'Anteayer',
add_selected: 'Seleccionado',
add_tags: 'Etiquetas',
add_tag_search: 'Buscar y crear etiquetas',
add_tag_new: 'Añadir etiqueta',
add_tag_modal_title: 'Añadir etiqueta',
add_tag_name_placeholder: 'Nombre de la etiqueta',
add_comment: 'Comentario',
add_photo: 'Foto',
add_photo_title: 'Añadir foto',
add_photo_camera: 'Sacar foto',
add_photo_gallery: 'Añadir desde galería',
add_submit: 'Añadir',
```

### Persistencia

La función `crearTransaccion` en `transactionRepo.ts` inserta en la tabla `transacciones` con todos los campos. Se llama al pulsar "Añadir".

---

## Decisiones

- **Componentes modulares**: cada sección (categoría, día, etiquetas, comentario, foto) es un componente independiente para facilitar testing y mantenimiento.
- **Reutilización de componentes existentes**: `TypeTabs`, `AccountModal`, `CalendarModal` ya existen y se reutilizan.
- **Estado local**: la pantalla usa estado local (no Context) ya que es un formulario temporal que se descarta al navegar.
- **TODOs marcados**: calculadora, añadir categoría, captura de foto — se implementan en features futuras.
- **String hardcodeado = error**: todos los textos visibles pasan por `t()`.

## Verificación

1. `npx expo start --web` — probar en navegador: navegación desde FAB, formulario completo, validación de cantidad.
2. `npx expo start` + Expo Go — probar en nativo: modales, permisos de cámara/galería (futuro).
3. Validar todos los criterios de aceptación de `1-spec.md`.
4. Cambiar idioma y verificar que todos los textos se actualizan.
5. Cambiar tema y verificar colores.
6. Cambiar tamaño de texto y verificar escalado.
