# 002 — Diseño de base de datos local

- **Objetivo**
Diseñar e implementar una base de datos SQLite local que almacene la información de usuarios, cuentas, categorías, transacciones, presupuestos y planes de ahorro. Reemplazar el uso de AsyncStorage por una base de datos relacional que permita consultas complejas, integridad referencial y mejor rendimiento con grandes volúmenes de datos.

- **Requisitos funcionales**
1. Gestión de usuarios (soporte multiusuario local si se desea cambiar de perfil en el mismo dispositivo).
2. CRUD completo de cuentas: cada cuenta pertenece a un usuario, tiene nombre, saldo inicial, icono y color.
3. CRUD completo de categorías: cada categoría pertenece a un usuario, tiene nombre, icono, color y tipo (gasto/ingreso).
4. CRUD completo de transacciones: cada transacción pertenece a una cuenta y una categoría, tiene tipo (gasto/ingreso), cantidad, descripción y fecha.
5. Consultas eficientes por período (día, semana, mes, año, rango personalizado) y por tipo (gasto/ingreso).
6. Agregaciones: total de ingresos y gastos por período, desglose por categorías con porcentajes.
7. Presupuestos mensuales por categoría con control de límite.
8. Planes de ahorro: nombre, objetivo, cantidad actual, fecha límite.
9. Migración de datos desde AsyncStorage a SQLite (una única vez al actualizar).

- **Contenido**
Esquema SQL de las tablas, script de inicialización, funciones CRUD en TypeScript, migración desde AsyncStorage.

- **Requisitos no funcionales**
- La base de datos debe crearse al iniciar la app por primera vez.
- Las migraciones deben ser versionadas para poder actualizar el esquema en el futuro.
- Las consultas deben ejecutarse en el hilo principal sin bloquear la UI (usar `expo-sqlite` con await).
- Los datos deben persistirse localmente sin conexión a internet.
- La estructura debe soportar borrado en cascada (ej. al eliminar una categoría, las transacciones de esa categoría se eliminan).

- **Fuera de alcance**
Sincronización en la nube, autenticación remota, servidor externo, base de datos en tiempo real.

- **Esquema de tablas propuesto**

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  moneda TEXT NOT NULL DEFAULT '€',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE cuentas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  saldo_inicial REAL NOT NULL DEFAULT 0,
  icono TEXT NOT NULL DEFAULT 'wallet',
  color TEXT NOT NULL DEFAULT '#22D3EE',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#A78BFA',
  tipo TEXT NOT NULL CHECK(tipo IN ('gasto', 'ingreso')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE transacciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuenta_id INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('gasto', 'ingreso')),
  cantidad REAL NOT NULL CHECK(cantidad > 0),
  descripcion TEXT,
  fecha TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (cuenta_id) REFERENCES cuentas(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

CREATE TABLE presupuestos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  limite REAL NOT NULL CHECK(limite > 0),
  mes INTEGER NOT NULL CHECK(mes BETWEEN 1 AND 12),
  año INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

CREATE TABLE planes_ahorro (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  objetivo REAL NOT NULL CHECK(objetivo > 0),
  cantidad_actual REAL NOT NULL DEFAULT 0,
  fecha_limite TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

- **Criterios de aceptación**
- [ ] La base de datos se crea automáticamente al iniciar la app si no existe.
- [ ] Se puede insertar un usuario, cuentas, categorías y transacciones.
- [ ] Las consultas de agregación por período devuelven los totales correctos.
- [ ] Al eliminar una categoría, se eliminan las transacciones asociadas.
- [ ] Al eliminar una cuenta, se eliminan las transacciones asociadas.
- [ ] Al eliminar un usuario, se eliminan todos sus datos asociados.
- [ ] Los datos existentes en AsyncStorage se migran correctamente a SQLite.
- [ ] Las inserciones y consultas no bloquean la interfaz de usuario.
