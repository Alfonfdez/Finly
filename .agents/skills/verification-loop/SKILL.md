---
name: verification-loop
description: Browser verification loop (Playwright MCP) against a feature's acceptance criteria in its spec. Use whenever a task says "verification" or when all tasks of a feature are complete.
---
The loop:

1. Read the acceptance criteria from the 1-spec.md of the active feature.
2. Open the page with the Playwright MCP (the file in public/ or the server URL when available).
3. Check the criteria one by one by interacting for real: type in fields, press buttons, inspect the DOM and resulting styles.
4. If a criterion fails: fix the code and re-check that criterion (and any others the change may affect).
5. Finish when all criteria pass. If the same criterion fails after 3 attempts, stop and explain what is blocking — do not keep iterating blindly.

When done, report the checklist criterion by criterion with [] or [x] and a comment if needed. If everything passes, mark the verification task as done.

Rules:
- Criteria live in the spec: do not invent, skip, or reinterpret them. If one cannot be checked, say so.
- When a criterion mentions responsive or mobile, check it with the viewport at 375px (or 1280px for large screens).
- Do not mark any feature as closed (or the verification task as done) with any criterion pending.
