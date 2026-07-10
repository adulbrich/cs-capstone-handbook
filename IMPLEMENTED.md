# IMPLEMENTED: Course Revision for Fall 2026

Branch: `revision-fall-2026`. Never merged to main. This file logs every change so you can review the whole revision. Companion document: `IDEAS.md` (the assessment and design rationale).

## The New Course at a Glance

Each term's grade has four equal components:

| Component | Weight | Detail |
|---|---|---|
| Project Partner Evaluation | 25% | Midterm pulse 5% + final 20% (unchanged instrument, reconciled arithmetic) |
| Peer Evaluation | 25% | Midterm 5% + final 20% (per-term four-criteria instrument documented as such; CATME at end of spring) |
| Individual Evidence | 25% | Fall/winter: RFC 15% + Defense 10%. Spring: Career and Individual Retrospective 15% + Defense 10% |
| Team Deliverables | 25% | Per-term set; sprint notes carry the individual contribution modifier |

Key structural moves: standalone requirements and technical design documents are gone (living docs in the repo, graded via twice-a-term Repo Checkpoints, with an NDA Track B walkthrough variant); 14 progress reports became 10 pass/fail sprint notes plus a demo cadence; individual credit runs through RFCs (draft, cross-team feedback, revision), live defenses, and PR-per-sprint ownership; the spring outcome ladder is scaffolded by a Definition of Shipped contract, term gates ("hello, production" in fall, release candidate in winter), and a new Shipping guide.

## 1. New Assignments Section (`src/content/docs/assignments/`, 15 pages, new sidebar group)

Source of truth for all graded work; Canvas mirrors it. Every rubric criterion carries a learning-outcome tag, and pages declare coverage in frontmatter.

| Page | Level | Terms | Weight | Notes |
|---|---|---|---|---|
| introduction.mdx | | | | Grade architecture, year at a glance, individual accountability, NDA Track A/B, AI policy, rubric conventions |
| team-charter.mdx | Team | F | 5% | Adds rotating named roles (PM, AI Coordinator, Quality Owner) and the AI/confidentiality one-pager; winter/spring refresh folds into checkpoint 1 |
| sprint-notes.mdx | Team + individual modifier | F/W/S | 8/8/4% | One page, five items, pass/fail; live demo cadence in cohort check-ins + two all-hands demo days |
| repo-checkpoints.mdx | Team | F/W | 4% each | Replaces requirements-update and technical-design-update; term gates; Track B walkthrough protocol |
| rfc.mdx | Individual | F/W | 15% | Draft week 4, cross-team feedback week 5, revision week 8; becomes the ADR; absorbs memo, research brief, standalone ADR |
| defense.mdx | Individual | F/W/S | 10% | 30-40 min per team in cohort check-ins; live scoresheet; AI open for explaining, closed for generating |
| term-retrospective.mdx | Team + individual pages | F | 4% | 4Ls format; winter uses the postmortem, spring the project retrospective |
| definition-of-shipped.mdx | Team | W | 4% | Partner-agreed contract: target ladder rung, metrics, lead times, user access plan; v0 drafted at fall checkpoint 2 |
| incident-postmortem.mdx | Team | W | 5% | Blameless, real incident, corrective actions verifiable at next checkpoint |
| release.mdx | Team | S | 8% | Video + release notes + new metrics evidence section (measured values against docs/shipped.md) |
| landing-page.mdx | Team | S | 3% | Resolved to team-level; Track B alternatives stated |
| project-retrospective.mdx | Team | S | 4% | Cross-year arc, delivered vs Definition of Shipped, decisions traced via RFCs |
| career-retrospective.mdx | Individual | S | 15% | PR portfolio, judgment/AI reflection, resume + two-way peer review |
| project-handoff.mdx | Team | S | 6% | Partner-facing, living-docs links, written partner confirmation, consent declaration |

**Deprecated assignments and their replacements:** Setup (folds into Sprint 1 note + fall checkpoint 1), Memo and Research Brief (fold into RFC 1's context and evidence), Progress Report ×14 (Sprint Notes + demos), Requirements Update and Technical Design Update (Repo Checkpoints on living docs), ADR + Code Review (RFC decision record + PR-per-sprint norm), winter Retrospective (Incident Postmortem), Retrospective and Career old form (Career and Individual Retrospective).

## 2. Project Evaluation Section

- `breakdown.mdx`: rewritten to the four-component architecture; partner facet weight table kept; CATME-dimensions listing removed (was inconsistent with the actual per-term instrument).
- `peer-evaluations.mdx`: documents the real per-term instrument (four criteria + 100-point distribution) and CATME's actual place (end of spring); mid/final split stated (5% + 20%); team-size policy stated (aim 3-4, range 2 to 5+, formula normalized for size, n=2 handling noted); the ~90-line commented-out CATME rubric removed; states that survey-validation deductions are reflected in the posted grade (this was a scripts bug: penalties were emailed but never posted).
- `project-partner-evaluation.mdx`: midterm/final arithmetic reconciled (5% + 20%, was "0-5%"/"20-25%"); corroboration-review sources updated to sprint-note contribution lines, repo activity with Track B live verification, and individual assignments; spring V&V explicitly scored against the Definition of Shipped; partner survey's individual-concern question mentioned; typos fixed.
- `conversion.mdx`: full letter scale (adds B+/C+/C-/D+ granularity; A at 93); explicit missing-work-scores-zero policy.
- `rubrics.mdx`: was a hidden "TBD" stub; now documents band conventions, the missing-is-not-a-band rule, evidence-over-prose, outcome tags, and handbook-wins-over-Canvas.
- `assignments.mdx`: now a short pointer to the Assignments section (no duplicated list to drift).
- Deleted `status.mdx.bak`.

## 3. Learning Objectives and Traceability

- New `learning-objectives/mapping.mdx`: outcome-by-outcome table of individual data points per student per year (every ABET SO has 5 to 10; SO4 lists the ethics course as the program-level point), WIC section marked pending the official revision, L10 mapped to the career retrospective.
- `ABET.mdx` and `WIC.mdx` link to the mapping; WIC page names the RFC as the primary vehicle.
- New `scripts/validate-outcomes.mjs`: parses assignment frontmatter, fails if any ABET outcome has fewer than 2 individual data points. Wired into CI and lefthook. Current output: SO1: 7, SO2: 6, SO3: 10, SO4: 5 (approaching 5 without ethics course), SO5: 9, SO6: 5.

## 4. Guides

- New `guides/shipping.mdx`: the category playbooks (FOSS, New Product or Game, Research, Consultancy), each with ladder rungs, prerequisites, fall/winter/spring timeline, common blockers, and evidence to collect. This is the student-support answer to "the spring outcomes are hard to reach".
- Published `guides/devops.mdx` and `guides/documentation.mdx` (removed `draft: true`; fixes the broken link from testing-strategy).
- New `guides/introduction.mdx`: a landing page mapping guides to the assignments they feed.

## 5. Activities Repositioned

All 11 pages: converted from graded-assignment voice ("Submit...") to practice-library voice; `introduction.mdx` rewritten (practice companions; small pass/fail extra-credit subset announced in Canvas); grading threats removed; pointers added from activities to the graded assignments they prepare (user research feeds the winter real-user gate and Definition of Shipped; design feeds the RFC; retro formats feed the term retrospective; career feeds the career retrospective); the documentary list gained verified 2020s AI-relevant titles; the Mom Test cheat sheet is finally linked; large commented-out blocks moved to `BACKLOG.md`.

## 6. Introduction, Practicalities, About

- `for-partners.mdx`: new assignment vocabulary, four-component grade split, Track A/B repo-access paragraph (staff read access is the stated default), living-docs explanation.
- `for-mentors.mdx`: de-duplicated against for-partners; mentor-specific content kept.
- `series.mdx`: four-component evaluation summary; term/credit table verified.
- `for-students.mdx`: typo fixes, grade summary, NDA answer now describes Track B.
- `index.mdx`: removed TODO comment block; added Assignments and Guides cards.
- `showcase.mdx`: alt text on all images, team-size claim defers to policy, TODOs cleared.
- `teams.mdx`: canonical team-size policy (aim 3-4, range 2 to 5+).
- `expo.mdx`: stale 2025-2026 revision notice removed, timing made timeless.
- `selection.mdx`: "refer to Canvas" replaced with handbook-as-source-of-truth.
- `categories.mdx`: links each category to the Shipping guide.
- `about/`: filled `description: TBD` frontmatter.
- New `BACKLOG.md` (repo root): parking lot for content ideas moved out of pages.

## 7. Templates (`public/`)

New: `rfc-template.md`, `sprint-note-template.md`, `definition-of-shipped-template.md`, `postmortem-template.md`, `defense-scoresheet.md` (printable per-student sheet with behavioral anchors). All linked from their assignment pages.

## 8. Canvas Mirror (`canvas/`)

- New rubric TSVs in the browser-extension import format, points matching the handbook exactly: `rfc/`, `defense/`, `sprint-note/`, `repo-checkpoint/`, `definition-of-shipped/`, `incident-postmortem/`, `career-retrospective/`, plus an updated `spring-release/` with the metrics-evidence criteria.
- New `individual-contribution/` assignment (HTML + rubric notes) documenting the sprint-note deduction logic (full/half/zero per sprint, evidence-based). The mechanism that previously existed only inside Canvas is now versioned here.
- `assignment-readme.md`: rewritten with the source-of-truth statement, the grade architecture, the full week-by-week schedule for all three terms, and a deprecation table mapping every retired assignment to its replacement. Old assignment directories kept for reference.
- Syllabi: `cs462.html` and `cs463.html` now state the four-component grade split and link the assignments overview; new `cs461.html` created (3 credits, fall, ABET outcomes; WIC remains only in cs462).

## 9. Infrastructure

- `src/content.config.ts`: schema extended with the `assignment` frontmatter block (level, terms, weight, outcomes).
- `astro.config.mjs`: Assignments sidebar group added.
- `.github/workflows/ci.yml`: build + astro check, outcome validation, tracked-student-data guard. First CI in this repo.
- `lefthook.yml`: activated (was all comments): pre-commit block on `data/` paths + outcome validation. Install with `pnpm exec lefthook install`.
- `package.json`: `validate:outcomes` script.

## Decisions That Need Your Confirmation

1. **Letter scale changed** (A at 93, added B+/C+/C-/D+ granularity). Check against department norms.
2. **Sprint note count and weeks** (fall 4/winter 4/spring 2, listed in introduction.mdx) assume the usual term calendar; adjust week numbers to the real academic calendar.
3. **RFC peer feedback is cross-team.** For NDA-heavy cohorts, an RFC may reveal partner context; the pages tell Track B students to sanitize, but you may prefer within-team review for NDA teams.
4. **Defense inside cohort check-ins** assumes check-ins are at least 40 minutes and TAs can score live. The printable scoresheet is in `public/defense-scoresheet.md`.
5. **CATME in spring** is kept as-is (parked per your instruction); the peer-evaluations page now says so explicitly.
6. **The old canvas/assignments sources for deprecated assignments were left in place** (with the readme marking them deprecated) rather than deleted, so nothing is lost while Canvas still holds live content.

## Validation

Four persona reviews ran against the branch (student, ABET program evaluator, senior instructor, grading TA), producing ~40 findings. All actionable findings were fixed; the record:

**Student review** (10 findings, all fixed):
- No late/absence/makeup policy existed anywhere; the Defense (10%, live) had no sick path. Added a full "Late Work, Absence, and Makeup" section to the assignments overview, with defense/demo rescheduling.
- Team-of-2 peer-score exposure (one rater determines everything): added an instructor-review trigger before any low score on a 2-person team stands.
- Death weeks defused: fall Term Retrospective moved to week 9; spring Landing Page moved to week 7.
- Peer-eval formula had a missing step (multiplier vs score units): now explicit, with a worked example.
- RFC cross-team review had no NDA path: added the decision-skeleton rule, NDA-to-NDA pairing, staff-review fallback.
- Fall sprint notes referenced a Definition of Shipped that does not exist yet: rephrased.
- Templates were unlinked from every assignment page: all five now linked; eight deprecated template files deleted from public/.
- "Cohort check-in" and "walking skeleton" were load-bearing but undefined: both defined at first use.
- Defense role criterion assumed everyone holds a named role: broadened to "or comparable ownership area" (page, TSV, scoresheet).
- Sprint guide still referenced progress reports: fixed.

**ABET evaluator review** (verdict: the ABET core would survive a visit; WIC and the assurance process were the exposed flanks; all fixed):
- The validator trusted frontmatter, which had drifted from rubric tables on six team pages. Rewritten: `validate-outcomes.mjs` now parses the rubric tables as source of truth, fails on any frontmatter/rubric drift, and enforces L07-L10 coverage in addition to the two-point ABET minimum. All frontmatter reconciled; drift now breaks CI and pre-commit.
- Sprint notes over-claimed outcomes with no gradeable criterion: claim removed.
- WIC L09 (single 2,000-word document) could not be met by combining two terms: the winter RFC now carries an explicit 2,000-word floor (1,500 to 2,500 draft range in winter).
- WIC.mdx claimed 461 and 462 are WIC; syllabi say 462 only: corrected to 462.
- Mapping prose disagreed with the tags in three places (SO3 undercount, SO5 CATME double-count, unsubstantiated handoff L08): all corrected.
- Defense had no evidence-retention story: Canvas is now the stated per-student score record for program assessment.
- Known concern documented, not yet resolved: SO4's in-capstone evidence is concentrated in the RFC (4 of 5 points); diversifying is on the roadmap.

**Senior instructor review** (9 findings; the two blockers and most others fixed):
- Blocker 1: "cohort check-in" undefined (see student fix) plus no operational spec: STAFF-RUNBOOK.md created (cohort ratios, term rhythm, defense calibration and logistics, RFC pairing and grading model, checkpoint protocol, modifier workflow, survey runbook, partner sign-off handling, week-0 checklist, lecture plan).
- Blocker 2: the handbook promised peer-eval corrections the R script never posted: **the script is fixed** (corrected score now merged into the gradebook), along with the s2026 facet-mapping bug. Two script issues remain open and are documented in the runbook and README (team-size cap at 6; Q7 extraction stub).
- RFC grader model was unassigned: now stated on the page (TA-graded, instructor calibration on a sample per grader) and in the runbook; same for the career retrospective.
- Partner sign-offs could block team grades on partner responsiveness: non-responsive-partner fallbacks added to Definition of Shipped and Handoff.
- Lecture-content gap acknowledged: priority workshop list in the runbook; decks remain to be built (open item).

**TA review** (15 findings; TSV fidelity was verified clean; all actionable items fixed):
- Double jeopardy on non-contribution (modifier + partner facet + checkpoint criterion): precedence declared everywhere; the checkpoint criterion now grades attribution infrastructure, not individuals.
- Defense TSV had a 20-point floor contradicting the zero policy: a zero band was added to all five criteria; scoresheet anchors now map to the TSV bands.
- Track B modifier enforcement was impossible as written: now bound to live evidence only.
- The modifier implied 160 audits/term: fast-pass default documented (investigate only on triggers).
- Defense throughput: scoresheet gained per-student timebox, artifact/PR line, repo-check field, assessor-split and dominance-redirect rules.
- Repo checkpoint anchors for cross-TA consistency added ("How Graders Review"), including a fixed Track B walkthrough order.
- Sprint-note pass/fail smuggled quality judgments: evidence item is now an OR, judgment layer passes on any genuine sprint-specific content.
- RFC reviewer no-show held the author harmless (fixed), late-joiner policy added, universal no-sanitized-evidence fallback added, numeric sprint-note split stated (Canvas double-count risk), appeal rule for the modifier defined (evidence note, five business days, instructor decides).

## Remaining Open Items (honest list)

1. SO4 evidence concentration in the RFC (accreditor concern; add a second non-RFC individual SO4 criterion in a future pass).
2. R scripts: team-size cap at 6 including self; Q7 individual-concern extraction stubbed. Fix or supersede with the instructor-tools page.
3. Lecture deck series (spec-writing for agents, AI-diff review, testing workshop) exists as a plan in STAFF-RUNBOOK.md, not as decks. `decks/Fall.md` week 1 deck is done.
4. The instructor-tools client-side page (README todo) is unbuilt; the runbook documents the manual pipeline until then.
5. Week numbers assume the standard term calendar; verify against the actual academic calendar before publishing.
6. Examples library (good/bad examples per assignment) still to be collected from past projects.

## Build Status

`pnpm run build` passes: astro check (warnings only, pre-existing `z` deprecation), 66 pages, internal links validated at build time. `node scripts/validate-outcomes.mjs` passes with rubric tables as source of truth: SO1: 7, SO2: 6, SO3: 10, SO4: 5, SO5: 9, SO6: 5, L07-L10 covered, zero frontmatter drift.
