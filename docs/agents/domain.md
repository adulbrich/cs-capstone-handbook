# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase. The repo is single-context, and its terms and rules live in places the skills do not look by default.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root. It points at `src/content/docs/about/glossary.mdx`, which holds every term.
- **The rules for the area you're about to work in**: the `AGENTS.md` hard rules, the `cs46x-*` skill its table names, and any `docs/agents/` file it points to. Where a rule cites the issue that set it, read the issue for the reason.

## Where a skill's writes go

| When a skill says | Write it here |
| --- | --- |
| Add a term to `CONTEXT.md` | `src/content/docs/about/glossary.mdx`, and its "Not:" list into `scripts/check-prose.mjs` in the same commit; `glossaryDrift()` fails when the two differ |
| Record an ADR in `docs/adr/` | The issue, for the decision and its reason, and the rule itself where it binds, as `AGENTS.md`, "Where decisions are recorded", describes |

`CONTEXT.md` stays a pointer, and neither `docs/adr/` nor a design-record directory is ever created.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined on `about/glossary.mdx`. Don't drift to synonyms its "Not:" lists rule out.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap, which is a glossary edit as above.

## Flag rule conflicts

If your output contradicts a rule in `AGENTS.md`, a skill, or a `docs/agents/` file, surface it explicitly with the issue that set it rather than silently overriding:

> _Contradicts hard rule 6 (one Canvas entry per due date, #259), but worth reopening because..._
