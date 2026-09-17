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
| `src/content/docs/learning-objectives/` | ABET / WIC / Beyond OSU outcomes, the outcome map, and grading policy (letter conversion, outcome tags). |
| `canvas/` | Rubric TSVs for the Canvas import extension, plus the three syllabus HTML bodies. Mirrors the handbook; the handbook wins. Assignment bodies are pasted from the built handbook page, not stored here. |
| `public/` | Templates and scoresheets students download. |
| `scripts/validate-outcomes.mjs` | The outcome validator, plus the assignment-page shape: AssignmentMeta weight text, the AI-use paragraph, rubric totals. Runs in CI and pre-commit. |
| `scripts/validate-activities.mjs` | The activity tier validator, plus badge shape, closing line, library count, the no-outcome-tags, no-grading-language rules for activities and guides, and the week-by-week schedule's activity links. Runs in CI and pre-commit. |
| `scripts/validate-downloads.mjs` | Checks every `public/` download has an owning page. Runs in CI and pre-commit. |
| `scripts/validate-dashes.mjs` | No em dashes (literal or entity) under `src/`, `canvas/`, `public/`, `decks/`. Runs in CI and pre-commit. |
| `scripts/validate-sidebar.mjs` | Every `sidebar.order` within one content directory is unique, and a directory numbers all of its pages or none. A duplicate is otherwise silent. Runs in CI and pre-commit. |
| `scripts/validate-dates.mjs` | No calendar dates and no academic year under `src/`, `canvas/`, `public/`, `decks/` or in `STAFF-RUNBOOK.md`: terms and weeks only. Runs in CI and pre-commit. |
| `scripts/check-prose.mjs` | No em dash and no emoji in any tracked text file, and none of the glossary's rejected synonyms under the content paths. Runs in CI, pre-commit, and the `after-edit` hook. |
| `scripts/test-guard-git.mjs` | Cases for `.claude/hooks/guard-git.mjs`, in both directions: a false block trains an agent to look for an escape, a hole lets a commit onto `main`. Builds its own throwaway repo and worktree. Runs in CI and pre-push. |
| `scripts/check-commit-message.mjs` | Conventional Commits subject rule. Runs at `commit-msg`, in the `guard-git` hook, and in CI over the PR range. |
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
   `validate-dashes.mjs` checks the content directories and
   `scripts/check-prose.mjs` checks every tracked text file, root docs and
   skills included, in CI and at pre-commit.
4. **The handbook outranks Canvas.** If a rubric TSV and a handbook rubric
   table disagree, the handbook is right and the TSV is the bug. Rubric point
   values must match exactly.
5. **Terms and weeks only. No calendar dates and no academic year anywhere
   in the handbook** (#57): not "Fall 2026", not "September 23", not
   "2026-27". Weekdays and named holidays are fine ("fall week 9, Wednesday
   before Thanksgiving"). The handbook is reused every year and a date is a
   fact that rots on a schedule. `validate-dates.mjs` checks the content
   directories, the syllabi, and the runbook; the changelogs keep their
   decision timestamps.

## Validation

Run all of these before considering any content change done:

```sh
npm run build            # astro check + astro build; fails on broken internal links
npm run validate:outcomes
npm run validate:activities
npm run validate:downloads
npm run validate:dashes
npm run validate:dates
npm run validate:sidebar
npm run check            # Biome, for anything under scripts/ or src/ that is code
npm run check:prose      # no em dash, emoji, or glossary-rejected synonym
npm run check:commits    # Conventional Commits over origin/main..HEAD
npm run test:hooks       # cases for the git guard hook
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

## Downloads in `public/`

Templates, cheat sheets, and scoresheets students download live in `public/`
and are linked as root-relative URLs (`/rfc-template.md`).
`starlight-links-validator` catches a link to a missing file;
`validate-downloads.mjs` catches the reverse, which is what actually happened:
six downloads were being served while no page linked them, so they went stale
unnoticed. **Every download has exactly one owning page, and that page is the
one that requires the artifact.** A template with nothing to own it should be
deleted, not kept.

Where the assignment page already enumerates the artifact's sections in prose,
the page *is* the template; do not ship a second copy that will drift. That is
why there is no charter template.

## Say each fact once

The handbook's worst failure mode is the same fact stated in five places and
edited in three. The rule:

**One canonical statement; everywhere else links to it.** A page may state the
single number its own reader needs (a project partner needs to know their
evaluation is 25% without clicking), but no page other than the canonical one
re-tabulates the whole thing. Use the glossary's word for each concept
(`about/glossary.mdx`); `check-prose` rejects the synonyms it rules out.

Current canonical homes:

| Fact | Lives in |
|---|---|
| The four-component grade split | `assignments/introduction.mdx` |
| Per-term Team Deliverables weights | `assignments/introduction.mdx` |
| Rubric bands, missing-is-zero, evidence rules | `assignments/introduction.mdx` |
| The AI policy and what it assesses | `assignments/introduction.mdx` |
| Points to letter grade, outcome tags | `learning-objectives/grading.mdx` |
| Project types: the four outcome types, origin, starting code, constraints, and the inherited-codebase audit | `practicalities/types.mdx` |
| V&V outcome ladder (one ladder, every outcome type) | `assignments/project-partner-evaluation.mdx` |
| Where each outcome is evidenced | `learning-objectives/mapping.mdx` |
| Week-by-week schedule | `introduction/schedule.mdx` |
| The handbook's vocabulary and the synonyms it rejects | `about/glossary.mdx` (`CONTEXT.md` points agents there) |

Before adding a paragraph that explains something, grep for it. If it already
exists somewhere, link instead.

## Grade weight arithmetic

Each term's grade is four components of 25% each. The Team Deliverables
component is split across several assignment pages, and **every term must sum
to exactly 25%**. `validate-outcomes.mjs` enforces that against the term tables,
and also reconciles each page's `assignment.weight` frontmatter against the row
that links it. `weight` is a scalar when the page is worth the same in every
term it runs, and a per-term map when it varies:

```yaml
assignment:
  terms: [fall, winter, spring]
  weight:
    fall: 8
    winter: 8
    spring: 4
```

A scalar on a page whose weight varies is now a hard failure. It used to be
silent, and Sprint Notes and Workshop Activities were both wrong.

Two places still hold weights the validator cannot see:

1. the three syllabi,
2. `canvas/assignments/assignment-readme.md`.

Changing one weight means re-cutting another, in all four places.

## Code style

Biome (via Ultracite's `core` preset) formats and lints the code: the three
validators, the Astro config and components, the content schema, and the JSON
configs. `canvas/` and `public/` are excluded on purpose; they are pasted or
served verbatim, not code. Run `npm run format` to fix and `npm run check` to
check. The same check runs in CI and as a pre-commit hook on staged code
files, so there is no need to memorize the rules; write ordinary modern
JavaScript and let the formatter settle the rest.

## Skills

Required reading before touching the matching content directory. Each one
carries the writing voice verbatim, so loading the skill is enough.

| Skill | Load before editing |
|---|---|
| `cs46x-activities` | `src/content/docs/activities/` |
| `cs46x-guides` | `src/content/docs/guides/` |
| `cs46x-assignments` | `src/content/docs/assignments/` |

## Git and pull requests

The rules, which the hooks under `.claude/hooks/`, `lefthook.yml`, and the
`main` ruleset enforce (the gates table in `CONTRIBUTING.md` shows where each
one stops you): branch
from a fresh `origin/main`, never commit on `main`, stage by name, Conventional
Commits with a lowercase imperative, no em dash, emoji, or session link in a
commit message or PR text, one PR per issue, squash merge after the review loop.

## Agent skills

### Issue tracker

GitHub Issues on `adulbrich/cs-capstone-handbook`, via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical labels, unrenamed. See `docs/agents/triage-labels.md`.

### Code review

`mattpocock-skills:code-review` on every pull request. The brief the
Standards axis reads, and the rule for when the loop ends, are in
`docs/agents/code-review.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root, created lazily by the domain-modeling skill for glossary terms and architecture decisions. See `docs/agents/domain.md`. Design records for course-design changes live in `docs/decisions/` (next section); the two do not overlap.

## Where decisions are recorded

There is no journal file in this repository. A decision lives in exactly one of three places:

1. **The issue**, for what to do and why, including the acceptance list the review checks against.
2. **The pull request body**, for what changed, what ran, and the review loop.
3. **`docs/decisions/`**, for a design record when the change sets a rule the handbook will live by. One file per design, with a status line; the handbook pages win where the two differ.

Do not create running logs, change logs, or idea files at the root. If a fact is worth keeping, it belongs in an issue, a PR, a design record, or the page that owns it.

## Writing voice

Lead with the point. Specific nouns and verbs. Cut every sentence that does not
change what the reader will do or understand. No "it's worth noting,"
rule-of-three padding, or vague intensifiers. Opinion is preferred when a
recommendation is required. Code stays exact. For prose, never use emdashes but
use proper punctuation instead.

Students read these pages under deadline pressure; length is a cost they pay.
