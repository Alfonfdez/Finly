# 003 — Página de configuración

- **Objetivo**
Una pantalla de ajustes accesible desde el menú hamburguesa (Drawer) que permita al usuario personalizar el comportamiento y la apariencia de la aplicación. Todos los valores tienen un valor por defecto sensato y se persisten localmente (SQLite en nativo, localStorage en web).

---

## Requisitos funcionales

### 1. Acceso
- El Drawer incorpora un item "Ajustes" ya existente (placeholder actualmente).
- Al pulsarlo, navega a la pantalla `SettingsScreen` dentro del Stack.
- La pantalla tiene un botón de retroceso nativo para volver al Home.

### 2. Secciones de configuración

La pantalla se organiza en secciones con encabezado y filas tipo `key → value` con un interruptor, selector o chevron según el tipo.

#### 2.1 — Apariencia

| Opción | Tipo | Valores por defecto | Valores posibles |
|--------|------|---------------------|------------------|
| Tema | Selector (radio) | Oscuro | Oscuro, Claro, Sistema |

- **Oscuro**: usa la paleta actual (Slate 900/800).
- **Claro**: paleta inversa (fondo blanco, texto oscuro, primario mantiene cyan).
- **Sistema**: sigue `Appearance.addChangeListener` de React Native / `prefers-color-scheme` en web.

Al cambiar el tema, toda la app se re-renderiza en tiempo real (no requiere reinicio).

#### 2.2 — Calendario

| Opción | Tipo | Valores por defecto | Valores posibles |
|--------|------|---------------------|------------------|
| Primer día de semana | Selector (radio) | Lunes | Lunes, Domingo |

- Afecta al `DayPicker` (headers y grid) y al `WeekPicker` (cálculo de rangos).
- El `DayPicker` actual tiene un bug de alineación headers/grid (headers en domingo, grid en lunes). Esta opción lo corrige unificando ambos al valor configurado.

#### 2.3 — Formato de dinero

| Opción | Tipo | Valores por defecto | Valores posibles |
|--------|------|---------------------|------------------|
| Divisa | Selector (radio) | Euro € | Euro €, Dólar $, Libra £, Yen ¥ |
| Separador decimal | Selector (radio) | Coma (1.234,56) | Coma (1.234,56), Punto (1,234.56) |

- La divisa afecta al símbolo mostrado en `formatearMoneda` y en todas las pantallas.
- El separador afecta al formato numérico: con coma el decimal es `,` y el miles es `.`; con punto es al revés.
- Formatos resultantes:
  - Coma: `1.234,56 €`
  - Punto: `1,234.56 €`

#### 2.4 — Idioma

| Opción | Tipo | Valores por defecto | Valores posibles |
|--------|------|---------------------|------------------|
| Idioma | Selector (radio) | Español | Español, English |

- Afecta a: nombres de meses, días de la semana, labels de la UI (tabs, botones, placeholder text).
- Por ahora solo se implementa la infraestructura y el cambio de labels estáticos. La traducción completa de toda la app es futuro.

#### 2.5 — Texto

| Opción | Tipo | Valores por defecto | Valores posibles |
|--------|------|---------------------|------------------|
| Tamaño del texto | Selector (radio) | Mediano | Pequeño, Mediano, Grande |

- Modifica un factor de escala global que se aplica al `fontSize` de los textos.
- Valores del factor: Pequeño = 0.85, Mediano = 1.0, Grande = 1.15.
- Se implementa como un `multiplier` en el contexto de configuración que los componentes consultan al renderizar.

#### 2.6 — Aspecto de categorías

| Opción | Tipo | Valores por defecto | Valores posibles |
|--------|------|---------------------|------------------|
| Forma del icono de categoría | Selector (radio) | Cuadrado | Cuadrado, Círculo |

- **Cuadrado**: los iconos de categoría se muestran con fondo cuadrado y esquinas redondeadas (borderRadius 12), que es el diseño actual de la app.
- **Círculo**: los iconos de categoría se muestran con fondo circular (borderRadius igual a la mitad del tamaño), con el icono centrado dentro del círculo.
- Afecta a todos los componentes que muestran iconos de categoría: `CategoryGrid`, `CategoryList`, grid de `CategoriesScreen`, grid de `AddCategoryScreen`, grid de `CreateCategoryScreen`, icono de categoría en el detalle de transacciones, y la vista previa de `ModifyCategoryScreen`.
- La selección de forma no requiere reinicio de la app; se aplica en tiempo real.

#### 2.7 — Aspecto de cuentas

| Opción | Tipo | Valores por defecto | Valores posibles |
|--------|------|---------------------|------------------|
| Forma del icono de cuenta | Selector (radio) | Cuadrado | Cuadrado, Círculo |

- **Cuadrado**: los iconos de cuenta se muestran con fondo cuadrado y esquinas redondeadas (borderRadius 12).
- **Círculo**: los iconos de cuenta se muestran con fondo circular (borderRadius igual a la mitad del tamaño), con el icono centrado dentro del círculo.
- Afecta a todos los componentes que muestran iconos de cuenta: `AccountsScreen` (lista), `HomeScreen` (header), `AccountSelector` (trigger y modal), `AccountModal` (bottom sheet), grid de `CreateAccountScreen`, grid de `ModifyAccountScreen`.
- La selección de forma no requiere reinicio de la app; se aplica en tiempo real.

---

## Requisitos no funcionales

- **Persistencia**: toda configuración se guarda en SQLite tabla `configuracion` (nativo) o `localStorage` (web) con una sola fila clave-valor.
- **Inicialización**: al arrancar la app, se lee la configuración y se aplica antes del primer render (evitar flash de tema incorrecto).
- **Rendimiento**: el cambio de tema debe ser instantáneo; no usar transiciones animadas.
- **Accesibilidad**: cada fila de configuración debe tener `accessibilityLabel` y `accessibilityRole` adecuados.

---

## Criterios de aceptación

- [ ] El Drawer muestra "Ajustes" y al pulsarlo navega a la pantalla de configuración.
- [ ] Se muestran 7 secciones: Apariencia, Calendario, Formato de dinero, Idioma, Texto, Aspecto de categorías, Aspecto de cuentas.
- [ ] Cada opción muestra el valor actual y permite cambiarlo.
- [ ] El tema Oscuro/Claro se aplica inmediatamente a toda la app.
- [ ] El tema Sistema respeta la preferencia del SO del dispositivo.
- [ ] El calendario comienza en Lunes por defecto; al cambiar a Domingo, DayPicker y WeekPicker se ajustan.
- [ ] La divisa por defecto es €; al cambiar a $, todos los importes muestran $.
- [ ] El separador decimal por defecto es coma; al cambiar a punto, los formatos numéricos cambian.
- [ ] El idioma por defecto es Español; al cambiar a English, los labels visibles cambian.
- [ ] El tamaño de texto por defecto es Mediano; al cambiar a Grande/Pequeño, la app se escala.
- [ ] La configuración persiste entre reinicios de la app.
- [ ] En web, la configuración se almacena en localStorage y funciona igual.
