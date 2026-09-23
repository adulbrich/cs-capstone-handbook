# Assignment README

- This directory holds one validated `<name>-rubric.csv` per distinct rubric of every live assignment except the two [owned in Canvas](#owned-in-canvas-resume-and-intent-and-the-career-retrospective-197), in the format of Canvas's rubric import, plus Canvas's own template in `_template/`. Nothing else: the pre-revision HTML bodies, the Markdown rubric copies and the retired assignment directories were removed under #30 (decided 2026-09-11), and git history keeps them.
- `scripts/validate-outcomes.mjs` reads every CSV as the rubric: it reconciles the outcome tags in the Criteria Name column against the page's frontmatter, totals each rubric to 100, and checks that each page renders its own CSVs and that its `assignment.canvas` entries declare every one. Runs in CI and pre-commit.
- The body of each assignment in Canvas is the handbook page itself, pasted from the local build (`npm run build`, then the page under `dist/assignments/`), until the import package in `docs/decisions/2026-08-19-canvas-import-package-design.md` generates it (#5).
- One CSV per distinct rubric, not per Canvas entry (#259). Every page lists its Canvas entries in `assignment.canvas` frontmatter: the exact name, the Canvas assignment group, the weeks due per term, the weight, the points, the submission type, and the CSV. That list is what to create in Canvas: the page renders it for students as the Submissions table (entries, due weeks, weights, submission), and the frontmatter adds the group and points each entry needs. Entries never bundle: four sprint notes are four Canvas assignments, not one column.

**All graded work except the two assignments owned in Canvas is authored in the [course handbook](https://capstone.alexulbrich.com/assignments/introduction/), and each rubric here is the only copy of itself.** Once imported, Canvas is what students go by, as the syllabi say, so a fix made only in Canvas has to be made here too or the next import undoes it. Since #144 the handbook page renders this directory's CSV rather than restating it, so there is no second copy of any rubric and nothing to keep in sync by hand. Editing a CSV changes both the handbook page and what the next Canvas import carries.

## Rubrics Moved to Canvas's Import Format

Canvas now imports rubrics itself, from the Rubrics page of a course, using the template in `_template/import_rubric_template.csv`. Every rubric here was converted to that format, and the browser extension is retired. Each `*-rubric-details.tsv` became `<name>-rubric.csv` in the same directory:

- CSV with a header row in place of headerless TSV. Fields holding a comma or a quote are quoted, so edit these in a spreadsheet or a CSV-aware editor.
- A new first column, Rubric Name, the same on every row of a file. It is the name Canvas lists the rubric under, taken from the page's Canvas entry name, or the assignment name where one rubric serves several entries.
- Each rating group is now name, description, points. The TSV put points first.
- Criteria Enable Range stays `true` on every criterion, as `use_range` was.

**Nothing students or graders see changed.** Every criterion, description, band, point value and outcome tag was checked equal, file by file, between the old parser's reading of each TSV and the new parser's reading of its CSV. A rubric already in Canvas does not need re-importing for this change. The pending re-imports below now take the CSV named in each. An import may add a second rubric rather than replace the one already in the course, so after re-importing, check the course's rubric list and delete the old one if both are there. Import `defense/defense-rubric.csv` first as the check that Canvas takes a fourth rating group and the quoted fields.

The sections below this one predate the move and name the old `.tsv` files where they record history.

## Re-import Required: Team Charter (#263)

`team-charter/team-charter-rubric.csv`: Exceeds on the Definition of Done now accepts a gate that is not built yet if the charter names the sprint it lands in and its owner. Exceeds on CONTRIBUTING.md and the AI context file accepts an AI context file whose parts that cannot be written before there is code are listed with an owner. The Meets bands change to match. Points and tags are unchanged.

## Re-import Required: RFC Final (#262)

`rfc/rfc-final-rubric.csv`: the Problem framing bands no longer require a decision that is "currently live". Exceeds asks for a decision that is real and current: still open in fall; in winter, open or already being acted on, with the RFC still changing how it is verified, reversed, or continued. Does Not Meet now names an RFC that justifies a decision it no longer changes, in place of "a retrospective justification of work already built". Points and tags are unchanged. Re-import it on RFC Final Draft, in both terms. Import this after the #259 split if both are pending.

## Re-import Required: Sprint Note (#260)

`sprint-note/sprint-note-rubric.csv`: the Working software evidence Pass band now says when a video may replace the live demo (a missed check-in, or a TA who could not meet) and how it is recorded (media.oregonstate.edu, unlisted, captioned, one timestamp per student). Points and tags are unchanged. Re-import it on every Sprint Notes N entry.

## Canvas Changes: Workshops Named and Due That Week (#285)

- Rename every workshop entry to its page title: **Workshop N: Activity Name**, as the Workshop Activities page's entries table lists them (fall "Workshop 1: User Story Mapping" to "Workshop 5: Identify Success Metrics", winter three, spring one).
- A workshop earns credit only in class or by the end of the week its class happened. Set each entry's due date and "until" date to the end of that week, so no late submission is accepted. The end-of-term allowance is gone.
- The rubric is unchanged.

## Canvas Changes: One Entry per Due Date (#259)

Each Canvas assignment has its own due date, late window, grade and submission, so none may hold several (`AGENTS.md` hard rule 6). The Submissions table on each handbook page lists what to create. What changes from the fall course as it stood before #259:

| Canvas before #259 | Change | Rubric |
|---|---|---|
| RFCs group (15%): RFC Draft + Peer Review, RFC Final Draft, 100 points each | Split into two groups: **RFC Draft** (5%) holding RFC Draft + Peer Review, **RFC Final** (10%) holding RFC Final Draft. Turn on Canvas peer review for the draft entry, reviews due end of week 5, cross-team pairings assigned by staff. | Import `rfc/rfc-draft-rubric.csv` (new) and `rfc/rfc-final-rubric.csv` (was `rfc-rubric-details.tsv`: Feedback given moved to the draft rubric, Revision now 15). |
| Sprint Notes Individual Contributions, one 400-point entry | Delete it. Create **Sprint Notes 1: Individual Contribution** to **Sprint Notes 4: Individual Contribution**, 100 points each, in the Sprint Notes group, no submission, due with the matching note, full marks by Set Default Grade. Winter has 5, spring 3. | Import `individual-contribution/individual-contribution-rubric.csv` (one criterion, Full 100 / Half 50 / Zero 0) on every one. The three per-term TSVs are deleted. |
| Workshop 1 to Workshop 5, 100 points each | No change to the entries. | Import `workshop-activities/workshop-activities-rubric.csv` (one criterion, Complete 100 / Incomplete 0) on every workshop entry, every term. The three per-term TSVs are deleted. |

No other entry, weight, or rubric changes. The Sprint Notes group stays 8% in fall: 4 notes and 4 individual entries at 100 points each are 1% apiece.

## Re-import Required: 9 Rubrics, 1 New (#144)

Since #144 the handbook page renders this directory's TSV, so a rubric exists
once. Populating **field 2**, Canvas's criterion description column, moved the
sentence the handbook rubric table used to carry after the criterion name
("Setup: complete, copy-pasteable, and actually verified by a fresh run" becomes
the criterion `Setup` with that sentence as its description). Canvas graders now
see the check rather than only the label.

**Points, band descriptions and outcome tags are byte-identical in every file.**
Only field 2 changed, so no score moves and no gradebook is affected.

**Re-import these 9:**

`defense`, `definition-of-shipped`, `incident-postmortem`,
`project-handoff`, `project-landing-page`, `project-retrospective`,
`repo-checkpoint`, `rfc`, `spring-release`.

**Create this one in Canvas:** `term-retrospective`. The fall Term Retrospective
had a handbook rubric and no TSV, which this file recorded as owed. Five
criteria at 25/20/20/25/10, three bands.

**Do nothing for these two:** `sprint-note` and `team-charter` are unchanged.
Every one of their handbook criterion clauses only restated its own Exceeds
band, so field 2 stayed empty rather than printing the same sentence twice in
one row. 23 of the 68 descriptions produced were dropped: 18 for restating their
own band, three that restated it less exactly, and two from `repo-checkpoint`
that described the page rather than the work ("(see table above)" and a
parenthetical grader note, neither of which means anything in Canvas).
**45 of the 75 criterion rows across the 14 rendered TSVs carry a
description.**

**Not rubrics students are shown, unchanged and not re-imported:**
`individual-contribution` and `workshop-activities`. Both are tagless, both held
one TSV per term, and no handbook page rendered either. Superseded by #259: each
is now one TSV, rendered on its page, and both must be imported (see the #259
section above).

## Grade Architecture (every term)

Four equal components (25% each): Project Partner Interactions (how the team works with the partner, scored by them: midterm pulse 5% + final survey 20%; a mentor, instructor, or TA stands in where a team has no partner), Peer Evaluation (midterm survey 5% + final survey 20%), Individual Evidence (fall: RFC 15% + Defense 8% + Resume and Intent 2%; winter: RFC 15% + Defense 10%; spring: Career and Individual Retrospective 15% + Defense 10%), and Team Deliverables (term-specific set with the individual contribution modifier).

There are midterm and end-of-term peer evaluation surveys and project partner surveys every term; both now live in the handbook's Assignments section ([peer](https://capstone.alexulbrich.com/assignments/peer-evaluations/), [partner](https://capstone.alexulbrich.com/assignments/project-partner-evaluation/)). Midterm surveys are sent week 5 and close at the end of week 6; final surveys are sent week 9 and close at the end of week 10. Half of each Sprint Note's points are individual (see `individual-contribution/`).

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

**AI policy changed in all three syllabi.** "Briefly disclose any AI use" is gone. The policy is now: state what you delegated, what checks made that reasonable, and where you validated yourself, with grading on the fit rather than on tool sophistication.

**New Canvas item to create:** one **Workshop Activities** column per term, graded complete/incomplete per item. Fall is 2% across 4 items, winter 1% across 3 items, spring 1% across 2 items. See [Workshop Activities](https://capstone.alexulbrich.com/assignments/workshop-activities/) for the item list and timing. Grading is confirming something real was submitted; there is no quality bar and no rubric, so a grader spends seconds per item. **The old extra-credit activity items are retired.**

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
| `incident-postmortem/` | Corrective actions: "verifiable at the next repo checkpoint" became "at the week-10 repo checkpoint or in the week-10 sprint note", since a fifth winter note now exists at week 10 (#26) |
| `sprint-note/` | Contribution lines: the Pass band now says the owned PR is a real change that landed this sprint and graders open one per student; the Fail band names an owned PR that does not open, did not land this sprint, or is mechanical, with no explanation (#23) |
| `individual-contribution/` | **New**, three files (`-fall-`, `-winter-`, `-spring-`): one Full / Half / Zero criterion per sprint for the Individual Contribution column of each term; create the rubric in Canvas from the term's file (#30) |

## Roles Counted Per Concern, Not Per Person

The Team Charter roles criterion asked for "three named rotating roles", which
only works cleanly on a team of three. Teams run from two to five. The criterion
now asks that all three concerns (schedule and partner relationship, AI
configuration and confidentiality, definition of done and build health) each
have exactly one named owner, whatever the headcount: on a team of two one
person owns two of them, on a team of five the remaining students name an
ownership area instead.

Points and outcome tags are unchanged (20, SO5). Both band descriptions changed,
so the TSV must be re-imported:

| File | What changed |
|---|---|
| `team-charter/` | Roles: "three named rotating roles" became all three concerns owned by a named person; the Meets band now names an unowned concern as the failure |

`defense/` is **not** affected: its rubric already read "named role ... or
comparable ownership area", which is the same rule, and its band descriptions are
unchanged.

The fall Term Retrospective's Writing criterion changed in the same way, but no TSV for it exists under `canvas/assignments/`; it needs one before the fall rubric is built in Canvas.

**All three syllabus bodies need re-pasting into Canvas** from `canvas/syllabus/` (2026-09-13, #22 and #32; the Term cells lost their year under #57): the grade table is the 11-band handbook scale, the Term cells read Fall, Winter and Spring with no year, and the late-policy paragraph is a summary that links the handbook instead of a second full statement.

## Rubric TSVs Requiring Re-Import After the WIC Remap (#59)

The WIC outcomes changed (#59) and every tag was re-derived from the new wording. Points are unchanged; tags and one band description moved, so these must be re-imported:

- `rfc/`: `L07` moved from Feedback given to Technical tradeoff analysis, whose Exceeds band now asks for cited sources.
- `spring-release/`, `project-landing-page/`, `project-retrospective/`: the writing-quality criterion is tagged `SO3` instead of `L08`.

## Rubric TSVs Requiring Re-Import: Workshops Re-Selected (#68)

| File | What changed |
|---|---|
| `workshop-activities/` | `-fall-` now 5 rows (User Story Mapping, Map Your One-Way Doors, Audit Your Safety Net, Peer Technical Design Review, Identify Success Metrics); `-term-` replaced by `-winter-` (3 rows: Dependency Mapping, Team Dysfunctions, Test Plan) and `-spring-` (1 row: Team Health). Re-create all three columns |

## Owned in Canvas: Resume and Intent and the Career Retrospective (#197)

The co-instructor runs Resume and Intent (fall, 2% in the Individual Evidence group) and the Career and Individual Retrospective (spring, 15%) entirely in Canvas, including their rubrics and the resume meetings. Their TSVs were removed from this directory and their handbook pages show only the meta box and a pointer to Canvas. Import nothing for either from this repo, and do not paste those handbook pages into Canvas as the assignment body. The fall Defense group weight stays at 8%, since Resume and Intent still takes 2% of Individual Evidence.

## Rubric TSVs Requiring Re-Import: One Outcome Ladder (#70)

| File | What changed |
|---|---|
| `definition-of-shipped/` | Target rung bands say "the outcome ladder" instead of the old per-category wording, and the lead-times band now points at the Shipping guide rather than naming a category; re-import before winter |
| `spring-release/` | Honest outcomes band text says "the target rung" instead of "the category's target rung"; re-import before spring |

## Rubric TSVs Requiring Re-Import: Criteria as Checks (#84)

Points and tags unchanged; criterion names and band descriptions changed, so re-import:

| File | What changed |
|---|---|
| `rfc/` | Writing: length, sections in order, sourced claims |
| `incident-postmortem/` | Impact and timeline: numbers, timestamps, missed signals; Writing: length, sections, facts |
| `team-charter/` | Writing: length, sections, quotable commitments |
| `project-retrospective/` | Forward-looking section: three first actions, linked |

## Rubric TSVs Requiring Re-Import: Plain Words for the AI Policy (#207)

The AI policy now says "checks" where it said "the net" or "safety net", and "hard-to-reverse decision" where it said "one-way door". "Honest" is gone from every criterion, replaced by the word each one means. Points and tags are unchanged; criterion names and band descriptions changed, so re-import all eight, and re-paste the three syllabus bodies from `canvas/syllabus/` (the AI policy paragraphs):

| File | What changed |
|---|---|
| `defense/` | Ownership and delegation: "checks" for "safety net" in the description and all three bands; Judgment: "the actual reasons", and "hard to reverse" for "one-way doors"; Communication: "candid" for "honest" |
| `repo-checkpoint/` | Living docs: "the quickstart is accurate"; Build health and safety net: "the checks match" in the description and bands (criterion name unchanged) |
| `rfc/` | Options: "the real costs"; Delegation and validation: "checks" for "safety net" |
| `definition-of-shipped/` | Criterion renamed `Target rung: explicit, project-specific, realistic [SO2]`; description and Exceeds band say "realistic about ambition" |
| `project-handoff/` | Known issues: "candid tone", "candid rather than promotional" |
| `project-retrospective/` | Decisions: "candid about the debt incurred"; Team dynamics: "discussed critically and candidly" |
| `spring-release/` | Criterion renamed `Accurate outcomes [SO6]` (was Honest outcomes); Trailer description: "partial features named as partial" |
| `workshop-activities/` | `-fall-` row renamed `Map Your Hard-to-Reverse Decisions` (was Map Your One-Way Doors), with its description; Audit Your Safety Net: "Accurate statement" |

## Canvas Items Without a Rubric: Term Startup (#157), Demo Day (#172) and Expo (#162)

Three assignment pages carry no points and no rubric, so there is no TSV here to import for any of them. Create them by hand.

**Term Startup**, once per term:

| Field | Value |
|---|---|
| Title | Term Startup |
| Points possible | 0 |
| `omit_from_final_grade` | true |
| Group | any; it contributes nothing, so the group choice does not affect the grade |
| Submission type | text entry |
| Due | fall: end of week 2; winter and spring: end of week 1 |
| Group assignment | yes, one submission per team |

**Demo Day**, once for the year. One Canvas item taking each team's proof of registration, so staff can see every team has taken one of the five sessions. The registration link itself goes out in an announcement:

| Field | Value |
|---|---|
| Title | Demo Day |
| Points possible | 0 |
| `omit_from_final_grade` | true |
| Group | any; it contributes nothing, so the group choice does not affect the grade |
| Submission type | file upload (screenshot of the registration confirmation) |
| Due | end of fall week 3 |
| Group assignment | yes, one submission per team |

**Engineering Expo**, spring only:

| Field | Value |
|---|---|
| Title | Engineering Expo |
| Points possible | 0 |
| `omit_from_final_grade` | true |
| Group | any; it contributes nothing, so the group choice does not affect the grade |
| Submission type | text entry |
| Due | end of spring week 10 |
| Group assignment | yes, one submission per team |

The zero points are the point: the item exists so the work reaches the student's Canvas to-do list and calendar, which the handbook schedule cannot do. Do not give any of them a rubric and do not put any of them in a weighted group's point total.

The Expo has real external deadlines that land well before its Canvas due date: registration opens in early spring and poster printing closes before week 10. Both are set by the College of Engineering, so announce them from the Expo website at term setup rather than encoding them here.

## Schedule

### CS 461 (Fall Term)

| Week | Due |
|------|-----|
| 2, 3, 7, 8 | Workshop Activities (5 items, complete/incomplete) |
| 2 | Term Startup (0 points, omit from final grade); Team Charter; Resume and Intent |
| 3 | Demo Day registration (0 points, omit from final grade) |
| 3-5 | Resume meetings (co-instructor) |
| 4 | Sprint Note 1; RFC draft |
| 5 | Repo Checkpoint 1 (rails stood up); RFC cross-team feedback; Demo Day session 1 |
| 6 | Sprint Note 2 |
| 7-9 | Defense (its own session, not a TA check-in; assessed by a TA or instructor other than the team's own) |
| 8 | Sprint Note 3; RFC final (revision and decision) |
| 9 | Term Retrospective |
| 10 | Sprint Note 4; Repo Checkpoint 2 ("hello, production" gate); Demo Day session 2 |

### CS 462 (Winter Term)

| Week | Due |
|------|-----|
| 1 | Term Startup (0 points, omit from final grade) |
| 2 | Sprint Note 1 |
| 1-3 | Workshop Activities (3 items, complete/incomplete) |
| 3 | Definition of Shipped (v1, partner-agreed) |
| 4 | Sprint Note 2; RFC draft |
| 5 | Repo Checkpoint 1 (integration health); RFC cross-team feedback; Demo Day session 3 |
| 6 | Sprint Note 3 |
| 7-9 | Defense (its own session, not a TA check-in; assessed by a TA or instructor other than the team's own) |
| 8 | Sprint Note 4; RFC final (revision and decision) |
| 9 | Incident Postmortem |
| 10 | Sprint Note 5; Repo Checkpoint 2 (release candidate gate); Demo Day session 4 |

### CS 463 (Spring Term)

| Week | Due |
|------|-----|
| 1 | Term Startup (0 points, omit from final grade) |
| 2 | Sprint Note 1 |
| 2 | Workshop Activities (1 item, complete/incomplete) |
| 4 | Sprint Note 2 |
| 5 | Demo Day session 5 |
| 6 | Sprint Note 3 |
| 7 | Landing Page |
| 7-9 | Defense (its own session, not a TA check-in; assessed by a TA or instructor other than the team's own) |
| 8 | Release and Metrics; Project Handoff |
| 9 | Project Retrospective; Career and Individual Retrospective |
| 10 | Engineering Expo (0 points, omit from final grade) |

## Deprecated Assignments

These assignments were retired in the revision. Their directories were removed under #30 (decided 2026-09-11, landed 2026-09-13); git history keeps the old bodies and rubrics:

- `memo/`: folds into the fall RFC (the stakeholder context and constraints become the RFC's problem framing) and the early partner conversations.
- `research-brief/`: folds into the RFC (the background research becomes the RFC's evidence and analysis).
- `progress-report/`: replaced by Sprint Notes and Demos (one page, pass/fail per item, plus a live demo cadence).
- `requirements-update/`: replaced by Repo Checkpoints (`docs/requirements.md` is graded in place, in the repository).
- `technical-design-update/`: replaced by Repo Checkpoints (`docs/design.md` is graded in place, in the repository).
- `setup/`: replaced by the fall week 5 Repo Checkpoint ("rails stood up" gate).
- `retrospective/`: replaced by the Term Retrospective (fall) and the Incident Postmortem (winter).
- `retrospective-and-career/` (old form): replaced by the spring Career and Individual Retrospective and the Project Retrospective.
