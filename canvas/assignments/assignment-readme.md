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

- `memo/`: replaced by the Team Charter (week 2 of fall) and the handbook onboarding pages.
- `research-brief/`: replaced by the RFC (individual design document with a draft, feedback, and revision cycle).
- `progress-report/`: replaced by Sprint Notes and Demos (one page, pass/fail per item, plus a live demo cadence).
- `requirements-update/`: replaced by Repo Checkpoints (`docs/requirements.md` is graded in place, in the repository).
- `technical-design-update/`: replaced by Repo Checkpoints (`docs/design.md` is graded in place, in the repository).
- `setup/`: replaced by the fall week 5 Repo Checkpoint ("rails stood up" gate).
- `retrospective/`: replaced by the Term Retrospective (fall) and the Incident Postmortem (winter).
- `retrospective-and-career/` (old form): replaced by the spring Career and Individual Retrospective and the Project Retrospective.
