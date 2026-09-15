# Staff Runbook

Operational companion to the course design. Staff-facing; the student-facing rules live in the handbook (Assignments section). Numbers assume ~300 students, ~85 teams, 2 instructors, and **6 TAs** (the real ceiling). Every mechanism below is budgeted against that number; the TA-hours ledger at the bottom is the check.

## Cohort Operations

- Each TA owns a cohort of ~14 teams. Check-ins are **in every sprint-note week, on the day the TA sets**, plus fall week 2 and spring weeks 8 and 10, which have no note: five check-in weeks a term, 14 meetings at 25 to 30 minutes in each, about 7 hours, and none in the week between. The average is the same 3.5 hours a week; the shape is lumpy on purpose, so that every team demos the sprint it just finished and the TA grades the note against a demo seen that week (#23). Weekly per-team check-ins do not fit at 6 TAs; do not promise them.
- **Every check-in opens with the sprint demo, and every student on the team demos their own work** (2 to 3 minutes each, so 6 to 12 minutes for a team of three or four). This fits inside the existing 25-to-30-minute slot and does not extend it. What it displaces is open-ended coaching: after the demo, cover the team's top risk and the decision they need, and push everything else to async. If a team is running long, the demo is not the part to cut, because it is the only per-student live signal collected every sprint. The TA picks the artifact each student demos, from that student's latest contribution line; the student does not choose (see Check-in Format).
- The defense is a **separate session in week 7 or 9**, the weeks with no check-ins, so the week-8 demo stays live (see Defense Logistics). An NDA checkpoint walkthrough, when a team needs one, takes that team's nearest check-in and displaces the demo; the team attaches a timestamped video with one segment per student to that sprint's note instead. Check the timestamps exist: an untimestamped team video is not a per-student demo and should be sent back.
- A student who misses their demo slot sends a timestamped video of their segment within 48 hours. Do not reschedule demos into another check-in: every check-in now carries its own, so there is no spare slot, and the video already exists as a mechanism.
- Cohort assignments and meeting grids are built in week 0 from the cohort sheet and published in Canvas week 1.
- The TA is the team's first contact for everything operational: absences, NDA walkthrough scheduling, deduction flags, escalations. Between check-ins, teams reach their TA async; TAs batch async responses, they do not hold extra meetings.

## Check-in Format (25 to 30 minutes, the same script in every cohort)

The check-in verifies the sprint note; it is not a status meeting. One script for every TA, because the detection failures we have had were TAs watching a demo the student chose: the same broken page at four check-ins running, "still working on it". The rule that closes that: **you pick what each student demos, from their latest contribution line, and nothing to open means nothing was done.**

**Before, five minutes.** Read the latest note's contribution lines (this week's if it is in, otherwise the previous one) and pick one artifact per student: the PR or the written document they listed as owned (for the first check-in of a term, pick from the board and the merged PRs). Open the board and the repository's merged PRs for the sprint window; note any student with none. Note the previous "decision needed".

**Note-less check-ins** keep the script with a different demo. Fall week 2 is the kickoff: charter, roles, repository, and the first sprint's plan, one student each. Spring weeks 8 and 10 demo the release and the handoff, by student. The record gets its per-student line either way.

**Agenda**, in this order, inside 25 to 30 minutes.

1. Last time's decision needed. Decided or not, and by whom.
2. Demos, two to three minutes per student, in an order you choose. Name the student and the artifact: "open PR 42, show me the diff, run it." For a written artifact: "open the findings and walk me through what changed the plan." One probe each.
3. Top risk and the one decision the team needs now. Everything else goes async.
4. Your challenge.
5. Actions with an owner and a week. Write the per-student lines before the next team arrives.

**Probes**, one per student, varied across the team: show me the diff, and which lines are yours; what did your reviewer ask you to change, and what changed; what breaks if X (pick X from their diff); where did you stop to check the AI's output, and what did you find; run the tests for this; for a findings document, what did you learn that changed the plan.

**Challenge moves** for a team that is fine: what would you cut if you lost two weeks; which done item could the partner use today; what is the riskiest untested path; show me the deploy; who decided that, and when.

**Work that is not code.** Research, user research, requirements, RFC sections, test plans: valid contributions, and they must be measurable, which means they landed in the repository as a written PR with the findings in it. "I researched auth options" with nothing to open is activity, not a result. Open the document the way you would open a PR and ask what it changed.

**Tells.** One is a note in the record; the same one at two check-ins running is a flag.

- The same artifact as last check-in, "still working on it". Nothing new since last time is no contribution this sprint, however much effort went in.
- "We" throughout and no "I"; the student cannot say which lines are theirs.
- A teammate drives the screen during the student's demo.
- The owned PR is a rename, a formatter run, a lockfile bump, or a status update.
- The student cannot navigate the code or the document they claim.
- The contribution line and the repository disagree.
- The same top risk three sprints running, or a decision needed that never gets decided.
- The judgment layer reads like last sprint's.

**What to do.** In the room, ask the direct question once ("which part of this is yours?"), record the answer, and move on; do not argue it in front of the team. Afterwards, write an evidence note (what was checked, what was found) into the individual contribution modifier process below. The check-in feeds that one process and is never a deduction of its own. A flag at two consecutive check-ins goes to the instructors with the notes.

**Record.** One line per student per check-in in the cohort sheet: demoed own work (yes or no), artifact verified (yes or no), note or flag, one phrase. Two minutes. It is the evidence the modifier asks for, and it is what makes cohorts comparable.

## Sprint Note Checks (about 5 minutes per note)

The rubric on the assignment page is the rule; these are the clicks that produce the pass or fail, so that a pass means the same thing in every cohort. The note and the check-in land in the same week in either order: a note read before the check-in is its agenda, and a demo seen before the note is what the note is checked against.

1. **Working software evidence**: the link opens and the CI run is there; or a plain statement of why nothing works. That statement is fine once; at the third consecutive sprint it is a note in the record.
2. **What got done**: the board link opens, and each item is something you could go and look at. "Worked on X" fails the item.
3. **Top risk and one decision needed**: one risk, one decision, with a from-whom.
4. **Contribution lines**: one line per student. Open one owned artifact per student: it exists, it landed in the sprint window (check the merge date), and it is a real change, not mechanical. The review part names a change asked for. The shipped sentence is human-written and specific. A missing PR with an explanation on the line passes; a line whose artifact does not open, did not land this sprint, or is mechanical, with no explanation, misrepresents the sprint, and the item fails on that. The item grades whether the note is true; who contributed is the modifier's question.
5. **Judgment layer**: about five lines, specific to this sprint, not last sprint's text.

An item fails for the team because the note is wrong or missing. An individual's zero-work sprint goes through the modifier, which is where it is penalized and the only place.

## Term Rhythm (staff view)

| Weeks | Staff activity |
|---|---|
| 2, 4, 6, 8, 10 | Check-in weeks: 14 meetings on the TA's day, notes graded against the demos (fall 2 and spring 8 and 10 have no note) |
| 1-2 | Cohorts formed; charters graded (TAs); Qualtrics contact lists built |
| 4-5 | RFC drafts land; staff generate cross-team review pairings and publish in Canvas; checkpoint 1 (TAs; NDA walkthroughs in check-ins); midterm surveys out in week 5, closing end of week 6 |
| 5 | All-hands demo day 1 (sampled lineup, ~15 teams in 110 minutes) |
| 7 and 9 | Defense sessions, separate from check-ins (calibration session first; see below) |
| 8 | RFC finals land (TA-graded, instructor calibration sample) |
| 9-10 | Term deliverable grading; checkpoint 2 (graded in finals week); final surveys out in week 9, closing end of week 10; demo day 2 |

## Defense Logistics

- One calibration hour before week 7 each term: all graders score the same recorded or role-played walkthrough on the printed scoresheet and reconcile. Spend part of it on the Ownership-and-Delegation criterion specifically, because it is the one graders most often get backwards: **score the triage decision, not the luck.** A student who let an agent drive a schema migration with no net scores low even though nothing broke; a student who stopped to validate an auth change scores high even with buggy feature code. Sophisticated tooling earns no points by itself, and a student on weaker tools who gated tightly has done the harder work. Spend a few minutes on the reviewer-side half of Communication as well, which is new: it asks what the student told someone whose work they reviewed and what changed because of it. "I left some comments" scores low; the discriminator is whether they can name the thing they said and the thing that moved. It is checkable against the RFC reviews in fall and winter and against sprint-note contribution lines in spring.
- **Session length is 6 minutes per student plus ~10 minutes of setup and wrap.** Team of 2 = 22 min, 3 = 28, 4 = 34, 5 = 40, 6 = 46. Do not compress per-student time on a large team: the scoresheet anchors are calibrated at 6 minutes and stop comparing across cohorts below that. The session simply runs longer. Book the slot from the roster before the cycle starts, since it is no longer a uniform 40 minutes.
- Sessions run in **weeks 7 and 9**, which carry no check-ins, and are in addition to them: 14 sessions averaging about 31 minutes, **~7 h per TA per term** (#23). Fall week 9 has three days (Thanksgiving), so most fall sessions land in week 7. Replacing the week-8 check-in instead would have been free, and was rejected because it turns every team's sprint-3 demo into a video and puts 14 defenses on top of RFC finals.
- **Anti-cueing protocol, mandatory.** Draw the speaking order at random in the room and never publish it in advance. Give each student a different artifact and a different "what breaks if X" question. The reviewer-side Communication question needs no variation: each student reviewed different work, so it is cueing-resistant by construction. Without this, whoever goes last has heard several rounds and is answering a question they have had ten minutes to prepare.
- **Individual follow-up.** If a score comes out borderline, or a student's part of the session ran short, ask them back for a 5-minute one-to-one in the same or the next cycle. Tell the student it is routine; it is there so no grade depends on how the group session went on the day. Budget one or two per cohort per term.
- Two assessors split the students between them when both attend.
- Fall week 9 is a three-day week (Thanksgiving): book no defenses on its Thursday or Friday.
- Absences: rescheduled within the window, or into a later check-in, if flagged before the session; unexcused no-show scores zero (the TSV has a zero band).
- Scores and notes entered into Canvas after each session; sheets are the live instrument, Canvas is the retention record for program assessment.

## RFC Machinery

- Pairing: generate reviewer pairs across teams (avoid same-project pairs; pair NDA teams with each other when possible). A spreadsheet or small script from the roster suffices; publish at the start of week 5.
- Grading: TAs grade their cohort's RFCs (~50 each per term in fall and winter, ~10 minutes each against the rubric; budget ~8 hours across weeks 8-10). Instructors re-grade a random sample of 3 per grader and reconcile. Enforce the length caps when grading; an RFC over the cap gets skimmed past the cap, not rewarded for volume.
- Reviewer no-shows: the author is held harmless (revision graded on self-identified improvements or staff feedback); the no-show reviewer loses the feedback points.

## Repo Checkpoints

- Default (staff repo access): asynchronous review, ~10-15 minutes per team against the checklist; leave feedback as issues where useful. Checkpoint 1 is graded in week 5; checkpoint 2 in finals week, after the week-10 check-ins, so that week stays at check-in load.
- NDA teams: 15-minute walkthrough in the check-in, fixed order (quickstart, CI, docs spot-check, risk register, PR list); retain nothing.
- Consistency anchors live on the assignment page ("How Graders Review"). Calibrate by having all TAs review one volunteer staff-accessible repo together in week 4.

## Individual Contribution Modifier

- Default full credit; investigate only on triggers (blank or unexplained contribution line, a check-in flag, peer or partner flag, something off at the defense, a low Ownership-and-Delegation or Role score at the defense).
- **These signals are inputs to one decision, not separate deductions.** A student is never penalized twice for the same behavior: the declared precedence order across the individual modifier, the partner evaluation facet, and the checkpoint contribution-traceability criterion is unchanged. The checkpoint criterion still grades whether attribution infrastructure exists, never individuals.
- TAs flag with an evidence note; instructors adjudicate. Student gets the note and five business days to respond.
- NDA teams: bind to live evidence only (walkthrough, defense, peer eval, partner flags).

**Where it lives in Canvas.** One Individual Contribution column per term holds the individual half of the Sprint Notes points, imported from `canvas/assignments/individual-contribution/` (one TSV per term, because the sprint counts differ: fall 4 x 25, winter 5 x 20, spring 34 / 33 / 33). One criterion per sprint, scored full, half, or zero. It defaults to full credit; there is no submission.

**Per-sprint bands.** Every deduction needs an evidence note (what was checked, what was found) so the decision is reviewable.

- **Full** (default): the contribution line lists reviewed PR(s) the student owned and the repo record corroborates it; or the PR norm was missed once with an explanation in the note.
- **Half**: some activity is visible, but no owned, reviewed PR and no explanation in the note; or the contribution line is only weakly corroborated by the repo record (trivial commits; review-only activity not agreed as that student's contribution mode in the charter).
- **Zero**: no meaningful contribution visible anywhere for the sprint (no contribution line, no PRs, no reviews, no traceable work) and no explanation; or the contribution line is contradicted by the repo record.

**Evidence sources**, in the order to check them: the contribution lines in the team's sprint notes (PR titles or IDs; NDA teams list IDs only); the repository record (authored or driven PRs, review responses, merges); review activity over the sprint window; live spot-verification at the demo and the defense; partner or peer flags, which trigger the corroboration review on the partner evaluation page. Reviewed PRs are the default evidence, but any verifiable contribution counts if the charter and the sprint note make it traceable (substantial reviews, documentation, test or infrastructure work).

**Appeals.** The student is shown the evidence note, has five business days to respond with evidence, and an instructor decides. TAs flag; instructors adjudicate.

**No double jeopardy.** Non-contribution is penalized here and only here. The sprint note's Contribution lines item grades whether the note is true, never who contributed; the check-in record and the tells feed this decision and carry no points of their own. The repo checkpoint's traceability criterion grades whether attribution infrastructure exists (team-level), and partner-evaluation facet adjustments are reserved for partner-originated flags.

## Surveys (per term: 4 processing runs)

- Peer midterm, peer final, partner midterm, partner final. Scripts in `scripts/` until the instructor-tools page exists.
- Known issues fixed on this branch: peer-eval corrected score now posted to the gradebook; s2026 Requirements facet 3.5 mapping.
- Known issues still open: team-size cap at 6 including self in the peer scripts (teams of 7+ break); Q7 individual-concern extraction stubbed in partner scripts (concerns must be read manually from the export until fixed).
- Per run: export from Qualtrics (values), update filenames and Canvas assignment IDs at the top of the script, run, eyeball the distribution plot, import the updated gradebook CSV into Canvas, send feedback emails.

## Partner Touchpoints

- Two surveys per term, peer and partner alike: the midterm pulse is sent week 5 and closes at the end of week 6; the final survey is sent week 9 and closes at the end of week 10. Two sign-offs per year: Definition of Shipped (winter week 3) and Handoff confirmation (spring week 10).
- Canned emails for both sign-offs: state what the document is, that a reply-with-approval suffices, and the one-week window.
- Non-responsive partner: after two documented attempts, mentor or instructor signs instead; the team is not penalized. This promise is in the handbook; honor it without friction.

## Lecture Plan (Friday slot)

With reports gone, the slot carries: demo days (2 per term), guest speakers, and workshops. The student-facing version is the week-by-week schedule on `introduction/series.mdx` (#55): it fixes the demo days (weeks 5 and 10), the eight in-class workshop activities in their published weeks, and the fall week 0 welcome deck (`decks/Fall.md`); every other Friday says "announced in Canvas". Priority sessions to build (#51): testing as the safety net (on the schedule at fall week 4, alongside Audit Your Safety Net); the outcome-critical-path calendar exercise, teams plotting their Definition of Shipped prerequisites (winter week 1, two weeks before the DoS is due); writing specs for AI agents and reviewing AI-generated diffs (not placed; they take an "announced in Canvas" Friday once built). The testing-strategy, generative-ai, and shipping guides carry most of the content already. Fall week 9 has no lecture (Thanksgiving Friday). Spring week 10 holds both the Expo and the second demo day; whether the Expo replaces that demo day is open.

## TA-Hours Ledger (per TA, per term, at 6 TAs / ~14 teams / ~50 students)

The honest budget. "Check-ins" dominates; everything else is deliberately cheap.

| Activity | Fall | Winter | Spring |
|---|---|---|---|
| Check-ins, five weeks a term (incl. demos) | ~35 h | ~35 h | ~35 h |
| Sprint notes (pass/fail, ~5 min each) | ~5 h | ~6 h | ~3.5 h |
| Repo checkpoints (~12 min per team, x2) | ~6 h | ~6 h | n/a |
| RFCs (~50 x ~10 min) | ~8 h | ~8 h | n/a |
| Defense sessions (weeks 7 and 9, in addition to check-ins) + scoring, follow-ups, Canvas entry | ~9 h | ~9 h | ~9 h |
| Term deliverable (charter / DoS + postmortem / spring set incl. release trailers) | ~5 h | ~5 h | ~7 h |
| Career retrospectives (~50 x ~10 min) | n/a | n/a | ~8 h |
| Modifier investigations (trigger-based only) | ~1 h | ~1 h | ~1 h |
| **Total** | **~69 h (~6.9 h/wk)** | **~70 h** | **~64 h** |

The check-ins row is 14 teams x 5 check-in weeks x 30 minutes, all of it in the sprint-note weeks (about 7 h in a check-in week, none in between). The defense row is 14 sessions at 6 minutes per student plus buffer (about 7 h at an average team of 3.5) plus ~2 h of scoring, follow-ups and Canvas entry. It was ~2 h when the defense replaced a check-in; the 7 h is the price of keeping the week-8 demo live (#23). **Moving demos from twice a term to every sprint does not move this number**, because the demo happens inside the existing slot rather than extending it: 2 to 3 minutes per student is 6 to 12 minutes of a 25-to-30-minute meeting for a team of three or four. What the demo displaces is open-ended coaching, which moves async.

The number that would break it is team size. At six or more students, 3 minutes each is 18 minutes and the rest of the agenda stops fitting. If a cohort has unusually large teams, either cap demo time at 2 minutes per student or extend those teams' slots and re-run this row.

Check-in weeks run ~8 to 9 h (meetings plus note grading); weeks 7 and 9 carry ~3.5 h of defenses each; week 8 is the peak at ~11 h (check-ins, notes, RFC finals landing). Week 10 stays at check-in load because checkpoint 2 is graded in finals week; weeks 1 and 3 are nearly empty. This fits a standard 0.49 FTE appointment with headroom for office hours and admin. For comparison, the old design at 6 TAs meant ~200 fifteen-criterion progress-report gradings per TA per year before anything else.

Instructors carry no cohort: calibration samples (RFC, defense, checkpoints), modifier and appeal adjudication, the four survey runs per term, partner communication, lectures, and demo days.

## Week 0 Checklist (per term)

- [ ] Team/cohort sheet current; TA assignments made
- [ ] Canvas shells: assignments imported from `canvas/assignments/` TSVs (rubric browser extension), weights checked against the handbook tables
- [ ] Both sprint-note Canvas columns (team + individual) created; together they equal the Sprint Notes weight
- [ ] Qualtrics surveys updated (contact lists from the roster script)
- [ ] Defense calibration hour scheduled; scoresheets printed
- [ ] Cohort sheet has a per-student check-in column (demoed own work, artifact verified, note or flag)
- [ ] NDA teams identified and flagged in the cohort sheet
