---
name: cs46x-assignments
description: Use when creating or editing assignment pages (MDX files in src/content/docs/assignments/) for the CS 461/462/463 capstone handbook. Covers the frontmatter contract read by the validators, the section skeleton, rubric rules, the Canvas rubric TSV the page renders, and grade-weight arithmetic. Always load this skill before writing or editing any assignment file.
---

# Assignment Style Guide

Assignment pages are **the source of truth for all graded work in the course**.
Canvas mirrors them, the syllabi mirror them, and two validators parse them. A
mistake here propagates into student grades and accreditation evidence, which is
why more of this skill is mechanical than the guide or activity skills.

## Writing Voice (applies to everything below)

**Read `docs/agents/voice.md` first.** It is the single home for document
voice and this skill does not restate it. The short version: every claim a
reader could doubt carries its reason, every named tool or standard carries a
link to its authoritative source on first mention, and no em dashes.

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

Seven rules the validators enforce, all of which have been gotten wrong before:

1. **`outcomes` counts must equal the number of TSV criteria carrying that
   tag.** `scripts/validate-outcomes.mjs` parses field 1 of the rubric TSV as
   the source of truth and fails on any disagreement. Tag a criterion, bump the
   count, in the same edit.
2. **Only `level: individual` pages contribute accreditation data points.** A
   `level: team` page contributes **zero**, however many tags its rubric
   carries. This is the rule most easily gotten wrong: a team page tagged `L07`
   looks like coverage and counts as nothing.
3. **Every ABET outcome (SO1-SO6) needs two individual data points; WIC and
   Beyond OSU (L07-L10) need one.** Removing a tagged criterion can drop an
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
7. **Rubric points total exactly 100**, unless the page is on the exception
   list in `validate-outcomes.mjs` (see **Rubric Rules**).

A page with no `assignment:` block is skipped by the validator entirely. Only
`introduction.mdx` should be in that state. Not enforced, still required: the
three bands, criteria written as observable checks, the section order, and the
Canvas TSV band descriptions (only the tag sets are reconciled).

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
   for one by one. State the format, the length, and where it lives.

4. **`## Rubric (100 points)`**, holding a `<RubricTable>` and nothing else.
   See **The Rubric Lives in the TSV** and **Rubric Rules**.

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
   naming the criterion each one serves. Then, where outcome types genuinely
   differ, a **By outcome type** table. Then a `Browse ... when these run
   out.` line naming one or two activity categories.

   Every activity you link here must carry a `Recommended` or `Workshop` badge;
   `scripts/validate-activities.mjs` fails otherwise. Promote and link in the
   same commit.

## Rubric Rules

The rubric is a TSV, not a Markdown table (see **The Rubric Lives in the TSV**).
The rules below are about its content.

- **Points total exactly 100**, summed as each criterion's highest band.
  Three documented exceptions, listed in `validate-outcomes.mjs` as
  `RUBRIC_EXCEPTIONS`, and these are the only three pages that still keep a
  hand-written Markdown table: the pass/fail workshop page
  (`workshop-activities.mdx`), and the two survey instruments,
  `peer-evaluations.mdx` and `project-partner-evaluation.mdx`, which run
  through Qualtrics and whose tables carry weights instead of points.
  `sprint-notes.mdx` is not an exception: its TSV is the two-band pass/fail
  shape and totals 100 like any other.
- **Three to six criteria is the working range.** Fewer than three cannot
  discriminate. More is allowed when each criterion is a separable
  observable check and the grading cost is accepted: at ~300 students and
  6 TAs every criterion is a line a grader reads on every submission, so
  say in the commit why the extra ones earn it. `rfc.mdx` (nine) and
  `team-charter.mdx` (seven) are the standing examples (#27, decided
  2026-09-14).
- **Write criteria as observable checks, not qualities.** "Setup: complete,
  copy-pasteable, and actually verified by a fresh run" tells a grader what to
  do. "High-quality documentation" does not.
- **The Outcome column is the accreditation record.** Only tag a criterion when
  the criterion genuinely evidences that outcome for that individual student.
- **Follow the rubric table with per-criterion grading notes** when graders need
  consistency. One line per criterion, in rubric order, saying the first thing
  the grader checks. `repo-checkpoints.mdx` is the model.

Every rubric uses three bands: **Exceeds** (full points), **Meets** (partial),
**Does Not Meet** (low or none), except the pass/fail ones and `defense`, which
adds a fourth. Not submitted, off-topic, or inaccessible to graders scores zero,
stated explicitly rather than folded into Does Not Meet.

## The Rubric Lives in the TSV

**Do not write a rubric table in MDX.** Since #144 each assignment's rubric is
`canvas/assignments/<dir>/*-rubric-details.tsv`, rendered on the page by
`src/components/RubricTable.astro` and imported into Canvas by the rubric-import
browser extension. One file, two destinations, nothing to keep in sync.

```mdx
import RubricTable from '/src/components/RubricTable.astro';
import rubricTsv from '/canvas/assignments/rfc/rfc-rubric-details.tsv?raw';

## Rubric (100 points)

<RubricTable tsv={rubricTsv} sourceLabel="canvas/assignments/rfc/rfc-rubric-details.tsv" />
```

`?raw` is a Vite feature and needs no configuration. `validate-outcomes.mjs`
fails the build if a page renders no `<RubricTable>` without being a documented
exception, if the `tsv={...}` name has no matching import, or if a page imports
a TSV belonging to a different assignment (Vite resolves any real path, so
nothing else catches that).

The TSV is headerless and tab separated. Fields, in order:

1. **Criterion name**, with its outcome tags in brackets: `Blameless throughout
   [SO4]`. A row with no bracket carries no tags, which is correct for the
   pass/fail rubrics.
2. **Criterion description**: the sentence saying what is being judged. This is
   the text that used to follow the criterion name in the MDX table. Leave it
   empty when the name already says it, or when it would only restate the
   Exceeds band; a row that says the same thing twice is a row students read
   twice.
3. `true` (Canvas's `use_range`; the handbook ignores it).
4. Onwards, **repeating groups of three**: points, band name, band description.

The group count is what varies, and the component reads groups until one is
empty rather than assuming a number:

- **Three bands, 12 fields.** The default: `Exceeds Expectations` /
  `Meets Expectations` / `Does Not Meet Expectations`, at full / 80% / 20%.
- **Two bands, 9 fields.** Pass/fail rubrics: `Pass` at full, `Fail` at 0.
- **Four bands, 15 fields.** `defense` adds a `Missing` band at 0 for an
  unexcused no-show, which the other rubrics state in prose instead.

Two directories hold Canvas rubrics that **no page renders**, by decision:
`individual-contribution/` (the individual half of the Sprint Notes points,
described in prose on that page) and `workshop-activities/` (complete/incomplete
per item). Both are tagless and both hold one TSV per term. They are listed in
`CANVAS_ONLY` in the validator.

**Changing a TSV means re-importing it into Canvas.** Say so in
`canvas/assignments/assignment-readme.md` in the same commit.

## What Does Not Belong Here

Assignment pages hold **assignments**: things submitted, evaluated, and carrying
a weight. Two neighbours are deliberately elsewhere:

- **Grading policy** (points to letter grade, what each letter means, how
  outcome tags work) lives in `learning-objectives/grading.mdx`, because every
  letter is defined in terms of the learning objectives.
- **Rubric conventions** (the three bands, missing-is-zero, evidence over
  prose) live in `assignments/introduction.mdx` and nowhere else. Do not restate
  them on individual assignment pages.

Peer evaluations and project partner evaluations **are** assignments, despite
being completed by someone other than the student: together they are 50% of
every term's grade, and this section is the source of truth for all graded work.

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
cannot see.

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
- A rubric that does not total 100, absent a documented exception.
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
7. If you touched a rubric, you touched the TSV, so add it to the re-import
   list in `canvas/assignments/assignment-readme.md` in the same commit.
