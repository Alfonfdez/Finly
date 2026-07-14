# 010 — App logo (icono de la aplicación)

- **Objetivo**
  Sustituir los iconos genéricos de Expo por el logotipo personalizado de Finly en todos los formatos y plataformas: app icon (iOS/Android), adaptive icon (Android), favicon (web), splash screen y drawer header.

---

## Requisitos funcionales

### 1. Formato y dimensiones

- El logo original se proporciona en un formato editable (PNG o SVG).
- A partir del original se generan 6 archivos PNG en `FinlyApp/assets/`:

| Archivo | Dimensiones (px) | Uso |
|---|---|---|
| `icon.png` | 1024 × 1024 | App icon principal (iOS home screen, Android non-adaptive, Expo manifest) |
| `android-icon-foreground.png` | 1024 × 1024 | Capa frontal del adaptive icon de Android |
| `android-icon-background.png` | 1024 × 1024 | Capa de fondo del adaptive icon de Android (color sólido) |
| `android-icon-monochrome.png` | 1024 × 1024 | Versión monochrome para Android themed icons (API 33+) |
| `favicon.png` | 48 × 48 | Icono de pestaña del navegador web |
| `splash-icon.png` | 1284 × 2778 | Icono central de la pantalla de carga (splash screen) |

> Nota: `splash-icon.png` se centra automáticamente sobre un fondo de color. El color de fondo se configura en `app.json`.

### 2. Diseño del logo

- **Icono**: El logotipo debe ser reconocible incluso a tamaño pequeño (48 px).
- **Fondo adaptive**: `android-icon-background.png` debe ser un color sólido que contraste con el foreground.
- **Monochrome**: `android-icon-monochrome.png` debe ser una versión de un solo color (blanco sobre fondo transparente) que mantenga la silueta reconocible.
- **Splash**: El icono centrado en la splash screen debe ser el mismo que `icon.png` o una versión simplificada.

### 3. Configuración en app.json

- `expo.icon` → `"./assets/icon.png"`
- `expo.android.adaptiveIcon.foregroundImage` → `"./assets/android-icon-foreground.png"`
- `expo.android.adaptiveIcon.backgroundImage` → `"./assets/android-icon-background.png"`
- `expo.android.adaptiveIcon.monochromeImage` → `"./assets/android-icon-monochrome.png"`
- `expo.web.favicon` → `"./assets/favicon.png"`
- `expo.splash`:
  - `image` → `"./assets/splash-icon.png"`
  - `resizeMode` → `"contain"`
  - `backgroundColor` → color de fondo que combine con el diseño del logo.
  - Nota: la splash de `app.json` solo funciona en nativo (Expo Go / builds). En web se usa un componente personalizado (`SplashScreen` en `App.tsx`).

### 3b. Splash screen web

- En web, el splash nativo de Expo no funciona. Se implementa un componente `SplashScreen` en `App.tsx` que se muestra mientras se inicializa la base de datos.
- El componente muestra:
  - Logo (`icon.png`) centrado, 80×80 px, borderRadius 20.
  - Texto "Finly" en color primario (#22D3EE), fontWeight 800, fontSize 28.
  - Barra de progreso lineal debajo del texto (120px ancho × 2px alto, track gris #1E293B, fill cyan #22D3EE) que se llena de izquierda a derecha durante la splash.
- **Animaciones**:
  - **Entrada del logo**: fade-in (800ms) + scale-up con spring (0.8 → 1.0, friction 5, tension 60).
  - **Entrada del texto**: fade-in (600ms) con delay de 500ms respecto al logo.
  - **Barra de progreso**: se llena al 100% en el 80% del tiempo mínimo de splash, con delay inicial de 400ms.
  - **Salida**: fade-out + scale-up (1.0 → 1.1) en 400ms cuando la app está lista.
- Fondo: #0F172A (mismo que el tema oscuro).
- La splash permanece visible un mínimo de 3 segundos (`MIN_SPLASH_MS = 3000`) aunque la base de datos cargue antes, para que sea apreciable visualmente.

### 4. Drawer header

- El header del Drawer (en `AppNavigator.tsx`) muestra el logo (`icon.png`) a la izquierda y el texto "Finly" a la derecha, en una fila horizontal centrada.
- El logo se muestra con tamaño 36×36 px y esquinas redondeadas (borderRadius 10).

---

## Requisitos no funcionales

- **Formato**: Todos los archivos deben ser PNG con fondo transparente donde corresponda.
- **Calidad**: Sin pérdida de calidad visible. Usar PNG-24 o PNG-32.
- **Compatibilidad**: Los archivos deben ser legibles por el sistema de builds de Expo (EAS Build y expo publish).
- **Tamaño**: Cada archivo no debe superar 1 MB.

---

## Criterios de aceptación

- [ ] `assets/icon.png` se muestra como icono de la app en la pantalla de inicio del dispositivo (iOS y Android).
- [ ] `assets/android-icon-foreground.png` + `assets/android-icon-background.png` forman el adaptive icon correctamente en Android 8+.
- [ ] `assets/android-icon-monochrome.png` se muestra correctamente en dispositivos Android con themed icons (API 33+).
- [ ] `assets/favicon.png` se muestra en la pestaña del navegador al abrir la app en web.
- [ ] `assets/splash-icon.png` aparece centrado en la pantalla de carga al iniciar la app.
- [ ] La splash screen nativa (app.json) se muestra al iniciar la app en nativo (Expo Go).
- [ ] En web, se muestra el componente SplashScreen con logo + "Finly" + loader mientras carga la app.
- [ ] Todos los archivos están referenciados correctamente en `app.json`.
- [ ] El drawer header muestra el logo (icon.png) junto al texto "Finly".
- [ ] El favicon se muestra en la pestaña del navegador (puede requerir borrar `dist/` y reiniciar el servidor).
