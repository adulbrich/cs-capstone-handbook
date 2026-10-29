# AGENTS.md

Context for AI coding agents working in this repository. Per-tool files such
as `CLAUDE.md` point here rather than duplicate it.

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
| `src/pages/tools/` | The instructor tools at `/tools/`. Before editing them, `src/lib/tools/`, or their wording in `src/data/`, read `docs/agents/tools.md`. |
| `src/decks/`, `src/pages/decks/` | The slide decks. Before editing one, read `docs/agents/decks.md`. |
| `src/data/sources/` | The sources registry: one `<id>.yaml` per cited source, with the claims the handbook makes from it and where the source supports each. Pages cite it with `<Cite id>`. See the `cs46x-guides` skill, Citing Evidence. |
| `scripts/validate-outcomes.mjs` | The outcome validator, reading each assignment's rubric CSVs, plus the assignment-page shape: the `<AssignmentSummary />` card and the section skeleton (#355), the AI-use paragraph, rubric totals, that each page renders its own CSVs, that its `assignment.canvas` entries reconcile (hard rule 6), and that each entry's `late` rule fits its submission. |
| `scripts/validate-activities.mjs` | The activity tier counts, computed from the assignment pages through `src/lib/activity-links.mjs`, plus the `<ActivityMeta>` badge line, closing line, library count, the standalone, no-outcome-tags, and no-grading-language rules for activities and guides, and the week-by-week schedule's activity links. |
| `scripts/validate-downloads.mjs` | Checks every `public/` download has an owning page, except the files in `NOT_A_DOWNLOAD`, a literal at the top of the script. |
| `scripts/lib/` | Shared by the scripts: the content-tree walker and its text extensions, and the frontmatter reader, which returns the body as well as the block. The outcome-tag pattern is `OUTCOME_TAG` in `src/lib/rubric-csv.mjs`, since the site's rubric parser reads it too. |
| `npm test` | `node --test` over `src/lib/tools/*.test.mjs`: the instructor tools' pure modules (roster parsing, contact lists, `.qsf` generation) on invented fixtures, never `data/`. |
| `scripts/validate-dashes.mjs` | No em dashes (literal or entity) under `src/`, `canvas/`, `public/`. |
| `scripts/validate-sidebar.mjs` | Every `sidebar.order` within one content directory is unique, and a directory numbers all of its pages or none. A duplicate is otherwise silent. The Activities group is listed page by page in `src/lib/activities-sidebar.mjs`, so it also checks that every page under `activities/` appears there exactly once and declares no `sidebar.order`. |
| `scripts/validate-sources.mjs` | Every `<Cite id>` names a file in `src/data/sources/`, every registry entry has its claims with locators and a `verified` value and is cited by some page, no two entries cite the same, and a citing page has `## References` then `<References />` directly above Additional Readings. |
| `.github/workflows/links.yml` | Weekly lychee check of the external links on the built site, the doi.org links included; opens or updates one issue on failure. Not per PR, because an outside outage would fail unrelated PRs. |
| `scripts/validate-dates.mjs` | No calendar dates and no academic year under `src/`, `canvas/`, `public/` or in `STAFF-RUNBOOK.md`: terms and weeks only. |
| `scripts/check-prose.mjs` | No em dash and no emoji in any tracked text file, and none of the glossary's rejected synonyms under the content paths. On handbook pages, also no banned word, bolded whole sentence, or banned guide opener from `docs/agents/voice.md`, and no banned word or percentage in a heading there or in the rubric CSVs, the syllabi, the Markdown downloads in `public/`, or the decks under `src/decks/`. The `after-edit` hook runs it on every edited file. |
| `scripts/test-guard-git.mjs` | Cases for `.claude/hooks/guard-git.mjs`, in both directions: a false block trains an agent to look for an escape, a hole lets a commit onto `main`. Builds its own throwaway repo and worktree. |
| `scripts/check-branch-name.mjs` | Branch rule, `<type>/<slug>`, with the issue number leading the slug when there is one. |
| `scripts/check-commit-message.mjs` | Conventional Commits subject rule, plus no em dash, emoji, or session link, in commit messages and in the PR title and body. |
| `scripts/canvas-export.mjs` | The Canvas paste kit: one HTML body per Canvas entry from the built pages in `dist/`, plus each term's rubric CSVs, syllabus, and entry list, written to the gitignored `canvas-export/`. `npm run canvas:export` after `npm run build`; CI runs it with `--strict`, which fails on any warning: an `OVERRIDES` entry that no longer matches its page, or a page element the transform does not handle. A stopgap until #5. |
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
   decision timestamps. Code may read today's month to pick the current
   term, as `src/lib/term-tabs.js` does for term tabs; pages name weeks in
   text, and no code computes the current week, since that needs each
   year's start date.
6. **One Canvas entry per due date; never bundle.** Each Canvas assignment
   has its own due date, late window, grade and submission, so four sprint
   notes are four entries and a draft and a final are two, even when one
   handbook page holds them all. The page lists its entries in
   `assignment.canvas` frontmatter, gives entries graded differently one
   `###` each under `## Rubric` (and under `## What You Submit` when what
   they hand in differs, or `## What You Produce` when what they produce
   does), and renders one `<RubricTable>` per distinct
   rubric; `validate-outcomes.mjs` reconciles the list with the
   page weight, the rendered rubrics, and Canvas's per-group points. See
   `docs/decisions/2026-09-23-canvas-entry-model.md`.
7. **Page bodies do not mention Canvas.** Assignment bodies are pasted into
   Canvas, so a page that says "confirm in Canvas", "the handbook wins", or
   "check Canvas" reads as a second authority once it is there. Only the
   syllabi and the note under each assignment title say which source wins:
   Canvas, once the assignments are in it. The note comes from
   `src/components/PageTitle.astro`, on every page under `assignments/` but
   the two Canvas-owned stubs; it renders outside `.sl-markdown-content`,
   the only part of a page `canvas-export.mjs` copies, so it never reaches
   Canvas, and `--strict` fails if it does.
   Write "submit", "your submission", "the gradebook". Something that
   exists only in Canvas, such as a registration link or a published
   schedule, is "check announcements for the link". The two Canvas-owned
   stubs and the Acknowledgments tools list are the only pages whose body
   names Canvas.

## Validation

A change is done when this exits 0:

```sh
npx lefthook run pre-push --force
```

It runs the `pre-push` block of `lefthook.yml`, which is everything CI's
`build` job runs, and `git push` runs the same block. Keep `--force`: run by
hand with nothing to push, lefthook skips every command and exits 0 having
checked nothing.

`starlight-links-validator` is enabled in `astro.config.mjs`, so the build
fails on any broken internal link **including anchors**. This matters: heading
text determines anchor slugs, so renaming a heading breaks every inbound
`#anchor` link. Let the build tell you rather than guessing slugs. The links
in an activity's generated badge line are the exception: a component renders
them, so the build never sees them. `validate-activities.mjs` checks what they
depend on instead: the exact "Activities That Prepare This" heading and unique
workshop heading slugs.

## Outcomes, tiers, and weights

Three rules bind edits outside the page you are on. The skill for each holds
the mechanics:

- **Outcome coverage** comes from the rubric CSVs' tags, counted only on
  `level: individual` pages: a team page contributes zero data points,
  however many tags its rubric carries. `cs46x-assignments`.
- **An activity's tier** is computed from the assignment pages that link it,
  never written on the activity, so promoting or demoting one is an edit to an
  assignment page. `cs46x-activities`.
- **Each of the four grade components sums to 25% in every term.** The
  syllabi and `canvas/assignments/assignment-readme.md` hold copies of each
  weight that no validator reads, so a weight change edits them in the same
  commit. `cs46x-assignments`.

## Downloads in `public/`

Templates, cheat sheets, and scoresheets students download live in `public/`
and are linked as root-relative URLs (`/rfc-template.md`).
`starlight-links-validator` catches a link to a missing file;
`validate-downloads.mjs` catches the reverse, a download no page links, which
goes stale unnoticed. **Every download has exactly one owning page, and that page is the
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
| Per-term assignment weights (the grade grid) | `assignments/introduction.mdx` |
| Rubric bands, missing-is-zero, evidence rules | `assignments/introduction.mdx` |
| The AI policy and what it assesses | `assignments/introduction.mdx` |
| How work is submitted: one PDF, every author named on the cover | `assignments/introduction.mdx` |
| Each entry's late rule | `late` in frontmatter, wording in `src/lib/canvas-entries.mjs` |
| Points to letter grade, outcome tags | `learning-objectives/grading.mdx` |
| The four example paths up the ladder, and that a project may match none | `guides/shipping.mdx` |
| What shipped means for a project, agreed with the partner and recorded | `assignments/definition-of-shipped.mdx` |
| The inherited-codebase audit and what it covers | `assignments/repo-checkpoints.mdx` |
| What each project-repository document holds, except `CONTRIBUTING.md` | `assignments/repo-checkpoints.mdx` |
| What `CONTRIBUTING.md` holds | `assignments/team-charter.mdx` |
| IP, NDA, and licensing policy | `introduction/ip-nda-and-licensing.mdx` |
| How projects are proposed, how teams form, how either changes | `introduction/for-students.mdx` |
| V&V outcome ladder (one ladder, every project) | its rungs in `canvas/assignments/project-partner-evaluation/partner-final-spring-rubric.csv`, shown by `<RubricCriterion>` under `assignments/project-partner-evaluation.mdx#spring` |
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

The check is a count: run
`grep -oE '\(/(assignments|guides|activities)/[^)]*\)' <page>` and ask whether
each one is load-bearing for that reader's question.

Policy is the other half of the same rule. A rule with two audiences and a
legal edge, such as IP and NDA terms, gets its own page under `introduction/`
and every audience page links it rather than restating it.

## Code style

Biome formats and lints the code; `npm run format` fixes what `npm run check`
reports.

## Skills

Required reading before editing what each row names. Each one has you read
`docs/agents/voice.md` first.

| Skill | Load before editing |
|---|---|
| `cs46x-activities` | `src/content/docs/activities/`, or an activity link on `introduction/schedule.mdx` |
| `cs46x-guides` | `src/content/docs/guides/`, or a registry entry under `src/data/sources/` |
| `cs46x-assignments` | `src/content/docs/assignments/`, a rubric CSV under `canvas/assignments/`, or a grade weight wherever it is stated |

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

GitHub Issues on `adulbrich/cs-capstone-handbook`. Before any `gh` command,
read `docs/agents/issue-tracker.md`: `gh` runs outside the sandbox and takes
bodies from a file.

### Triage labels

Before labeling an issue, read `docs/agents/triage-labels.md`: the five triage
labels, unrenamed, and the priority labels every actionable issue carries.

### Code review

Before opening or reviewing a pull request, read `docs/agents/code-review.md`:
it sets the axes, the bar, and when the rounds stop.

### Domain docs

Glossary terms go on `about/glossary.mdx` and its `check-prose` list, never in
`CONTEXT.md`. Every decision record, architecture included, goes in
`docs/decisions/`, and there is no `docs/adr/`. Before a skill reads or writes
`CONTEXT.md` or an ADR, read `docs/agents/domain.md`.

## Where decisions are recorded

There is no journal file in this repository. A decision lives in exactly one of three places:

1. **The issue**, for what to do and why, including the acceptance list the review checks against.
2. **The pull request body**, for what changed, what ran, and the review loop.
3. **`docs/decisions/`**, for a design record when the change sets a rule the handbook will live by. One file per design, with a status line; the handbook pages win where the two differ.

Do not create running logs, change logs, or idea files at the root. If a fact is worth keeping, it belongs in an issue, a PR, a design record, or the page that owns it.

## Writing voice

Before writing any text a student, partner, or mentor reads (a handbook page,
a slide, a syllabus, a download, a rubric description), read
`docs/agents/voice.md`.

Students read these pages under deadline pressure, so length is a cost they
pay. Pay it on the reason and the source, not on restating the point.
