# 002 — Diseño de base de datos local

- **Objetivo**
Diseñar e implementar una base de datos SQLite local que almacene la información de usuarios, cuentas, categorías y transacciones. Reemplazar el uso de AsyncStorage por una base de datos relacional que permita consultas complejas, integridad referencial y mejor rendimiento con grandes volúmenes de datos. Los datos de prueba existentes se cargan como semilla inicial en la base de datos.

- **Requisitos funcionales**
1. Gestión de usuarios (soporte multiusuario local si se desea cambiar de perfil en el mismo dispositivo).
2. CRUD completo de cuentas: cada cuenta pertenece a un usuario, tiene nombre, saldo inicial, icono y color.
3. CRUD completo de categorías: cada categoría pertenece a un usuario, tiene nombre, icono, color y tipo (gasto/ingreso).
4. CRUD completo de transacciones: cada transacción pertenece a una cuenta y una categoría, tiene tipo (gasto/ingreso), cantidad, descripción y fecha.
5. Consultas eficientes por período (día, semana, mes, año, rango personalizado) y por tipo (gasto/ingreso).
6. Agregaciones: total de ingresos y gastos por período, desglose por categorías con porcentajes.
7. Carga inicial de datos de prueba (mockData) al crear la base de datos por primera vez.

- **Contenido**
Esquema SQL de las tablas, script de inicialización, funciones CRUD en TypeScript, migración desde AsyncStorage.

- **Requisitos no funcionales**
- La base de datos debe crearse al iniciar la app por primera vez.
- Las migraciones deben ser versionadas para poder actualizar el esquema en el futuro.
- Las consultas deben ejecutarse en el hilo principal sin bloquear la UI (usar `expo-sqlite` con await).
- Los datos deben persistirse localmente sin conexión a internet.
- La estructura debe soportar borrado en cascada (ej. al eliminar una categoría, las transacciones de esa categoría se eliminan).
- Las fechas se almacenan en formato TEXT con patrón `YYYY-MM-DD HH:MM:SS`.
- Los nombres de tipos TypeScript deben coincidir con los existentes en el código: `Cuenta`, `Categoria`, `Transaccion`.
- Se deben crear índices en las columnas frecuentemente consultadas para optimizar rendimiento.

- **Fuera de alcance**
Sincronización en la nube, autenticación remota, servidor externo, base de datos en tiempo real, migración desde AsyncStorage (la app aún no tiene datos en producción).

- **Esquema de tablas propuesto**

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  moneda TEXT NOT NULL DEFAULT '€',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE cuentas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  saldo_inicial REAL NOT NULL DEFAULT 0,
  icono TEXT NOT NULL DEFAULT 'wallet',
  color TEXT NOT NULL DEFAULT '#22D3EE',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#A78BFA',
  tipo TEXT NOT NULL CHECK(tipo IN ('gasto', 'ingreso')),
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
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
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (cuenta_id) REFERENCES cuentas(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_cuentas_usuario ON cuentas(usuario_id);
CREATE INDEX idx_categorias_usuario ON categorias(usuario_id);
CREATE INDEX idx_categorias_tipo ON categorias(usuario_id, tipo);
CREATE INDEX idx_transacciones_cuenta ON transacciones(cuenta_id, fecha);
CREATE INDEX idx_transacciones_categoria ON transacciones(categoria_id, fecha);
CREATE INDEX idx_transacciones_tipo ON transacciones(tipo, fecha);
```

- **Formato de fechas**
Todas las fechas se almacenan en formato TEXT con patrón `YYYY-MM-DD HH:MM:SS`. Ejemplo: `'2026-07-01 14:30:00'`. Se usa `datetime('now', 'localtime')` para generar automáticamente `created_at` y `fecha` se almacena al crear la transacción.

- **Criterios de aceptación**
- [ ] La base de datos se crea automáticamente al iniciar la app si no existe.
- [ ] Los datos de prueba (mockData) se cargan como semilla al crear la base de datos.
- [ ] Se puede insertar un usuario, cuentas, categorías y transacciones.
- [ ] Las consultas de agregación por período devuelven los totales correctos.
- [ ] Al eliminar una categoría, se eliminan las transacciones asociadas.
- [ ] Al eliminar una cuenta, se eliminan las transacciones asociadas.
- [ ] Al eliminar un usuario, se eliminan todos sus datos asociados.
- [ ] Las inserciones y consultas no bloquean la interfaz de usuario.
- [ ] Los nombres de tipos TypeScript coinciden con los existentes: `Cuenta`, `Categoria`, `Transaccion`.
