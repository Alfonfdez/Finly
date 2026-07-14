# Tareas — 010 App logo
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Generación de assets

[x] T1 — Exportar/crear los 6 archivos PNG desde el diseño original del logo:
  - `icon.png` (1024×1024)
  - `android-icon-foreground.png` (1024×1024)
  - `android-icon-background.png` (1024×1024, color sólido)
  - `android-icon-monochrome.png` (1024×1024, monocromo)
  - `favicon.png` (48×48)
  - `splash-icon.png` (1284×2778)

[x] T2 — Copiar los 6 archivos a `FinlyApp/assets/`, sobrescribiendo los existentes.

---

### Fase 2 — Configuración

[x] T3 — Actualizar `FinlyApp/app.json`:
  - Verificar que `expo.icon`, `expo.android.adaptiveIcon` y `expo.web.favicon` apuntan a los archivos correctos.
  - Añadir sección `expo.splash` con `image`, `resizeMode: "contain"` y `backgroundColor`.

[x] T3c — Actualizar `App.tsx`:
  - Crear componente `SplashScreen` con logo (80×80, borderRadius 20), texto "Finly" (color primario, fontWeight 800) y barra de progreso lineal.
  - Animación de entrada: logo fade-in (800ms) + spring scale-up, texto fade-in (600ms) con delay 500ms.
  - Barra de progreso: 120px × 2px, track gris, fill cyan, se llena en el 80% del tiempo mínimo.
  - Animación de salida: fade-out + scale-up (400ms) antes de mostrar la app.
  - MIN_SPLASH_MS = 3000ms. Reemplazar los dos bloques `loading` por `<SplashScreen />`.

[x] T3b — Actualizar `src/navigation/AppNavigator.tsx`:
  - Añadir import de `Image` desde `react-native`.
  - Añadir `<Image source={require('../../assets/icon.png')}>` en el drawer header junto al texto "Finly".
  - Añadir estilo `drawerLogo` (36×36, borderRadius 10).
  - FlexDirection row, alignItems center, gap 12 en `drawerHeader`.

---

### Verificación

[ ] T4 — Verificación visual:
  - `npx expo start --web`: comprobar favicon en pestaña y splash al cargar.
  - `npx expo start`: comprobar icono en Expo Go y splash screen al abrir la app.
  - En Android: verificar que el adaptive icon se renderiza correctamente (foreground + background).
