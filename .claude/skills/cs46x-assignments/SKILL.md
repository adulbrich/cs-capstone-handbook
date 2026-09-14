---
name: cs46x-assignments
description: Use when creating or editing assignment pages (MDX files in src/content/docs/assignments/) for the CS 461/462/463 capstone handbook. Covers the frontmatter contract read by the validators, the section skeleton, rubric rules, Canvas mirroring, and grade-weight arithmetic. Always load this skill before writing or editing any assignment file.
---

# Assignment Style Guide

Assignment pages are **the source of truth for all graded work in the course**.
Canvas mirrors them, the syllabi mirror them, and two validators parse them. A
mistake here propagates into student grades and accreditation evidence, which is
why more of this skill is mechanical than the guide or activity skills.

## Writing Voice (applies to everything below)

Lead with the point. Specific nouns and verbs. Cut every sentence that does not
change what the reader will do or understand. No "it's worth noting,"
rule-of-three padding, or vague intensifiers. Opinion is preferred when a
recommendation is required. Code stays exact. For prose, never use emdashes but
use proper punctuation instead.

Students read these pages under deadline pressure. Length is a cost they pay.

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

1. **`outcomes` counts must equal the number of rubric criteria carrying that
   tag.** `scripts/validate-outcomes.mjs` parses the rubric table as the source
   of truth and fails on any disagreement. Tag a criterion, bump the count, in
   the same edit.
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

2. **Intro prose.** One to three paragraphs on why the assignment exists and
   what it is really testing. This is where you are allowed to argue. Say what
   the failure mode is that the assignment kills.

3. **The deliverable section.** Heading names the artifact and, where it
   applies, its length and repository path:

   - `## What You Must Produce`
   - `## What It Must Contain (1 to 2 pages, in \`docs/shipped.md\`)`
   - `## Structure (2 to 3 pages, in \`docs/postmortems/\`)`
   - `## Required Sections`

   Prefer a numbered list when the artifact has named parts a grader will look
   for one by one. State the format, the length, and where it lives.

4. **`## Rubric (100 points)`.** See **Rubric Rules**.

5. **`**AI use:**` paragraph**, required on any assignment whose deliverable is
   a written document. State what AI may legitimately do here, and name the
   specific dishonest use that would fail the assignment. Be concrete:
   "fabricating demo footage, metrics, findings, or user feedback fails the
   assignment; a smaller true number always beats a bigger invented one."

6. *Admonitions.* Optional, but two patterns recur and are worth reusing:
   `:::note[If your project is under NDA]` for the local NDA variation, and
   `:::tip[Why this replaces X]` for defending a design choice students will
   question. Keep each to one idea.

7. **`## Activities That Prepare This`.** The shared recommendations first,
   naming the criterion each one serves. Then, where categories genuinely
   differ, a **By project category** table. Then a `Browse ... when these run
   out.` line naming one or two activity categories.

   Every activity you link here must carry a `Recommended` or `Workshop` badge;
   `scripts/validate-activities.mjs` fails otherwise. Promote and link in the
   same commit.

## Rubric Rules

```md
| Criterion | Points | Outcome |
|---|---|---|
| Criterion name: what specifically is being judged | 25 | SO2 |
| Another criterion, dual-tagged where it genuinely evidences both | 20 | SO2, SO4 |
```

- **Points total exactly 100.** Three documented exceptions, listed in
  `validate-outcomes.mjs` as `RUBRIC_EXCEPTIONS`: the pass/fail workshop
  rubric (`workshop-activities.mdx`), and the two survey-based instruments,
  `peer-evaluations.mdx` and `project-partner-evaluation.mdx`, which run
  through Qualtrics rather than a banded rubric and whose tables carry weights
  instead of points. `sprint-notes.mdx` is not an exception: it uses a
  two-band table, `| Item | Pass (20) | Fail (0) |`, with no Outcome column
  by decision, and the validator totals it to 100 like any other. The band
  text is lifted verbatim from the sprint-note TSV so the page and Canvas
  agree row for row.
- **Three to six criteria is the working range.** Fewer than three cannot
  discriminate; more than six is unaffordable at ~300 students and 6 TAs.
  Two pages currently exceed it (`rfc.mdx` with nine, `team-charter.mdx`
  with seven); whether the range bends or the rubrics consolidate is open
  on #27.
- **Write criteria as observable checks, not qualities.** "Setup: complete,
  copy-pasteable, and actually verified by a fresh run" tells a grader what to
  do. "High-quality documentation" does not.
- **The Outcome column is the accreditation record.** Only tag a criterion when
  the criterion genuinely evidences that outcome for that individual student.
- **Follow the rubric table with per-criterion grading notes** when graders need
  consistency. One line per criterion, in rubric order, saying the first thing
  the grader checks. `repo-checkpoints.mdx` is the model.

Every rubric uses three bands: **Exceeds** (full points), **Meets** (partial),
**Does Not Meet** (low or none). Not submitted, off-topic, or inaccessible to
graders scores zero, stated explicitly rather than folded into Does Not Meet.

## Canvas Mirroring

Each graded assignment has a directory under `canvas/assignments/` holding a
`*-rubric-details.tsv` for the rubric-import browser extension.

- Banded rubrics are **12 tab-separated fields** per row: criterion (with its
  outcome tags in brackets), empty, `true`, high points, `Exceeds Expectations`,
  description, mid points, `Meets Expectations`, description, low points,
  `Does Not Meet Expectations`, description. Bands run full / 80% / 20%.
- Pass/fail rubrics are **9 fields**: criterion, empty, `true`, points, `Pass`,
  description, `0`, `Fail`, description.
- **The set of outcome tags in the TSV must equal the set in the handbook
  rubric table.** `validate-outcomes.mjs` reconciles them and fails on drift in
  either direction. Nothing else in the toolchain reads Canvas, so without that
  check it drifts silently, and it has.
- Changing criteria or points means the TSV must be re-imported into Canvas.
  Say so in `canvas/assignments/assignment-readme.md` when you change one.

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

- Em dashes.
- A rubric that does not total 100, absent a documented exception.
- Outcome tags whose counts disagree with the frontmatter.
- Links to activities that carry no tier badge.
- Explanations that belong in a guide. Link to the guide instead; two
  descriptions of one practice drift, and students read the assignment.
- Grading language on any page other than an assignment page. This section is
  the only place rubric point values live; the points-to-letter table lives
  in `learning-objectives/grading.mdx`.

## Before Finishing

1. `npm run validate:outcomes` (frontmatter, rubric tags, weights, Canvas
   mirror, AssignmentMeta weight text, AI-use paragraph, rubric totals).
2. `npm run validate:activities` (every linked activity is tiered).
3. `npm run validate:downloads` (every `public/` download has an owning page).
4. `npm run validate:dashes` (no em dashes, literal or entity).
5. `npm run build` (MDX, internal links, anchors).
6. If you touched a weight, verify all three terms still sum to 25%.
7. If you touched a rubric, update the Canvas TSV in the same commit and add
   it to the re-import list in `canvas/assignments/assignment-readme.md`.
