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
- `expo.splash` (añadir si no existe):
  - `image` → `"./assets/splash-icon.png"`
  - `resizeMode` → `"contain"`
  - `backgroundColor` → color de fondo que combine con el diseño del logo.

### 4. Drawer header

- El header del Drawer (en `AppNavigator.tsx`) muestra el texto "Finly" en grande.
- Opcionalmente, puede reemplazarse por el logo como imagen (para un futuro refinamiento visual).

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
- [ ] La splash screen usa el color de fondo configurado en `app.json`.
- [ ] Todos los archivos están referenciados correctamente en `app.json`.
