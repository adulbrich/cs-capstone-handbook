# AGENTS.md

Context for AI coding agents working in this repository. Named `AGENTS.md`
rather than `AGENT.md` because that is the filename the cross-tool convention
settled on; `CLAUDE.md`-style per-tool files should point here rather than
duplicate it.

## What this repository is

The CS 461/462/463 capstone handbook: an Astro + Starlight documentation site
that is the **source of truth for all graded work** in the course. Canvas
mirrors it. Content lives in `src/content/docs/**` as MDX.

| Path | Holds |
|---|---|
| `src/content/docs/assignments/` | Graded work. Source of truth. Every page's rubric table is machine-parsed. |
| `src/content/docs/activities/` | The practice library. See the `cs46x-activities` skill before editing. |
| `src/content/docs/guides/` | How-to material. Not graded, may aspire beyond what assessment requires. |
| `src/content/docs/learning-objectives/` | ABET / WIC / Beyond OSU outcome mapping. |
| `canvas/` | Canvas-ready HTML and rubric TSVs. Mirrors the handbook; the handbook wins. |
| `public/` | Templates and scoresheets students download. |
| `scripts/validate-outcomes.mjs` | The outcome validator. Runs in CI and pre-commit. |
| `scripts/validate-activities.mjs` | The activity tier validator. Runs in CI and pre-commit. |
| `data/` | Student PII. Gitignored and guarded. Never commit anything here. |

## Hard rules

1. **Never commit anything under `data/`.** It holds rosters, grades, and
   survey exports with student PII. A lefthook pre-commit hook and a CI step
   both block it. Do not work around either.
2. **Use `npm`, never `bun` or `pnpm`.** CI runs `npm ci`, which installs
   strictly from `package-lock.json`. `npm install` in CI would let the
   lockfile drift, so CI would stop testing what ships.
3. **No em dashes in prose.** Use colons, semicolons, commas, or periods.
   This applies to handbook content, Canvas HTML, and repo docs alike.
4. **The handbook outranks Canvas.** If a rubric TSV and a handbook rubric
   table disagree, the handbook is right and the TSV is the bug. Rubric point
   values must match exactly.

## Validation

Run both before considering any content change done:

```sh
npm run build            # astro check + astro build; fails on broken internal links
npm run validate:outcomes
npm run validate:activities
```

`starlight-links-validator` is enabled in `astro.config.mjs`, so the build
fails on any broken internal link **including anchors**. This matters: heading
text determines anchor slugs, so renaming a heading breaks every inbound
`#anchor` link. Let the build tell you rather than guessing slugs.

## How outcome coverage stays true

Every assignment page carries outcome tags in its rubric table and declares
matching counts in its frontmatter. `scripts/validate-outcomes.mjs` parses the
rubric tables directly as the source of truth and fails if:

- frontmatter counts and rubric-table tags disagree,
- any ABET outcome (SO1-SO6) drops below **two individual data points**,
- any WIC or Beyond OSU outcome (L07-L10) loses individual coverage entirely.

Only pages with `level: individual` in their frontmatter contribute data
points. A `level: team` page contributes **zero**, however many tags its rubric
carries. This is the rule most easily gotten wrong: a team-level page tagged
`L07` looks like coverage on the page and counts as nothing to the validator.

`src/content/docs/learning-objectives/mapping.mdx` is the human-readable view
of the same map and is hand-maintained against this check. When you change a
rubric criterion's tags, update the frontmatter, the mapping page, and the
Canvas TSV in the same commit.

The same validator reconciles **Canvas against the handbook**: the set of
outcome tags in each `canvas/assignments/*/​*-rubric-details.tsv` must equal the
set in the handbook rubric table it mirrors. Nothing else in the toolchain reads
Canvas, so without this it drifts silently, and it had. The directory-to-page
map and the deprecated-directory list live at the top of the script; a Canvas
directory that starts claiming outcomes without being in either list fails the
check rather than being skipped.

## How activity tiers stay true

An activity is Recommended because an assignment page links to it, but the tier
is *displayed* as a badge on the activity page. Two files, one fact, so it
drifts. `scripts/validate-activities.mjs` reconciles them and fails if a
linked activity carries no badge, if a Recommended badge has no assignment
linking to it, or if an assignment links to an anchor that matches no heading.

Workshop tier is exempt from the second rule: those are assigned centrally
through `assignments/workshop-activities.mdx`, not per assignment page.

## Grade weight arithmetic

Each term's grade is four components of 25% each. The Team Deliverables
component is split across several assignment pages, and **every term must sum
to exactly 25%**. The weights appear in four places that must agree:

1. each assignment page's `assignment.weight` frontmatter,
2. the term tables in `src/content/docs/assignments/introduction.mdx`,
3. the three syllabi,
4. `canvas/assignments/assignment-readme.md`.

Changing one weight means re-cutting another. Verify the sums programmatically
rather than by eye.

## Code style

Biome (via Ultracite) formats and lints the small amount of JS/TS here. Run
`npx ultracite format` to fix and `npx ultracite lint` to check. The rules are
enforced mechanically, so there is no need to memorize them; write ordinary
modern JavaScript and let the formatter settle the rest.

## Skills

Required reading before touching the matching content directory. Each one
carries the writing voice verbatim, so loading the skill is enough.

| Skill | Load before editing |
|---|---|
| `cs46x-activities` | `src/content/docs/activities/` |
| `cs46x-guides` | `src/content/docs/guides/` |
| `cs46x-assignments` | `src/content/docs/assignments/` |

## Writing voice

Lead with the point. Specific nouns and verbs. Cut every sentence that does not
change what the reader will do or understand. No "it's worth noting,"
rule-of-three padding, or vague intensifiers. Opinion is preferred when a
recommendation is required. Code stays exact. For prose, never use emdashes but
use proper punctuation instead.

Students read these pages under deadline pressure; length is a cost they pay.
