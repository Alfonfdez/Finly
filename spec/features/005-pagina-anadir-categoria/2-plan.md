# Plan de implementación — 005 Página de añadir categoría

## Arquitectura

### Componentes nuevos

- **AddCategoryScreen.tsx**: Pantalla principal con header, grid de categorías filtradas por tipo y botón "Crear" en la última posición del grid.
- **SearchBar.tsx**: Componente reutilizable de barra de búsqueda con input y botón "x".

### Archivos modificados

- **AppNavigator.tsx**: Añadir `AddCategoryScreen` al `HomeStack`.
- **types.ts**: Añadir `AddCategoryScreenProps` al `HomeStackParamList`.
- **CategoryGrid.tsx**: Modificar `onAddMore` para navegar a `AddCategoryScreen`.
- **i18n/en.ts, es.ts, ca.ts**: Añadir claves multilingües para la nueva pantalla.

### Flujo de navegación

```
AddTransactionScreen → CategoryGrid ("Más") → AddCategoryScreen → AddTransactionScreen (con categoría seleccionada)
```

### Filtrado por tipo

1. `AddTransactionScreen` pasa el tipo activo (`tipo`) como parámetro de navegación.
2. `AddCategoryScreen` recibe el tipo y filtra las categorías accordingly.
3. Solo se muestran las categorías del tipo activo (gasto o ingreso).

### Lógica de búsqueda

1. El usuario pulsa el botón de búsqueda → se muestra el input.
2. Al escribir en el input, se filtran las categorías cuyo nombre contenga los caracteres escritos (en cualquier orden, case-insensitive).
3. Si no hay coincidencias, se muestra el estado vacío.
4. Al pulsar "x", se cierra el input y se restablecen todas las categorías del tipo activo.

### Botón "Crear"

1. El botón "Crear" se muestra en la última posición del grid de categorías.
2. Tiene icono "+" y texto "Crear" (multilingual).
3. Al pulsar, se navega a una nueva pantalla "Crear categoría" (TODO: implementación futura).

### Selección de categoría

1. El usuario pulsa una categoría en el grid.
2. Se navega de vuelta a `AddTransactionScreen` con la categoría seleccionada como parámetro.
3. `AddTransactionScreen` actualiza el estado `categoriaId` con la categoría recibida.

---

## Dependencias

- Sistema i18n existente (`src/i18n/index.ts`).
- ConfigContext para colores y escalado de texto.
- Repositorios de categorías (SQLite nativo o localStorage web).
- Navegación React Navigation v7 (HomeStack).

---

## Estimación

- **Tareas**: 10 tareas
- **Tiempo estimado**: 1-2 horas
