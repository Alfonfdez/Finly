# Finly

[🇬🇧 English](README.md)

App para gestionar ingresos y gastos personales con múltiples cuentas, categorías personalizables, filtros por período y gráficos visuales.

![Vista previa de la app](images/excalidraw/Finly_v2.png)

## Metodología

**Specification-Driven Development (SDD).** Las especificaciones están en `spec/` y son la única fuente de verdad. Primero se define qué construir, luego se implementa.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React Native con Expo (SDK 54) |
| Lenguaje | TypeScript |
| Navegación | React Navigation (Stack + Drawer) |
| Iconos | @expo/vector-icons (Ionicons) |
| Gráficos | react-native-svg |
| Color picker | reanimated-color-picker |
| Persistencia | SQLite (expo-sqlite) en nativo, localStorage en web |
| Web | react-native-web |
| Estado | Context API (AppContext + ConfigContext) |
| i18n | Sistema propio (español, inglés, catalán) |

## Cómo empezar

### Requisitos

- Node.js 18+
- npm
- Expo Go (app móvil gratuita) para verlo en el móvil

### Primera vez al clonar

```bash
cd FinlyApp
npm install
npx expo start
```

Esto arranca Metro Bundler. A partir de ahí:

| Para ver en… | Haz esto |
|---|---|
| **Navegador** | Abre [http://localhost:8081](http://localhost:8081) o ejecuta `npx expo start --web` |
| **Móvil (Expo Go)** | Pulsa la tecla **`s`** en la terminal y escanéa el QR con Expo Go |

> Si `expo` no se reconoce como comando, usa `npx expo ...` o `npm run web`.

### Notas importantes

- Este proyecto usa **Expo SDK 54** por compatibilidad con Expo Go. No actualices el SDK ni ejecutes `npm audit fix --force` (rompe las versiones).
- Si al escanear el QR en Expo Go no pasa nada, asegúrate de haber pulsado **`s`** para cambiar a modo Expo Go (el mensaje debe poner "Scan the QR code to open in Expo Go").
- Si da error `TurboModule method "installTurboModule"`, ejecuta:
  ```bash
  npx expo install react-native-worklets@0.5.1
  ```

### Otros comandos

| Comando | Descripción |
|---|---|
| `npm start` | Arranca Expo en modo desarrollo |
| `npm run web` | Arranca y abre en navegador |
| `npm run android` | Arranca en emulador Android |
| `npm run ios` | Arranca en simulador iOS (solo macOS) |

### Desarrollo por USB (sin red compartida)

Útil cuando el PC y el móvil no están en la misma red (ej. en clase).

**Requisitos previos:**
- Habilitar depuración USB en el móvil: Ajustes → Acerca del teléfono → tocar "Número de compilación" 7 veces → Ajustes → Opciones del desarrollador → activar "Depuración USB"
- Descargar `adb` (Android Debug Bridge):
  ```bash
  Invoke-WebRequest -Uri "https://dl.google.com/android/repository/platform-tools-latest-windows.zip" -OutFile "$env:TEMP\platform-tools.zip"
  Expand-Archive -Path "$env:TEMP\platform-tools.zip" -DestinationPath "C:\platform-tools" -Force
  ```
- Para que `adb` esté disponible globalmente, reiniciar la terminal después de la instalación.

**Pasos:**
1. Conectar el móvil al PC con cable USB
2. Reenviar el puerto con adb:
   ```bash
   C:\platform-tools\adb.exe reverse tcp:8081 tcp:8081
   ```
3. Arrancar Expo:
   ```bash
   npx expo start
   ```
4. En Expo Go: agitar el móvil → "Introducir URL manualmente" → escribir:
   ```
   exp://localhost:8081
   ```

### Desarrollo por USB Tethering (sin ADB, sin red compartida)

Alternativa cuando ADB no detecta el móvil (ej. drivers no instalados, cable sin datos).

**Requisito:** Datos móviles activos en el teléfono.

**Pasos:**
1. Conectar el móvil al PC con cable USB
2. En el móvil: **Ajustes → Conexiones → Zona WiFi compartida / USB tethering → activar "USB tethering"**
3. En el PC, arrancar Expo:
   ```bash
   npx expo start
   ```
4. Pulsar **`s`** para cambiar a modo Expo Go y escanear el QR

El PC navega a través de los datos del móvil, por lo que ambos dispositivos están en la misma red virtual. No requiere ADB ni `adb reverse`.

### Desarrollo por Tunnel (sin red compartida, sin cable)

```bash
npx expo start --tunnel
```
Requiere `@expo/ngrok` instalado globalmente (`npm install -g @expo/ngrok`). Funciona desde cualquier red pero es más lento.

## Generar APK Android

Para compilar una APK instalable en un teléfono sin Expo Go, se usa **EAS Build** (Expo Application Services).

### Requisitos

- Cuenta gratuita en [expo.dev](https://expo.dev)
- Instalar EAS CLI:
  ```bash
  npm install -g eas-cli
  ```
- Iniciar sesión:
  ```bash
  eas login
  ```

### Generar la APK

```bash
cd FinlyApp
eas build --platform android --profile preview
```

El perfil `preview` en `eas.json` está configurado con `"distribution": "internal"`, lo que genera una **APK** (en lugar de AAB). El proceso tarda unos minutos en la nube.

Cuando termine, EAS devolverá un **enlace de descarga**. Ábrelo desde el teléfono para descargar la APK.

### Instalar la APK en el teléfono

1. Descargar el archivo `.apk` desde el enlace de EAS
2. Abrirlo desde el gestor de archivos del teléfono
3. Si el sistema lo solicita, activar **"Instalar de fuentes desconocidas"** en Ajustes → Seguridad
4. Abrir la app desde el cajón de aplicaciones

### Notas

- La APK de `preview` es para **testing interno**, no para publicar en Google Play.
- Para publicar en Google Play se necesita un perfil `production` con AAB: `eas build --platform android --profile production`.
- La app usa **SQLite nativo** en Android. Los datos no se comparten entre la APK y Expo Go (cada una tiene su propia base de datos).
- Si la APK muestra pantalla negra al abrir, revisa que las migraciones de la base de datos no fallen. Los errores se muestran en pantalla durante el desarrollo.

## Funcionalidades

- Gestión de múltiples cuentas (crear, editar, eliminar)
- Registro de ingresos y gastos por categorías
- Listado y edición de categorías personalizadas con icono y color
- Filtros por período: Día, Semana, Mes, Año, Período personalizado
- Selector de fecha interactivo (DateTimePicker)
- Gráfico de anillos (donut) y barra horizontal apilada
- Desglose por categorías con porcentajes
- Selector de cuenta reutilizable con cálculo de saldos
- Ordenación de transacciones por fecha o cantidad
- Pantalla de todas las transacciones con filtros combinados
- Pantalla de detalles de transacción con eliminar y editar
- Pantalla de modificar transacción con datos precargados
- Pantalla de ajustes: tema, divisa, idioma, calendario, tamaño de texto
- Tema oscuro y claro con cambio en tiempo real
- Soporte multilingüe: español, inglés, catalán
- Escalado de texto según preferencias del usuario
- Navegación con menú lateral (Drawer)
- Calculadora básica integrada

## Screenshots

![App flow](images/screenshots/app-flow.gif)<br>*Recorrido completo por la aplicación: pantalla principal, menú lateral, transacciones, ajustes y más.*<br><br>

![Splash animation](images/screenshots/000-Splash_animation.png)<br>*Animación de carga con el logotipo de Finly y barra de progreso.*<br><br>
![Home screen](images/screenshots/001-Home_screen.png)<br>*Pantalla principal con selector de cuenta, saldo total, gráfico de anillos y desglose por categorías.*<br><br>
![Hamburger menu](images/screenshots/002-Hamburguer-menu.png)<br>*Menú lateral (Drawer) con acceso a Inicio, Ajustes, Transacciones, Categorías y Cuentas.*<br><br>
![Account selector modal](images/screenshots/003-Choose_accounts.png)<br>*Modal de selección de cuenta con icono, nombre y saldo disponible.*<br><br>
![Add transaction](images/screenshots/004-Add_transaction.png)<br>*Formulario para añadir un gasto o ingreso con cantidad, cuenta, categorías, día, etiquetas y comentario.*<br><br>
![Create category](images/screenshots/005-Create_category.png)<br>*Pantalla para crear una categoría personalizada con icono, color y nombre.*<br><br>
![Categories list](images/screenshots/006-Categories.png)<br>*Listado de categorías organizadas por tipo (gastos/ingresos) en un grid 4×N.*<br><br>
![All transactions](images/screenshots/007-All_transactions.png)<br>*Listado completo de todas las transacciones con selector de cuenta, ordenación y agrupación por día.*<br><br>
![Settings](images/screenshots/008-Settings.png)<br>*Pantalla de ajustes con configuración de tema, divisa, idioma, tamaño de texto y forma de iconos.*<br><br>
![Calendar period selection](images/screenshots/009-calendar_period_selection.png)<br>*Selector de período personalizado con calendario para elegir un rango de fechas.*
