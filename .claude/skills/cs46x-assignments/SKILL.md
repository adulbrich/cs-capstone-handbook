---
name: cs46x-assignments
description: Assignment pages, rubric CSVs, and grade weights for the CS 461/462/463 capstone handbook. Use before editing an assignment page (src/content/docs/assignments/), a rubric CSV under canvas/assignments/, or a grade weight wherever it is stated.
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
reader about the value of retrospectives has taken space from the deliverable.
The guide is one link away and that is where the why lives; link it rather
than restating it, since two descriptions of one practice drift.

Length is not the reason to compress, though. A rubric criterion a student
misreads costs them a grade, so an extra clause that removes the ambiguity is
cheap. Cut restatement, not precision.

### Sourcing

**Name the source the first time the page names a tool, standard, format, or
technique.** If the assignment says "follow conventional commits", link the
specification. If it says "WCAG AA", link the standard. A practice every
stack has, such as pinning dependency versions, is not a named technique and
has no single owner: state it plainly and link nothing. A named tool,
standard, or technique still gets its link. Projects range from web apps to
game engines to firmware, and one ecosystem's documentation tells the rest
that the page was not written for them. A student who cannot find the
standard you are grading against will guess at it, and then contest the grade.

Research findings belong in the guide the assignment links, not here (the
last paragraph of Claims in `docs/agents/voice.md`).

A link to the standard specifies the deliverable: "Use
[conventional commits](https://www.conventionalcommits.org/)" says what is
due, and that is all it says.

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
      due_label: <optional: the due date in words for the card, "Week 7 or 9">
      titles: { fall: [<one per week listed>] }  # only with {title} in the name
      numbering: year  # optional: {n} continues across terms (Sprint Notes 1 to 12)
      weight: <the family's percent of the term grade>
      points: 100
      submission: pdf | video | url | image | survey | text | none, or a list
      late: standard | not-accepted | class-week | survey-closes | session | none
      rubric: <dir>/<name>-rubric.csv
---
```

`weight` is a scalar when the page is worth the same in every term it runs, and
a per-term map when it varies:

```yaml
  weight:
    fall: 8
    winter: 10
    spring: 6
```

`canvas` lists the page's **Canvas entries**, one family per item, and each
family expands to one Canvas assignment per week listed. **Never bundle
entries** (AGENTS.md hard rule 6): a draft and a final, or four sprint notes,
are separate Canvas assignments with their own due dates and grades, however
the page groups them for the reader. `docs/decisions/2026-09-23-canvas-entry-model.md`
has the model; `peer_review_week` marks an entry using Canvas's own peer review.
`due_label` replaces the weeks on the summary card where they mislead or run
long ("Sunday of each sprint's second week", "Week 7 or 9"); the weeks still
set the Canvas due dates.

`late` is required on every family: what a late or missed entry costs. Each
value's wording lives once, in `LATE` in `src/lib/canvas-entries.mjs`, and
the summary card, the entry's Canvas box (its Late work row), and the table
on `assignments/introduction.mdx` all render it. `standard` is the 48-hour
rule most submissions follow; `not-accepted` is the sprint note's;
`class-week` the workshops'; `survey-closes` every survey's; `session` the
Defense's; and `none`, which shows nothing, is for an entry with nothing to
submit of its own that follows another (the individual contribution). A new
rule is a new key in `LATE`, with its `needs` if it fits only one
submission, plus its row in `ORDER` in `src/components/LateWorkTable.astro`
(the build fails without one), never a sentence on the page.

Nine rules the validators enforce, all of which have been gotten wrong before:

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
4. **`weight` and `terms` are reconciled against the grade grid** in
   `assignments/introduction.mdx`. A scalar on a page whose weight varies by
   term is a hard failure, as is a declared term no grid row gives, or a page
   with an `assignment:` block and no row. See
   **Grade Weights** below.
5. **The page follows the Section Skeleton below.** `<AssignmentSummary />`
   and never `<AssignmentMeta>`; What You Submit and Rubric present; the fixed
   sections in order; nothing after Activities but References; every rubric
   table inside `## Rubric`.
6. **What You Produce ends its own text on one `**AI use:**` paragraph**,
   before any `###`, and a page without What You Produce has none.
7. **Rubric points total the entry's `points`** per CSV (see **Rubric
   Rules**).
8. **The `canvas` entries reconcile.** Per term, family weights sum to the page
   weight; within one Canvas group, every entry carries the same weight per
   point (Canvas weights a group's entries by points); every family's rubric
   is rendered on the page and every rendered CSV belongs to a family; every
   `###` under Rubric names a family, and the family `###`s under What You
   Submit, if any, match them.
9. **`late` fits the submission.** Every family has a known `late` key;
   `none` and `session` only with `submission: none` alone, and
   `survey-closes` only with `survey` alone (each rule's `needs` in
   `LATE`). The check runs one way: a survey may take another rule.

A page with no `assignment:` block is skipped by the validator entirely: no
rubric CSV, no weight, no AI-use paragraph, no outcome tags. Three pages
are in that state deliberately: `introduction.mdx`, `demo-day.mdx`, and
`expo.mdx`. A fourth needs a reason. **This is the supported shape for an
ungraded item**, paired with a Canvas item at 0 points with
`omit_from_final_grade`: add it to `ZERO_POINT` in `scripts/canvas-export.mjs`
and to the Week 0 Checklist in `STAFF-RUNBOOK.md`. Do not reach for
`weight: 0`, which passes Zod but keeps the block and so re-arms the
rubric and AI-use checks.

Demo Day also has a 100-point Presentation entry in an Extra Credit Canvas
group, outside the four components (#305). No frontmatter can carry it, so its
page, the assignments overview, the syllabi, and the extra
entries in `scripts/canvas-export.mjs` each state it.

Two **graded** pages share the shape for a different reason:
`resume-and-intent.mdx` and `career-retrospective.mdx` run entirely in Canvas
under the co-instructor (#197), at their real weights, not at 0 points. Each
shows only its hand-written `<AssignmentMeta>` and "Please check the Canvas assignment.", and
the Section Skeleton below does not apply to them. Do not rebuild them.

Not enforced, still required: the
three bands, criteria written as observable checks, and the Canvas CSV band
descriptions (only the tag sets are reconciled). So is
`learning-objectives/mapping.mdx`, the hand-maintained view of the outcome
map: a change to a criterion's tags updates it in the same commit.

## Section Skeleton

Every graded page has the same sections in the same order, so a student who
has read one page knows where to look on the next, and the Canvas export can
cut a page into one body per entry by heading name. Sections in **bold** are
required; `validate-outcomes.mjs` checks the order.

1. **`<AssignmentSummary />`**, immediately after the imports, before any
   prose. It is generated from the `assignment` frontmatter: a header line
   saying who submits, when the page runs, and its weight, then a row per
   Canvas entry family with its due week, weight, and a link to its rubric.
   Families sharing a name are one row (the partner's End-of-Term Survey);
   a titled family gets a row per term (the workshops).

   ```mdx
   import AssignmentSummary from '/src/components/AssignmentSummary.astro';

   <AssignmentSummary who="Individual, held as a team session" />
   ```

   - `who` overrides "Team" or "Individual" (from `level`) where the page
     needs the qualified form ("Team, with the individual contribution
     modifier"; "Completed by your project partner, not by you").
   - The slot is optional and holds **one** qualifying clause, in MDX.
     Anything longer belongs in the intro prose.
   - The card ends on the late rule, from each family's `late` key: after
     the slot when there is one, alone when there is none. A `none` family
     adds nothing, so Sprint Notes shows only the note's rule; a page whose
     families carry two different rules gets one line each, naming its
     entries. Never restate the rule in the slot or the prose.
   - Nothing on the card is typed by hand. A due date the weeks state badly
     goes in the family's `due_label`.

2. **Intro prose.** One to three paragraphs, in second person, on what the
   student produces, by when, and what makes it good. **The page addresses
   the student about their work.** Say why it matters **to the student** (an
   interviewer can ask about it, the partner will expect it) and stop there.
   A sentence whose subject is the course, the staff, or a past cohort (why
   the assignment exists, what it replaced, what earlier teams did) is course
   design, and it goes where `AGENTS.md`, "Where decisions are recorded",
   puts decisions, never on the page.

3. **`## What You Produce`**, on every page where the student makes an
   artifact. The heading is always this; the length goes in its first lines
   ("The postmortem is two to three pages."), never in the heading. Named
   parts are `###` subsections, or a numbered list when a grader looks for
   them one by one. Its own text, before the first `###`, ends on the
   **`**AI use:**` paragraph**: what AI may legitimately do here, and the
   specific dishonest use that fails the assignment. Be concrete:
   "fabricating demo footage, metrics, findings, or user feedback fails the
   assignment; a smaller true number always beats a bigger invented one."

   Only what an AI tool or a successor needs to work on the product goes in
   the project repository: the living docs Repo Checkpoints lists (#302),
   and the decision records in `docs/rfcs/` or `docs/adr/`.
   Team documents (the charter, retrospectives, the handoff document) do
   not, and the page says where they live instead.

   A page whose student makes nothing to hand in (Defense, Term Startup, the
   two evaluation pages) has no What You Produce and no AI-use paragraph.

4. *Explanation sections*, optional: how a session runs, what deployed means, the
   partner's facets, the demo cadence. Named for their content.

5. **`## What You Submit`**, in one or two lines: the format and what goes in
   it. Every document is submitted as one PDF; link the rule in
   `assignments/introduction.mdx` ("Submitting Your Work") rather than
   restating what its cover carries. Something with nothing to hand in says
   so and why ("Nothing to upload: ..."). A format never goes in a heading,
   and neither does a percentage (`docs/agents/voice.md`, Structure). The
   NDA variation of what to submit goes here, as a
   `:::note[If your project is under NDA]`.

6. **`## Rubric`**, exactly that, whose table is a `<RubricTable>` rather than
   Markdown. Prose belongs under it: per-criterion grading notes and the
   page's own consequences for not completing it (the Bidding Survey's
   placement without your input), stated in place with no link to the late
   policy; the late rule itself is the card's. One sentence may precede the
   table where it frames the whole rubric. See **The Rubric Lives in the
   CSV** and **Rubric Rules**.

7. **`## Activities That Prepare This`.** The shared recommendations first,
   naming the criterion each one serves. Then, where projects actually
   differ, an **Examples** table with the header `| If | Activities |`, each
   row keyed on a situation this assignment cares about ("your top rung
   needs people outside the team to use it on their own"), never on a kind
   of project; rows may overlap. Its lead-in carries the way out: "A project
   may match several rows or none. If none fits, ask your partner or mentor
   which activities do." (`docs/decisions/2026-10-30-examples-by-concept.md`
   has the rule.) Then a `Browse ... when these run
   out.` line naming the activity pages to browse,
   usually one or two. Nothing follows it but
   `## References` on a page that cites sources.

   This section drives the activity badges. Linking an activity here makes
   it Recommended and adds a Prepares badge naming this page, linking back to
   this section, to the activity's badge line (`<ActivityMeta>`, computed by
   `src/lib/activity-links.mjs` from the page's MDX); removing the link
   demotes it. So the section's heading stays exactly
   `## Activities That Prepare This`, it ends at the next `## `, and every
   activity link inside it counts, prose and Examples table alike.
   `scripts/validate-activities.mjs` fails on a link whose anchor matches no
   activity heading. Demoting an activity on the schedule's Optional line
   also means removing it from the schedule in the same commit.

   Two pages go without it: Workshop Activities, whose entries are
   activities, and the Bidding Survey, which no activity prepares.

### Entries with a rubric of their own

Where a page's Canvas entries are graded differently (the RFC's draft and
final, a sprint's team note and individual contribution, the partner's pulse
and survey, the four repo checkpoints' milestones), each gets one `###` under
`## Rubric`, named exactly as the
`canvas` family with `{n}` written as `N` ("Sprint Notes N"). Where they also
differ in what is handed in, each gets the same `###` under `## What You
Submit`, with any procedure of its own (the RFC's peer review) as `####`
inside it. Where they differ in what the student produces instead (the repo
checkpoints' milestones), each gets a `###` under `## What You Produce`, after
the AI-use paragraph, that starts with the entry's name and adds the
milestone's name ("Repo Checkpoint 1: Set Up"), and What You Submit stays the one
PDF. A link about what the entry asks for takes that heading's anchor; a
link about its rubric takes the rubric heading's. Where every entry shares one rubric (the workshops, Peer
Evaluations), there are no entry headings.

The Canvas export gives each entry the `###` sections named for it and drops
the others, so a misspelled entry heading puts the wrong text in Canvas. The
validator checks the names under Rubric and What You Submit, not under What
You Produce, so start a What You Produce heading with the entry's exact name.

*Admonitions* are optional anywhere. The pattern worth reusing is
`:::note[If your project is under NDA]` for the local NDA variation. Keep each
to one idea about the student's work.

## Rubric Rules

The rubric is a CSV, not a Markdown table (see **The Rubric Lives in the CSV**).
The rules below are about its content.

- **Points total the Canvas entry's `points`**, summed as each criterion's
  highest band, because Canvas grades an entry out of its rubric. An entry
  is 100 points unless it shares a Canvas group with a heavier entry; then
  its points are in proportion to its weight, since the group weights its
  entries by points. The survey pages are no exception: their criteria
  carry the facet or score weights as points (#300).
- **One CSV per distinct rubric, not per entry.** Sprint Notes 1 to 4 share
  one CSV; every workshop shares one. The RFC's draft and final differ, so
  they have two. A page with several renders each under its entry's `###`
  in `## Rubric`, and its outcome counts are the sum across them.
- **Three to six criteria is the working range.** Fewer than three cannot
  discriminate. More is allowed when each criterion is a separable
  observable check and the grading cost is accepted: at ~230 students and
  4 TAs every criterion is a line a grader reads on every submission, so
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
  the grader checks, never restating a band. Where What You Produce gives each
  shared criterion a subsection, the line closes that subsection instead.

Every rubric uses three bands: **Exceeds** (full points), **Meets** (partial),
**Does Not Meet** (low or none), except these: the two-band ones (the sprint note, the workshops, Term
Startup, the Bidding Survey); the individual contribution's Full, Partial, and Zero; `defense`,
which adds a fourth; the surveys, whose bands are the instrument's own scale; and the four
Repo Checkpoint 1 criteria, which keep the three bands at zero points to show a team where
it stands before they count. Not submitted, off-topic, or inaccessible to graders scores zero,
stated explicitly rather than folded into Does Not Meet.

## The Rubric Lives in the CSV

**Do not write a rubric table in MDX.** Since #144 each assignment's rubric is
`canvas/assignments/<dir>/<name>-rubric.csv`, rendered on the page by
`src/components/RubricTable.astro` and imported through the Canvas Rubrics
page. One file, two destinations, nothing to keep in sync.

```mdx
import RubricTable from '/src/components/RubricTable.astro';
import rubricCsv from '/canvas/assignments/team-charter/team-charter-rubric.csv?raw';

## Rubric

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
- **Two bands, 10 fields.** The sprint note's `Pass` at full and `Fail` at 0;
  the workshops', Term Startup's, and the Bidding Survey's `Complete` at
  full and `Incomplete` at 0.
- **Individual contribution.** `Full` at 100, `Partial` at 99 with a range
  down to 1 at the grader's discretion, and `Zero` at 0.
- **Four bands, 16 fields.** `defense` adds a `Missing` band at 0 for an
  unexcused no-show, which the other rubrics state in prose instead.
- **The surveys' own scales.** The partner's facets keep three bands, 13
  fields, named for the anchors: `Top anchor` / `Middle anchor` /
  `Low anchor` at full / 80% / 50%. The peer ratings and the Midterm Pulse
  have five bands, 19 fields; the partner's spring Verification and
  Validation ladder six, 22 fields.

A criterion a reader needs where the page discusses it, not only in the rubric at
the bottom, is shown with `<RubricCriterion csv={...} sourceLabel="..."
criterion="..." />` (`src/components/RubricCriterion.astro`): the same CSV, one
criterion, one row per band. The spring outcome ladder is the only one. Never
retype the bands in MDX to get the same effect.

Every Canvas rubric directory is rendered by a page. `individual-contribution/`
is rendered on Sprint Notes, `workshop-activities/` on Workshop Activities; both
are tagless. The directory-to-page map and the deprecated-directory list live at
the top of `validate-outcomes.mjs`, and a rubric directory that claims outcomes
without being in either list fails the check rather than being skipped.

**Changing a CSV means re-importing it into Canvas.** Say so on the PR
body's Canvas mirror line, naming each CSV.

## What Does Not Belong Here

Assignment pages hold **assignments**: things submitted and evaluated. Almost
all carry a weight; Demo Day and the Expo are the exceptions, because students
do not act on what Canvas does not put in their to-do list and the schedule
cannot do that. Two neighbours are deliberately elsewhere:

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

## Grade Weights

Each term's grade is four components of 25% each, each split across several
assignment pages, and **every component must sum to exactly 25% in every
term**. A weight appears in three places that must agree:

1. the page's `assignment.weight` frontmatter,
2. the grade grid in `assignments/introduction.mdx`,
3. the three syllabi.

The validator reconciles the first two against each other. The syllabi it
cannot see. The two Canvas-owned stubs have no frontmatter weight: their copy
is the `<AssignmentMeta>` text plus their grade grid rows on
`assignments/introduction.mdx`. The validator sums those rows into Individual
Evidence but has no page weight to reconcile them against.

Raising one weight means cutting another; `validate-outcomes` checks the sums.
When choosing what to cut, protect Sprint Notes and Repo Checkpoints: they
carry the individual contribution modifier and the living-docs review.

## NDA Projects

There is no "Track A / Track B" vocabulary. The default is that staff have
repository read access; where an NDA team does something different, say so
**locally on the affected page** in a short `:::note`, not as a global concept
the student has to learn first.

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

1. Run `npx lefthook run pre-push --force` and get exit 0 (`AGENTS.md`,
   Validation). For an assignment page two of its commands carry most of the
   weight: `validate:outcomes` checks the frontmatter, rubric tags, weights,
   Canvas entries, the section skeleton, the AI-use paragraph, and rubric
   totals; `canvas:export -- --strict` checks the page still converts to a
   Canvas body.
2. If you touched a weight, change it in the three syllabi and, for a
   Canvas-owned stub, its `<AssignmentMeta>` text, in the same commit; no validator reads them.
   The Demo Day extra credit has its own list of copies, in its paragraph
   under Frontmatter Contract.
3. If you touched a rubric, you touched the CSV, so name it on the PR
   body's Canvas mirror line.
