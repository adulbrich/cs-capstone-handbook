# Assignment README

- Each assignment has its own directory under `canvas/assignments/`.
- Assignments are stored in HTML that are ready to paste in Canvas.
- Rubrics are stored in Markdown files in the same folder as the assignment HTML.
- Rubric details for the Canvas rubric-import browser extension are stored in `*-rubric-details.tsv` files in the same folder.
- There is a template for the assignment and rubrics structures in `canvas/assignments/_template/`.

**The [course handbook](https://capstone.alexulbrich.com/assignments/introduction/) is now the source of truth for all graded work.** Canvas mirrors the handbook; when in doubt, the handbook wins, and rubric points in the TSV files must match the handbook rubric tables exactly.

## Grade Architecture (every term)

Four equal components (25% each): Project Partner Evaluation (midterm pulse 5% + final survey 20%), Peer Evaluation (midterm survey 5% + final survey 20%), Individual Evidence (fall and winter: RFC 15% + Defense 10%; spring: Career and Individual Retrospective 15% + Defense/Expo Q&A 10%), and Team Deliverables (term-specific set with the individual contribution modifier).

There are midterm and end-of-term peer evaluation surveys and project partner surveys every term. Half of each Sprint Note's points are individual (see `individual-contribution/`).

## Four-Skills Pass (August 2026): What Changed in Canvas

Criterion renames that require re-importing rubric TSVs:

| Assignment | Was | Now |
|---|---|---|
| RFC | `AI disclosure: tools, purposes, verification [SO4]` | `Delegation and validation [SO4]` |
| Defense | `Ownership: work they demonstrably own [SO2]` | `Ownership and delegation [SO2, SO4]` |
| Defense | `Judgment: why this approach, what was rejected [SO1]` | adds "what was hard to reverse" |
| Defense | `Role and team accountability [SO5]` | `Role, team accountability, and work distribution [SO5]` |
| Repo Checkpoint | `Build health: CI, tests, quickstart [SO6]` | `Build health and safety net: CI, tests, quickstart, gates [SO6]` |

Points are unchanged in every case; only labels and band descriptions moved. The **defense Ownership criterion is now dual-tagged `SO2, SO4`**, which is the course's fix for the SO4 concentration concern and the reason per-student defense scores must keep reaching Canvas as program assessment evidence.

**AI policy changed in all three syllabi.** "Briefly disclose any AI use" is gone. The policy is now: state what you delegated, what safety net made that reasonable, and where you validated yourself, with grading on the fit rather than on tool sophistication.

**New Canvas items to create:** six zero-point complete/incomplete workshop activities, listed with their timing in the [activities introduction](https://capstone.alexulbrich.com/activities/introduction/). They carry no weight; the mark exists so students and TAs can both see the work happened, and so a skipped workshop is visible as a trigger signal alongside a low score on the criterion it feeds. **The old extra-credit activity items are retired.**

## Schedule

### CS 461 (Fall Term)

| Week | Due |
|------|-----|
| 2 | Team Charter |
| 4 | Sprint Note 1; RFC draft |
| 5 | Repo Checkpoint 1 (rails stood up); RFC cross-team feedback |
| 6 | Sprint Note 2 |
| 7-9 | Defense (during cohort check-ins) |
| 8 | Sprint Note 3; RFC final (revision and decision) |
| 10 | Sprint Note 4; Repo Checkpoint 2 ("hello, production" gate); Term Retrospective |

### CS 462 (Winter Term)

| Week | Due |
|------|-----|
| 2 | Sprint Note 1 |
| 3 | Definition of Shipped (v1, partner-agreed) |
| 4 | Sprint Note 2; RFC draft |
| 5 | Repo Checkpoint 1 (integration health); RFC cross-team feedback |
| 6 | Sprint Note 3 |
| 7-9 | Defense (during cohort check-ins) |
| 8 | Sprint Note 4; RFC final (revision and decision) |
| 9 | Incident Postmortem |
| 10 | Repo Checkpoint 2 (release candidate gate) |

### CS 463 (Spring Term)

| Week | Due |
|------|-----|
| 3 | Sprint Note 1 |
| 6 | Sprint Note 2 |
| 7-10 | Defense (Expo Q&A may substitute, at the instructors' discretion) |
| 8 | Release and Metrics; Landing Page |
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
