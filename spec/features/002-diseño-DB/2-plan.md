# Plan de implementación — 002 Diseño de base de datos local

## Decisión técnica: SQLite con expo-sqlite

Se sustituye AsyncStorage por **SQLite** mediante el módulo `expo-sqlite` (incluido en Expo SDK). Motivos:

- **Modelo relacional**: las finanzas tienen relaciones naturales (usuarios → cuentas → transacciones → categorías). SQLite es el estándar para bases de datos embebidas.
- **Consultas complejas**: agregaciones por período y categoría con `GROUP BY`, `SUM`, filtros por fecha.
- **Integridad referencial**: claves foráneas con `ON DELETE CASCADE`.
- **Rendimiento**: SQLite maneja miles de transacciones sin problemas; AsyncStorage se degrada con volumen.
- **Migración futura**: facilita exportar a un servidor si se necesitara sincronización.
- **Soporte nativo en Expo**: `expo-sqlite` funciona sin eject ni configuraciones nativas adicionales.

## Dependencias nuevas

```bash
npx expo install expo-sqlite
```

## Archivos

```
src/
├── database/
│   ├── database.ts           ← inicialización, migraciones, conexión
│   ├── migrations/
│   │   └── 001_initial.ts    ← migración inicial con el CREATE TABLES
│   ├── repositories/
│   │   ├── usuarioRepo.ts    ← CRUD usuarios
│   │   ├── cuentaRepo.ts     ← CRUD cuentas
│   │   ├── categoriaRepo.ts  ← CRUD categorías
│   │   ├── transaccionRepo.ts← CRUD transacciones + consultas agregadas
│   │   ├── presupuestoRepo.ts← CRUD presupuestos
│   │   └── ahorroRepo.ts     ← CRUD planes de ahorro
│   └── types.ts              ← interfaces TypeScript para cada tabla
│
├── storage/
│   └── migration.ts          ← migración de datos desde AsyncStorage a SQLite
│
└── context/
    └── AppContext.tsx         ← se actualiza para usar repositorios SQLite
```

## Arquitectura de datos

```
AppContext
  └── repositorios (capa de acceso a datos)
        └── database.ts (conexión SQLite)
              └── Finly.db (archivo local)
```

## Flujo de inicialización

1. `App.tsx` llama a `initDatabase()` en `database.ts`.
2. `database.ts` abre/crea `Finly.db` y ejecuta migraciones pendientes.
3. Si es la primera vez y hay datos en AsyncStorage, `migration.ts` los migra a SQLite.
4. `AppContext.tsx` se conecta a los repositorios y carga el estado inicial.
5. Las operaciones CRUD se hacen a través de los repositorios, no directamente.

## Migraciones versionadas

Cada migración se numera (001, 002, …). La base de datos guarda la versión actual en una tabla interna `_migrations`. Al arrancar, se ejecutan las migraciones > versión actual en orden.

## Funciones principales por repositorio

### usuarioRepo
- `insertar(datos)` → crea usuario por defecto
- `obtenerPorId(id)` → obtiene usuario
- `actualizar(id, datos)` → modifica nombre, moneda, etc.

### cuentaRepo
- `listar(usuarioId)` → todas las cuentas
- `insertar(datos)` → nueva cuenta
- `actualizar(id, datos)` → modificar nombre, saldo, icono
- `eliminar(id)` → borra cuenta y transacciones asociadas
- `obtenerSaldoActual(id)` → saldo inicial + suma ingresos - suma gastos

### categoriaRepo
- `listar(usuarioId, tipo?)` → todas o filtradas por tipo
- `insertar(datos)` → nueva categoría
- `actualizar(id, datos)` → modificar nombre, icono, color
- `eliminar(id)` → borra categoría y transacciones asociadas

### transaccionRepo
- `listar(filtros)` → por cuenta, categoría, tipo, rango de fechas
- `insertar(datos)` → nueva transacción
- `actualizar(id, datos)` → modificar transacción
- `eliminar(id)` → borrar transacción
- `totalPorPeriodo(usuarioId, tipo, fechaInicio, fechaFin)` → SUM agrupado
- `desglosePorCategorias(usuarioId, tipo, fechaInicio, fechaFin)` → agregación por categoría

### presupuestoRepo
- `obtener(usuarioId, categoriaId, mes, año)` → presupuesto actual
- `insertar/actualizar(datos)` → upsert
- `verificarLimite(usuarioId, categoriaId, mes, año)` → gasto actual vs límite

### ahorroRepo
- `listar(usuarioId)` → todos los planes
- `insertar(datos)` → nuevo plan
- `actualizarCantidad(id, nuevaCantidad)` → progreso del ahorro
- `eliminar(id)` → borrar plan

## Migración desde AsyncStorage

- Leer datos existentes de AsyncStorage.
- Crear usuario por defecto.
- Insertar cuentas, categorías y transacciones en SQLite.
- Marcar migración como completada en AsyncStorage (`migrated: true`).
- A partir de entonces, solo se usa SQLite.

## Verificación

Ejecutar `npx expo start` en emulador/dispositivo. Validar que:
- La base de datos se crea sin errores.
- Se pueden crear cuentas, categorías y transacciones.
- Las consultas de agregación devuelven valores correctos.
- La migración desde AsyncStorage funciona correctamente.
- Validar todos los criterios de aceptación de `1-spec.md`.
