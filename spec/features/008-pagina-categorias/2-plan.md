# Plan de implementación — 008 Página de categorías

## Arquitectura

### Componentes nuevos

- **CategoriesScreen.tsx**: Pantalla principal con header (menú hamburguesa + título), `TypeTabs`, grid 4×N de categorías filtradas por tipo, y botón "Crear" en la última posición del grid.

### Archivos modificados

- **AppNavigator.tsx**: Añadir `CategoriesScreen` al `HomeStack`. Conectar el `DrawerItem` de "Categorías" (actualmente `onPress={() => {}}`) para navegar a la nueva pantalla.
- **types.ts**: Añadir `Categories` al `RootStackParamList` y `CategoriesScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Añadir clave `nav_categories` (si no existe ya como título visible) y cualquier otra clave necesaria.

### Flujo de navegación

```
Drawer → "Categorías" → CategoriesScreen
  ├── pulsar categoría → ModifyCategoryScreen (009) { categoryId }
  └── pulsar "Crear" → CreateCategoryScreen (006) { type }
```

### Grid de categorías

- Reutilizar el patrón de grid 4×N con icono + nombre de `AddCategoryScreen`.
- Cada celda muestra el icono de la categoría con su color de fondo + nombre debajo.
- Scroll vertical con FlatList o ScrollView.
- Última posición: botón "+" con label "Crear" (multilingual).

### Dependencias

- Sistema i18n existente (`src/i18n/index.ts`).
- ConfigContext para colores y escalado de texto.
- Repositorio de categorías (`categoryRepository`).
- Navegación React Navigation v7 (HomeStack + Drawer).
- Componente `TypeTabs` existente.
- Pantalla `CreateCategoryScreen` existente (006).
- Pantalla `ModifyCategoryScreen` a implementar (009).

---

## Estados de la UI

```
┌─────────────────────────────────┐
│ ☰  Categorías                   │  ← Header con menú hamburguesa
├─────────────────────────────────┤
│ [Gastos]  [Ingresos]            │  ← TypeTabs
├─────────────────────────────────┤
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │  ← Grid 4×N de categorías
│ └──┘ └──┘ └──┘ └──┘           │     Icono + color + nombre
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │
│ └──┘ └──┘ └──┘ └──┘           │
│ ...                            │
│ ┌──────────────┐               │
│ │ [+] Crear    │               │  ← Última posición
│ └──────────────┘               │
└─────────────────────────────────┘
```

---

## i18n

Claves nuevas necesarias:

| Clave | EN | ES | CA |
|---|---|---|---|
| `categories_title` | Categories | Categorías | Categories |

Si `nav_categories` ya existe en los archivos i18n, se puede reutilizar para el título del header.

---

## Estimación

- **Tareas**: 8 tareas en 3 fases
- **Tiempo estimado**: 1-2 horas
