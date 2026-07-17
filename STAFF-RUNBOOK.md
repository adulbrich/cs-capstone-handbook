# Staff Runbook

Operational companion to the Fall 2026 course design. Staff-facing; the student-facing rules live in the handbook (Assignments section). Numbers assume ~300 students, ~85 teams, 2 instructors, and **6 TAs** (the real ceiling). Every mechanism below is budgeted against that number; the TA-hours ledger at the bottom is the check.

## Cohort Operations

- Each TA owns a cohort of ~14 teams. Check-ins are **bi-weekly per team, aligned to sprint boundaries**: 7 team-meetings per week at 25 to 30 minutes, about 3.5 hours of meetings per TA per week. Weekly per-team check-ins do not fit at 6 TAs; do not promise them.
- Defense and Track B checkpoint sessions run 40 minutes and **replace** that team's regular check-in for the cycle, so they add scoring time, not meeting time.
- Cohort assignments and meeting grids are built in week 0 from the team-assignment sheet and published in Canvas week 1.
- The TA is the team's first contact for everything operational: absences, Track B scheduling, deduction flags, escalations. Between check-ins, teams reach their TA async; TAs batch async responses, they do not hold extra meetings.

## Term Rhythm (staff view)

| Weeks | Staff activity |
|---|---|
| 1-2 | Cohorts formed; charters graded (TAs); Qualtrics contact lists built |
| 4-5 | RFC drafts land; staff generate cross-team review pairings and publish in Canvas; checkpoint 1 (TAs; Track B walkthroughs in check-ins); midterm surveys out |
| 5 | All-hands demo day 1 (sampled lineup, ~15 teams in 110 minutes) |
| 7-9 | Defenses inside check-ins (calibration session first; see below) |
| 8 | RFC finals land (TA-graded, instructor calibration sample) |
| 9-10 | Term deliverable grading; checkpoint 2; final surveys out; demo day 2 |

## Defense Logistics

- One calibration hour before week 7 each term: all graders score the same recorded or role-played walkthrough on the printed scoresheet and reconcile.
- 6 minutes per student; two assessors split the students when both attend.
- Absences: rescheduled into another check-in that term if flagged before the session; unexcused no-show scores zero (the TSV has a zero band).
- Scores and notes entered into Canvas after each session; sheets are the live instrument, Canvas is the retention record for program assessment.

## RFC Machinery

- Pairing: generate reviewer pairs across teams (avoid same-project pairs; pair Track B teams with each other when possible). A spreadsheet or small script from the roster suffices; publish at the start of week 5.
- Grading: TAs grade their cohort's RFCs (~50 each per term in fall and winter, ~10 minutes each against the rubric; budget ~8 hours across weeks 8-10). Instructors re-grade a random sample of 3 per grader and reconcile. Enforce the length caps when grading; an RFC over the cap gets skimmed past the cap, not rewarded for volume.
- Reviewer no-shows: the author is held harmless (revision graded on self-identified improvements or staff feedback); the no-show reviewer loses the feedback points.

## Repo Checkpoints

- Track A: asynchronous review, ~10-15 minutes per team against the checklist; leave feedback as issues where useful.
- Track B: 15-minute walkthrough in the check-in, fixed order (quickstart, CI, docs spot-check, risk register, PR list); retain nothing.
- Consistency anchors live on the assignment page ("How Graders Review"). Calibrate by having all TAs review one volunteer Track A repo together in week 4.

## Individual Contribution Modifier

- Default full credit; investigate only on triggers (blank or unexplained contribution line, peer or partner flag, something off at demo or defense).
- TAs flag with an evidence note; instructors adjudicate. Student gets the note and five business days to respond.
- Track B: bind to live evidence only (walkthrough, defense, peer eval, partner flags).

## Surveys (per term: 4 processing runs)

- Peer midterm, peer final, partner midterm, partner final. Scripts in `scripts/` until the instructor-tools page exists.
- Known issues fixed on this branch: peer-eval corrected score now posted to the gradebook; s2026 Requirements facet 3.5 mapping.
- Known issues still open: team-size cap at 6 including self in the peer scripts (teams of 7+ break); Q7 individual-concern extraction stubbed in partner scripts (concerns must be read manually from the export until fixed).
- Per run: export from Qualtrics (values), update filenames and Canvas assignment IDs at the top of the script, run, eyeball the distribution plot, import the updated gradebook CSV into Canvas, send feedback emails.

## Partner Touchpoints

- Two surveys per term (midterm pulse, final). Two sign-offs per year: Definition of Shipped (winter week 3) and Handoff confirmation (spring week 10).
- Canned emails for both sign-offs: state what the document is, that a reply-with-approval suffices, and the one-week window.
- Non-responsive partner: after two documented attempts, mentor or instructor signs instead; the team is not penalized. This promise is in the handbook; honor it without friction.

## Lecture Plan (Friday slot)

With reports gone, the slot carries: demo days (2 per term), guest speakers, and workshops. Priority sessions to build before fall: writing specs for AI agents; reviewing AI-generated diffs; testing as the safety net; the outcome-critical-path calendar exercise (teams plot their Definition of Shipped prerequisites). The testing-strategy, generative-ai, and shipping guides carry most of the content already.

## TA-Hours Ledger (per TA, per term, at 6 TAs / ~14 teams / ~50 students)

The honest budget. "Check-ins" dominates; everything else is deliberately cheap.

| Activity | Fall | Winter | Spring |
|---|---|---|---|
| Bi-weekly check-ins (incl. demos) | ~35 h | ~35 h | ~35 h |
| Sprint notes (pass/fail, ~5 min each) | ~5 h | ~5 h | ~2.5 h |
| Repo checkpoints (~12 min per team, x2) | ~6 h | ~6 h | — |
| RFCs (~50 x ~10 min) | ~8 h | ~8 h | — |
| Defense scoring + Canvas entry (replaces check-ins) | ~4 h | ~4 h | ~4 h |
| Term deliverable (charter / DoS + postmortem / spring set incl. release videos) | ~5 h | ~5 h | ~9 h |
| Career retrospectives (~50 x ~10 min) | — | — | ~8 h |
| Modifier investigations (trigger-based only) | ~1 h | ~1 h | ~1 h |
| **Total** | **~64 h (~6.4 h/wk)** | **~64 h** | **~60 h** |

Peaks land in weeks 8-10 (~9-10 h/wk); weeks 1-4 run light (~4-5 h/wk). This fits a standard 0.49 FTE appointment with headroom for office hours and admin. For comparison, the old design at 6 TAs meant ~200 fifteen-criterion progress-report gradings per TA per year before anything else.

Instructors carry no cohort: calibration samples (RFC, defense, checkpoints), modifier and appeal adjudication, the four survey runs per term, partner communication, lectures, and demo days.

## Week 0 Checklist (per term)

- [ ] Team/cohort sheet current; TA assignments made
- [ ] Canvas shells: assignments imported from `canvas/assignments/` TSVs (rubric browser extension), weights checked against the handbook tables
- [ ] Both sprint-note Canvas columns (team + individual) created; together they equal the Sprint Notes weight
- [ ] Qualtrics surveys updated (contact lists from the roster script)
- [ ] Defense calibration hour scheduled; scoresheets printed
- [ ] Track B teams identified and flagged in the tracking sheet
