# Finly

[English](README.md) · [Español](README.es.md) · [Català](README.ca.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [Italiano](README.it.md)

**Finly** ist eine App für persönliche Finanzen, um Einnahmen und Ausgaben im Blick zu behalten. Erfassen Sie, was Sie Tag für Tag verdienen und ausgeben, organisieren Sie es in mehreren Konten und eigenen Kategorien, und verstehen Sie Ihr Geld dank Diagrammen, Zeitraum-Filtern, Tags und Kommentaren.

Alles läuft **auf dem Gerät**: Ihre Daten leben in einer lokalen SQLite-Datenbank (sql.js + IndexedDB im Web), nichts verlässt Ihr Telefon, und Konto oder Abo werden nicht benötigt.

| | |
|---|---|
| **Plattformen** | iOS, Android und Web |
| **Version** | 2.0.0 |
| **Sprachen** | Englisch, Spanisch, Katalanisch, Französisch, Deutsch, Portugiesisch und Italienisch |
| **Daten** | 100 % lokal (SQLite nativ, sql.js + IndexedDB im Web) |
| **Designs** | Dunkel, Hell und Automatisch (folgt dem System) |

## Funktionen

- **Mehrere Konten** — Konten erstellen, bearbeiten und löschen, jedes mit eigenem Icon, eigener Farbe und optionalem Startguthaben. Ein spezielles **Gesamt**-Konto summiert alles.
- **Einnahmen- und Ausgabenerfassung** — Transaktionen an einem bestimmten Tag mit Betrag, Konto, Kategorie, Tags, Kommentar und optionalem Foto hinzufügen.
- **Eigene Kategorien** — aus einer Bibliothek von Icons und Farben wählen und eigene Ausgaben- und Einnahmen-Kategorien erstellen.
- **Diagramme** — Donut-Diagramm mit dem Gesamtbetrag in der Mitte und horizontales gestapeltes Balkendiagramm, mit einer Aufschlüsselung nach Kategorie, die Prozentsätze anzeigt.
- **Zeitraum-Filter** — Tag, Woche, Monat, Jahr und frei wählbare Bereiche mit Kalenderauswahl.
- **Alle Transaktionen** — kombinierte Filter: Typ, Kategorien (Mehrfachauswahl), Zeitraum, Konto, Tags und Suche mit Sortierung nach Datum oder Betrag.
- **Tags und Kommentare** — Transaktionen taggen und nach Tag filtern; alle Kommentare der App verwalten und Massenbearbeitungen oder -löschungen auf mehrere Transaktionen gleichzeitig anwenden.
- **Fotos** — auf allen Plattformen ein Foto aus der Galerie an eine Transaktion anhängen (Kamera auf iOS und Android).
- **Massenaktionen** — Transaktionen, Tags, Kommentare und Kategorien mehrfach auswählen und auf einmal löschen.
- **Datensicherung** — die gesamte Datenbank als JSON-Snapshot exportieren und jederzeit wieder importieren.
- **Einstellungen** — Design, Textgröße, Währung, Dezimaltrennzeichen, Sprache, erster Tag der Woche, Icon-Formen, Start- und Transaktion-hinzufügen-Standardwerte sowie Datenschutzoptionen zum Ausblenden von Guthaben.
- **Integrierter Taschenrechner** — ein kleiner Taschenrechner auf dem Transaktion-hinzufügen-Bildschirm, um Beträge zu berechnen.

## Screenshots

![Startbildschirm](images/screenshots/v2-01-a-home-empty.png)<br>*Startbildschirm, bevor Konten eingerichtet wurden.*<br><br>
![Startbildschirm](images/screenshots/v2-01-b-home.png)<br>*Startbildschirm mit Konten, Donut-Diagramm und Aufschlüsselung nach Kategorie.*<br><br>
![Hamburger-Menü](images/screenshots/v2-02-hamburger.png)<br>*Seitliches Menü mit Startseite, Konten, Kategorien, Tags, Kommentare, Alle Transaktionen und Einstellungen.*<br><br>
![Transaktion hinzufügen](images/screenshots/v2-03-add-transaction.png)<br>*Ausgabe oder Einnahme mit Betrag, Konto, Kategorie, Tag, Tags, Kommentar und Foto hinzufügen.*<br><br>
![Datumsauswahl](images/screenshots/v2-04-date-picker.png)<br>*Kalenderauswahl, um einen Tag, eine Woche, einen Monat, ein Jahr oder einen freien Zeitraum zu wählen.*<br><br>
![Kategorien](images/screenshots/v2-05-categories.png)<br>*Kategorien nach Typ (Ausgaben/Einnahmen) in einem 4×N-Raster organisiert.*<br><br>
![Tags](images/screenshots/v2-06-tags.png)<br>*Tags-Bildschirm mit Suche und Massenauswahl.*<br><br>
![Alle Transaktionen, leer](images/screenshots/v2-07-a-all-transactions-empty-state.png)<br>*Alle Transaktionen im Leerzustand.*<br><br>
![Alle Transaktionen](images/screenshots/v2-07-b-all-transactions.png)<br>*Alle Transaktionen mit Typ-, Kategorie-, Zeitraum- und Tag-Filtern sowie Sortierung und Suche.*<br><br>
![Konten](images/screenshots/v2-08-accounts.png)<br>*Konten-Bildschirm mit Guthaben und aggregiertem Gesamt-Konto.*<br><br>
![Einnahmen-Details](images/screenshots/v2-09-a-details-income.png)<br>*Details einer Einnahmen-Transaktion mit Bearbeiten und Löschen.*<br><br>
![Ausgaben-Details](images/screenshots/v2-09-b-details-expense.png)<br>*Details einer Ausgaben-Transaktion mit Bearbeiten und Löschen.*<br><br>
![Einstellungen](images/screenshots/v2-10-settings.png)<br>*Einstellungen: Darstellung, Regional, Personalisierung und Daten.*<br><br>
![Regionale Einstellungen](images/screenshots/v2-11-regional-en.png)<br>*Regionale Einstellungen: Sprache, Währung, Dezimaltrennzeichen und erster Tag der Woche.*<br><br>
![Darstellungs-Einstellungen](images/screenshots/v2-12-settings-appearance.png)<br>*Darstellung: Design, Textgröße und Icon-Formen.*<br><br>
![Personalisierungs-Einstellungen](images/screenshots/v2-13-settings-personalization.png)<br>*Personalisierung: Start- und Transaktion-hinzufügen-Standardwerte sowie Datenschutz.*<br><br>
![Daten-Einstellungen](images/screenshots/v2-14-settings-data.png)<br>*Daten: Sicherungs-Export/Import und Lösch-/Reset-Aktionen.*<br><br>

## Technologie-Stack

| Schicht | Technologie |
|---|---|
| Framework | React Native mit Expo (SDK 57) |
| Sprache | TypeScript |
| Navigation | React Navigation (Stack + Drawer) |
| Icons | @expo/vector-icons (Ionicons) |
| Diagramme | react-native-svg |
| Farbauswahl | reanimated-color-picker |
| Persistenz | SQLite (expo-sqlite) nativ, sql.js (WASM) + IndexedDB im Web |
| ORM | Drizzle ORM (sqlite-proxy über einem gemeinsamen DatabaseHandle) |
| Validierung | Zod-Schemas als einzige Quelle der Wahrheit für gespeicherte Zeilen |
| Web | react-native-web |
| State | Context API (AppContext + ConfigContext) |
| i18n | Eigenes System (en, es, ca, fr, de, pt, it) |

## Entwicklung

Dieser Abschnitt ist für Mitwirkende und für alle, die die App ausführen, forken oder erweitern möchten.

### Voraussetzungen

- Node.js 20+ (Node 24 empfohlen)
- npm
- Ein optionaler Android-Emulator (der Ordner `android/` wird von CNG generiert — siehe unten)

### Erstes Mal nach dem Klonen

```bash
cd FinlyApp
npm install
npx expo start
```

Das startet den Metro Bundler. Danach:

| Zum Ansehen auf… | Tun Sie dies |
|---|---|
| **Browser** | Öffnen Sie http://localhost:8081 oder führen Sie `npx expo start --web` aus |
| **Android (Emulator)** | Führen Sie `npx expo run:android` aus |
| **iOS (Simulator)** | Führen Sie `npx expo run:ios` aus (nur macOS) |

### Befehle

| Befehl | Beschreibung |
|---|---|
| `npm start` | Startet Expo im Entwicklungsmodus |
| `npm run web` | Startet und öffnet im Browser |
| `npm run android` | Startet auf dem Android-Emulator |
| `npm run ios` | Startet auf dem iOS-Simulator (nur macOS) |
| `npm run typecheck` | TypeScript-Prüfung (`tsc --noEmit`) |
| `npm run lint` | ESLint über `expo lint` |
| `npm test` | Führt die Vitest-Suite aus |
| `npm run test:watch` | Führt Vitest im Watch-Modus aus |
| `npm run test:all` | typecheck + lint + tests (die vollständige lokale Prüfung) |

### Tests

- **Unit-/Integrationstests** — Vitest. Die Suite deckt die Datenbank-Repositories auf beiden SQLite-Backends (nativ + sql.js), die Sicherungs-Roundtrips und mit `@testing-library/react-native` gerenderte Komponenten ab.
- **Natives E2E** — Maestro-Flows in `FinlyApp/.maestro/` (10 Flows + Helfer) laufen gegen die Debug-APK auf einem Android-Emulator; siehe `docs/harnesses.md`.
- **Web-Verifizierung** — die Akzeptanzkriterien jeder Funktion werden in einem echten Browser bei 375px mit Playwright verifiziert.
- Die CI-Pipeline (`.github/workflows/ci.yml`) führt das vollständige Tor `npm run test:all` bei jedem Push und jeder Pull Request auf `develop` und `main` aus.

> **Lokales Tor:** Eine Änderung ist erst fertig, wenn `npm run test:all` besteht.

### Projektstruktur

```
FinlyApp/
  src/
    components/    — Wiederverwendbare UI-Komponenten
    constants/     — Designs, Typen, Farben, Icons
    context/       — AppContext, ConfigContext (globaler State)
    database/      — SQLite/sql.js-Engines, Repositories, Migrationen, Drizzle-Schema
    hooks/         — Eigene Hooks
    i18n/          — Übersetzungen (en, es, ca, fr, de, pt, it)
    navigation/    — AppNavigator (Drawer + Stack)
    screens/       — Screens-Komponenten (PascalCase)
    utils/         — Formatter, Taschenrechner, Plattform, Sprache
  .maestro/        — Native E2E-Flows und Helfer
```

### Datenbank

- Eine einzige Engine-Schnittstelle (`DatabaseHandle`) auf allen Plattformen: expo-sqlite nativ, sql.js (WASM) mit IndexedDB-Persistenz im Web.
- Migrationen werden mit `PRAGMA user_version` versioniert (`001_initial`, `002_seed`, `003_config`) und genau einmal innerhalb einer Transaktion angewendet.
- Die Repositories sind mit Drizzle ORM über dem gemeinsamen Handle geschrieben; gespeicherte Zeilen werden mit Zod-Schemas validiert.
- Im Web werden die exportierten SQLite-Bytes in IndexedDB persistiert, sodass dieselben Daten Neuladungen überleben.

### Ein Android-APK / AAB erzeugen (EAS Build)

Erfordert ein Expo-Konto und das EAS-CLI:

```bash
npm install -g eas-cli
eas login
cd FinlyApp
```

| Profil | Befehl | Ergebnis |
|---|---|---|
| Development | `eas build --profile development` | Dev-Client-Build (intern) |
| Preview | `eas build --platform android --profile preview` | Installierbares APK (intern) |
| Production | `eas build --platform android --profile production --no-wait` | Veröffentlichbares AAB (Store) |

Das Profil `production` in `eas.json` verwendet `"distribution": "store"` und `"buildType": "app-bundle"` und erzeugt ein AAB für die Store-Einreichung. Beachten Sie, dass der native Ordner `android/` von Expo CNG (`expo prebuild`) generiert wird; normalerweise müssen Sie ihn nicht einchecken.

### Methodik

Dieses Projekt verwendet **Specification-Driven Development (SDD).** Die Spezifikationen leben in `spec/` und sind die einzige Quelle der Wahrheit — zuerst wird in den `1-spec.md`-Dokumenten definiert, was gebaut werden soll, dann wird es implementiert und schließlich gegen die Akzeptanzkriterien verifiziert. Die Roadmap wird in `spec/constitution/3-roadmap.md` verfolgt.