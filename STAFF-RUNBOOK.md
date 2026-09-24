# Staff Runbook

Operational companion to the course design. Staff-facing; the student-facing rules live in the handbook (Assignments section). Numbers assume ~300 students, ~85 teams, 2 instructors, and **6 TAs** (the real ceiling). Every mechanism below is budgeted against that number; the TA-hours ledger at the bottom is the check.

## TA Check-in Operations

- Each TA owns ~14 teams. Check-ins are **in every sprint-note week, at a time the TA and the team agree**, plus fall week 2 and spring weeks 8 and 10, which have no note: five check-in weeks a term, 14 meetings at 25 to 30 minutes in each, about 7 hours, and none in the week between. The average is the same 3.5 hours a week; the shape is lumpy on purpose, so that every team demos the sprint it just finished and the TA grades the note against a demo seen that week (#23). Weekly per-team check-ins do not fit at 6 TAs; do not promise them.
- **Every check-in opens with the sprint demo, and every student on the team demos their own work** (2 to 3 minutes each, so 6 to 12 minutes for a team of three or four). This fits inside the existing 25-to-30-minute slot and does not extend it. What it displaces is open-ended coaching: after the demo, cover the team's top risk and the decision they need, and push everything else to async. If a team is running long, the demo is not the part to cut, because it is the only per-student live signal collected every sprint. Each student picks the artifact they demo, from their own contribution line for the sprint, and it cannot be the one they showed last time (see Check-in Format).
- The defense is a **separate session in week 7 or 9**, the weeks with no check-ins, so the week-8 demo stays live (see Defense Logistics). An NDA checkpoint walkthrough is its own 15-minute slot in the checkpoint week, scheduled with the team, and never displaces a demo.
- Demos are live. A video replaces one only when the student missed the check-in or you could not meet the team that week: on media.oregonstate.edu, unlisted, captioned, one timestamp per student, within 48 hours. Send back a video with no timestamps or no captions; it is not a per-student demo. Do not reschedule demos into another check-in: every check-in carries its own, so there is no spare slot.
- Team-to-TA assignments are built in week 0 from the check-in sheet and announced in week 1; each TA agrees the check-in times with their teams in week 1.
- The TA is the team's first contact for everything operational: absences, NDA walkthrough scheduling, deduction flags, escalations. Between check-ins, teams reach their TA async; TAs batch async responses, they do not hold extra meetings.

## Resume and Intent, Career Retrospective (co-instructor)

- The co-instructor runs both entirely in Canvas: the assignments, their rubrics, the grading, and the resume meetings. TAs do not grade them, and neither the handbook nor `canvas/assignments/` describes them (#197).

## Check-in Format (25 to 30 minutes, the same script for every TA)

The check-in verifies the sprint note; it is not a status meeting. One script for every TA, because the detection failures we have had were TAs watching a demo the student chose: the same broken page at four check-ins running, "still working on it". Students still choose what they demo, so the rule that closes that now binds the choice: **each student demos an artifact from their own contribution line for the sprint, never the one they showed last time, and nothing to open means nothing was done.**

**Before, five minutes.** Read the latest note's contribution lines (this week's if it is in, otherwise the previous one) so you know what each student can demo, and check your record for what each showed last time. Open the board and the record where the team's work lives (`CONTRIBUTING.md` names it) for the sprint window; note any student with no owned, accepted work. Note the previous "decision needed".

**Note-less check-ins** keep the script with a different demo. Fall week 2 is the kickoff: first the team's Term Startup list as it stands (who has replied, what is scheduled, what is stuck), then charter, roles, repository, and the first sprint's plan, one student each. Spring weeks 8 and 10 demo the release and the handoff, by student. The record gets its per-student line either way.

**Agenda**, in this order, inside 25 to 30 minutes.

1. Last time's decision needed. Decided or not, and by whom.
2. Demos, two to three minutes per student, in an order you choose. The student names the artifact and opens it: the diff, then a run. For a written artifact, the findings and what changed the plan. Check it is on their contribution line and not last time's. One probe each.
3. Top risk and the one decision the team needs now. Everything else goes async. In winter and spring week 2, take the risk from the team's Term Startup report: any item still not done, and whether the partner is answering.
4. Your challenge.
5. Actions with an owner and a week. Write the per-student lines before the next team arrives.

**Probes**, one per student, varied across the team: show me the diff, and which lines are yours; what did your reviewer ask you to change, and what changed; what breaks if X (pick X from their diff); where did you stop to check the AI's output, and what did you find; run the tests for this; for a findings document, what did you learn that changed the plan.

**Challenge moves** for a team that is fine: what would you cut if you lost two weeks; which done item could the partner use today; what is the riskiest untested path; show me the deploy; who decided that, and when.

**Work that is not code.** Research, user research, requirements, RFC sections, test plans: valid contributions, and they must be something you can open: the document, issue, or ticket where the findings live, in the repository or the tracker `CONTRIBUTING.md` names. "I researched auth options" with nothing to open is activity, not a result. Open the document the way you would open a PR and ask what it changed.

**Tells.** One is a note in the record; the same one at two check-ins running is a flag.

- The same artifact as last check-in, "still working on it". Nothing new since last time is no contribution this sprint, however much effort went in.
- "We" throughout and no "I"; the student cannot say which lines are theirs.
- A teammate drives the screen during the student's demo.
- The owned work is a rename, a formatter run, a lockfile bump, or a status update.
- The student cannot navigate the code or the document they claim.
- The contribution line and the record where the work lives disagree.
- The same top risk three sprints running, or a decision needed that never gets decided.
- The judgment layer reads like last sprint's.

**What to do.** In the room, ask the direct question once ("which part of this is yours?"), record the answer, and move on; do not argue it in front of the team. Afterwards, write an evidence note (what was checked, what was found) into the individual contribution modifier process below. The check-in feeds that one process and is never a deduction of its own. A flag at two consecutive check-ins goes to the instructors with the notes.

**Record.** One line per student per check-in in the check-in sheet: the artifact demoed (PR number or document), demoed own work (yes or no), artifact verified (yes or no), note or flag, one phrase. The artifact column is what the next check-in's no-repeat check reads. Two minutes. It is the evidence the modifier asks for, and it is what makes TAs' grading comparable.

## Sprint Note Checks (about 5 minutes per note)

The rubric on the assignment page is the rule; these are the clicks that produce the pass or fail, so that a pass means the same thing for every TA. The note and the check-in land in the same week in either order: a note read before the check-in is its agenda, and a demo seen before the note is what the note is checked against.

1. **Working software evidence**: the link opens and the CI run is there; or a plain statement of why nothing works. That statement is fine once; at the third consecutive sprint it is a note in the record.
2. **What got done**: the board link opens, and each item is something you could go and look at. "Worked on X" fails the item.
3. **Top risk and one decision needed**: one risk, one decision, with a from-whom.
4. **Contribution lines**: one line per student. Open one owned artifact per student: it exists, it was accepted in the sprint window (check the merge or close date), and it is a real change, not mechanical. The review part names a change asked for. The shipped sentence is human-written and specific. A line that truthfully says a student has nothing this sprint needs no other part and passes, as does a line that explains a miss; work in a system you cannot open is verified at the check-in demo. Any other line missing one of its three parts, or whose work does not check out (does not open and was not verified at the demo, was not accepted this sprint, or is mechanical), misrepresents the sprint, and the item fails on that. The item grades whether the note is true; who contributed is the modifier's question.
5. **Judgment layer**: about five lines, specific to this sprint, not last sprint's text.

An item fails for the team because the note is wrong or missing. An individual's zero-work sprint goes through the modifier, which is where it is penalized and the only place.

## Term Rhythm (staff view)

| Weeks | Staff activity |
|---|---|
| 2, 4, 6, 8, 10 | Check-in weeks: 14 meetings at times agreed with each team, notes graded against the demos (fall 2 and spring 8 and 10 have no note) |
| 1-2 | Team-to-TA assignments made; charters graded (TAs); Qualtrics contact lists built |
| 4-5 | RFC drafts land; Canvas peer review assigns each student two drafts; checkpoint 1 (TAs; NDA walkthroughs in their own slots); midterm surveys out in week 5, closing end of week 6 |
| 5 | All-hands demo day 1 (sampled lineup, ~15 teams in the hour) |
| 7 and 9 | Defense sessions, separate from check-ins (calibration session first; see below) |
| 8 | RFC finals land (TA-graded, instructor calibration sample) |
| 9-10 | Term deliverable grading; checkpoint 2 (graded in finals week); final surveys out in week 9, closing end of week 10; demo day 2 (fall and winter) |

## Defense Logistics

- One calibration hour before week 7 each term: all graders score the same recorded or role-played walkthrough on the printed scoresheet and reconcile. Spend part of it on the Ownership-and-Delegation criterion specifically, because it is the one graders most often get backwards: **score the triage decision, not the luck.** A student who let an agent drive a schema migration with no checks scores low even though nothing broke; a student who stopped to validate an auth change scores high even with buggy feature code. Sophisticated tooling earns no points by itself, and a student on weaker tools who gated tightly has done the harder work. Spend a few minutes on the reviewer-side half of Communication as well, which is new: it asks what the student told someone whose work they reviewed and what changed because of it. "I left some comments" scores low; the discriminator is whether they can name the thing they said and the thing that moved. It is checkable against the RFC reviews in fall and winter and against sprint-note contribution lines in spring.
- **Session length is 6 minutes per student plus ~10 minutes of setup and wrap.** Team of 2 = 22 min, 3 = 28, 4 = 34, 5 = 40, 6 = 46. Do not compress per-student time on a large team: the scoresheet anchors are calibrated at 6 minutes and stop comparing across TAs below that. The session simply runs longer. Book the slot from the roster before the cycle starts, since it is no longer a uniform 40 minutes.
- Sessions run in **weeks 7 and 9**, which carry no check-ins, and are in addition to them: 14 sessions averaging about 31 minutes, **~7 h per TA per term** (#23). Fall week 9 is short (see Term Calendar), so most fall sessions land in week 7. Replacing the week-8 check-in instead would have been free, and was rejected because it turns every team's sprint-3 demo into a video and puts 14 defenses on top of RFC finals.
- **Anti-cueing protocol, mandatory.** Draw the speaking order at random in the room and never publish it in advance. Give each student a different artifact and a different "what breaks if X" question. The reviewer-side Communication question needs no variation: each student reviewed different work, so it is cueing-resistant by construction. Without this, whoever goes last has heard several rounds and is answering a question they have had ten minutes to prepare.
- **Individual follow-up.** If a score comes out borderline, or a student's part of the session ran short, ask them back for a 5-minute one-to-one in the same or the next cycle. Tell the student it is routine; it is there so no grade depends on how the group session went on the day. Budget one or two per group per term.
- **A team is assessed by a TA or instructor who is not its regular TA, and the regular TA does not attend.** Presence defeats the independence the session buys. Pair TAs and swap rosters for the cycle: the total hours per TA are unchanged, because each still assesses about the same number of teams, but booking becomes a cross-product rather than each TA working down their own list, so do the pairing before the slots go out. Where two assessors attend, split the students between them.
- Fall week 9 is short (see Term Calendar): book no defenses on its Thursday or Friday.
- Absences: rescheduled within the window if flagged before the session; unexcused no-show scores zero (the rubric has a zero band).
- Scores and notes entered into Canvas after each session; sheets are the live instrument, Canvas is the retention record for program assessment.

## RFC Machinery

- Pairing: Canvas peer review on the RFC Draft + Peer Review entry assigns each student two drafts at the start of week 5; staff do not pick the pairs. NDA students submit a sanitized draft or contact the instruction team, as the RFC page says.
- Grading: TAs grade their teams' RFCs (~50 each per term in fall and winter, ~10 minutes each against the rubric; budget ~8 hours across weeks 8-10). Instructors re-grade a random sample of 3 per grader and reconcile. Enforce the length caps when grading; an RFC over the cap gets skimmed past the cap, not rewarded for volume.
- Reviewer no-shows: the author is held harmless (revision graded on self-identified improvements or staff feedback); the no-show reviewer loses the feedback points.

## WIC Compliance (CS 462)

CS 462 is the certified Writing Intensive Curriculum course. This table holds the WIC office's criteria (https://wic.oregonstate.edu/propose-assess-wic-courses/wic-learning-outcomes-criteria-and-rationale) against the course as it runs; the student-facing outcomes are on the handbook's WIC page.

| Criterion | How the course meets it | Status |
|---|---|---|
| 3 or more credits | CS 462 is 3 credits | Met |
| 300 or 400 level, juniors and seniors | 462, capstone standing | Met |
| Regular departmental number | 462 | Met |
| 4,000 words per student across assignments | Unmeasured beyond the RFC | Open (#60) |
| 1,500 words of low-stakes writing per student | Two written peer reviews, five contribution lines, a share of five judgment layers; no length guideline today | Open (#60) |
| One formal piece of 1,500 or more words using disciplinary sources | The winter RFC: its length floor (on the RFC page) clears this, and its analysis is argued from cited sources | Met |
| 35% of the grade from writing assignments | Writing assignments are 30% of the winter grade, 38% if repo checkpoints (docs graded from the checkpoint PDF) count; the weights are on the assignments overview, the RFC under Individual Evidence and the rest in the Winter Team Deliverables table | Open (#60) |
| Instructor of record gives feedback at least a week before the final due date on at least one assignment; peer feedback supplements, never replaces | The winter RFC draft gets peer feedback in week 5; staff feedback lands on the final, plus a substitute review when a peer reviewer no-shows. Waiting on the WIC director | Open (#60) |
| Individually written work revised after instructor feedback is assessed | The RFC revision criterion assesses revision after peer feedback; revision after instructor feedback waits on the draft-feedback decision in #60 | Partial (#60) |
| Student-to-instructor ratio of 25 to 1 or better | Two instructors, six TAs, about 300 students; whether GTAs count is the WIC office's call | Confirm (WIC office) |
| Instructor of record is not a graduate student | Faculty instructors | Met |
| WIC training for new faculty, every three years for continuing faculty, and for GTAs giving writing feedback | Not tracked in the repo | Open (#60) |
| Two distinct audiences and two writing types, one formal, with discipline-specific examples | RFC (formal, technical peers and staff); sprint notes (informal, staff); Definition of Shipped (partner contract). Examples: the RFC template, the ADR and requirements guides | Met |
| Students evaluate and integrate multiple sources with citations | RFC analysis argued from cited sources; the winter literature review activity | Met |
| The course addresses AI tools and disciplinary norms | The AI policy on the assignments overview, the generative AI guide, the delegation criterion on the RFC and the defense | Met |
| Writing Elevation prerequisite | Catalog, not the handbook | Confirm (WIC office) |

## Repo Checkpoints

- Default (staff repo access): asynchronous review, ~10-15 minutes per team against the checklist: the documents from the PDF, and the build, gate and history from the repository at the named commit. Spot-check one document against the commit; a PDF that does not match counts against the living-docs criterion. Leave feedback as issues where useful. Checkpoint 1 is graded in week 5; checkpoint 2 in finals week, after the week-10 check-ins, so that week stays at check-in load.
- NDA teams whose partner rules out read access: 15-minute walkthrough of the repository at the named commit, in its own slot in the checkpoint week, scheduled with the team, fixed order (quickstart, CI, docs spot-check, risk register, PR list); retain nothing beyond the sanitized PDF the team submits where its partner permits. It never displaces a demo.
- Consistency anchors live on the assignment page ("How Graders Review"). Calibrate by having all TAs review one volunteer staff-accessible repo together in week 4.

## Individual Contribution Modifier

- Default full credit; investigate only on triggers (blank or unexplained contribution line, a check-in flag, peer or partner flag, something off at the defense, a low Ownership-and-Delegation or Role score at the defense).
- **These signals are inputs to one decision, not separate deductions.** A student is never penalized twice for the same behavior: the declared precedence order across the individual modifier, the partner evaluation facet, and the checkpoint contribution-traceability criterion is unchanged. The checkpoint criterion still grades whether attribution infrastructure exists, never individuals.
- TAs flag with an evidence note; instructors adjudicate. Student gets the note and five business days to respond.
- NDA teams: bind to live evidence only (walkthrough, defense, peer eval, partner flags).

**Where it lives in Canvas.** Each sprint note has a sibling entry, "Sprint Notes N: Individual Contribution", 100 points in the Sprint Notes group, so each is half the sprint's weight. One criterion, scored full, partial, or zero, from `canvas/assignments/individual-contribution/individual-contribution-rubric.csv`. It defaults to full credit through Set Default Grade; there is no submission. Grade it when you grade that sprint's note, so a deduction reaches the student in the sprint it concerns.

**Per-sprint bands.** Every deduction needs an evidence note (what was checked, what was found) so the decision is reviewable.

- **Full** (default): the contribution line lists one or more pieces of work the student owned that someone else accepted, and the record where they live corroborates it. A sprint where the whole team was blocked, stated in the note, is Full too.
- **Partial** (1 to 99, your call): some contribution, short of the contribution floor: trivial changes only, review-only activity not agreed as that student's contribution mode in `CONTRIBUTING.md`, or work that is only weakly corroborated by the record. Dock from the first sprint it happens; waiting for a pattern teaches the team that a free sprint exists.
- **Zero**: no contribution this sprint, or a contribution line the record contradicts. Being blocked is not an explanation on its own, since there is other work to pick up; only a whole-team block is.

**Evidence sources**, in the order to check them: the contribution lines in the team's sprint notes (links or IDs; NDA teams list IDs only); the record where the work lives (authored or driven PRs, closed issues or tickets, approved documents, review responses); review activity over the sprint window; live spot-verification at the demo and the defense; peer flags; partner flags, which trigger the corroboration review on the partner evaluation page. Any owned, accepted work counts where `CONTRIBUTING.md` says it lives and the sprint note links it; a code change is its merged PR.

**Appeals.** The student is shown the evidence note, has five business days to respond with evidence, and an instructor decides. TAs flag; instructors adjudicate.

**No double jeopardy.** Non-contribution is penalized here and only here. The sprint note's Contribution lines item grades whether the note is true, never who contributed; the check-in record and the tells feed this decision and carry no points of their own. The repo checkpoint's traceability criterion grades whether attribution infrastructure exists (team-level), and partner-evaluation facet adjustments are reserved for partner-originated flags.

## Surveys (per term: 4 processing runs)

- Peer midterm, peer final, partner midterm, partner final. Scripts in `scripts/` until the instructor-tools page exists.
- Partner scoring (#264): the Midterm Pulse rubric and the no-response rule are on the handbook's partner evaluation page. `generate-project-partner-midterm-score.R` applies the pulse rubric and writes the Canvas score; it needs the Qualtrics export with choice text, not numeric values, and stops on an answer it cannot map. Neither partner script sees a survey nobody answered: enter those teams by hand at the A lower bound, scaled to the entry's Canvas points, never as a zero or a blank.
- CATME, end of spring only, is read to corroborate the peer scores and is not scored.
- Known issues fixed on this branch: peer-eval corrected score now posted to the gradebook; s2026 Requirements facet 3.5 mapping.
- Known issues still open: team-size cap at 6 including self in the peer scripts (teams of 7+ break); Q7 individual-concern extraction stubbed in partner scripts (concerns must be read manually from the export until fixed).
- Per run: export from Qualtrics (values; choice text for the partner midterm run), update filenames and Canvas assignment IDs at the top of the script, run, eyeball the distribution plot, import the updated gradebook CSV into Canvas, send feedback emails.

## Partner Touchpoints

- The intro email runs in **fall only**: the partner and mentor do not change during the year, so winter and spring start from the first meeting of the term instead, with that term's goal (winter: the Definition of Shipped; spring: the release target, the handoff recipient, and the Expo invitation). Term Startup lists all three terms. Fall is due at the end of week 2, because teams and partners are announced at the end of week 1.
- The Bcc to `cs-46x-help@oregonstate.edu` is gone from the template. It produced 70-plus untracked messages a term and nobody read them. What is lost is the **independent** signal, not all signal: the Term Startup status report runs every term and carries the email date (fall) and the first meeting date, so a partner nobody contacted is still visible in week 2, on the team's own word rather than on ours.
- Two surveys per term, peer and partner alike: the midterm pulse is sent week 5 and closes at the end of week 6; the final survey is sent week 9 and closes at the end of week 10. Two sign-offs per year: Definition of Shipped (winter week 3) and Handoff confirmation (spring week 8, inside the handoff PDF).
- Canned emails for both sign-offs: state what the document is, that a reply-with-approval suffices, and the one-week window.
- Non-responsive partner: after two documented attempts, mentor or instructor signs instead; the team is not penalized. This promise is in the handbook; honor it without friction.

## Lecture Plan (Friday slot)

Two hours are available; one is used. The slot carries demo days (fall and winter weeks 5 and 10, spring week 5), the workshops, and nothing else unless Canvas announces it. The week-by-week schedule on `introduction/schedule.mdx` is the one list of sessions, the nine graded workshops (#68) and the ungraded spring week-6 Resume Building session included; the fall week 0 welcome deck is `decks/Fall.md`. Every workshop runs the activity as its page describes, with an optional second run with an AI agent (a skill such as brainstorming or wayfinder, or a structured prompt), and the team submits the output the activity page describes; there are no standalone AI sessions. Fall week 1 opens with teams seated together, so team assignments must be done before that Friday (bidding closes the Sunday of week 0). Decks to build are #51. Fall week 9 has no lecture. Spring week 10 holds the Expo; spring has one demo day so that each team demos once a year across the five demo days.

## TA-Hours Ledger (per TA, per term, at 6 TAs / ~14 teams / ~50 students)

The honest budget. "Check-ins" dominates; everything else is deliberately cheap.

| Activity | Fall | Winter | Spring |
|---|---|---|---|
| Check-ins, five weeks a term (incl. demos) | ~35 h | ~35 h | ~35 h |
| Sprint notes (pass/fail, ~5 min each) | ~5 h | ~6 h | ~3.5 h |
| Repo checkpoints (~12 min per team, x2; an NDA team's walkthrough is a separate 15-minute slot instead) | ~6 h | ~6 h | n/a |
| RFCs (~50 x ~10 min) | ~8 h | ~8 h | n/a |
| Defense sessions (weeks 7 and 9, in addition to check-ins) + scoring, follow-ups, Canvas entry | ~9 h | ~9 h | ~9 h |
| Term deliverable (charter / DoS + postmortem / spring set incl. release trailers) | ~5 h | ~5 h | ~7 h |
| Modifier investigations (trigger-based only) | ~1 h | ~1 h | ~1 h |
| **Total** | **~69 h (~6.9 h/wk)** | **~70 h** | **~56 h** |

The check-ins row is 14 teams x 5 check-in weeks x 30 minutes, all of it in the five check-in weeks of the term (about 7 h in a check-in week, none in between). The defense row is 14 sessions at 6 minutes per student plus buffer (about 7 h at an average team of 3.5) plus ~2 h of scoring, follow-ups and Canvas entry. It was ~2 h when the defense replaced a check-in; the 7 h is the price of keeping the week-8 demo live (#23). **Moving demos from twice a term to every sprint does not move this number**, because the demo happens inside the existing slot rather than extending it: 2 to 3 minutes per student is 6 to 12 minutes of a 25-to-30-minute meeting for a team of three or four. What the demo displaces is open-ended coaching, which moves async.

The number that would break it is team size. At six or more students, 3 minutes each is 18 minutes and the rest of the agenda stops fitting. If a TA's teams are unusually large, either cap demo time at 2 minutes per student or extend those teams' slots and re-run this row.

Check-in weeks run ~8 to 9 h (meetings plus note grading); weeks 7 and 9 carry ~3.5 h of defenses each; week 8 is the peak at ~11 h (check-ins, notes, RFC finals landing). Week 10 stays at check-in load because checkpoint 2 is graded in finals week; weeks 1 and 3 are nearly empty. This fits a standard 0.49 FTE appointment with headroom for office hours and admin. For comparison, the old design at 6 TAs meant ~200 fifteen-criterion progress-report gradings per TA per year before anything else.

Instructors carry no teams: calibration samples (RFC, defense, checkpoints), modifier and appeal adjudication, the four survey runs per term, partner communication, lectures, and demo days.

## Term Calendar (weeks and holidays, last verified against the registrar)

- Fall starts midweek and has eleven instructional weeks counted 0 to 10. Thanksgiving takes the Thursday and Friday of week 9, so week 9 has no Friday lecture and week 10 is a full week. Veterans Day is the Wednesday of week 7.
- Winter: MLK Day is the Monday of week 3.
- Spring: Memorial Day is the Monday of week 10; Commencement is the Saturday after week 10. The Expo is spring week 10.
- Re-verify every year at term setup (the checklist under `.github/ISSUE_TEMPLATE/term-setup.md`); record the answer here as weeks and holidays only.

## Week 0 Checklist (per term)

- [ ] Check-in sheet current; TA assignments made
- [ ] Paste kit regenerated from `main`: `npm run build`, then `npm run canvas:export`, which writes `canvas-export/<term>/` with a body per entry, the rubric CSVs, the syllabus, and a README listing every entry's group, points, weight and due week
- [ ] Canvas shells: rubrics imported from the `canvas/assignments/` CSVs (Canvas Rubrics page, Import), weights checked against the handbook tables
- [ ] Every Canvas entry in each page's Submissions table created, never bundled: each sprint has its note and its Individual Contribution entry, 100 points each in the Sprint Notes group; group weights checked against the handbook tables
- [ ] Term Startup: 100 points in its own Term Startup group (1%), text entry, group submission, due end of week 2 in fall and end of week 1 in winter and spring, with `term-startup/term-startup-rubric.csv` attached. TAs grade it complete or incomplete in the week it is due.
- [ ] Fall only: Demo Day Registration created by hand: 0 points, omit from final grade, file upload (registration screenshot), group submission, due end of fall week 3. Announce the registration link with the five sessions
- [ ] Every term: an Extra Credit group (1%) holding one Demo Day Presentation entry, 100 points, no submission, group assignment. Enter 100 for each student on a team that presented that term; leave everyone else blank, never zero.
- [ ] Announcements the pages point students at: each team's TA and the meeting times and room (week 1), and the funds and cloud request form
- [ ] Spring only: Engineering Expo created by hand (0 points, omit from final grade, text entry, group submission), due end of week 10. No rubric. Check the Expo website for that year's registration opening and poster printing deadlines and announce them
- [ ] Qualtrics surveys updated (contact lists from the roster script)
- [ ] Defense calibration hour scheduled; scoresheets printed
- [ ] Check-in sheet has a per-student check-in column (demoed own work, artifact verified, note or flag)
- [ ] NDA teams identified and flagged in the check-in sheet, with whether the partner allows the instruction team read access
