# Assignment README

- Each assignment has its own directory under `canvas/assignments/`.
- The current, validated artifact in each live directory is the `*-rubric-details.tsv` for the Canvas rubric-import browser extension. `scripts/validate-outcomes.mjs` reconciles every live TSV against the handbook rubric table it mirrors, in CI and pre-commit; `canvas/assignments/_template/` holds the TSV format the extension imports.
- The body of each assignment in Canvas is the handbook page itself, pasted from the local build (`npm run build`, then the page under `dist/assignments/`), until the import package in `docs/superpowers/specs/2026-08-19-canvas-import-package-design.md` generates it (#5).
- The `*-assignment.html` and `*-rubrics.md` files still present in some directories are pre-revision. Nothing reads them, they describe formats the handbook no longer states, and they must not be pasted into Canvas. Their disposition is decided in #30.

**The [course handbook](https://capstone.alexulbrich.com/assignments/introduction/) is now the source of truth for all graded work.** Canvas mirrors the handbook; when in doubt, the handbook wins, and rubric points in the TSV files must match the handbook rubric tables exactly.

## Grade Architecture (every term)

Four equal components (25% each): Project Partner Evaluation (midterm pulse 5% + final survey 20%), Peer Evaluation (midterm survey 5% + final survey 20%), Individual Evidence (fall and winter: RFC 15% + Defense 10%; spring: Career and Individual Retrospective 15% + Defense/Expo Q&A 10%), and Team Deliverables (term-specific set with the individual contribution modifier).

There are midterm and end-of-term peer evaluation surveys and project partner surveys every term; both now live in the handbook's Assignments section ([peer](https://capstone.alexulbrich.com/assignments/peer-evaluations/), [partner](https://capstone.alexulbrich.com/assignments/project-partner-evaluation/)). Half of each Sprint Note's points are individual (see `individual-contribution/`).

## Four-Skills Pass (August 2026): What Changed in Canvas

Criterion renames that require re-importing rubric TSVs:

| Assignment | Was | Now |
|---|---|---|
| RFC | `AI disclosure: tools, purposes, verification [SO4]` | `Delegation and validation [SO4]` |
| Defense | `Ownership: work they demonstrably own [SO2]` | `Ownership and delegation [SO2, SO4]` |
| Defense | `Judgment: why this approach, what was rejected [SO1]` | adds "what was hard to reverse" |
| Defense | `Role and team accountability [SO5]` | `Role, team accountability, and work distribution [SO5]` |
| Repo Checkpoint | `Build health: CI, tests, quickstart [SO6]` | `Build health and safety net: CI, tests, quickstart, gates [SO6]` |
| Defense | `Communication: clear, honest, handles not-knowing [SO3]` | `Communication, both directions [SO3]` |

Points are unchanged in every case; only labels and band descriptions moved. The Communication rename landed last (2026-08-19) and completes the pass: the criterion now also asks what the student told someone whose work they reviewed and what changed because of it, so all three band descriptions changed and `defense/` needs re-importing. In fall and winter that is the RFC cross-team review; in spring it is code review, because there is no RFC in spring. The **defense Ownership criterion is now dual-tagged `SO2, SO4`**, which is the course's fix for the SO4 concentration concern and the reason per-student defense scores must keep reaching Canvas as program assessment evidence.

**AI policy changed in all three syllabi.** "Briefly disclose any AI use" is gone. The policy is now: state what you delegated, what safety net made that reasonable, and where you validated yourself, with grading on the fit rather than on tool sophistication.

**New Canvas item to create:** one **Workshop Activities** column per term, graded complete/incomplete per item. Fall is 2% across 6 items, winter 1% across 1 item, spring 1% across 1 item. See [Workshop Activities](https://capstone.alexulbrich.com/assignments/workshop-activities/) for the item list and timing. Grading is confirming something real was submitted; there is no quality bar and no rubric, so a grader spends seconds per item. **The old extra-credit activity items are retired.**

**Team Deliverables weights were re-cut to fund this**, keeping every term at 25%. Sprint Notes and Repo Checkpoints are untouched, because they carry the individual contribution modifier and the living-docs gate respectively:

| Term | Changed |
|---|---|
| Fall | Team Charter 5% to 4%; Term Retrospective 4% to 3%; Workshop Activities 2% added |
| Winter | Incident Postmortem 5% to 4%; Workshop Activities 1% added |
| Spring | Project Retrospective 4% to 3%; Workshop Activities 1% added |

All three syllabi were updated to match.

**Re-cut again in September 2026** (#24, #26), still 25% per term. Only Canvas assignment-group weights move; no rubric TSV changes points:

| Term | Changed |
|---|---|
| Winter | Sprint Notes 8% to 10% (a fifth note at week 10); Definition of Shipped 4% to 3%; Incident Postmortem 4% to 3% |
| Spring | Sprint Notes 4% to 6% (3 notes at weeks 2, 4, 6 instead of 2 at weeks 3, 6); Release and Metrics 8% to 7%; Project Handoff 6% to 5% |

## Rubric TSVs Requiring Re-Import (August 2026)

**Release and Metrics changed format** (instructor decision, 2026-08-18). The 8-to-12-minute video plus one-page notes became a **3-minute trailer plus a 2-page report**. A twelve-minute video is not an artifact anyone watches to the end, and measured results belong in text where they can be checked and quoted. Criteria and points both changed, so `spring-release/` must be re-imported. Total is still 100, and the outcome tags are unchanged (SO2 x2, SO3, SO6, L08).


`node scripts/validate-outcomes.mjs` now reconciles every Canvas rubric TSV against the handbook rubric table it mirrors and fails on any mismatch. That check found five files out of sync. **All five must be re-imported into Canvas**; the first four change criteria and point splits, not just labels.

| File | Was | Now |
|---|---|---|
| `team-charter/` | 16 criteria, 5-10 points each | 7 criteria matching the handbook (20/15/10/15/15/15/10) |
| `project-retrospective/` | 10 criteria | 6 criteria (20/20/25/15/10/10) |
| `project-handoff/` | 7 criteria | 5 criteria (15/30/20/10/25) |
| `project-landing-page/` | 6 criteria | 4 criteria (30/35/15/20) |
| `sprint-note/` | criteria tagged `[SO5]` and `[L07]` | tags removed |

The first four were written before the handbook rubrics were rewritten and were never regenerated, so a grader importing them would have graded against criteria and point values the handbook does not state. Every total is still 100.

The sprint-note case is the opposite error: the TSV claimed outcome tags that `sprint-notes.mdx` deliberately does not carry, those having been removed when the outcome claim was found to be over-reaching. Harmless for accreditation, since sprint notes are team-level and count zero either way, but it is Canvas asserting evidence the source of truth does not.

## Rubric TSVs Requiring Re-Import (September 2026)

Criterion text changed on the branch review (#40). Points and outcome tags are unchanged; the band descriptions are, so the TSVs must be re-imported:

| File | What changed |
|---|---|
| `project-retrospective/` | Arc and pivots: rewritten as an observable check (dated, linked milestones; each pivot with decision, date, evidence) |
| `project-landing-page/` | Value proposition: rewritten as an observable check (one sentence, user's terms, no course vocabulary) |
| `career-retrospective/` | PR portfolio: the retired track vocabulary replaced by "NDA teams", matching the handbook page (#33) |
| `incident-postmortem/` | Corrective actions: "verifiable at the next repo checkpoint" became "at the week-10 repo checkpoint or in the week-10 sprint note", since a fifth winter note now exists at week 10 (#26) |

The fall Term Retrospective's Writing criterion changed in the same way, but no TSV for it exists under `canvas/assignments/`; it needs one before the fall rubric is built in Canvas.

**All three syllabus bodies need re-pasting into Canvas** from `canvas/syllabus/` (2026-09-13, #22 and #32): the grade table is the 11-band handbook scale, the term labels read Fall 2026, Winter 2027 and Spring 2027, and the late-policy paragraph is a summary that links the handbook instead of a second full statement.

## Schedule

### CS 461 (Fall Term)

| Week | Due |
|------|-----|
| 1-5 | Workshop Activities (6 items, complete/incomplete) |
| 2 | Team Charter |
| 4 | Sprint Note 1; RFC draft |
| 5 | Repo Checkpoint 1 (rails stood up); RFC cross-team feedback |
| 6 | Sprint Note 2 |
| 7-9 | Defense (during cohort check-ins) |
| 8 | Sprint Note 3; RFC final (revision and decision) |
| 9 | Term Retrospective |
| 10 | Sprint Note 4; Repo Checkpoint 2 ("hello, production" gate) |

### CS 462 (Winter Term)

| Week | Due |
|------|-----|
| 2 | Sprint Note 1 |
| 2-3 | Workshop Activities (1 item, complete/incomplete) |
| 3 | Definition of Shipped (v1, partner-agreed) |
| 4 | Sprint Note 2; RFC draft |
| 5 | Repo Checkpoint 1 (integration health); RFC cross-team feedback |
| 6 | Sprint Note 3 |
| 7-9 | Defense (during cohort check-ins) |
| 8 | Sprint Note 4; RFC final (revision and decision) |
| 9 | Incident Postmortem |
| 10 | Sprint Note 5; Repo Checkpoint 2 (release candidate gate) |

### CS 463 (Spring Term)

| Week | Due |
|------|-----|
| 2 | Sprint Note 1 |
| 2-3 | Workshop Activities (1 item, complete/incomplete) |
| 4 | Sprint Note 2 |
| 6 | Sprint Note 3 |
| 7 | Landing Page |
| 7-10 | Defense (Expo Q&A may substitute, at the instructors' discretion) |
| 8 | Release and Metrics |
| 9 | Project Retrospective; Career and Individual Retrospective |
| 10 | Project Handoff |

## Deprecated Assignments

These directories are kept for reference but are no longer assigned:

- `memo/`: folds into the fall RFC (the stakeholder context and constraints become the RFC's problem framing) and the early partner conversations.
- `research-brief/`: folds into the RFC (the background research becomes the RFC's evidence and analysis).
- `progress-report/`: replaced by Sprint Notes and Demos (one page, pass/fail per item, plus a live demo cadence).
- `requirements-update/`: replaced by Repo Checkpoints (`docs/requirements.md` is graded in place, in the repository).
- `technical-design-update/`: replaced by Repo Checkpoints (`docs/design.md` is graded in place, in the repository).
- `setup/`: replaced by the fall week 5 Repo Checkpoint ("rails stood up" gate).
- `retrospective/`: replaced by the Term Retrospective (fall) and the Incident Postmortem (winter).
- `retrospective-and-career/` (old form): replaced by the spring Career and Individual Retrospective and the Project Retrospective.
