# Finly

[English](README.md) · [Español](README.es.md)

App personal per gestionar ingressos i despeses amb múltiples comptes, categories personalitzables, filtres per període i gràfics visuals.

![Vista prèvia de l'app](images/excalidraw/Finly_v2.png)

## Metodologia

**Specification-Driven Development (SDD).** Les especificacions es troben a `spec/` i són l'única font de veritat. Primer es defineix què cal construir i després s'implementa.

## Stack

| Capa | Tecnologia |
|---|---|
| Framework | React Native amb Expo (SDK 54) |
| Llenguatge | TypeScript |
| Navegació | React Navigation (Stack + Drawer) |
| Icones | @expo/vector-icons (Ionicons) |
| Gràfics | react-native-svg |
| Color picker | reanimated-color-picker |
| Persistència | SQLite (expo-sqlite) en natiu, sql.js (WASM) + IndexedDB en web |
| Web | react-native-web |
| Estat | Context API (AppContext + ConfigContext) |
| i18n | Sistema propi (català, castellà, anglès) |

## Com començar

### Requisits

- Node.js 18+
- npm
- Expo Go (aplicació mòbil gratuïta) per previsualitzar al telèfon

### Primera vegada després de clonar

```bash
cd FinlyApp
npm install
npx expo start
```

Això inicia Metro Bundler. Després:

| Per veure a… | Feu això |
|---|---|
| **Navegador** | Obriu [http://localhost:8081](http://localhost:8081) o executeu `npx expo start --web` |
| **Mòbil (Expo Go)** | Premeu **`s`** al terminal i escanegeu el codi QR amb Expo Go |

> Si `expo` no es reconeix com una ordre, utilitzeu `npx expo ...` o `npm run web`.

### Notes importants

- Aquest projecte utilitza **Expo SDK 54** per compatibilitat amb Expo Go. No actualitzeu el SDK ni executeu `npm audit fix --force` (trenca les versions).
- Si escanejar el codi QR a Expo Go no fa res, assegureu-vos d'haver premut **`s`** per canviar al mode Expo Go (el missatge ha de dir "Scan the QR code to open in Expo Go").
- Si obteniu un error `TurboModule method "installTurboModule"`, executeu:
  ```bash
  npx expo install react-native-worklets@0.5.1
  ```

### Altres ordres

| Ordre | Descripció |
|---|---|
| `npm start` | Inicia Expo en mode desenvolupament |
| `npm run web` | Inicia i obre al navegador |
| `npm run android` | Inicia a l'emulador d'Android |
| `npm run ios` | Inicia al simulador d'iOS (només macOS) |

### Desenvolupament per USB (sense xarxa compartida)

Útil quan l'ordinador i el telèfon no són a la mateixa xarxa (p. ex., a classe).

**Requisits previs:**
- Activeu la depuració per USB al telèfon: Configuració → Informació del telèfon → toqueu "Número de compilació" 7 vegades → Configuració → Opcions de desenvolupador → activeu "Depuració USB"
- Baixeu `adb` (Android Debug Bridge):
  ```bash
  Invoke-WebRequest -Uri "https://dl.google.com/android/repository/platform-tools-latest-windows.zip" -OutFile "$env:TEMP\platform-tools.zip"
  Expand-Archive -Path "$env:TEMP\platform-tools.zip" -DestinationPath "C:\platform-tools" -Force
  ```
- Reinicieu el terminal després de la instal·lació perquè `adb` estigui disponible globalment.

**Passos:**
1. Connecteu el telèfon a l'ordinador per USB
2. Reenvieu el port amb adb:
   ```bash
   C:\platform-tools\adb.exe reverse tcp:8081 tcp:8081
   ```
3. Inicieu Expo:
   ```bash
   npx expo start
   ```
4. A Expo Go: sacsegeu el telèfon → "Enter URL manually" → escriviu:
   ```
   exp://localhost:8081
   ```

### Desenvolupament per tethering USB (sense ADB, sense xarxa compartida)

Alternativa quan ADB no detecta el telèfon (p. ex., controladors no instal·lats, cable sense dades).

**Requisit:** Dades mòbils actives al telèfon.

**Passos:**
1. Connecteu el telèfon a l'ordinador per USB
2. Al telèfon: **Configuració → Connexions → Mobile Hotspot and Tethering → activeu "USB tethering"**
3. A l'ordinador, inicieu Expo:
   ```bash
   npx expo start
   ```
4. Premeu **`s`** per canviar al mode Expo Go i escanegeu el codi QR

L'ordinador navega a través de les dades del telèfon, de manera que tots dos dispositius són a la mateixa xarxa virtual. No cal ADB ni `adb reverse`.

### Desenvolupament per túnel (sense xarxa compartida, sense cable)

```bash
npx expo start --tunnel
```
Requereix `@expo/ngrok` instal·lat globalment (`npm install -g @expo/ngrok`). Funciona des de qualsevol xarxa però és més lent.

## Generar un APK d'Android

Per crear un APK instal·lable per a telèfons sense Expo Go, utilitzeu **EAS Build** (Expo Application Services).

### Requisits

- Compte gratuït a [expo.dev](https://expo.dev)
- Instal·leu el CLI d'EAS:
  ```bash
  npm install -g eas-cli
  ```
- Inicieu sessió:
  ```bash
  eas login
  ```

### Creeu l'APK

```bash
cd FinlyApp
eas build --platform android --profile preview
```

El perfil `preview` a `eas.json` està configurat amb `"distribution": "internal"`, que genera un **APK** (en lloc d'AAB). El procés triga uns minuts al núvol.

Quan acabi, EAS retorna un **enllaç de descàrrega**. Obriu-lo des del telèfon per baixar l'APK.

### Instal·leu l'APK al telèfon

1. Baixeu el fitxer `.apk` des de l'enllaç d'EAS
2. Obriu-lo des del gestor de fitxers del telèfon
3. Si us ho demana, activeu **"Install from unknown sources"** a Configuració → Seguretat
4. Obriu l'app des del calaix d'aplicacions

### Notes

- L'APK `preview` és per a **proves internes**, no per publicar a Google Play.
- Per publicar a Google Play, cal un perfil `production` amb AAB: `eas build --platform android --profile production`.
- L'app utilitza **SQLite natiu** a Android. Les dades no es comparteixen entre l'APK i Expo Go (cadascun té la seva pròpia base de dades).
- Si l'APK mostra una pantalla negra en iniciar-se, comproveu que les migracions de la base de dades no fallin. Els errors es mostren en pantalla durant el desenvolupament.

## Funcions

- Gestió de múltiples comptes (crear, editar, eliminar)
- Seguiment d'ingressos i despeses per categoria
- Llistat i edició de categories personalitzades amb icona i color
- Filtres per període: Dia, Setmana, Mes, Any, Període personalitzat
- Selector de dates interactiu (DateTimePicker)
- Gràfic de dònut i gràfic de barres apilades horitzontal
- Desglossament per categories amb percentatges
- Selector de comptes reutilitzable amb càlcul de saldo
- Ordenació de transaccions per data o import
- Pantalla de totes les transaccions amb filtres combinats
- Pantalla de detalls de la transacció amb eliminar i editar
- Pantalla de modificar transacció amb dades precarregades
- Pantalla de configuració: tema, moneda, idioma, calendari, mida del text
- Tema fosc i clar amb canvi en temps real
- Suport multilingüe: català, castellà, anglès
- Escalat del text segons les preferències de l'usuari
- Navegació amb Drawer
- Calculadora bàsica integrada

## Captures de pantalla

![App flow](images/screenshots/app-flow.gif)<br>*Recorregut complet de l'app: pantalla d'inici, menú lateral, transaccions, configuració i més.*<br><br>

![Splash animation](images/screenshots/000-Splash_animation.png)<br>*Animació de càrrega amb el logotip de Finly i barra de progrés.*<br><br>
![Home screen](images/screenshots/001-Home_screen.png)<br>*Pantalla d'inici amb selector de comptes, saldo total, gràfic de dònut i desglossament per categories.*<br><br>
![Hamburger menu](images/screenshots/002-Hamburguer-menu.png)<br>*Menú lateral amb accés a Inici, Configuració, Transaccions, Categories i Comptes.*<br><br>
![Account selector modal](images/screenshots/003-Choose_accounts.png)<br>*Selector de comptes amb icona, nom i saldo disponible.*<br><br>
![Add transaction](images/screenshots/004-Add_transaction.png)<br>*Formulari per afegir una despesa o un ingrés amb import, compte, categories, dia, etiquetes i comentari.*<br><br>
![Create category](images/screenshots/005-Create_category.png)<br>*Pantalla per crear una categoria personalitzada amb icona, color i nom.*<br><br>
![Categories list](images/screenshots/006-Categories.png)<br>*Llistat de categories organitzat per tipus (despeses/ingressos) en una graella de 4×N.*<br><br>
![All transactions](images/screenshots/007-All_transactions.png)<br>*Llista completa de transaccions amb selector de comptes, ordenació i agrupació per dies.*<br><br>
![Settings](images/screenshots/008-Settings.png)<br>*Pantalla de configuració amb tema, moneda, idioma, mida del text i forma de les icones.*<br><br>
![Calendar period selection](images/screenshots/009-calendar_period_selection.png)<br>*Selector de període personalitzat amb calendari per triar un interval de dates.*
