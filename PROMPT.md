# Prompt — Copy & Paste for New Sessions

This is the Finly project — a React Native/Expo personal finance app with SQLite (mobile) and sql.js/IndexedDB (web), following Specification-Driven Development (SDD). Follow these steps to get context:

1. Read `AGENTS.md` for rules, tech stack, and conventions.
2. Read `spec/constitution/` files for project mission, tech stack, design system, validations, screens, and platform differences (mobile vs web).
3. Read `spec/features/` files for feature specifications, plans, and task breakdowns.
4. Read `docs/` files for changelog, git workflows, programming concepts, app assets reference, and the verification harnesses in `docs/harnesses.md`.
5. Read project code in `FinlyApp/src/`.
6. Check skills in `.agents/skills/` and apply them when relevant.
7. Use Context7 MCP to look up up-to-date library documentation when working with external packages.
8. After code changes, run `npm run test:all` from `FinlyApp/` (typecheck + lint + unit tests) and follow the harness rules in `docs/harnesses.md`.
9. Any code update must be documented in `docs/changelog.md`.
10. When asked for a commit message, follow the workflow in `docs/git-commands.md` (run `git status` + `git diff --stat`, then generate conventional commit + branch name).
11. Always consult the developer before adding, modifying, or deleting code. Wait for verification.
