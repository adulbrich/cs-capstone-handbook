# Vocabulary

The handbook's terms live on one page, `src/content/docs/about/glossary.mdx`
(published at `/about/glossary/`). Use its word for each concept in prose,
issue titles, commit messages, and PR bodies. `scripts/check-prose.mjs` fails
on the synonyms below under `src/content/docs/`, `canvas/`, `public/`,
`decks/`, and `STAFF-RUNBOOK.md`.

| Use | Not |
|---|---|
| project partner | client, sponsor |
| TA check-in, resume meeting, the class, grading sheet | cohort |
| stand-up | standup |
| sprint note | sprint report, progress report |
| outcome type, project type | project category, project categories |
| outcome ladder | V&V ladder, category ladder |
| existing codebase | legacy project, brownfield |
| NDA project, with a local note | Track A, Track B |

Technical senses of "client" (client-side, an API or HTTP client, code) are
allowed; the check skips code blocks and inline code and the phrases listed in
the script.
