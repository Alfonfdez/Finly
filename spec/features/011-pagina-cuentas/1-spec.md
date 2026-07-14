# 011 — Página de cuentas

- **Objetivo**
  Pantalla accesible desde el Drawer (menú hamburguesa) que muestre todas las cuentas existentes con su saldo y permita navegar a la modificación de cada cuenta. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde el ítem "Cuentas" del Drawer Navigator (menú hamburguesa), actualmente placeholder con `onPress={() => {}}`.
- El header tiene un botón de menú hamburguesa a la izquierda para abrir/cerrar el Drawer.
- El título del header es "Cuentas" (multilingual, clave `nav_accounts` ya existente).

### 2. Total general

- Debajo del header, se muestra una sección con el texto "Total:" (multilingual) y el saldo total acumulado de todas las cuentas.
- El saldo total se calcula sumando `initial_balance` más ingresos menos gastos de cada cuenta.
- El color del total sigue la regla: verde si >= 0, rojo si < 0.

### 3. Lista de cuentas

- Debajo del total, se muestra una lista (FlatList o ScrollView) con una fila por cada cuenta.
- Cada fila contiene:
  - **Primera fila** (siempre visible): icono de la cuenta con su color de fondo a la izquierda, nombre de la cuenta en el centro, saldo actual formateado con la divisa activa a la derecha.
  - **Segunda fila** (solo si la cuenta tiene nota): texto de la nota debajo del nombre, en color `textoSuave` y tamaño reducido, ocupa el ancho disponible.
- La fila completa es un `TouchableOpacity` que al pulsarla navega a `ModifyAccountScreen` (012) con el `accountId` como parámetro.
- Si no hay cuentas, se muestra un estado vacío con icono y mensaje.

### 4. Botón flotante "+"

- Botón flotante (FAB) en la esquina inferior derecha con icono "+".
- Al pulsar, navega a `CreateAccountScreen` (013) para crear una nueva cuenta.
- El botón usa el color primario como fondo.
- El botón se superpone sobre la lista de cuentas (position absolute).

### 5. Persistencia

- Las cuentas se cargan desde `accountRepository.list()` con el usuario activo.
- Los saldos se obtienen con `accountRepository.getCurrentBalance()`.
- **Refresco después de mutaciones**: tras crear o modificar una cuenta (013 y 012), se debe invocar `refreshAccounts()` del `AppContext` para que la lista de cuentas en el HomeScreen (AccountModal) se actualice inmediatamente.

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles deben usar `t()` del sistema i18n existente.
- **Configuración**: usar `useConfig().activeColors` para colores.
- **Texto**: usar `useFontSize()` para escalado.
- **Navegación**: se añade al `HomeStack` en `AppNavigator.tsx` y el `DrawerItem` "Cuentas" se conecta para navegar a ella.
- **Persistencia**: datos desde `accountRepository` (SQLite nativo / localStorage web).
- **Formato monetario**: todos los importes se muestran con máximo 2 decimales usando `formatCurrency()`.

---

## Criterios de aceptación

- [ ] El Drawer muestra "Cuentas" y al pulsarlo navega a la pantalla de cuentas.
- [ ] El header muestra botón de menú hamburguesa y título "Cuentas" en el idioma activo.
- [ ] Se muestra "Total:" con el saldo total de todas las cuentas, en verde si >= 0, rojo si < 0, con máximo 2 decimales.
- [ ] Cada cuenta muestra icono con color de fondo + nombre + saldo formateado.
- [ ] Si la cuenta tiene nota (descripción), se muestra debajo del nombre en color suave y tamaño reducido.
- [ ] Al pulsar una cuenta, se navega a "Modificar cuenta" (012) con el `accountId`.
- [ ] Si no hay cuentas, se muestra estado vacío.
- [ ] El botón flotante "+" navega a "Crear cuenta" (013).
- [ ] Todos los textos cambian al cambiar el idioma.
- [ ] La pantalla respeta el tema activo y el tamaño de texto.
