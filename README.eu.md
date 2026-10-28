# Finly

[English](README.md) · [Español](README.es.md) · [Català](README.ca.md) · [Galego](README.gl.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [Italiano](README.it.md)

**Finly** finantza pertsonaleko aplikazio bat da, sarrerak eta gastuak kontrolatzeko. Erregistratu irabazten eta gastatzen duzuna gertatzen den egunean, antolatu hainbat kontu eta kategoria pertsonalizaturen artean, eta ulertu zure dirua grafikoen, aldi-iragazkien, etiketen eta iruzkinen bidez.

Dena **gailuan** exekutatzen da: zure datuak tokiko SQLite datu-base batean bizi dira (sql.js + IndexedDB webgunean), ezer ez da zure telefonotik ateratzen, eta ez da konturik edo harpidetzarik behar.

| | |
|---|---|
| **Plataformak** | iOS, Android eta Web |
| **Bertsioa** | 2.2.0 |
| **Hizkuntzak** | Ingelesa, Gaztelania, Katalana, Galiziera, Euskara, Frantsesa, Alemana, Portugesa eta Italiera |
| **Datuak** | % 100 tokikoak (SQLite natiboan, sql.js + IndexedDB webgunean) |
| **Gaiak** | Iluna, Argia eta Automatikoa (sistemari jarraitzen dio) |

## Funtzioak

- **Hainbat kontu** — sortu, editatu eta ezabatu kontuak, bakoitza bere ikono, kolore eta hasierako saldo aukerakoarekin. **Total** kontu berezi batek dena biltzen du.
- **Sarreren eta gastuen jarraipena** — gehitu transakzioak egun jakin batean, zenbateko, kontu, kategoria, etiketa, iruzkin eta aukerako argazki batekin.
- **Kategoria pertsonalizatuak** — aukeratu ikono eta koloreen liburutegi batetik, eta sortu zeure gastu eta sarrera kategoriak.
- **Grafikoak** — donut grafikoa erdian totalarekin eta barra metatu horizontaleko grafikoa, kategoria bakoitzeko ehunekoak erakusten dituen sailkapenarekin.
- **Aldi-iragazkiak** — Eguna, Astea, Hilabetea, Urtea eta tarte pertsonalizatuak egutegi-hautatzailearekin.
- **Transakzio guztiak** — iragazki konbinatuak: mota, kategoriak (hautaketa anizkoitza), aldia, kontua, etiketak eta bilaketa, data edo zenbatekoaren araberako ordenarekin.
- **Etiketak eta iruzkinak** — etiketatu transakzioak eta gero iragazi etiketaren arabera; kudeatu aplikazioko iruzkin guztiak eta aplikatu aldaketak edo ezabaketa masiboak transakzio askori aldi berean.
- **Argazkiak** — erantsi argazki bat transakzio bati galeriatik plataforma guztietan (kamera iOS eta Androiden).
- **Arau errepikakorrak** — bihurtu transakzio bat errepikatzen den programazio bat (egunero, astero, hilero edo urtero, tartea eta amaiera-data aukerakoarekin); falta diren ocurrentziak berez sortzen dira eta arau bakoitza pausatu, berrekin edo editatu daiteke aldaketa etorkizunari soilik edo iraganari ere aplikatuz.
- **Ekintza masiboak** — hautatu anitz eta ezabatu transakzioak, etiketak, iruzkinak eta kategoriak batera.
- **Datuen babeskopia** — esportatu zure datu-base osoa JSON argazki gisa eta inportatu berriro nahi duzunean.
- **Ezarpenak** — gaia, testu-tamaina, moneta, hamartar bereizlea, hizkuntza, asteko lehen eguna, ikono-formak, hasiera eta transakzio-gehiketa lehenetsiak, eta saldoak ezkutatzeko pribatutasun-aukerak.
- **Kalkulagailu integratua** — transakzio-gehiketa pantailan zenbatekoak kalkulatzeko kalkulagailu txiki bat.

## Pantaila-argazkiak

![Hasierako pantaila](images/screenshots/v3.3-01-a-home-empty.png)<br>*Instalazio berria transakziorik gabe.*<br><br>
![Hasierako pantaila](images/screenshots/v3.3-01-b-home.png)<br>*Hasierako pantaila kontuekin, donut grafikoarekin eta kategoria-sailkapenarekin.*<br><br>
![Alboko menua](images/screenshots/v3.3-02-hamburger.png)<br>*Alboko menua: Hasiera, Transakzio guztiak, Errepikariak, Kontuak, Kategoriak, Etiketak, Iruzkinak eta Ezarpenak.*<br><br>
![Transakzioa gehitu](images/screenshots/v3.3-03-add-transaction.png)<br>*Gehitu gastu edo sarrera bat zenbateko, kontu, kategoria, egun, etiketa, iruzkin eta argazkiarekin.*<br><br>
![Data-hautatzailea](images/screenshots/v3.3-04-date-picker.png)<br>*Egutegi-hautatzailea egun, aste, hilabete, urte edo aldi-tarte pertsonalizatua aukeratzeko.*<br><br>
![Transakzio guztiak, hutsik](images/screenshots/v3.3-05-a-all-transactions-empty-state.png)<br>*Transakzio guztiak egoera hutsean.*<br><br>
![Transakzio guztiak](images/screenshots/v3.3-05-b-all-transactions.png)<br>*Transakzio guztiak mota, kategoria, aldi eta etiketa iragazkiekin, ordenarekin eta bilaketarekin.*<br><br>
![Kategoria-iragazkia](images/screenshots/v3.3-05-c-category-filter.png)<br>*Kategoria-iragazkia Kategoria guztiak, Gastu guztiak eta Sarrera guztiak aurre-ezarpenekin.*<br><br>
![Sarrera-xehetasunak](images/screenshots/v3.3-05-d-details-income.png)<br>*Sarrera-transakzio baten xehetasunak, edizio eta ezabaketarekin.*<br><br>
![Gastu-xehetasunak](images/screenshots/v3.3-05-e-details-expense.png)<br>*Gastu-transakzio baten xehetasunak, edizio eta ezabaketarekin.*<br><br>
![Transakzioa editatu](images/screenshots/v3.3-05-f-modify-transaction.png)<br>*Editatu transakzio baten zenbatekoa, kontua, kategoria, eguna, etiketak, iruzkina eta argazkia.*<br><br>
![Errepikariak](images/screenshots/v3.3-06-recurring.png)<br>*Errepikapen-arauak hurrengo epemugekin, zenbatekoekin eta aktibo/pausatuta etengailuekin.*<br><br>
![Errepikapen-arau berria](images/screenshots/v3.3-06-a-create-recurring.png)<br>*Konfiguratu errepikapen-arau bat izenarekin, maiztasunarekin, tartearekin eta aukerako amaiera-datearekin.*<br><br>
![Errepikapen-araua editatu](images/screenshots/v3.3-06-b-modify-recurring.png)<br>*Editatu errepikapen-arau baten programazioa eta aukeratu aldaketa hurrengo errepikapenei soilik edo aurrekoei ere aplikatzen zaien.*<br><br>
![Kontuak](images/screenshots/v3.3-07-accounts.png)<br>*Kontuen pantaila saldoekin eta Total kontu agregatuarekin.*<br><br>
![Kontua sortu](images/screenshots/v3.3-07-a-create-account.png)<br>*Sortu kontu bat izenarekin, ikonoarekin, kolorearekin, hasierako saldoarekin eta aukerako oharrarekin.*<br><br>
![Kontua editatu](images/screenshots/v3.3-07-b-modify-account.png)<br>*Editatu kontu baten datuak, hasierako saldoa eta oharra, edo ezabatu.*<br><br>
![Kategoriak](images/screenshots/v3.3-08-categories.png)<br>*Kategoriak motaren arabera antolatuta (gastuak/sarrerak) 4×N sare batean.*<br><br>
![Kategoria sortu](images/screenshots/v3.3-08-a-create-category.png)<br>*Sortu gastu edo sarrera kategoria bat izenarekin, ikonoarekin eta kolorearekin.*<br><br>
![Kategoria editatu](images/screenshots/v3.3-08-b-modify-category.png)<br>*Editatu kategoria baten izena, ikonoa eta kolorea, edo ezabatu.*<br><br>
![Etiketak](images/screenshots/v3.3-09-tags.png)<br>*Etiketa-pantaila bilaketarekin eta hautaketa masiboarekin.*<br><br>
![Etiketa berria](images/screenshots/v3.3-09-a-create-tag.png)<br>*Sortu etiketa bat transakzioak elkartzeko.*<br><br>
![Etiketa editatu](images/screenshots/v3.3-09-b-modify-tag.png)<br>*Aldatu etiketa baten izena edo ezabatu.*<br><br>
![Iruzkinak](images/screenshots/v3.3-10-comments.png)<br>*Iruzkinen pantaila bilaketarekin, erabilera-kontagailuekin eta hautapen anitzarekin.*<br><br>
![Iruzkina editatu](images/screenshots/v3.3-10-a-modify-comment.png)<br>*Editatu iruzkin bat hura erabiltzen duten transakzio guztietan.*<br><br>
![Ezarpenak](images/screenshots/v3.3-11-settings.png)<br>*Ezarpenak: Itxura, Eskualdea, Pertsonalizazioa eta Datuak.*<br><br>
![Itxura-ezarpenak](images/screenshots/v3.3-11-a-appearance.png)<br>*Itxura: gaia, testu-tamaina eta ikono-formak.*<br><br>
![Eskualde-ezarpenak](images/screenshots/v3.3-11-b-regional-en.png)<br>*Eskualde-ezarpenak: hizkuntza, moneta, hamartar bereizlea eta asteko lehen eguna.*<br><br>
![Pertsonalizazio-ezarpenak](images/screenshots/v3.3-11-c-personalization.png)<br>*Pertsonalizazioa: hasiera eta transakzio-gehiketa lehenetsiak eta pribatutasuna.*<br><br>
![Datu-ezarpenak](images/screenshots/v3.3-11-d-data.png)<br>*Datuak: babeskopia esportatu/inportatu eta ezabatu/berrezarri ekintzak.*<br><br>

## Teknologia-pila

| Geruza | Teknologia |
|---|---|
| Framework | React Native Expo-rekin (SDK 57) |
| Hizkuntza | TypeScript |
| Nabigazioa | React Navigation (Stack + Drawer) |
| Ikonoak | @expo/vector-icons (Ionicons) |
| Grafikoak | react-native-svg |
| Kolore-hautatzailea | reanimated-color-picker |
| Iraunkortasuna | SQLite (expo-sqlite) natiboan, sql.js (WASM) + IndexedDB webgunean |
| ORM | Drizzle ORM (sqlite-proxy DatabaseHandle partekatu baten gainean) |
| Balidazioa | Zod eskemak gordetako errenkaden iturri bakarra |
| Web | react-native-web |
| Egoera | Context API (AppContext + ConfigContext) |
| i18n | Sistema propioa (en, es, ca, gl, eu, fr, de, pt, it) |

## Garapena

Atal hau laguntzaileentzat da, eta aplikazioa exekutatu, fork egin edo zabaldu nahi duenarentzat.

### Betebeharrak

- Node.js 20+ (Node 24 gomendatzen da)
- npm
- Aukerako Android emuladorea (`android/` karpeta CNG-k sortzen du — ikusi behean)

### Klonatu ondorengo lehen aldia

```bash
cd FinlyApp
npm install
npx expo start
```

Honek Metro Bundler abiarazten du. Ondoren:

| Nola ikusi… | Egin hau |
|---|---|
| **Nabigatzailea** | Ireki http://localhost:8081 edo exekutatu `npx expo start --web` |
| **Android (emuladorea)** | Exekutatu `npx expo run:android` |
| **iOS (simulatzailea)** | Exekutatu `npx expo run:ios` (macOS bakarrik) |

### Komandoak

| Komandoa | Azalpena |
|---|---|
| `npm start` | Expo abiarazi garapen moduan |
| `npm run web` | Abiarazi eta ireki nabigatzailean |
| `npm run android` | Abiarazi Android emuladorean |
| `npm run ios` | Abiarazi iOS simulatzailean (macOS bakarrik) |
| `npm run typecheck` | TypeScript egiaztapena (`tsc --noEmit`) |
| `npm run lint` | ESLint `expo lint` bidez |
| `npm test` | Vitest suitea exekutatu |
| `npm run test:watch` | Vitest watch moduan exekutatu |
| `npm run test:all` | typecheck + lint + tests (tokiko ate osoa) |
| `npm run lint:fix` | Konpondu automatikoki lint/format arazoak (koska, komatxoak, amaierako komak, fitxategi amaierako lerro-jauzia) |
| `npm run i18n` | Gehitu, eguneratu, ezabatu edo zerrendatu itzulpen-gakoak 9 hizkuntzetan |

### Probak

- **Unitarioak / integrazioa** — Vitest. Suiteak datu-basearen biltegiratze-guneak estaltzen ditu bi SQLite backendetan (natiboa + sql.js), babeskopiaren joan-etorriak eta `@testing-library/react-native`-rekin errendatutako osagaiak.
- **E2E natiboak** — `FinlyApp/.maestro/`-ko Maestro fluxuak (15 fluxu + laguntzaileak) debug APKaren aurka exekutatzen dira Android emuladore batean; ikusi `docs/harnesses.md`.
- **Web egiaztapena** — funtzionalitate bakoitzaren onarpen-irizpideak benetako nabigatzaile batean egiaztatzen dira 375px-an Playwright-ekin.
- CI pipelineak (`.github/workflows/ci.yml`) `npm run test:all` ate osoa exekutatzen du `develop` eta `main` adarretako push eta pull request bakoitzean.

> **Tokiko atea:** aldaketa bat egina dagoela esaten da `npm run test:all` pasatzen denean bakarrik.

### Proiektuaren egitura

```
FinlyApp/
  src/
    components/    — berrerabilgarriak diren UI osagaiak
    constants/     — gaiak, motak, koloreak, ikonoak
    context/       — AppContext, ConfigContext (egoera globala)
    database/      — SQLite/sql.js motorrak, biltegiratze-guneak, migrazioak, Drizzle eskema
    hooks/         — hook pertsonalizatuak
    i18n/          — itzulpenak (en, es, ca, gl, eu, fr, de, pt, it)
    navigation/    — AppNavigator (Drawer + Stack)
    screens/       — pantaila-osagaiak (PascalCase)
    utils/         — formateatzaileak, kalkulagailua, plataforma, hizkuntza
  .maestro/        — E2E fluxu eta laguntzaile natiboak
```

### Datu-basea

- Motor-interfaze bakarra (`DatabaseHandle`) plataforma guztietan: expo-sqlite natiboan, sql.js (WASM) IndexedDB iraunkortasunarekin webgunean.
- Migrazioak `PRAGMA user_version`-ekin bertsionatzen dira (`001_initial`, `002_seed`, `003_config`, `004_recurring`) eta behin bakarrik aplikatzen dira, transakzio baten barruan.
- Biltegiratze-guneak Drizzle ORM-rekin idatzita daude handle partekatuaren gainean; gordetako errenkadak Zod eskemen bidez balidatzen dira.
- Webgunean, esportatutako SQLite byteak IndexedDBn gordetzen dira, beraz datu berak berriz kargatu ondoren ere irauten dute.

### Android APK / AAB bat sortzea (EAS Build)

Expo kontu bat eta EAS CLI behar dira:

```bash
npm install -g eas-cli
eas login
cd FinlyApp
```

| Profila | Komandoa | Irteera |
|---|---|---|
| Development | `eas build --profile development` | dev-client build-a (barnekoa) |
| Preview | `eas build --platform android --profile preview` | APK instalagarria (barnekoa) |
| Production | `eas build --platform android --profile production --no-wait` | AAB argitaragarria (denda) |

`eas.json`-eko `production` profileak `"distribution": "store"` eta `"buildType": "app-bundle"` erabiltzen ditu, dendara bidaltzeko AAB bat sortuz. Kontuan izan `android/` karpeta natiboa Expo CNG-k sortzen duela (`expo prebuild`); normalean ez duzu commit egin behar.

### Metodologia

Proiektu honek **Espezifikazioetan Oinarritutako Garapena (SDD)** erabiltzen du. Espezifikazioak `spec/`-en bizi dira eta iturri bakarra dira — zer eraiki `1-spec.md` dokumentuetan definitzen da lehenik, gero inplementatu, eta azkenik onarpen-irizpideen aurka egiaztatzen da. Bide-orria `spec/constitution/3-roadmap.md`-n jarraitzen da.

## Lizentzia

Finly MIT Lizentziaren pean dago — ikusi [LICENSE](LICENSE) fitxategia.
