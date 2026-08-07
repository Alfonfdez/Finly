// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const boundaries = require("eslint-plugin-boundaries");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "constants", pattern: "src/constants", partialMatch: false },
        { type: "utils", pattern: "src/utils", partialMatch: false },
        { type: "i18n", pattern: "src/i18n", partialMatch: false },
        { type: "database", pattern: "src/database", partialMatch: false },
        { type: "context", pattern: "src/context", partialMatch: false },
        { type: "hooks", pattern: "src/hooks", partialMatch: false },
        { type: "components", pattern: "src/components", partialMatch: false },
        { type: "screens", pattern: "src/screens", partialMatch: false },
        { type: "navigation", pattern: "src/navigation", partialMatch: false },
      ],
    },
    rules: {
      "boundaries/no-unknown-files": 1,
      "boundaries/dependencies": [2, {
        default: "disallow",
        policies: [
          {
            from: { element: { type: "*" } },
            allow: { to: { module: { origin: "external" } } },
          },
          {
            from: { element: { type: "constants" } },
            allow: { to: { element: { type: "constants" } } },
          },
          {
            from: { element: { type: "utils" } },
            allow: { to: { element: { type: ["utils", "constants", "i18n"] } } },
          },
          {
            from: { element: { type: "utils" } },
            allow: { to: { element: { type: "database" } }, dependency: { kind: "type" } },
          },
          {
            from: { element: { type: "i18n" } },
            allow: { to: { element: { type: ["i18n", "constants"] } } },
          },
          {
            from: { element: { type: "database" } },
            allow: { to: { element: { type: ["database", "constants", "utils"] } } },
          },
          {
            from: { element: { type: "context" } },
            allow: { to: { element: { type: ["context", "constants", "utils", "i18n", "database"] } } },
          },
          {
            from: { element: { type: "hooks" } },
            allow: { to: { element: { type: ["hooks", "constants", "utils", "i18n", "database", "context"] } } },
          },
          {
            from: { element: { type: "components" } },
            allow: { to: { element: { type: ["components", "constants", "utils", "i18n", "database", "context", "hooks"] } } },
          },
          {
            from: { element: { type: "screens" } },
            allow: { to: { element: { type: ["screens", "constants", "utils", "i18n", "database", "context", "hooks", "components"] } } },
          },
          {
            from: { element: { type: "navigation" } },
            allow: { to: { element: { type: ["navigation", "screens", "components", "hooks", "context", "database", "i18n", "utils", "constants"] } } },
          },
        ],
      }],
    },
  },
]);
