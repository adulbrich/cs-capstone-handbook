# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase. The repo is single-context, and its terms and decisions live in two places the skills do not look by default.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root. It points at `src/content/docs/about/glossary.mdx`, which holds every term.
- **`docs/decisions/`**: read the design records that touch the area you're about to work in. Each is one `YYYY-MM-DD-<slug>.md` with a status line, and the handbook pages win where a record and a page differ.

## Where a skill's writes go

| When a skill says | Write it here |
| --- | --- |
| Add a term to `CONTEXT.md` | `src/content/docs/about/glossary.mdx`, and its "Not:" list into `scripts/check-prose.mjs` in the same commit; `glossaryDrift()` fails when the two differ |
| Record an ADR in `docs/adr/` | A design record in `docs/decisions/`, as `AGENTS.md`, "Where decisions are recorded", describes |

`CONTEXT.md` stays a pointer, and `docs/adr/` is never created.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined on `about/glossary.mdx`. Don't drift to synonyms its "Not:" lists rule out.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap, which is a glossary edit as above.

## Flag design-record conflicts

If your output contradicts a record in `docs/decisions/`, surface it explicitly rather than silently overriding:

> _Contradicts `docs/decisions/2026-09-23-canvas-entry-model.md` (one Canvas entry per due date), but worth reopening because..._
