# Plan de implementación — 002 Diseño de base de datos local

## Decisión técnica: SQLite con expo-sqlite

Se sustituye AsyncStorage por **SQLite** mediante el módulo `expo-sqlite` (incluido en Expo SDK). Motivos:

- **Modelo relacional**: las finanzas tienen relaciones naturales (usuarios → cuentas → transacciones → categorías). SQLite es el estándar para bases de datos embebidas.
- **Consultas complejas**: agregaciones por período y categoría con `GROUP BY`, `SUM`, filtros por fecha.
- **Integridad referencial**: claves foráneas con `ON DELETE CASCADE`.
- **Rendimiento**: SQLite maneja miles de transacciones sin problemas; AsyncStorage se degrada con volumen.
- **Migración futura**: facilita exportar a un servidor si se necesitara sincronización.
- **Soporte nativo en Expo**: `expo-sqlite` funciona sin eject ni configuraciones nativas adicionales.
- **Índices**: creación de índices para optimizar consultas frecuentes por cuenta, categoría, tipo y fecha.

## Dependencias nuevas

```bash
npx expo install expo-sqlite
```

## Archivos

```
FinlyApp/src/
├── database/
│   ├── database.ts           ← inicialización, migraciones, conexión
│   ├── migrations/
│   │   ├── 001_initial.ts    ← CREATE TABLES + CREATE INDEX
│   │   └── 002_seed.ts       ← inserción de datos de prueba iniciales
│   ├── repositories/
│   │   ├── usuarioRepo.ts    ← CRUD usuarios
│   │   ├── cuentaRepo.ts     ← CRUD cuentas
│   │   ├── categoriaRepo.ts  ← CRUD categorías
│   │   └── transaccionRepo.ts← CRUD transacciones + consultas agregadas
│   └── types.ts              ← interfaces TypeScript (Cuenta, Categoria, Transaccion)
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
3. Si es la primera vez, `002_seed.ts` inserta los datos de prueba (mockData) en la base de datos.
4. `AppContext.tsx` se conecta a los repositorios y carga el estado inicial.
5. Las operaciones CRUD se hacen a través de los repositorios, no directamente.

## Migraciones versionadas

Cada migración se numera (001, 002, …). La base de datos guarda la versión actual en una tabla interna `_migrations`. Al arrancar, se ejecutan las migraciones > versión actual en orden.

- `001_initial.ts`: crea todas las tablas (`usuarios`, `cuentas`, `categorias`, `transacciones`) e índices.
- `002_seed.ts`: inserta usuario por defecto y datos de prueba (cuentas, categorías y transacciones del mockData actual).

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

## Carga de datos de prueba (seed)

Al crear la base de datos por primera vez, se insertan los datos de prueba actuales del mockData:

1. Se crea un usuario por defecto (`Usuario Demo`).
2. Se insertan las cuentas: Efectivo, Banco, Ahorros (con `saldo_inicial: 0`).
3. Se insertan las categorías: Nómina, Freelance, Alimentación, Transporte, Ocio, Vivienda, Salud, Inversiones.
4. Se insertan las transacciones de ejemplo con fechas en formato `YYYY-MM-DD HH:MM:SS`.

## Verificación

Ejecutar `npx expo start` en emulador/dispositivo. Validar que:
- La base de datos se crea sin errores.
- Los datos de prueba se cargan correctamente al iniciar.
- Se pueden crear cuentas, categorías y transacciones.
- Las consultas de agregación devuelven valores correctos.
- Validar todos los criterios de aceptación de `1-spec.md`.
