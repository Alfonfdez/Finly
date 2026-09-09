# Finly

[English](README.md) · [Español](README.es.md) · [Català](README.ca.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [Italiano](README.it.md)

**Finly** est une application de finances personnelles pour suivre vos revenus et dépenses. Enregistrez ce que vous gagnez et dépensez au jour le jour, organisez-le entre plusieurs comptes et catégories personnalisées, et comprenez votre argent grâce à des graphiques, des filtres par période, des étiquettes et des commentaires.

Tout fonctionne **sur l'appareil** : vos données vivent dans une base de données SQLite locale (sql.js + IndexedDB sur le web), rien ne quitte votre téléphone, et aucun compte ni abonnement n'est requis.

| | |
|---|---|
| **Plateformes** | iOS, Android et Web |
| **Version** | 2.0.0 |
| **Langues** | Anglais, Espagnol, Catalan, Français, Allemand, Portugais et Italien |
| **Données** | 100 % locales (SQLite sur natif, sql.js + IndexedDB sur web) |
| **Thèmes** | Sombre, Clair et Automatique (suit le système) |

## Fonctionnalités

- **Plusieurs comptes** — créez, modifiez et supprimez des comptes, chacun avec sa propre icône, sa couleur et un solde initial facultatif. Un compte spécial **Total** agrège tout.
- **Suivi des revenus et dépenses** — ajoutez des transactions un jour précis avec montant, compte, catégorie, étiquettes, commentaire et une photo facultative.
- **Catégories personnalisées** — choisissez dans une bibliothèque d'icônes et de couleurs, et créez vos propres catégories de dépenses et de revenus.
- **Graphiques** — camembert en anneau avec le total au centre et graphique à barres empilées horizontales, avec une répartition par catégorie affichant les pourcentages.
- **Filtres par période** — Jour, Semaine, Mois, Année et plages personnalisées avec un sélecteur de calendrier.
- **Toutes les transactions** — filtres combinés : type, catégories (multi-sélection), période, compte, étiquettes et recherche avec tri par date ou montant.
- **Étiquettes et commentaires** — étiquetez vos transactions puis filtrez par étiquette ; gérez tous les commentaires de l'app et appliquez des modifications ou des suppressions groupées à plusieurs transactions à la fois.
- **Photos** — joignez une photo à une transaction depuis la galerie sur toutes les plateformes (appareil photo sur iOS et Android).
- **Actions groupées** — multi-sélectionnez et supprimez des transactions, étiquettes, commentaires et catégories en une seule fois.
- **Sauvegarde de données** — exportez toute votre base de données sous forme d'instantané JSON et réimportez-la à tout moment.
- **Réglages** — thème, taille du texte, devise, séparateur décimal, langue, premier jour de la semaine, formes d'icônes, valeurs par défaut de l'accueil et de l'ajout de transaction, et options de confidentialité pour masquer les soldes.
- **Calculatrice intégrée** — une petite calculatrice sur l'écran d'ajout de transaction pour calculer les montants.

## Captures d'écran

![Écran d'accueil](images/screenshots/v2-01-a-home-empty.png)<br>*Écran d'accueil avant la configuration d'un compte.*<br><br>
![Écran d'accueil](images/screenshots/v2-01-b-home.png)<br>*Écran d'accueil avec comptes, camembert en anneau et répartition par catégorie.*<br><br>
![Menu hamburger](images/screenshots/v2-02-hamburger.png)<br>*Menu latéral avec Accueil, Comptes, Catégories, Étiquettes, Commentaires, Toutes les transactions et Réglages.*<br><br>
![Ajouter une transaction](images/screenshots/v2-03-add-transaction.png)<br>*Ajoutez une dépense ou un revenu avec montant, compte, catégorie, jour, étiquettes, commentaire et photo.*<br><br>
![Sélecteur de date](images/screenshots/v2-04-date-picker.png)<br>*Sélecteur de calendrier pour choisir un jour, une semaine, un mois, une année ou une plage de période personnalisée.*<br><br>
![Catégories](images/screenshots/v2-05-categories.png)<br>*Catégories organisées par type (dépenses/revenus) dans une grille de 4×N.*<br><br>
![Étiquettes](images/screenshots/v2-06-tags.png)<br>*Écran des étiquettes avec recherche et sélection groupée.*<br><br>
![Toutes les transactions, vide](images/screenshots/v2-07-a-all-transactions-empty-state.png)<br>*Toutes les transactions à l'état vide.*<br><br>
![Toutes les transactions](images/screenshots/v2-07-b-all-transactions.png)<br>*Toutes les transactions avec filtres de type, catégorie, période et étiquettes, plus le tri et la recherche.*<br><br>
![Comptes](images/screenshots/v2-08-accounts.png)<br>*Écran des comptes avec soldes et le compte Total agrégé.*<br><br>
![Détails d'un revenu](images/screenshots/v2-09-a-details-income.png)<br>*Détails d'une transaction de revenu avec modification et suppression.*<br><br>
![Détails d'une dépense](images/screenshots/v2-09-b-details-expense.png)<br>*Détails d'une transaction de dépense avec modification et suppression.*<br><br>
![Réglages](images/screenshots/v2-10-settings.png)<br>*Réglages : Apparence, Régional, Personnalisation et Données.*<br><br>
![Réglages régionaux](images/screenshots/v2-11-regional-en.png)<br>*Réglages régionaux : langue, devise, séparateur décimal et premier jour de la semaine.*<br><br>
![Réglages d'apparence](images/screenshots/v2-12-settings-appearance.png)<br>*Apparence : thème, taille du texte et formes des icônes.*<br><br>
![Réglages de personnalisation](images/screenshots/v2-13-settings-personalization.png)<br>*Personnalisation : valeurs par défaut de l'accueil et de l'ajout de transaction, plus confidentialité.*<br><br>
![Réglages des données](images/screenshots/v2-14-settings-data.png)<br>*Données : export/import de la sauvegarde et actions de suppression/réinitialisation.*<br><br>

## Pile technique

| Couche | Technologie |
|---|---|
| Framework | React Native avec Expo (SDK 57) |
| Langage | TypeScript |
| Navigation | React Navigation (Stack + Drawer) |
| Icônes | @expo/vector-icons (Ionicons) |
| Graphiques | react-native-svg |
| Sélecteur de couleur | reanimated-color-picker |
| Persistance | SQLite (expo-sqlite) sur natif, sql.js (WASM) + IndexedDB sur web |
| ORM | Drizzle ORM (sqlite-proxy sur un DatabaseHandle partagé) |
| Validation | Schémas Zod comme source de vérité unique pour les lignes stockées |
| Web | react-native-web |
| État | Context API (AppContext + ConfigContext) |
| i18n | Système maison (en, es, ca, fr, de, pt, it) |

## Développement

Cette section est destinée aux contributeurs et à toute personne souhaitant exécuter, forker ou étendre l'app.

### Prérequis

- Node.js 20+ (Node 24 recommandé)
- npm
- Un émulateur Android facultatif (le dossier `android/` est généré par CNG — voir plus bas)

### Première fois après le clonage

```bash
cd FinlyApp
npm install
npx expo start
```

Cela démarre Metro Bundler. Ensuite :

| Pour voir sur… | Faites ceci |
|---|---|
| **Navigateur** | Ouvrez http://localhost:8081 ou exécutez `npx expo start --web` |
| **Android (émulateur)** | Exécutez `npx expo run:android` |
| **iOS (simulateur)** | Exécutez `npx expo run:ios` (macOS uniquement) |

### Commandes

| Commande | Description |
|---|---|
| `npm start` | Démarre Expo en mode développement |
| `npm run web` | Démarre et ouvre dans le navigateur |
| `npm run android` | Démarre sur l'émulateur Android |
| `npm run ios` | Démarre sur le simulateur iOS (macOS uniquement) |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint via `expo lint` |
| `npm test` | Exécute la suite Vitest |
| `npm run test:watch` | Exécute Vitest en mode watch |
| `npm run test:all` | typecheck + lint + tests (le portail local complet) |

### Tests

- **Unitaires / intégration** — Vitest. La suite couvre les dépôts de base de données sur les deux backends SQLite (natif + sql.js), les allers-retours de sauvegarde et les composants rendus avec `@testing-library/react-native`.
- **E2E natives** — les flux Maestro dans `FinlyApp/.maestro/` (10 flux + helpers) s'exécutent contre l'APK de débogage sur un émulateur Android ; voir `docs/harnesses.md`.
- **Vérification web** — les critères d'acceptation de chaque fonctionnalité sont vérifiés dans un vrai navigateur à 375px avec Playwright.
- Le pipeline CI (`.github/workflows/ci.yml`) exécute le portail complet `npm run test:all` à chaque push et pull request sur `develop` et `main`.

> **Portail local :** une modification n'est terminée que lorsque `npm run test:all` passe.

### Structure du projet

```
FinlyApp/
  src/
    components/    — composants d'interface réutilisables
    constants/     — thèmes, types, couleurs, icônes
    context/       — AppContext, ConfigContext (état global)
    database/      — moteurs SQLite/sql.js, dépôts, migrations, schéma Drizzle
    hooks/         — hooks personnalisés
    i18n/          — traductions (en, es, ca, fr, de, pt, it)
    navigation/    — AppNavigator (Drawer + Stack)
    screens/       — composants d'écran (PascalCase)
    utils/         — formateurs, calculatrice, plateforme, langue
  .maestro/        — flux et helpers E2E natifs
```

### Base de données

- Une seule interface de moteur (`DatabaseHandle`) sur toutes les plateformes : expo-sqlite sur natif, sql.js (WASM) avec persistance IndexedDB sur web.
- Les migrations sont versionnées avec `PRAGMA user_version` (`001_initial`, `002_seed`, `003_config`) et appliquées une seule fois, dans une transaction.
- Les dépôts sont écrits avec Drizzle ORM sur le handle partagé ; les lignes stockées sont validées avec des schémas Zod.
- Sur le web, les octets SQLite exportés sont persistés dans IndexedDB, donc les mêmes données survivent aux rechargements.

### Générer un APK / AAB Android (EAS Build)

Nécessite un compte Expo et le CLI EAS :

```bash
npm install -g eas-cli
eas login
cd FinlyApp
```

| Profil | Commande | Résultat |
|---|---|---|
| Development | `eas build --profile development` | build dev-client (interne) |
| Preview | `eas build --platform android --profile preview` | APK installable (interne) |
| Production | `eas build --platform android --profile production --no-wait` | AAB publiable (store) |

Le profil `production` dans `eas.json` utilise `"distribution": "store"` et `"buildType": "app-bundle"`, produisant un AAB pour la soumission au store. Notez que le dossier natif `android/` est généré par Expo CNG (`expo prebuild`) ; vous n'avez normalement pas besoin de le committer.

### Méthodologie

Ce projet utilise le **développement piloté par spécifications (SDD).** Les spécifications vivent dans `spec/` et sont la source de vérité unique — ce qui doit être construit est d'abord défini dans les documents `1-spec.md`, puis implémenté, puis vérifié contre les critères d'acceptation. La feuille de route est suivie dans `spec/constitution/3-roadmap.md`.