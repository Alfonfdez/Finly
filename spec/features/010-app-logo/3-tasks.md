# Tareas — 010 App logo
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Generación de assets

[ ] T1 — Exportar/crear los 6 archivos PNG desde el diseño original del logo:
  - `icon.png` (1024×1024)
  - `android-icon-foreground.png` (1024×1024)
  - `android-icon-background.png` (1024×1024, color sólido)
  - `android-icon-monochrome.png` (1024×1024, monocromo)
  - `favicon.png` (48×48)
  - `splash-icon.png` (1284×2778)

[ ] T2 — Copiar los 6 archivos a `FinlyApp/assets/`, sobrescribiendo los existentes.

---

### Fase 2 — Configuración

[ ] T3 — Actualizar `FinlyApp/app.json`:
  - Verificar que `expo.icon`, `expo.android.adaptiveIcon` y `expo.web.favicon` apuntan a los archivos correctos.
  - Añadir sección `expo.splash` con `image`, `resizeMode: "contain"` y `backgroundColor`.

---

### Verificación

[ ] T4 — Verificación visual:
  - `npx expo start --web`: comprobar favicon en pestaña y splash al cargar.
  - `npx expo start`: comprobar icono en Expo Go y splash screen al abrir la app.
  - En Android: verificar que el adaptive icon se renderiza correctamente (foreground + background).
