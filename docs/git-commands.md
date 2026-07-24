# Git Commands — Finly

## Important Rules for opencode

opencode must **never** run any of the following git commands. Only the developer performs these actions manually:

- `git commit`
- `git push`
- `git pull`
- `git fetch`
- `git checkout` / `git switch`
- `git merge`
- `gh pr create` / `gh pr merge`
- Any command that modifies the repository state

opencode is only allowed to run **read-only** git commands (e.g., `git status`, `git diff`, `git log`, `git branch`).

---

## Commit Message Generation

When the user says **"give me the commit message"**, run these two commands:

```bash
git status
git diff --stat
```

With this info, generate:
1. A **branch name** following the project convention (`feature/`, `fix/`, `refactor/`, `chore/`, `docs/`)
2. A **commit message** in Conventional Commits format:
   ```
   <type>(<scope>): <description>
   ```
   - Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
   - Scope is optional (e.g., `feat(accounts):`, `fix(home):`)
   - Description in English, imperative mood, lowercase, no period
   - Max 50 chars for subject line

---

## Branch Cleanup

Delete all local branches except `develop` and `main`:

```bash
git branch | Where-Object { $_.Trim() -notmatch '^\*?(develop|main)$' } | ForEach-Object { git branch -D $_.Trim() }
```

> **Note:** The `.Trim()` and `\*?` handle the current-branch `*` prefix correctly, so `main` or `develop` are never accidentally deleted.
