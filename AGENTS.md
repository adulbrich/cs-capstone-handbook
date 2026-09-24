# AGENTS.md

Context for AI coding agents working in this repository. Named `AGENTS.md`
rather than `AGENT.md` because that is the filename the cross-tool convention
settled on; `CLAUDE.md`-style per-tool files should point here rather than
duplicate it.

## What this repository is

The CS 461/462/463 capstone handbook: an Astro + Starlight documentation site
where **all graded work is authored**, except the two Canvas-owned assignments
under hard rule 4. Assignment pages are exported to Canvas, and once imported,
Canvas is authoritative for students; hard rule 7 governs how pages mention
it. Content lives in `src/content/docs/**` as MDX.

| Path | Holds |
|---|---|
| `src/content/docs/assignments/` | Graded work, authored here and exported to Canvas, except the two Canvas-owned stubs (hard rule 4). Every page's rubric CSV is machine-parsed. |
| `src/content/docs/activities/` | The practice library. See the `cs46x-activities` skill before editing. |
| `src/content/docs/guides/` | How-to material. Not graded, may aspire beyond what assessment requires. |
| `src/content/docs/learning-objectives/` | ABET / WIC / Beyond OSU outcomes, the outcome map, and grading policy (letter conversion, outcome tags). |
| `canvas/` | **The rubrics.** One `*-rubric.csv` per distinct rubric, except for the two Canvas-owned assignments (hard rule 4), rendered on the handbook page and imported through Canvas's own rubric import, plus the three syllabus HTML bodies. Assignment bodies come from the built pages through the paste kit (`npm run canvas:export`) and are not stored here. |
| `public/` | Templates and scoresheets students download. |
| `src/data/sources/` | The sources registry: one `<id>.yaml` per cited source, with the claims the handbook makes from it and where the source supports each. Pages cite it with `<Cite id>`. See the `cs46x-guides` skill, Citing Evidence. |
| `scripts/validate-outcomes.mjs` | The outcome validator, reading each assignment's rubric CSVs, plus the assignment-page shape: AssignmentMeta weight text, the AI-use paragraph, rubric totals, that each page renders its own CSVs, and that its `assignment.canvas` entries reconcile (hard rule 6). Runs in CI and pre-commit. |
| `scripts/validate-activities.mjs` | The activity tier validator, plus badge shape, closing line, library count, the standalone, no-outcome-tags, and no-grading-language rules for activities and guides, and the week-by-week schedule's activity links. Runs in CI and pre-commit. |
| `scripts/validate-downloads.mjs` | Checks every `public/` download has an owning page. Runs in CI and pre-commit. |
| `scripts/validate-dashes.mjs` | No em dashes (literal or entity) under `src/`, `canvas/`, `public/`, `decks/`. Runs in CI and pre-commit. |
| `scripts/validate-sidebar.mjs` | Every `sidebar.order` within one content directory is unique, and a directory numbers all of its pages or none. A duplicate is otherwise silent. Runs in CI and pre-commit. |
| `scripts/validate-sources.mjs` | Every `<Cite id>` names a file in `src/data/sources/`, every registry entry has its claims with locators and a `verified` value and is cited by some page, no two entries cite the same, and a citing page has `## References` then `<References />` directly above Additional Readings. Runs in CI and pre-commit. |
| `.github/workflows/links.yml` | Weekly lychee check of the external links on the built site, the doi.org links included; opens or updates one issue on failure. Not per PR, because an outside outage would fail unrelated PRs. |
| `scripts/validate-dates.mjs` | No calendar dates and no academic year under `src/`, `canvas/`, `public/`, `decks/` or in `STAFF-RUNBOOK.md`: terms and weeks only. Runs in CI and pre-commit. |
| `scripts/check-prose.mjs` | No em dash and no emoji in any tracked text file, and none of the glossary's rejected synonyms under the content paths. On handbook pages, also no banned word, bolded whole sentence, or banned guide opener from `docs/agents/voice.md`, and no banned word or percentage in a heading there or in the rubric CSVs, the syllabi, or the Markdown downloads in `public/`; a guide carrying the legacy-opener marker skips the opener check until its sweep, and a marker with nothing to waive fails. Runs in CI, pre-commit, and the `after-edit` hook. |
| `scripts/test-guard-git.mjs` | Cases for `.claude/hooks/guard-git.mjs`, in both directions: a false block trains an agent to look for an escape, a hole lets a commit onto `main`. Builds its own throwaway repo and worktree. Runs in CI and pre-push. |
| `scripts/check-branch-name.mjs` | Branch rule, `<type>/<slug>`, with the issue number leading the slug when there is one. Runs at `pre-push` and in CI on the PR's head branch. |
| `scripts/check-commit-message.mjs` | Conventional Commits subject rule, plus no em dash, emoji, or session link. Runs at `commit-msg`, in the `guard-git` hook, in CI over the PR range, and in the `pr-text` workflow over the PR title and body. |
| `scripts/canvas-export.mjs` | The Canvas paste kit: one HTML body per Canvas entry from the built pages in `dist/`, plus each term's rubric CSVs, syllabus, and entry list, written to the gitignored `canvas-export/`. `npm run canvas:export` after `npm run build`; CI runs it with `--strict`, which fails on any warning: an `OVERRIDES` entry that no longer matches its page, or a page element the transform does not handle. A stopgap for #50 until #5. |
| `data/` | Student PII. Gitignored and guarded. Never commit anything here. |

## Hard rules

1. **Never commit anything under `data/`.** It holds rosters, grades, and
   survey exports with student PII. A lefthook pre-commit hook and a CI step
   both block it. Do not work around either. This is the root `data/` only;
   `src/data/sources/` is the sources registry and is tracked.
2. **Use `npm`, never `bun` or `pnpm`.** CI runs `npm ci`, which installs
   strictly from `package-lock.json`. `npm install` in CI would let the
   lockfile drift, so CI would stop testing what ships.
3. **No em dashes in prose.** Use colons, semicolons, commas, or periods.
   This applies to handbook content, Canvas HTML, and repo docs alike.
   `validate-dashes.mjs` checks the content directories and
   `scripts/check-prose.mjs` checks every tracked text file, root docs and
   skills included, in CI and at pre-commit.
4. **Each rubric lives once, in its CSV.** A rubric is
   `canvas/assignments/<dir>/<name>-rubric.csv`, in the format of Canvas's
   rubric import template (`canvas/assignments/_template/`), rendered on the
   handbook page by `src/components/RubricTable.astro` and imported through
   the Canvas Rubrics page. Edit the CSV, and re-import it into Canvas (#144).
   The CSV goes one way and is never read back out, so a fix made only in
   Canvas is lost at the next import. The Qualtrics surveys are no
   exception: their rubrics give the scoring in points (#300).
   Two graded pages have no rubric here at all: `resume-and-intent` and
   `career-retrospective` run entirely in Canvas under the co-instructor
   (#197). Their pages are stubs with no `assignment:` block; do not
   rebuild them.
5. **Terms and weeks only. No calendar dates and no academic year anywhere
   in the handbook** (#57): not "Fall 2026", not "September 23", not
   "2026-27". Weekdays and named holidays are fine ("fall week 9, Wednesday
   before Thanksgiving"). The handbook is reused every year and a date is a
   fact that rots on a schedule. `validate-dates.mjs` checks the content
   directories, the syllabi, and the runbook; the changelogs keep their
   decision timestamps.
6. **One Canvas entry per due date; never bundle.** Each Canvas assignment
   has its own due date, late window, grade and submission, so four sprint
   notes are four entries and a draft and a final are two, even when one
   handbook page holds them all. The page lists its entries in
   `assignment.canvas` frontmatter, gives entries that differ in what is
   submitted or how it is graded their own section, and renders one
   `<RubricTable>` per distinct rubric; `validate-outcomes.mjs` reconciles the list with the
   page weight, the rendered rubrics, and Canvas's per-group points. See
   `docs/decisions/2026-09-23-canvas-entry-model.md`.
7. **Pages do not mention Canvas.** Assignment bodies are pasted into
   Canvas, so a page that says "confirm in Canvas", "the handbook wins", or
   "check Canvas" reads as a second authority once it is there. Only the
   syllabi say which source wins: Canvas, once the assignments are in it.
   Write "submit", "your submission", "the gradebook". Something that exists
   only in Canvas, such as a registration link or a published schedule, is
   "check announcements for the link". The two Canvas-owned stubs and the
   Acknowledgments tools list are the only pages that name Canvas.

## Validation

Run all of these before considering any content change done:

```sh
npm run build            # astro check + astro build; fails on broken internal links
npm run canvas:export -- --strict  # the paste kit, after the build; fails on any warning
npm run validate:outcomes
npm run validate:activities
npm run validate:downloads
npm run validate:dashes
npm run validate:dates
npm run validate:sidebar
npm run validate:sources
npm run check            # Biome, for anything under scripts/ or src/ that is code
npm run check:prose      # no em dash, emoji, glossary-rejected synonym, or voice tell
npm run check:commits    # Conventional Commits over origin/main..HEAD
npm run check:branch     # the current branch is <type>/<slug>
npm run test:hooks       # cases for the git guard hook
```

`starlight-links-validator` is enabled in `astro.config.mjs`, so the build
fails on any broken internal link **including anchors**. This matters: heading
text determines anchor slugs, so renaming a heading breaks every inbound
`#anchor` link. Let the build tell you rather than guessing slugs.

## How outcome coverage stays true

Every assignment page's rubric is a CSV under `canvas/assignments/`, rendered
on the page, with each criterion's outcome tags in its Criteria Name column;
the page declares matching counts in its frontmatter.
`scripts/validate-outcomes.mjs` reads the CSVs as the source of truth and
fails if:

- frontmatter counts and CSV tags disagree,
- any ABET outcome (SO1-SO6) drops below **two individual data points**,
- any WIC or Beyond OSU outcome (L07-L10) loses individual coverage entirely,
  except L10, exempt while its only criteria live in Canvas (#196).

Only pages with `level: individual` in their frontmatter contribute data
points. A `level: team` page contributes **zero**, however many tags its rubric
carries. This is the rule most easily gotten wrong: a team-level page tagged
`L07` looks like coverage on the page and counts as nothing to the validator.

`src/content/docs/learning-objectives/mapping.mdx` is the human-readable view
of the same map and is hand-maintained against this check. When you change a
rubric criterion's tags, update the CSV, the frontmatter, and the mapping page
in the same commit.

The same validator checks that each page renders its own CSVs. Vite resolves
any real path, so nothing else would catch a page rendering another
assignment's rubric. The directory-to-page map and the deprecated-directory
list live at the top of the script; a rubric directory that claims outcomes
without being in either list fails the check rather than being skipped.

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
| How work is submitted: one PDF, every author named on the cover | `assignments/introduction.mdx` |
| Points to letter grade, outcome tags | `learning-objectives/grading.mdx` |
| The four example paths up the ladder, and that a project may match none | `guides/shipping.mdx` |
| What shipped means for a project, agreed with the partner and recorded | `assignments/definition-of-shipped.mdx` |
| The inherited-codebase audit and what it covers | `assignments/repo-checkpoints.mdx` |
| IP, NDA, and licensing policy | `introduction/ip-nda-and-licensing.mdx` |
| How projects are proposed, how teams form, how either changes | `introduction/for-students.mdx` |
| V&V outcome ladder (one ladder, every project) | `assignments/project-partner-evaluation.mdx` |
| Where each outcome is evidenced | `learning-objectives/mapping.mdx` |
| Week-by-week schedule | `introduction/schedule.mdx` |
| The handbook's vocabulary and the synonyms it rejects | `about/glossary.mdx` (`CONTEXT.md` points agents there) |

Before adding a paragraph that explains something, grep for it. If it already
exists somewhere, link instead.

## Audience pages are orientation, not a course index

`introduction/for-students.mdx`, `for-partners.mdx`, and `for-mentors.mdx`
answer "what is this and what does it ask of me" for one reader each. They are
FAQ, not instruction, and their value is being short enough to read in one
sitting before the term starts.

**An audience page does not become a second table of contents.** Link an
assignment, a guide, or an activity only where that page is the answer to the
question being asked, and state the fact the reader needs rather than sending
them somewhere to look it up. The closing `## The Pages You Need` card grid is
the page's index; the body is not a second one.

This is the same rule `cs46x-guides` states for guides, arrived at the same
way. `practicalities/` had no such rule and grew 24 outbound links into
assignments, guides, and activities before it was dissolved into these pages
(#162). The check is a count: run
`grep -oE '\(/(assignments|guides|activities)/[^)]*\)' <page>` and ask whether
each one is load-bearing for that reader's question.

Policy is the other half of the same rule. A rule with two audiences and a
legal edge, such as IP and NDA terms, gets its own page under `introduction/`
and every audience page links it rather than restating it.

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
    winter: 10
    spring: 6
```

A scalar on a page whose weight varies is now a hard failure. It used to be
silent, and Sprint Notes and Workshop Activities were both wrong.

Three places still hold weights the validator cannot see:

1. the three syllabi,
2. `canvas/assignments/assignment-readme.md`,
3. the `<AssignmentMeta>` text on the two Canvas-owned stubs, which carry no
   `assignment:` block for the validator to read.

The Demo Day extra credit (1% in the term a team presents, on top of the
four components, #305) is in no frontmatter at all: its page, the
assignments overview, the syllabi, the Canvas readme, and the extra
entries in `scripts/canvas-export.mjs` state it.

Changing one weight means re-cutting another, in every place it appears.

## Code style

Biome (via Ultracite's `core` preset) formats and lints the code: the
scripts, the Astro config and components, the content schema, and the JSON
configs. `canvas/` and `public/` are excluded on purpose; they are pasted or
served verbatim, not code. Run `npm run format` to fix and `npm run check` to
check. The same check runs in CI and as a pre-commit hook on staged code
files, so there is no need to memorize the rules; write ordinary modern
JavaScript and let the formatter settle the rest.

## Skills

Required reading before touching the matching content directory. Each one
references `docs/agents/voice.md` rather than restating it, so read that file
too when the work is prose.

| Skill | Load before editing |
|---|---|
| `cs46x-activities` | `src/content/docs/activities/` |
| `cs46x-guides` | `src/content/docs/guides/` |
| `cs46x-assignments` | `src/content/docs/assignments/` |

## Git and pull requests

The rules, which the hooks under `.claude/hooks/`, `lefthook.yml`, and the
`main` ruleset enforce (the gates table in `CONTRIBUTING.md` shows where each
one stops you): branch from a fresh `origin/main` as `<type>/<slug>`, leading
the slug with the issue number when there is one (`fix/192-handoff-week`),
renaming the app's `claude/` branch before the first push, never commit on `main`, stage by
name, Conventional Commits with a lowercase imperative, no em dash, emoji, or
session link in a commit message or PR text, one PR per issue, squash merge
after the review loop.

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

The single home is `docs/agents/voice.md`. It names whose voice the handbook
uses (the instructor's own writing, linked there) and covers person, the
three kinds of claim and what verified evidence means, structure, the
word-level rules, and the floor that holds in every register.

Document voice is not chat voice. A maintainer's `CLAUDE.md` governs the
terminal and is left alone; applying its compression rule to a handbook page
is what produced the aphorism problem `docs/agents/voice.md` exists to correct.

Students read these pages under deadline pressure, so length is a cost they
pay. Pay it on the reason and the source, not on restating the point.
