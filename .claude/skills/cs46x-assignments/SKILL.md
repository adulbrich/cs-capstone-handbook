---
name: cs46x-assignments
description: Use when creating or editing assignment pages (MDX files in src/content/docs/assignments/) for the CS 461/462/463 capstone handbook. Covers the frontmatter contract read by the validators, the section skeleton, rubric rules, the Canvas rubric CSV the page renders, and grade-weight arithmetic. Always load this skill before writing or editing any assignment file.
---

# Assignment Style Guide

Assignment pages are **where all graded work in the course is authored**,
except the two Canvas-owned stubs described under **Frontmatter Contract**.
They are exported to Canvas, which students go by once imported, and the page
body never names Canvas (AGENTS.md hard rule 7). The syllabi mirror them, and
two validators parse them. A
mistake here propagates into student grades and accreditation evidence, which is
why more of this skill is mechanical than the guide or activity skills.

## Writing Voice (applies to everything below)

**Read `docs/agents/voice.md` first.** It is the single home for document
voice: whose voice the handbook uses, person, the three kinds of claim,
structure, and the word-level rules. This skill does not restate it; it adds
only what the task register needs. On an assignment page the rule that bites
most often is the closer: a paragraph ends on its last requirement, never on
a line that restates it.

Document voice is not chat voice. A maintainer's `CLAUDE.md` asks for
compression in the terminal, where the reader can ask a follow-up. That rule
applied to a handbook page deletes the why, and what survives is an aphorism
the student cannot check or argue with.

Students read these pages under deadline pressure. Length is a cost they pay.

## The Task Register

An assignment page is **reference**, not explanation and not how-to. It is the
contract: what is due, when, and how it is scored. It speaks to a student who
has already decided to do the work, in second person and task first: "In this
assignment you will build ...". The procedure for producing the artifact lives
in the paired activity; the reason the practice exists lives in the guide.

This matches the three-way split in `cs46x-guides` and `cs46x-activities`.
Guides explain, activities are how-to, assignments are reference.

**Do not import the guides' explanation register.** Guides explain why a
practice exists; assignments say what is due. A page that opens by teaching the
reader about the value of retrospectives has taken space from the deliverable
and broken the rule below about course design. The guide is one link away and
that is where the why lives.

Length is not the reason to compress, though. A rubric criterion a student
misreads costs them a grade, so an extra clause that removes the ambiguity is
cheap. Cut restatement, not precision.

### Sourcing

**Name the source the first time the page names a tool, standard, format, or
technique.** If the assignment says "follow conventional commits", link the
specification. If it says "WCAG AA", link the standard. If it says "use a
lockfile", link the tool's documentation on lockfiles.

There is no numeric target here yet. The current assignment pages sit at 0.2
external links per 1,000 words, which is effectively zero, and that is the
defect. The right rate is not borrowed from another course: capstone
assignments are a different kind of artifact from a lower-division programming
assignment, where a single function under test can carry four references. Fix
the zero, then let the corpus tell us the rate.

What does not depend on a number: a student who cannot find the standard you
are grading against will guess at it, and then contest the grade.

Research findings belong in the guide the assignment links, not here (see
"Who owes what" under Claims in `docs/agents/voice.md`).

A link is not course-design rationale and does not violate the rule below. "Use
[conventional commits](https://www.conventionalcommits.org/)" is a
specification of the deliverable. "We adopted conventional commits in 2024
because the previous convention drifted" is course design and stays out.

## Frontmatter Contract

```yaml
---
title: <Assignment Name>
description: <one sentence; quote it if it contains a colon>
sidebar:
  order: <number>
assignment:
  level: individual | team
  terms: [fall, winter, spring]
  weight: <percent of that term's grade, or a per-term map>
  outcomes:
    SO2: 1
    SO4: 2
  canvas:
    - name: "<Exact Canvas name; {n} numbers a family, {title} names each entry>"
      group: <Canvas assignment group>
      weeks: { fall: [4, 8] }
      titles: { fall: [<one per week listed>] }  # only with {title} in the name
      weight: <the family's percent of the term grade>
      points: 100
      submission: pdf | video | url | image | survey | none, or a list
      rubric: <dir>/<name>-rubric.csv
---
```

`weight` is a scalar when the page is worth the same in every term it runs, and
a per-term map when it varies:

```yaml
  weight:
    fall: 8
    winter: 8
    spring: 4
```

`canvas` lists the page's **Canvas entries**, one family per item, and each
family expands to one Canvas assignment per week listed. **Never bundle
entries** (AGENTS.md hard rule 6): a draft and a final, or four sprint notes,
are separate Canvas assignments with their own due dates and grades, however
the page groups them for the reader. `docs/decisions/2026-09-23-canvas-entry-model.md`
has the model; `peer_review_week` marks an entry using Canvas's own peer review.

Eight rules the validators enforce, all of which have been gotten wrong before:

1. **`outcomes` counts must equal the number of CSV criteria carrying that
   tag.** `scripts/validate-outcomes.mjs` parses the Criteria Name column of
   the rubric CSV as
   the source of truth and fails on any disagreement. Tag a criterion, bump the
   count, in the same edit.
2. **Only `level: individual` pages contribute accreditation data points.** A
   `level: team` page contributes **zero**, however many tags its rubric
   carries. This is the rule most easily gotten wrong: a team page tagged `L07`
   looks like coverage and counts as nothing.
3. **Every ABET outcome (SO1-SO6) needs two individual data points; WIC and
   Beyond OSU (L07-L10) need one.** L10 is exempt for now, because its only
   criteria moved to Canvas (`CANVAS_EVIDENCED`, #196). Removing a tagged criterion can drop an
   outcome below its floor and fail CI. Run the validator before assuming a
   deletion is safe.
4. **`weight` is reconciled against the term tables** in
   `assignments/introduction.mdx`. A scalar on a page whose weight varies by
   term is a hard failure, as is a declared term no table row links. See
   **Grade Weights** below.
5. **The `<AssignmentMeta weight="...">` text states every percentage the
   frontmatter declares.** A per-term map means every term's figure appears
   in the text ("8% of the fall and winter grades, 4% of the spring grade").
6. **A page with a deliverable section carries an `**AI use:**` paragraph.**
   The deliverable headings the validator recognizes are the four listed
   under **Section Skeleton** below.
7. **Rubric points total exactly 100** per CSV (see **Rubric Rules**).
8. **The `canvas` entries reconcile.** Per term, family weights sum to the page
   weight; within one Canvas group, every entry carries the same weight per
   point (Canvas weights a group's entries by points); every family's rubric
   is rendered on the page and every rendered CSV belongs to a family; a page
   with more than one entry in a term renders `<CanvasEntries />`.

A page with no `assignment:` block is skipped by the validator entirely: no
rubric CSV, no weight, no AI-use paragraph, no outcome tags. Four ungraded pages
are in that state deliberately: `introduction.mdx`, `term-startup.mdx`,
`demo-day.mdx`, and `expo.mdx`. A fifth needs a reason. **This is the supported shape for an ungraded item**, paired
with a Canvas item at 0 points with `omit_from_final_grade`; see
`canvas/assignments/assignment-readme.md`. Do not reach for `weight: 0`, which
passes Zod but keeps the block and so re-arms the rubric and AI-use checks.

Two **graded** pages share the shape for a different reason:
`resume-and-intent.mdx` and `career-retrospective.mdx` run entirely in Canvas
under the co-instructor (#197), at their real weights, not at 0 points. Each
shows only its `<AssignmentMeta>` and "Please check the Canvas assignment.", and
the Section Skeleton below does not apply to them. Do not rebuild them.

Not enforced, still required: the
three bands, criteria written as observable checks, the section order, and the
Canvas CSV band descriptions (only the tag sets are reconciled).

## Section Skeleton

Sections in **bold** are required.

1. **`<AssignmentMeta>` block**, immediately after the frontmatter, before any
   prose. This replaced the freehand bold sentence; do not reintroduce one.

   ```mdx
   import AssignmentMeta from '/src/components/AssignmentMeta.astro';

   <AssignmentMeta submission="Team" due="Winter, week 3 (v1, partner-agreed)" weight="4% of the winter grade">
     A v0 draft is part of the fall week-10 [Repo Checkpoint](/assignments/repo-checkpoints/).
   </AssignmentMeta>
   ```

   - `submission`: "Team", "Individual", or the qualified form where it matters
     ("Team, with the individual contribution modifier"; "Individual, held as a
     team session").
   - `due`: the term and week, or the cadence for repeated work.
   - `weight`: percent of that term's grade, matching the `weight` frontmatter.
   - The slot is optional and holds **one** qualifying clause. It is MDX, so
     links work. Anything longer belongs in the intro prose.

   Self-close it (`/>`) when there is no note.

   On a page owning more than one Canvas entry in a term, `<CanvasEntries />`
   follows it: the table of entries, read from the page's own `canvas`
   frontmatter. Where the entries differ in what is submitted or how it is
   graded (the RFC's draft and final), give each its own `##` section named
   as in Canvas, with its own `<AssignmentMeta>` and its own rubric.

2. **Intro prose.** One to three paragraphs, in second person, on what the
   student produces, by when, and what makes it good. Say why it matters **to
   the student** (an interviewer can ask about it, the partner will expect it)
   and stop there. **Never explain the course's design on an assignment
   page**: no "this assignment exists because", "this replaces X", "most
   teams used to", "by design", "on purpose", "in this course there is no",
   or any sentence whose subject is the course, the staff, or a past cohort.
   Students read the page to find out what to do; design rationale belongs in
   `STAFF-RUNBOOK.md`, `docs/agents/`, or the issue that made the decision.

3. **The deliverable section.** Heading names the artifact and, where it
   applies, its length and repository path:

   - `## What You Must Produce`
   - `## What It Must Contain (1 to 2 pages, in \`docs/shipped.md\`)`
   - `## Structure (2 to 3 pages, in \`docs/postmortems/\`)`
   - `## Required Sections`

   Prefer a numbered list when the artifact has named parts a grader will look
   for one by one. State the length and where it lives.

   Then **`## What You Submit`**, in one or two lines: the format and what goes
   in it. An entry with its own `##` section and `<AssignmentMeta>` (the RFC's
   draft and final, a sprint's individual contribution) carries its own
   `### What You Submit` inside that section. Where each entry's section
   already says what a complete submission is (the workshops), one page-level
   block covers them all. Every document is submitted as one PDF; link the rule in
   `assignments/introduction.mdx` ("Submitting Your Work") rather than
   restating what its cover carries. An entry with nothing to hand in says so
   and why ("Nothing to upload: ..."). A format never goes in a heading, and neither does a
   percentage (`docs/agents/voice.md`, Structure).
   `validate-outcomes.mjs` fails a page with Canvas entries and no such
   heading, an entry section with its own meta and no block, and a heading
   carrying "PDF" or "submitted as" (#288).

4. **`## Rubric (100 points)`**, whose table is a `<RubricTable>` rather than
   Markdown. Prose belongs under it: the `**AI use:**` paragraph, per-criterion
   grading notes, and any late or non-submission rule. One sentence may precede
   the component where it frames the whole rubric.
   See **The Rubric Lives in the CSV** and **Rubric Rules**.

5. **`**AI use:**` paragraph**, required on any assignment whose deliverable is
   a written document. State what AI may legitimately do here, and name the
   specific dishonest use that would fail the assignment. Be concrete:
   "fabricating demo footage, metrics, findings, or user feedback fails the
   assignment; a smaller true number always beats a bigger invented one."

6. *Admonitions.* Optional. The pattern worth reusing is
   `:::note[If your project is under NDA]` for the local NDA variation. Do not
   write a `Why this replaces X` or `Why we do it this way` admonition; that
   is course design talking to itself on a student page. Keep each to one
   idea.

7. **`## Activities That Prepare This`.** The shared recommendations first,
   naming the criterion each one serves. Then, where projects actually
   differ, an **Examples** table whose first column reads "If your project is". Then a `Browse ... when these run
   out.` line naming one or two activity categories.

   Every activity you link here must carry a `Recommended` or `Workshop` badge;
   `scripts/validate-activities.mjs` fails otherwise. Promote and link in the
   same commit.

## Rubric Rules

The rubric is a CSV, not a Markdown table (see **The Rubric Lives in the CSV**).
The rules below are about its content.

- **Points total exactly 100**, summed as each criterion's highest band. The
  survey pages are no exception: their criteria carry the facet or score
  weights as points (#300).
- **One CSV per distinct rubric, not per entry.** Sprint Notes 1 to 4 share
  one CSV; every workshop shares one. The RFC's draft and final differ, so
  they have two. A page with several renders each under a heading containing
  "Rubric" (the nearest `##` or `###`), and its outcome counts are the sum
  across them.
- **Three to six criteria is the working range.** Fewer than three cannot
  discriminate. More is allowed when each criterion is a separable
  observable check and the grading cost is accepted: at ~300 students and
  6 TAs every criterion is a line a grader reads on every submission, so
  say in the commit why the extra ones earn it. `rfc.mdx` (eight on the final) and
  `team-charter.mdx` (seven) are the standing examples (#27, decided
  2026-09-14).
- **Write criteria as observable checks, not qualities.** "Setup: complete,
  copy-pasteable, and actually verified by a fresh run" tells a grader what to
  do. "High-quality documentation" does not.
- **The Outcome column is the accreditation record.** Only tag a criterion when
  the criterion actually evidences that outcome for that individual student.
- **Follow the rubric table with per-criterion grading notes** when graders need
  consistency. One line per criterion, in rubric order, saying the first thing
  the grader checks. `repo-checkpoints.mdx` is the model.

Every rubric uses three bands: **Exceeds** (full points), **Meets** (partial),
**Does Not Meet** (low or none), except the pass/fail ones, `defense`, which
adds a fourth, and the surveys, whose bands are the instrument's own scale. Not submitted, off-topic, or inaccessible to graders scores zero,
stated explicitly rather than folded into Does Not Meet.

## The Rubric Lives in the CSV

**Do not write a rubric table in MDX.** Since #144 each assignment's rubric is
`canvas/assignments/<dir>/<name>-rubric.csv`, rendered on the page by
`src/components/RubricTable.astro` and imported through the Canvas Rubrics
page. One file, two destinations, nothing to keep in sync.

```mdx
import RubricTable from '/src/components/RubricTable.astro';
import rubricCsv from '/canvas/assignments/team-charter/team-charter-rubric.csv?raw';

## Rubric (100 points)

<RubricTable csv={rubricCsv} sourceLabel="canvas/assignments/team-charter/team-charter-rubric.csv" />
```

`?raw` is a Vite feature and needs no configuration. `validate-outcomes.mjs`
fails the build if a page renders no `<RubricTable>`, if the `csv={...}` name has no matching import, or if a page imports
a CSV belonging to a different assignment (Vite resolves any real path, so
nothing else catches that).

The CSV is Canvas's rubric import template
(`canvas/assignments/_template/import_rubric_template.csv`), parsed by
`src/lib/rubric-csv.mjs`. It is real CSV: a field holding a comma, a quote, or
a newline is wrapped in double quotes, and a quote inside it is doubled
(`"students say ""it worked"""`). Edit it with a spreadsheet or a CSV-aware
editor; a hand-typed comma in an unquoted field shifts every column after it.

The first row is the header, `Rubric Name,Criteria Name,Criteria
Description,Criteria Enable Range`, then `Rating Name,Rating
Description,Rating Points` once per band of the widest criterion. The parser
rejects any other header. Then one row per criterion, fields in order:

1. **Rubric name**, the same on every row: one file is one rubric, and it is
   the name Canvas lists it under. The validator fails two files sharing one.
2. **Criterion name**, with its outcome tags in brackets: `Blameless throughout
   [SO4]`. A row with no bracket carries no tags, which is correct for the
   pass/fail rubrics.
3. **Criterion description**: the sentence saying what is being judged. This is
   the text that used to follow the criterion name in the MDX table. Leave it
   empty when the name already says it, or when it would only restate the
   Exceeds band; a row that says the same thing twice is a row students read
   twice. **Plain text only.** Both destinations render it verbatim: the
   component escapes it, and Canvas shows a backtick as a backtick. No
   Markdown, no code spans, and nothing referring to the page's layout, since
   in Canvas there is no page.
4. `true` (Canvas's Criteria Enable Range; the handbook ignores it).
5. Onwards, **repeating groups of three**: band name, band description,
   points. Points come last.

The group count is what varies. Rows may stop short of the header, as in
Canvas's template, and the parser reads groups until one is empty rather than
assuming a number:

- **Three bands, 13 fields.** The default: `Exceeds Expectations` /
  `Meets Expectations` / `Does Not Meet Expectations`, at full / 80% / 20%.
- **Two bands, 10 fields.** Pass/fail rubrics: `Pass` at full, `Fail` at 0.
- **Four bands, 16 fields.** `defense` adds a `Missing` band at 0 for an
  unexcused no-show, which the other rubrics state in prose instead.

Every Canvas rubric directory is rendered by a page. `individual-contribution/`
is rendered on Sprint Notes, `workshop-activities/` on Workshop Activities; both
are tagless.

**Changing a CSV means re-importing it into Canvas.** Say so in
`canvas/assignments/assignment-readme.md` in the same commit.

## What Does Not Belong Here

Assignment pages hold **assignments**: things submitted and evaluated. Almost
all carry a weight; `term-startup.mdx` is the exception, because students do not
act on what Canvas does not put in their to-do list and the schedule cannot do
that. Two neighbours are deliberately elsewhere:

- **Grading policy** (points to letter grade, what each letter means, how
  outcome tags work) lives in `learning-objectives/grading.mdx`, because every
  letter is defined in terms of the learning objectives.
- **Rubric conventions** (the three bands, missing-is-zero, evidence over
  prose) live in `assignments/introduction.mdx` and nowhere else. Do not restate
  them on individual assignment pages.

Peer evaluations and project partner evaluations **are** assignments, despite
being completed by someone other than the student: together they are 50% of
every term's grade, and this section is where all graded work is authored,
apart from the two Canvas-owned stubs.

## Say Each Fact Once

One canonical statement, everywhere else links. A page may state the single
number its own reader needs; no page other than the canonical one re-tabulates
the whole thing. `AGENTS.md` lists the current canonical homes. Before writing
a paragraph that explains something, grep for it.

## Grade Weights

Each term's grade is four components of 25% each. Team Deliverables is split
across several assignment pages and **every term must sum to exactly 25%**. A
weight appears in four places that must agree:

1. the page's `assignment.weight` frontmatter,
2. the term tables in `assignments/introduction.mdx`,
3. the three syllabi,
4. `canvas/assignments/assignment-readme.md`.

The validator reconciles the first two against each other. The last two it
cannot see. The two Canvas-owned stubs have no frontmatter weight: their copy
is the `<AssignmentMeta>` text plus the Individual Evidence row on
`assignments/introduction.mdx`, and no validator reads either.

Raising one weight means cutting another. Verify the sums with a script, not by
eye. When choosing what to cut, protect Sprint Notes and Repo Checkpoints: they
carry the individual contribution modifier and the living-docs gate.

## NDA Projects

There is no "Track A / Track B" vocabulary. The default is that staff have
repository read access; where an NDA team does something different, say so
**locally on the affected page** in a short `:::note`, not as a global concept
the student has to learn first.

## What Assignment Pages Must Not Contain

- Course design rationale, history, or description: why the assignment
  exists, what it replaced, what past cohorts did, what "this course" does or
  does not have. The page addresses the student about their work.
- Em dashes.
- Calendar dates or an academic year. `due` is a term and a week, and may
  add a weekday or a named holiday ("Fall, week 9, Wednesday before
  Thanksgiving"), never a date. `validate-dates.mjs` fails on one.
- A rubric that does not total 100.
- Outcome tags whose counts disagree with the frontmatter.
- Links to activities that carry no tier badge.
- Explanations that belong in a guide. Link to the guide instead; two
  descriptions of one practice drift, and students read the assignment.
- Grading language on any page other than an assignment page. This section is
  the only place rubric point values live; the points-to-letter table lives
  in `learning-objectives/grading.mdx`.

## Worked Examples

Same requirement, same budget. The difference is whether the student can act
without guessing.

The pairs below are constructed to the rule. They are not drawn from capstone
pages, and they are not drawn from other courses either, because assignments in
this program's lower-division courses are a different kind of artifact: a
scoped exercise against a known function, not a term-long team deliverable for
an external partner. Replace these with real capstone examples when good ones
exist. Until then, treat them as illustrations of the rule and let
`docs/agents/voice.md` be the register model.

**A deliverable line.**

> Before: Commit history should be clean and conventional.
>
> After: Every commit follows
> [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): a
> type, an optional scope, and an imperative subject under 72 characters, for
> example `fix(auth): reject expired refresh tokens`. History is squashed per
> pull request, so the merge commit is the one that has to read well.

**A rubric criterion.**

> Before: Documentation: thorough and professional.
>
> After: Documentation: `README.md` states what the project does, how to run it
> locally, and how to run the tests, and a new reader can follow it without
> asking the team a question.

**An intro paragraph.**

> Before: This assignment is where the real engineering starts. Ship something
> that works.
>
> After: In this assignment you will take the design from the previous
> checkpoint and ship a working vertical slice: one user-facing flow that runs
> end to end against real data. Your partner will see this running, and it is
> the artifact an interviewer is most likely to ask you to walk through.

**What the "before" column has in common:** each one sounds decisive and leaves
the student to guess the standard they will be graded against.

## Before Finishing

1. `npm run validate:outcomes` (frontmatter, rubric tags, weights, Canvas
   mirror, AssignmentMeta weight text, AI-use paragraph, rubric totals).
2. `npm run validate:activities` (every linked activity is tiered).
3. `npm run validate:downloads` (every `public/` download has an owning page).
4. `npm run validate:dashes` (no em dashes, literal or entity).
5. `npm run build` (MDX, internal links, anchors).
6. If you touched a weight, verify all three terms still sum to 25%.
7. If you touched a rubric, you touched the CSV, so add it to the re-import
   list in `canvas/assignments/assignment-readme.md` in the same commit.
