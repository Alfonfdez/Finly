# Tareas — 002 Diseño de base de datos local
Orden de ejecución. Marca cada tarea al completarlo.

[ ] T1 — Instalar `expo-sqlite`. Crear carpeta `src/database/` con `database.ts`, `types.ts` y `migrations/001_initial.ts`.

[ ] T2 — Implementar `database.ts`: abrir conexión, ejecutar migraciones versionadas, exponer la instancia de base de datos.

[ ] T3 — Escribir `migrations/001_initial.ts` con el CREATE TABLE de todas las tablas (usuarios, cuentas, categorías, transacciones, presupuestos, planes_ahorro) e índices necesarios.

[ ] T4 — Implementar `types.ts` con las interfaces TypeScript: Usuario, Cuenta, Categoria, Transaccion, Presupuesto, PlanAhorro.

[ ] T5 — Implementar `usuarioRepo.ts`: insertar usuario por defecto, obtener, actualizar.

[ ] T6 — Implementar `cuentaRepo.ts`: listar, insertar, actualizar, eliminar, obtenerSaldoActual.

[ ] T7 — Implementar `categoriaRepo.ts`: listar (con filtro opcional por tipo), insertar, actualizar, eliminar.

[ ] T8 — Implementar `transaccionRepo.ts`: listar con filtros (cuenta, categoría, tipo, rango de fechas), insertar, actualizar, eliminar. Agregaciones: totalPorPeriodo, desglosePorCategorias.

[ ] T9 — Implementar `presupuestoRepo.ts`: obtener, upsert, verificarLimite.

[ ] T10 — Implementar `ahorroRepo.ts`: listar, insertar, actualizarCantidad, eliminar.

[ ] T11 — Crear `storage/migration.ts`: leer datos de AsyncStorage e insertarlos en SQLite creando usuario por defecto.

[ ] T12 — Actualizar `AppContext.tsx` para que use los repositorios SQLite en lugar de AsyncStorage (mantener compatibilidad mientras tanto).

[ ] T13 — Verificación: probar en emulador que la base de datos se crea, las operaciones CRUD funcionan y las agregaciones devuelven datos correctos.
