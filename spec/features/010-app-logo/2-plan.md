# Plan de implementación — 010 App logo

## Arquitectura

### Assets (sin cambios estructurales)

Solo se reemplazan los archivos existentes en `FinlyApp/assets/`:

```
FinlyApp/assets/
├── icon.png                  ← Reemplazar (1024×1024)
├── android-icon-foreground.png ← Reemplazar (1024×1024)
├── android-icon-background.png ← Reemplazar (1024×1024, color sólido)
├── android-icon-monochrome.png ← Reemplazar (1024×1024, monocromo)
├── favicon.png               ← Reemplazar (48×48)
└── splash-icon.png           ← Reemplazar (1284×2778)
```

### Archivos modificados

- **`app.json`**: Añadir sección `expo.splash` con `image`, `resizeMode` y `backgroundColor`.
- **`FinlyApp/assets/*`**: Reemplazar los 6 archivos PNG.

### Archivos sin cambios

- No se modifica código fuente (TypeScript, componentes, navegación).
- No se añaden ni modifican repositorios, contextos, ni pantallas.

---

## Flujo de trabajo

1. Diseñar/exportar el logo desde la herramienta de diseño (Figma, Illustrator, etc.).
2. Generar los 6 PNG con las dimensiones exactas.
3. Copiar los archivos a `FinlyApp/assets/` sobrescribiendo los existentes.
4. Actualizar `app.json` con la configuración de splash.
5. Verificar en web (`npx expo start --web`) que favicon y splash se ven correctamente.
6. Verificar en móvil (Expo Go) que el icono de la app y la splash se ven correctamente.

---

## Estimación

- **Tareas**: 4 tareas en 2 fases
- **Tiempo estimado**: 30-60 min (dependiendo de la herramienta de diseño)
