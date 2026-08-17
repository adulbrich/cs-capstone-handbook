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

## 1. New Assignments Section (`src/content/docs/assignments/`, 16 pages, new sidebar group)

Source of truth for all graded work; Canvas mirrors it. Every rubric criterion carries a learning-outcome tag, and pages declare coverage in frontmatter.

| Page | Level | Terms | Weight | Notes |
|---|---|---|---|---|
| introduction.mdx | | | | Grade architecture, year at a glance, individual accountability, NDA Track A/B, AI policy, rubric conventions |
| team-charter.mdx | Team | F | 4% | Adds rotating named roles (PM, AI Coordinator, Quality Owner) and the AI/confidentiality one-pager; winter/spring refresh folds into checkpoint 1 |
| sprint-notes.mdx | Team + individual modifier | F/W/S | 8/8/4% | One page, five items, pass/fail; live demo cadence in cohort check-ins + two all-hands demo days |
| repo-checkpoints.mdx | Team | F/W | 4% each | Replaces requirements-update and technical-design-update; term gates; Track B walkthrough protocol |
| rfc.mdx | Individual | F/W | 15% | Draft week 4, cross-team feedback week 5, revision week 8; becomes the ADR; absorbs memo, research brief, standalone ADR |
| defense.mdx | Individual | F/W/S | 10% | 30-40 min per team in cohort check-ins; live scoresheet; AI open for explaining, closed for generating |
| term-retrospective.mdx | Team + individual pages | F | 3% | 4Ls format; winter uses the postmortem, spring the project retrospective |
| definition-of-shipped.mdx | Team | W | 4% | Partner-agreed contract: target ladder rung, metrics, lead times, user access plan; v0 drafted at fall checkpoint 2 |
| incident-postmortem.mdx | Team | W | 4% | Blameless, real incident, corrective actions verifiable at next checkpoint |
| release.mdx | Team | S | 8% | Video + release notes + new metrics evidence section (measured values against docs/shipped.md) |
| landing-page.mdx | Team | S | 3% | Resolved to team-level; Track B alternatives stated |
| project-retrospective.mdx | Team | S | 3% | Cross-year arc, delivered vs Definition of Shipped, decisions traced via RFCs |
| career-retrospective.mdx | Individual | S | 15% | PR portfolio, judgment/AI reflection, resume + two-way peer review |
| project-handoff.mdx | Team | S | 6% | Partner-facing, living-docs links, written partner confirmation, consent declaration |
| workshop-activities.mdx | Team | F/W/S | 2/1/1% | Six practice-library activities graded complete/incomplete; added in the August 2026 four-skills pass (section 10) |

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
- New `scripts/validate-outcomes.mjs`: parses assignment frontmatter, fails if any ABET outcome has fewer than 2 individual data points. Wired into CI and lefthook. Current output: SO1: 7, SO2: 6, SO3: 10, SO4: 8, SO5: 9, SO6: 5.

## 4. Guides

- New `guides/shipping.mdx`: the category playbooks (FOSS, New Product or Game, Research, Consultancy), each with ladder rungs, prerequisites, fall/winter/spring timeline, common blockers, and evidence to collect. This is the student-support answer to "the spring outcomes are hard to reach".
- Published `guides/devops.mdx` and `guides/documentation.mdx` (removed `draft: true`; fixes the broken link from testing-strategy).
- New `guides/introduction.mdx`: a landing page mapping guides to the assignments they feed.

## 5. Activities Repositioned

All 11 pages: converted from graded-assignment voice ("Submit...") to practice-library voice; `introduction.mdx` rewritten (practice companions; an extra-credit subset was proposed here and later replaced by tiering, see section 10); grading threats removed; pointers added from activities to the graded assignments they prepare (user research feeds the winter real-user gate and Definition of Shipped; design feeds the RFC; retro formats feed the term retrospective; career feeds the career retrospective); the documentary list gained verified 2020s AI-relevant titles; the Mom Test cheat sheet is finally linked; large commented-out blocks moved to `BACKLOG.md`.

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
- `lefthook.yml`: activated (was all comments): pre-commit block on `data/` paths + outcome validation. Install with `npx lefthook install`.
- `package.json`: `validate:outcomes` script.

### Package Manager Migration to npm (August 2026)

Moved off pnpm. `pnpm-lock.yaml` deleted, `package-lock.json` committed, the
`packageManager` pnpm pin removed from `package.json`.

Regenerating the lockfile was itself the security fix. The pnpm lock was last
written 2026-07-04 and had frozen transitive deps at that day's resolution, so
`pnpm audit` reported 18 vulnerabilities (9 high, 7 moderate, 2 low) even though
the declared ranges already permitted patched versions. A clean `npm install`
cleared 17 of them without a single version change. Only `astro`, pinned exactly
at `7.0.6`, needed a real bump.

Added:

- `.npmrc`: `engine-strict=true`, `fund=false`, `prefer-dedupe=true`.
- `.nvmrc`: `24`, matching `engines.node` in `package.json` and CI. Node 24 is
  Vercel's default runtime, and Vercel reads `engines.node`, so local, CI, and
  deploy now all resolve to the same major.
- `.github/dependabot.yml`: weekly grouped npm updates, monthly GitHub Actions.
  This is what prevents the lockfile drift described above from recurring.
- CI `audit` job: `npm audit signatures` (supply-chain) and
  `npm audit --audit-level=high`, split from `build` so a new advisory does not
  mask a compile failure.

CI now runs `npm ci` rather than `npm install`, on `actions/checkout@v5` and
`actions/setup-node@v5` reading the Node version from `.nvmrc`.

Three dependencies are installed and updated but currently inert, commented out
in `astro.config.mjs`: `starlight-links-validator`, `starlight-page-actions`,
and `starlight-image-zoom`. Either enable them or drop them from
`package.json`; as-is they carry advisory surface for no benefit.

`typescript` stays on 6.0.3. TypeScript 7.0.2 is available but
`@astrojs/check@0.9.10` declares `typescript: "^5.0.0 || ^6.0.0"`, so the bump
would break `astro check`. Revisit when `@astrojs/check` widens its peer range.

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
- Concern raised here and since resolved: SO4's in-capstone evidence was concentrated in the RFC (4 of 5 points). Dual-tagging the defense ownership criterion `SO2, SO4` added three non-RFC individual points, one per term, taking SO4 to 8. See the four-skills design spec.

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

## Staffing Recalibration (July 2026)

The original persona reviews and runbook assumed 10 to 12 TAs; the real ceiling is **6 TAs** (~14 teams and ~50 students per TA). Changes made on that basis:

- **Check-ins are bi-weekly per team, aligned to sprint boundaries** (was weekly). At 14 teams per TA, weekly per-team check-ins alone would cost 6 to 7 hours a week; bi-weekly costs ~3.5. Defense and Track B checkpoint sessions replace that cycle's regular check-in, so they add scoring time, not meeting time. Updated in the assignments overview and the runbook.
- **STAFF-RUNBOOK.md now carries a per-TA hours ledger at 6 TAs**: ~64 hours per TA in fall and winter (~6.4 h/week average, peaking ~9-10 in weeks 8-10), ~60 in spring. This fits a standard 0.49 FTE appointment with headroom. The dominant line is check-ins, by design; grading proper is ~25 h/term because sprint notes are pass/fail, checkpoints are checklists, and the defense produces no take-home artifact.
- RFC arithmetic updated: ~50 per TA per term (not 25-30), ~8 hours in weeks 8-10, with length caps enforced at grading time.
- If the load still feels too high after a live term, the documented relief valve is the fall RFC: grading it credit/no-credit with instructor sampling would save ~6 h/TA in fall while outcome coverage stays above the two-point floor (winter RFC + three defenses carry it). Not applied; noted as the first thing to cut.

## 10. Four-Skills Pass (August 2026)

A second pass added explicit assessment for **critical thinking, AI literacy, leadership, and collaboration**, driven by partner and employer reports of four failure modes (students who cannot explain their own system, unverified AI output reaching the partner, nobody driving decisions to a conclusion, invisible contribution) and by the pace of change in AI practice. Full rationale in `docs/superpowers/specs/2026-08-17-four-skills-assessment-design.md`; tiering decision in `docs/superpowers/plans/2026-08-17-activity-tiering.md`.

**Governing principles:** rubrics assess invariants while guides and activities carry the volatile tool layer (no rubric criterion names a tool); the standard is capability-relative, so delegation is graded against the strength of the safety net rather than against tool sophistication; graders score the triage decision, not whether the code happened to turn out fine; content teaches the frontier baseline while assessment accommodates limited tooling; new behavioral signals feed the single existing contribution modifier and never create a new deduction channel.

**Assessment layer:**

- `defense.mdx`: the five criteria were re-anchored to the four skills rather than extended, because 6 minutes per student is the binding constraint on the course. Ownership became **Ownership and delegation**, dual-tagged `SO2, SO4`. Judgment gained the hard-to-reverse element; Role gained work distribution. The question "what did the AI get wrong and how did you catch it" became "where did you decide to stop and check, and why there", since the original assumed line-by-line review of AI output.
- **SO4 went from 5 to 8 individual data points**, 4 of them non-RFC. This closes open item 1, previously the branch's live accreditor exposure.
- `rfc.mdx`: the AI-disclosure criterion became **Delegation and validation** (same 10 points, same SO4 tag). Disclosure is a compliance instrument and cannot measure skill. The RFC trigger tightened to decisions that are **hard to reverse**, with a stated fallback, so topic choice is itself a triage exercise.
- `assignments/introduction.mdx`: the course-wide AI policy rule 2 changed from "disclose and verify" to delegate-deliberately-and-build-the-net.
- `sprint-notes.mdx`: contribution lines now record who chaired which decision, giving the defense role criterion a record instead of self-narration. `team-charter.mdx` carries the rotation commitment.
- `repo-checkpoints.mdx`: Build health became **Build health and safety net**, judged relative to how much the team delegates. Extended the existing criterion rather than adding a sixth, so points stayed at 100.
- `STAFF-RUNBOOK.md`: defense calibration now covers the delegation criterion explicitly; a low defense Ownership or Role score is a new **input** to the one modifier decision, with precedence unchanged.
- `mapping.mdx`: SO4 row rebuilt, concentration sentence deleted, and a caution added that L07's only individual source is the RFC peer-feedback criterion (the term retrospective's `L07` tag is team-level and counts zero, so cutting peer review would fail CI).

**Instruction layer:**

- New `activities/ai.mdx` (7 activities): the library had 105 exercises and **not one** taught AI-assisted engineering practice. Three pillars: which doors are one-way (a concept absent from the handbook entirely), you may delegate only as far as your net catches, and the acceptance judgment that cannot be delegated. Every exercise states a substitute for more limited tooling. Includes a repo-skills setup exercise naming [obra's Superpowers](https://github.com/obra/superpowers) and [Matt Pocock's skills](https://github.com/mattpocock/skills).
- `guides/testing-strategy.mdx`: accessibility added in three forms (automated as a CI gate, manual because roughly half of real defects need judgment, assistive-technology user sessions with an honest simulated substitute). WCAG 2.2 AA named as the standard; the handbook previously had none.
- `guides/generative-ai.mdx`: "Verify, do not trust" replaced by "verify what matters, build the net that lets you trust the rest". Added a nine-entry index of what can be automated, each linking to the owning guide, plus the counterpart list of what stays human. Marked for annual review.
- Accessibility activity cluster distributed across `design`, `user`, `ai`, and `communication`.
- **Activities tiered**: 8 Workshop, 40 Recommended, 66 Library, out of 114 total. Extra credit removed: it tried to solve a routing problem with an incentive. Every graded assignment now names its recommended activities and the criterion each serves, with repeated assignments differentiated (repo checkpoints by their four escalating gates, defense and RFC by term, sprint notes by one-time-setup versus repeatable). `career.mdx` deliberately excluded from both promoted tiers pending its own review pass.
- Fixed two malformed activity headings (leading space in `planning.mdx`, trailing space in `teamwork.mdx`) that produced broken anchors, plus missing `Badge` imports in `conflict.mdx` and `ai.mdx`.

- **Workshop activities are graded** complete/incomplete on a new `assignments/workshop-activities.mdx` page: fall 2% across 6 items, winter 1%, spring 1%. Funded by re-cutting Team Deliverables while keeping every term at exactly 25%: Charter 5 to 4 and Term Retrospective 4 to 3 in fall, Incident Postmortem 5 to 4 in winter, Project Retrospective 4 to 3 in spring. Sprint Notes and Repo Checkpoints were deliberately left alone, since they carry the individual contribution modifier and the living-docs gate. All three syllabi updated to match; new Canvas rubric TSVs in `canvas/assignments/workshop-activities/` at 10 points per item.
- **Career activities promoted onto the career assignment only**: Portfolio Development and Public Code Repository for the PR-portfolio criterion, Resume Building for the resume and peer-review criteria. No career activity is recommended for any non-career assignment.

**Infrastructure:** `starlightLinksValidator` was commented out in `astro.config.mjs` and is now enabled and verified by negative test. This pass added roughly 90 internal cross-references, most of them anchor links, none of which would otherwise have been checked.

## Remaining Open Items (honest list)

1. ~~SO4 evidence concentration in the RFC.~~ **Resolved 2026-08-17**: the defense ownership-and-delegation criterion is now tagged `SO2, SO4`, giving three non-RFC individual SO4 points per year (SO4 total 5 to 8).
2. R scripts: team-size cap at 6 including self; Q7 individual-concern extraction stubbed. Fix or supersede with the instructor-tools page.
3. Lecture deck series (spec-writing for agents, AI-diff review, testing workshop) exists as a plan in STAFF-RUNBOOK.md, not as decks. `decks/Fall.md` week 1 deck is done.
4. The instructor-tools client-side page (README todo) is unbuilt; the runbook documents the manual pipeline until then.
5. Week numbers assume the standard term calendar; verify against the actual academic calendar before publishing.
6. Examples library (good/bad examples per assignment) still to be collected from past projects.

## Build Status

`npm run build` passes: astro check (0 errors, warnings only, pre-existing `z` deprecation), 67 pages. Internal link validation **is** running as of 2026-08-17: `starlightLinksValidator()` was previously commented out in `astro.config.mjs` and is now enabled, reporting "All internal links are valid" across all 67 pages. Verified by negative test (a deliberately broken link fails the build), and CI gates on it because CI runs `npm run build`. `node scripts/validate-outcomes.mjs` passes with rubric tables as source of truth: SO1: 7, SO2: 6, SO3: 10, SO4: 8, SO5: 9, SO6: 5, L07-L10 covered, zero frontmatter drift.
