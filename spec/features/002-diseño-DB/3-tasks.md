# Tareas — 002 Diseño de base de datos local
Orden de ejecución. Marca cada tarea al completarlo.

[ ] T1 — Instalar `expo-sqlite`. Crear carpeta `src/database/` con `database.ts`, `types.ts` y `migrations/`.

[ ] T2 — Implementar `database.ts`: abrir conexión, ejecutar migraciones versionadas, exponer la instancia de base de datos.

[ ] T3 — Escribir `migrations/001_initial.ts` con el CREATE TABLE de todas las tablas (usuarios, cuentas, categorías, transacciones) e índices necesarios.

[ ] T4 — Escribir `migrations/002_seed.ts` con la inserción de datos de prueba: usuario por defecto, cuentas, categorías y transacciones del mockData actual.

[ ] T5 — Implementar `types.ts` con las interfaces TypeScript: `Cuenta`, `Categoria`, `Transaccion`.

[ ] T6 — Implementar `usuarioRepo.ts`: insertar usuario por defecto, obtener, actualizar.

[ ] T7 — Implementar `cuentaRepo.ts`: listar, insertar, actualizar, eliminar, obtenerSaldoActual.

[ ] T8 — Implementar `categoriaRepo.ts`: listar (con filtro opcional por tipo), insertar, actualizar, eliminar.

[ ] T9 — Implementar `transaccionRepo.ts`: listar con filtros (cuenta, categoría, tipo, rango de fechas), insertar, actualizar, eliminar. Agregaciones: totalPorPeriodo, desglosePorCategorias.

[ ] T10 — Actualizar `AppContext.tsx` para que use los repositorios SQLite en lugar de mockData.

[ ] T11 — Verificación: probar en emulador que la base de datos se crea, los datos de prueba se cargan, las operaciones CRUD funcionan y las agregaciones devuelven datos correctos.
