# Finly

[English](README.md) · [Español](README.es.md) · [Català](README.ca.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [Italiano](README.it.md)

**Finly** é um app de finanças pessoais para acompanhar receitas e despesas. Anote o que você ganha e gasta dia a dia, organize em várias contas e categorias personalizadas, e entenda seu dinheiro com gráficos, filtros por período, etiquetas e comentários.

Tudo funciona **no dispositivo**: seus dados vivem em um banco de dados SQLite local (sql.js + IndexedDB na web), nada sai do seu telefone e não é preciso conta nem assinatura.

| | |
|---|---|
| **Plataformas** | iOS, Android e Web |
| **Versão** | 2.0.0 |
| **Idiomas** | Inglês, Espanhol, Catalão, Francês, Alemão, Português e Italiano |
| **Dados** | 100 % locais (SQLite no nativo, sql.js + IndexedDB na web) |
| **Temas** | Escuro, Claro e Automático (segue o sistema) |

## Funcionalidades

- **Várias contas** — crie, edite e exclua contas, cada uma com seu próprio ícone, cor e saldo inicial opcional. Uma conta especial **Total** agrega tudo.
- **Acompanhamento de receitas e despesas** — adicione transações em um dia específico com valor, conta, categoria, etiquetas, comentário e uma foto opcional.
- **Categorias personalizadas** — escolha em uma biblioteca de ícones e cores, e crie suas próprias categorias de despesas e receitas.
- **Gráficos** — gráfico de rosca com o total no centro e gráfico de barras empilhadas horizontal, com um detalhamento por categorias mostrando porcentagens.
- **Filtros por período** — Dia, Semana, Mês, Ano e intervalos personalizados com seletor de calendário.
- **Todas as transações** — filtros combinados: tipo, categorias (multisseleção), período, conta, etiquetas e busca com ordenação por data ou valor.
- **Etiquetas e comentários** — etiquete suas transações e filtre por etiqueta; gerencie todos os comentários do app e aplique edições ou exclusões em massa a várias transações de uma vez.
- **Fotos** — anexe uma foto a uma transação pela galeria em todas as plataformas (câmera no iOS e Android).
- **Ações em massa** — multisselecione e exclua transações, etiquetas, comentários e categorias de uma só vez.
- **Backup de dados** — exporte todo o banco de dados como um snapshot JSON e importe-o quando quiser.
- **Configurações** — tema, tamanho do texto, moeda, separador decimal, idioma, primeiro dia da semana, formatos dos ícones, valores padrão de início e de adicionar transação, e opções de privacidade para ocultar saldos.
- **Calculadora integrada** — uma pequena calculadora na tela de adicionar transação para calcular valores.

## Capturas de tela

![Tela inicial](images/screenshots/v2-01-a-home-empty.png)<br>*Tela inicial antes de configurar qualquer conta.*<br><br>
![Tela inicial](images/screenshots/v2-01-b-home.png)<br>*Tela inicial com contas, gráfico de rosca e detalhamento por categorias.*<br><br>
![Menu hambúrguer](images/screenshots/v2-02-hamburger.png)<br>*Menu lateral com Início, Contas, Categorias, Etiquetas, Comentários, Todas as transações e Configurações.*<br><br>
![Adicionar transação](images/screenshots/v2-03-add-transaction.png)<br>*Adicione uma despesa ou receita com valor, conta, categoria, dia, etiquetas, comentário e foto.*<br><br>
![Seletor de data](images/screenshots/v2-04-date-picker.png)<br>*Seletor de calendário para escolher um dia, semana, mês, ano ou intervalo de período personalizado.*<br><br>
![Categorias](images/screenshots/v2-05-categories.png)<br>*Categorias organizadas por tipo (despesas/receitas) em uma grade 4×N.*<br><br>
![Etiquetas](images/screenshots/v2-06-tags.png)<br>*Tela de etiquetas com busca e seleção em massa.*<br><br>
![Todas as transações, vazio](images/screenshots/v2-07-a-all-transactions-empty-state.png)<br>*Todas as transações em estado vazio.*<br><br>
![Todas as transações](images/screenshots/v2-07-b-all-transactions.png)<br>*Todas as transações com filtros de tipo, categoria, período e etiquetas, além de ordenação e busca.*<br><br>
![Contas](images/screenshots/v2-08-accounts.png)<br>*Tela de contas com saldos e a conta Total agregada.*<br><br>
![Detalhes de receita](images/screenshots/v2-09-a-details-income.png)<br>*Detalhes de uma transação de receita com edição e exclusão.*<br><br>
![Detalhes de despesa](images/screenshots/v2-09-b-details-expense.png)<br>*Detalhes de uma transação de despesa com edição e exclusão.*<br><br>
![Configurações](images/screenshots/v2-10-settings.png)<br>*Configurações: Aparência, Regional, Personalização e Dados.*<br><br>
![Configurações regionais](images/screenshots/v2-11-regional-en.png)<br>*Configurações regionais: idioma, moeda, separador decimal e primeiro dia da semana.*<br><br>
![Configurações de aparência](images/screenshots/v2-12-settings-appearance.png)<br>*Aparência: tema, tamanho do texto e formatos dos ícones.*<br><br>
![Configurações de personalização](images/screenshots/v2-13-settings-personalization.png)<br>*Personalização: valores padrão de início e de adicionar transação, e privacidade.*<br><br>
![Configurações de dados](images/screenshots/v2-14-settings-data.png)<br>*Dados: exportação/importação de backup e ações de exclusão/reinicialização.*<br><br>

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React Native com Expo (SDK 57) |
| Linguagem | TypeScript |
| Navegação | React Navigation (Stack + Drawer) |
| Ícones | @expo/vector-icons (Ionicons) |
| Gráficos | react-native-svg |
| Seletor de cor | reanimated-color-picker |
| Persistência | SQLite (expo-sqlite) no nativo, sql.js (WASM) + IndexedDB na web |
| ORM | Drizzle ORM (sqlite-proxy sobre um DatabaseHandle compartilhado) |
| Validação | Esquemas Zod como única fonte de verdade para as linhas armazenadas |
| Web | react-native-web |
| Estado | Context API (AppContext + ConfigContext) |
| i18n | Sistema próprio (en, es, ca, fr, de, pt, it) |

## Desenvolvimento

Esta seção é para colaboradores e para qualquer pessoa que queira executar, fazer fork ou ampliar o app.

### Requisitos

- Node.js 20+ (recomendado Node 24)
- npm
- Um emulador de Android opcional (a pasta `android/` é gerada pelo CNG — veja abaixo)

### Primeira vez após clonar

```bash
cd FinlyApp
npm install
npx expo start
```

Isso inicia o Metro Bundler. Depois:

| Para ver em… | Faça isso |
|---|---|
| **Navegador** | Abra http://localhost:8081 ou execute `npx expo start --web` |
| **Android (emulador)** | Execute `npx expo run:android` |
| **iOS (simulador)** | Execute `npx expo run:ios` (somente macOS) |

### Comandos

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o Expo em modo desenvolvimento |
| `npm run web` | Inicia e abre no navegador |
| `npm run android` | Inicia no emulador Android |
| `npm run ios` | Inicia no simulador iOS (somente macOS) |
| `npm run typecheck` | Verificação de TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint via `expo lint` |
| `npm test` | Executa a suíte de testes Vitest |
| `npm run test:watch` | Executa o Vitest em modo watch |
| `npm run test:all` | typecheck + lint + testes (a verificação local completa) |

### Testes

- **Unitários / integração** — Vitest. A suíte cobre os repositórios de banco de dados nos dois backends SQLite (nativo + sql.js), os round-trips de backup e os componentes renderizados com `@testing-library/react-native`.
- **E2E nativos** — os fluxos de Maestro em `FinlyApp/.maestro/` (10 fluxos + helpers) rodam contra o APK de depuração em um emulador Android; veja `docs/harnesses.md`.
- **Verificação web** — os critérios de aceitação de cada funcionalidade são verificados em um navegador real a 375px com Playwright.
- O pipeline de CI (`.github/workflows/ci.yml`) executa o portão completo `npm run test:all` em cada push e pull request para `develop` e `main`.

> **Portão local:** uma mudança só está feita quando `npm run test:all` passa.

### Estrutura do projeto

```
FinlyApp/
  src/
    components/    — componentes de UI reutilizáveis
    constants/     — temas, tipos, cores, ícones
    context/       — AppContext, ConfigContext (estado global)
    database/      — engines SQLite/sql.js, repositórios, migrações, schema Drizzle
    hooks/         — hooks personalizados
    i18n/          — traduções (en, es, ca, fr, de, pt, it)
    navigation/    — AppNavigator (Drawer + Stack)
    screens/       — componentes de tela (PascalCase)
    utils/         — formatadores, calculadora, plataforma, idioma
  .maestro/        — fluxos e helpers E2E nativos
```

### Banco de dados

- Uma única interface de engine (`DatabaseHandle`) em todas as plataformas: expo-sqlite no nativo, sql.js (WASM) com persistência em IndexedDB na web.
- As migrações são versionadas com `PRAGMA user_version` (`001_initial`, `002_seed`, `003_config`) e aplicadas uma única vez, dentro de uma transação.
- Os repositórios são escritos com Drizzle ORM sobre o handle compartilhado; as linhas armazenadas são validadas com esquemas Zod.
- Na web, os bytes SQLite exportados são persistidos em IndexedDB, então os mesmos dados sobrevivem aos recarregamentos.

### Gerar um APK / AAB Android (EAS Build)

Requer uma conta Expo e o CLI do EAS:

```bash
npm install -g eas-cli
eas login
cd FinlyApp
```

| Perfil | Comando | Resultado |
|---|---|---|
| Development | `eas build --profile development` | build de dev-client (interno) |
| Preview | `eas build --platform android --profile preview` | APK instalável (interno) |
| Production | `eas build --platform android --profile production --no-wait` | AAB publicável (loja) |

O perfil `production` no `eas.json` usa `"distribution": "store"` e `"buildType": "app-bundle"`, produzindo um AAB para envio à loja. Observe que a pasta nativa `android/` é gerada pelo Expo CNG (`expo prebuild`); normalmente você não precisa commitá-la.

### Metodologia

Este projeto usa **Desenvolvimento orientado a especificações (SDD).** As especificações vivem em `spec/` e são a única fonte de verdade — primeiro define-se o que construir nos documentos `1-spec.md`, depois implementa-se e, por fim, verifica-se contra os critérios de aceitação. O roadmap é acompanhado em `spec/constitution/3-roadmap.md`.

## Licença

O Finly está licenciado sob a licença MIT — consulte o arquivo [LICENSE](LICENSE).