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

Key structural moves: standalone requirements and technical design documents are gone (living docs in the repo, graded via twice-a-term Repo Checkpoints, with a live walkthrough variant for NDA teams); 14 progress reports became 10 pass/fail sprint notes plus a demo cadence; individual credit runs through RFCs (draft, cross-team feedback, revision), live defenses, and PR-per-sprint ownership; the spring outcome ladder is scaffolded by a Definition of Shipped contract, term gates ("hello, production" in fall, release candidate in winter), and a new Shipping guide.

## 1. New Assignments Section (`src/content/docs/assignments/`, 17 pages, new sidebar group)

Source of truth for all graded work; Canvas mirrors it. Every rubric criterion carries a learning-outcome tag, and pages declare coverage in frontmatter.

| Page | Level | Terms | Weight | Notes |
|---|---|---|---|---|
| introduction.mdx | | | | Grade architecture, year at a glance, individual accountability, NDA handling, AI policy, rubric conventions |
| team-charter.mdx | Team | F | 4% | Adds rotating named roles (PM, AI Coordinator, Quality Owner) and the AI/confidentiality one-pager; winter/spring refresh folds into checkpoint 1 |
| sprint-notes.mdx | Team + individual modifier | F/W/S | 8/8/4% | One page, five items, pass/fail; live demo cadence in cohort check-ins + two all-hands demo days |
| repo-checkpoints.mdx | Team | F/W | 4% each | Replaces requirements-update and technical-design-update; term gates; NDA walkthrough protocol |
| rfc.mdx | Individual | F/W | 15% | Draft week 4, cross-team feedback week 5, revision week 8; becomes the ADR; absorbs memo, research brief, standalone ADR |
| defense.mdx | Individual | F/W/S | 10% | 30-40 min per team in cohort check-ins; live scoresheet; AI open for explaining, closed for generating |
| term-retrospective.mdx | Team + individual pages | F | 3% | 4Ls format; winter uses the postmortem, spring the project retrospective |
| definition-of-shipped.mdx | Team | W | 4% | Partner-agreed contract: target ladder rung, metrics, lead times, user access plan; v0 drafted at fall checkpoint 2 |
| incident-postmortem.mdx | Team | W | 4% | Blameless, real incident, corrective actions verifiable at next checkpoint |
| release.mdx | Team | S | 8% | 3-minute trailer + 2-page report with a metrics evidence section (measured values against docs/shipped.md); format changed 2026-08-18 |
| landing-page.mdx | Team | S | 3% | Resolved to team-level; alternatives for NDA teams stated |
| project-retrospective.mdx | Team | S | 3% | Cross-year arc, delivered vs Definition of Shipped, decisions traced via RFCs |
| career-retrospective.mdx | Individual | S | 15% | PR portfolio, judgment/AI reflection, resume + two-way peer review |
| project-handoff.mdx | Team | S | 6% | Partner-facing, living-docs links, written partner confirmation, consent declaration |
| workshop-activities.mdx | Team | F/W/S | 2/1/1% | Eight practice-library activities graded complete/incomplete (6 fall, 1 winter, 1 spring); added in the August 2026 four-skills pass (section 10) |
| peer-evaluations.mdx | Individual | F/W/S | 25% | Moved in from Project Evaluation in the deduplication pass (section 12); midterm 5% + final 20%, CATME at end of spring |
| project-partner-evaluation.mdx | Team, individually adjustable | F/W/S | 25% | Moved in from Project Evaluation in the deduplication pass (section 12); midterm pulse 5% + final 20%, six facets, V&V ladders |

**Deprecated assignments and their replacements:** Setup (folds into Sprint 1 note + fall checkpoint 1), Memo and Research Brief (fold into RFC 1's context and evidence), Progress Report ×14 (Sprint Notes + demos), Requirements Update and Technical Design Update (Repo Checkpoints on living docs), ADR + Code Review (RFC decision record + PR-per-sprint norm), winter Retrospective (Incident Postmortem), Retrospective and Career old form (Career and Individual Retrospective).

## 2. Project Evaluation Section

- `breakdown.mdx`: rewritten to the four-component architecture; partner facet weight table kept; CATME-dimensions listing removed (was inconsistent with the actual per-term instrument).
- `peer-evaluations.mdx`: documents the real per-term instrument (four criteria + 100-point distribution) and CATME's actual place (end of spring); mid/final split stated (5% + 20%); team-size policy stated (aim 3-4, range 2 to 5+, formula normalized for size, n=2 handling noted); the ~90-line commented-out CATME rubric removed; states that survey-validation deductions are reflected in the posted grade (this was a scripts bug: penalties were emailed but never posted).
- `project-partner-evaluation.mdx`: midterm/final arithmetic reconciled (5% + 20%, was "0-5%"/"20-25%"); corroboration-review sources updated to sprint-note contribution lines, repo activity with live verification for NDA teams, and individual assignments; spring V&V explicitly scored against the Definition of Shipped; partner survey's individual-concern question mentioned; typos fixed.
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

- `for-partners.mdx`: new assignment vocabulary, four-component grade split, NDA repo-access paragraph (staff read access is the stated default), living-docs explanation.
- `for-mentors.mdx`: de-duplicated against for-partners; mentor-specific content kept.
- `series.mdx`: four-component evaluation summary; term/credit table verified.
- `for-students.mdx`: typo fixes, grade summary, NDA answer now describes the walkthrough path.
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

Pass 13 extended that to the whole directory: 14 downloads, every one linked from an owning page, enforced by `scripts/validate-downloads.mjs`. `team-charter-template.md` was deleted rather than kept, because `team-charter.mdx` enumerates the sections itself.

## 8. Canvas Mirror (`canvas/`)

- New rubric TSVs in the browser-extension import format, points matching the handbook exactly: `rfc/`, `defense/`, `sprint-note/`, `repo-checkpoint/`, `definition-of-shipped/`, `incident-postmortem/`, `career-retrospective/`, plus an updated `spring-release/` with the metrics-evidence criteria.
- New `individual-contribution/` assignment (HTML + rubric notes) documenting the sprint-note deduction logic (full/half/zero per sprint, evidence-based). The mechanism that previously existed only inside Canvas is now versioned here.
- `assignment-readme.md`: rewritten with the source-of-truth statement, the grade architecture, the full week-by-week schedule for all three terms, and a deprecation table mapping every retired assignment to its replacement. Old assignment directories kept for reference.
- Syllabi: `cs462.html` and `cs463.html` now state the four-component grade split and link the assignments overview; new `cs461.html` created (3 credits, fall, ABET outcomes; WIC remains only in cs462).

## 9. Infrastructure

- `src/content.config.ts`: schema extended with the `assignment` frontmatter block (level, terms, weight, outcomes). `weight` accepts a number or a strict per-term map as of pass 13.
- `astro.config.mjs`: Assignments sidebar group added.
- `.github/workflows/ci.yml`: build + astro check, outcome validation, activity-tier validation, download-ownership validation, tracked-student-data guard. First CI in this repo.
- `lefthook.yml`: activated (was all comments): pre-commit block on `data/` paths plus all three validators. Install with `npx lefthook install`.
- `package.json`: `validate:outcomes`, `validate:activities`, `validate:downloads` scripts.

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

1. ~~**Letter scale changed** (A at 93, added B+/C+/C-/D+ granularity). Check against department norms.~~ **Decided 2026-09-11** (#22): 11 bands, handbook scale; syllabi resynced 2026-09-13.
2. ~~**Sprint note count and weeks** (fall 4/winter 4/spring 2, listed in introduction.mdx) assume the usual term calendar; adjust week numbers to the real academic calendar.~~ **Decided 2026-09-11** (#24, #26, #29): fall 4, winter 5, spring 3, at weeks 4/6/8/10, 2/4/6/8/10 and 2/4/6; week numbers verified against the registrar 2026-09-13 (open item 5).
3. **RFC peer feedback is cross-team.** For NDA-heavy cohorts, an RFC may reveal partner context; the pages tell students on NDA teams to sanitize, but you may prefer within-team review for NDA teams.
4. **Defense inside cohort check-ins** assumes check-ins are at least 40 minutes and TAs can score live. The printable scoresheet is in `public/defense-scoresheet.md`.
5. **CATME in spring** is kept as-is (parked per your instruction); the peer-evaluations page now says so explicitly.
6. **The old canvas/assignments sources for deprecated assignments were left in place** (with the readme marking them deprecated) rather than deleted, so nothing is lost while Canvas still holds live content.
7. ~~The four-skills spec's Communication substitution is unimplemented and unrecorded.~~ **Resolved 2026-08-19**: implemented, with one deliberate divergence from the spec text. See section 14.

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
- NDA modifier enforcement was impossible as written: now bound to live evidence only.
- The modifier implied 160 audits/term: fast-pass default documented (investigate only on triggers).
- Defense throughput: scoresheet gained per-student timebox, artifact/PR line, repo-check field, assessor-split and dominance-redirect rules.
- Repo checkpoint anchors for cross-TA consistency added ("How Graders Review"), including a fixed NDA walkthrough order.
- Sprint-note pass/fail smuggled quality judgments: evidence item is now an OR, judgment layer passes on any genuine sprint-specific content.
- RFC reviewer no-show held the author harmless (fixed), late-joiner policy added, universal no-sanitized-evidence fallback added, numeric sprint-note split stated (Canvas double-count risk), appeal rule for the modifier defined (evidence note, five business days, instructor decides).

## Staffing Recalibration (July 2026)

The original persona reviews and runbook assumed 10 to 12 TAs; the real ceiling is **6 TAs** (~14 teams and ~50 students per TA). Changes made on that basis:

- **Check-ins are bi-weekly per team, aligned to sprint boundaries** (was weekly). At 14 teams per TA, weekly per-team check-ins alone would cost 6 to 7 hours a week; bi-weekly costs ~3.5. Defense and NDA checkpoint sessions replace that cycle's regular check-in, so they add scoring time, not meeting time. Updated in the assignments overview and the runbook.
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
- **Activities tiered**: 8 Workshop, 40 Recommended, 66 Library, out of 114 total (revised to 8 / 53 / 57 out of 118 in the August revision pass below). Extra credit removed: it tried to solve a routing problem with an incentive. Every graded assignment now names its recommended activities and the criterion each serves, with repeated assignments differentiated (repo checkpoints by their four escalating gates, defense and RFC by term, sprint notes by one-time-setup versus repeatable). `career.mdx` deliberately excluded from both promoted tiers pending its own review pass.
- Fixed two malformed activity headings (leading space in `planning.mdx`, trailing space in `teamwork.mdx`) that produced broken anchors, plus missing `Badge` imports in `conflict.mdx` and `ai.mdx`.

- **Workshop activities are graded** complete/incomplete on a new `assignments/workshop-activities.mdx` page: fall 2% across 6 items, winter 1%, spring 1%. Funded by re-cutting Team Deliverables while keeping every term at exactly 25%: Charter 5 to 4 and Term Retrospective 4 to 3 in fall, Incident Postmortem 5 to 4 in winter, Project Retrospective 4 to 3 in spring. Sprint Notes and Repo Checkpoints were deliberately left alone, since they carry the individual contribution modifier and the living-docs gate. All three syllabi updated to match; new Canvas rubric TSVs in `canvas/assignments/workshop-activities/` at 10 points per item.
- **Career activities promoted onto the career assignment only**: Portfolio Development and Public Code Repository for the PR-portfolio criterion, Resume Building for the resume and peer-review criteria. No career activity is recommended for any non-career assignment.

**Infrastructure:** `starlightLinksValidator` was commented out in `astro.config.mjs` and is now enabled and verified by negative test. This pass added roughly 90 internal cross-references, most of them anchor links, none of which would otherwise have been checked.

## 11. Revision Pass (August 2026)

Instructor feedback pass over the four-skills work. Grouped by what changed.

**Terminology.** "Track A" and "Track B" are gone from every student-facing and staff-facing surface (21 files). The default is stated once, on the assignments overview, and each page notes locally where an NDA team does something different. The vocabulary was cost with no benefit: most students were on the default and still had to learn both labels to read the pages. The anchor `#nda-projects-track-a-and-track-b` became `#nda-projects`; inbound links updated. `IDEAS.md` and `docs/superpowers/**` were deliberately left alone, being dated design records.

**Sprint notes.**
- Demos are now per-student, every sprint, in the team's own check-in. 2 to 3 minutes each is 6 to 12 minutes for a team of three or four, inside the existing 25-to-30-minute slot; the runbook names open-ended coaching as what it displaces.
- Sprints whose check-in is consumed by a defense or an NDA walkthrough substitute one timestamped video with a segment per student. TAs are told to reject untimestamped team videos, because an untimestamped video is not a per-student signal.
- "Planned versus done" became "what got done": concrete, consequential, explicitly not required to be code.
- Contribution lines gained a quantitative and qualitative proxy: PRs owned, the specific change asked for in review, and one human-written sentence on the most consequential thing shipped and how the team knows it works. Bounded by three stated rules (mechanical changes are not evidence; numbers are read as a pattern, never one sprint; the sentence outranks the counts). Self-reported and passes on being filled in, so a grader never opens GitHub for a pass/fail item, with spot-verification live at demo and defense.

**Repo checkpoints.**
- `docs/adr/` accepted alongside `docs/rfcs/`.
- `AGENTS.md` and `CLAUDE.md` named as the AI context file; the Copilot instructions reference is gone.
- The CI minimum is defined as four outcomes rather than "have a workflow file", with per-category realizations, because the file-based phrasing is unsatisfiable for FOSS and vacuous for research.
- Git hygiene (PR-only merges, no committed secrets or artifacts, meaningful messages, no force-push) folded into the Contribution traceability criterion rather than becoming a sixth criterion. The 100-point split and the Canvas TSV field counts are unchanged.
- The fall week 10 production target must be recorded in `docs/design.md` and partner-agreed at the week 5 checkpoint.
- "How Graders Review" replaced by one line per criterion in rubric order.

**RFC.** ADR framing removed from the page and the template. The hard-to-reverse note now covers partner-constrained teams, who inherit the stack and hosting and were being asked to pick a one-way door they are not standing in front of. Padding cut.

**Outcome mapping.** The two-data-point rule is scoped to ABET, since WIC and Beyond OSU need coverage rather than redundancy; the L07 caution is removed. "How This Stays True" moved to `AGENTS.md`.

**Activities.**
- New `cs46x-activities` skill in `.claude/skills/` defines the page format. The library had grown to 114 entries across twelve pages without a written format, and `ai.mdx` had drifted; `ai.mdx` was rewritten to the majority convention rather than the reverse.
- Two headings carried a decorative emoji, producing anchor slugs containing an invisible variation selector. Stripped, with all seven inbound links fixed.
- Six new research and R&D activities, each tied to a gate in the Shipping guide. A seventh was merged into the existing `Define Your Research Questions` stub instead of shipping a near-duplicate.
- Five assignment pages carry a **By project category** table (FOSS, Research, Consultancy, New Product or Game). This is what lets a repeated assignment name more than two or three options without asking anyone to redo an exercise.
- `scripts/validate-activities.mjs` reconciles badges against assignment links, because the tier is decided in one file and displayed in another. Wired into CI and pre-commit. Tiers now: **8 Workshop, 53 Recommended, 57 Library, 118 total**.

**Repository.**
- `AGENTS.md` at root replaces `.github/copilot-instructions.md`, which was 324 autogenerated lines of Biome lint rules for a repo that is almost entirely MDX. Named `AGENTS.md`, not `AGENT.md`, to match the cross-tool convention.
- `.github/ISSUE_TEMPLATE/term-setup.md` added, modeled on the engr103 and cs312 templates; the README's instructor checklist points at it.

## 12. Deduplication Pass (August 2026)

Instructor review found the same facts restated across the handbook. A mechanical scan for repeated sentences across all pages came back nearly empty (14 hits, ten of them badge markup), which showed the duplication was **conceptual**: the same fact reworded, not copied. Tracing facts instead of strings found the grade architecture stated with numbers in **eight places** and rubric conventions in three.

**The Project Evaluation section is gone**, dissolved into Assignments and Learning Objectives. Its own contents made the case: `project-evaluation/assignments.mdx` was 118 words whose entire purpose was to say the assignments section is the source of truth. Three of its six pages had **zero inbound links** and were reachable only from the sidebar, including the letter-grade table students actually need.

| Page | Fate |
|---|---|
| `assignments.mdx` | Deleted. Pointer plus a duplicate. |
| `breakdown.mdx` | Facet-weight table moved onto the partner evaluation page; the rest was a second copy of the grade table. |
| `conversion.mdx` | Became `learning-objectives/grading.mdx`. Every letter is defined in learning-objective language ("mastery on all learning objectives"), so that is where it belongs. |
| `rubrics.mdx` | Merged into the Rubric Conventions section of `assignments/introduction.mdx`. |
| `peer-evaluations.mdx` | Moved to `assignments/`. |
| `project-partner-evaluation.mdx` | Moved to `assignments/`. |

Peer evaluations and partner evaluations are 50% of every term's grade, so the assignments section is where they belong; the sidebar group is now `Learning Objectives and Grading`. Six Astro redirects cover the retired URLs, which were live and linked. 68 pages to 65.

**The restatement rule**, now in `AGENTS.md` with a table of canonical homes: one canonical statement, everywhere else links, but a page may state the single number its own reader needs. `for-partners` keeps "your evaluations account for 25%" and loses the other three components; `series`, `for-students`, and `for-mentors` lost their full breakdowns.

**Two invariants moved from memory into CI:**

- Each term's Team Deliverables table must sum to exactly 25%. This had been checked with a throwaway script every time weights were re-cut. Negative-tested by breaking a weight and confirming the build fails.
- Peer evaluations now declares `SO5: 2` in frontmatter like every other page, so `validate-outcomes.mjs` derives its six data points instead of carrying `STANDING_INDIVIDUAL_POINTS = { SO5: 6 }` as a hardcoded constant. Accreditation evidence no longer lives in a script comment. SO5 still totals 9.

Project category prose was also deduplicated: the partner evaluation page repeated the descriptions from `practicalities/categories.mdx` (two sentences byte-identical) and now links once, keeping the V&V ladders that are genuinely its own.

## 13. Consistency Sweep (August 2026)

A full content sweep. All three validators passed on entry, which was the useful starting fact: every real defect had to be in what they cannot see. Eleven discrepancies in the first pass, then the `public/` download surface turned out to hold a worse problem than the content drift it was checked for.

**Handbook internal.** `activities/introduction.mdx` and `assignments/workshop-activities.mdx` both said "six activities everyone does" while the Workshop tier is eight (6 fall, 1 winter, 1 spring), which the same pages' own tables and the validator already stated. The Year at a Glance omitted Workshop Activities from the winter and spring team rows. The activities description listed 9 themes for a page that has 11. `guides/introduction.mdx` never listed `guides/conflict.mdx`, extracted two commits earlier, and advertised Presentations as covering "the release video" three days after Release became a trailer plus a written report, which `presentations.mdx` covers neither of. `for-students.mdx` still listed "project evaluation" in its coverage list, a section dissolved in pass 12.

**Canvas mirror.** Landing Page was week 8 in `cs463.html` and `assignment-readme.md` against week 7 in the handbook; the readme's CS 462 and CS 463 schedules carried no Workshop Activities row despite the same file's weights section adding them. `scripts/project-partner-end-of-term-surveys.R` pointed at `/project-evaluation/breakdown/#project-partner-assessment-facets`, whose redirect drops the anchor. Its facet weights match the handbook exactly; only the comment was stale.

**Spring defense runs through week 10**, and here Canvas was right and the handbook was wrong. Expo is week 10 and Expo Q&A may substitute for the defense, so the spring window is weeks 7 to 10 where fall and winter are 7 to 9. `expo.mdx` now states the week instead of only "in June." **Reversed 2026-09-11 (#31):** there is no substitution; the spring defense window is weeks 7 to 9 like every term, and the Expo is a separate event that the defense page does not mention.

**All 13 Canvas rubric TSVs verified clean** on points, criterion order, and outcome tags, every total 100. `mapping.mdx` counts match validator output on all ten outcomes. The syllabi weights match the term tables. Pass 12's reconciliation held.

**Two more invariants moved from memory into CI.**

- **`assignment.weight` is now reconciled against the term tables.** It was documentary: nothing read it, so it drifted. Sprint Notes declared `8` while spring is 4%, Workshop Activities declared `2` while winter and spring are 1%. The field now takes a scalar when the weight is uniform across the terms a page runs, and a per-term map when it varies. `validate-outcomes.mjs` fails on scalar-where-varying, a wrong per-term number, a missing term, and a declared term no table row links; `content.config.ts` uses a **strict** object so a misspelled term fails at build rather than silently declaring nothing. The check was written before the fix and independently flagged exactly the two pages. Negative-tested in both directions.
- **`scripts/validate-downloads.mjs`, new**: every file in `public/` must be linked from a page under `src/content/docs/`. `starlight-links-validator` already covered links to missing files; nothing covered the reverse, and **six of fifteen downloads were being served with no page linking them**. An orphan is worse than a missing file: it stays served while going stale, and the assignment it belongs to never notices. Negative-tested.

**The download surface got a rule**, now in `AGENTS.md`: every download has exactly one owning page, and that page is the one that requires the artifact.

| File | Fate |
|---|---|
| `team-charter-template.md` | Deleted. See below. |
| `CONTRIBUTING-template.md` | Linked from `team-charter.mdx` artifact 2. Covers all five stated requirements. |
| `team-retrospective-template.md` | Asked for 2 improvement commitments plus a risk plan where the page requires one commitment, and named a date-stamped filename where the page says `docs/retrospectives/fall.md`. Both fixed, then linked. |
| `rfc-template.md` | Gained **Response to Feedback** and **Decision** sections. Criterion 8 is worth 10 points and had no template home. |
| `problem-statement-template.md` | LinkCard from `guides/requirements.mdx`. |
| `email-template.txt` | Linked from `practicalities/selection.mdx`, "reach out to and meet your project partner." |
| `the-20-min-networking-cheat-sheet.md` | Linked from the networking activity in `career.mdx`. The weakest of the seven: the sheet is about one-on-one informational meetings, not job fairs. |

**`team-charter-template.md` was deleted rather than repaired.** `team-charter.mdx` already enumerates all eight required sections with per-role duties and rotation rules. The template restated that badly: it was missing the two rubric-scored sections worth 30 points combined (PR-per-Sprint Norm, AI and Confidentiality One-Pager) and opened with a Change Log table the page explicitly says not to maintain, git history being the change log. Where the assignment page enumerates the sections, **the page is the template**; a second copy is the same "say each fact once" failure that pass 12 was about, and this file is what it looks like after a year.

**Em dashes eliminated repo-wide.** Four in `guides/`, twenty across four `public/` templates, three used as empty-cell markers in `STAFF-RUNBOOK.md` (now `n/a`), two in a `Latex.astro` comment. A repo-wide grep for the character now returns nothing outside `node_modules`.

**Home page.** The hero's *Explore Activities* button became *Explore Assignments*. The Assignments/Guides card grid was dropped as redundant with it, replaced by a **What Students Learn** paragraph naming the four skills (critical thinking, AI literacy, leadership, collaboration) and stating that each is assessed per student rather than inferred from the team's output. The vocabulary is the four-skills pass's own, already load-bearing in the defense and RFC rubrics, so the page makes no claim the handbook does not back.

## 14. Defense Communication Criterion (August 2026)

The last unimplemented line of the four-skills design (section 10), surfaced by the pass 13 sweep. The spec's table said: *substitute one question: what was the strongest thing you told a peer whose RFC you reviewed.* The plan document never carried it forward, so it reached neither `defense.mdx` nor the scoresheet, and nothing recorded it as cut.

**Why it exists.** Communication was assessed in one direction only: how well a student explains their own work. A student can be articulate about their own work and useless in review, and the course already generates reviewer-side evidence it was not asking about.

**The criterion is now `Communication, both directions`**, still 20 points, still tagged `SO3` alone. It keeps the self-expression half unchanged and adds: names the most useful thing they told someone whose work they reviewed, and what changed because of it. No `L07`: this is spoken, not writing, and L07's individual floor is already met by the RFC.

**The divergence: the spec's wording is unimplementable in spring.** The RFC runs fall and winter only, so "a peer whose RFC you reviewed" has no referent at the spring defense. The criterion is therefore anchored on review generally: the RFC cross-team review in fall and winter, code review in spring, where sprint-note contribution lines already require naming "the one change you asked for." Both are graded records, which makes the answer checkable rather than self-reported.

**The 6-minute budget was respected.** The defense budget is the binding constraint on the whole design, and the rule is that no question is added without one being removed. `defense.mdx` listed "why this way" and "what alternatives did you reject" as two questions, while the scoresheet and the Canvas TSV already scored them as one combined Judgment answer. Merging the prose list brings it into line with both grading instruments and leaves the question count at four.

**Band descriptions changed, not just the label.** The old bands were entirely about self-expression, so a grader would have accepted "I left some comments." The discriminator is now whether the reviewee changed something: Exceeds names the specific thing said and what moved, Meets names something real but cannot say what changed, Does Not Meet has nothing or feedback that named no line and requested no change. That is `sprint-notes.mdx`'s existing standard for what counts as a review, reused rather than reinvented.

Files: `src/content/docs/assignments/defense.mdx`, `public/defense-scoresheet.md`, `canvas/assignments/defense/defense-rubric-details.tsv` (**needs re-importing into Canvas**), `canvas/assignments/assignment-readme.md`, and a calibration line in `STAFF-RUNBOOK.md`, since a new half of a criterion with a known grader failure mode is exactly what the calibration hour is for. The anti-cueing bullet gained a clause noting the reviewer-side question needs no per-student variation: each student reviewed different work, so it is cueing-resistant by construction.

Outcome tags are unchanged, and `validate-outcomes.mjs` still reports SO3: 10.

## Remaining Open Items (honest list)

1. ~~SO4 evidence concentration in the RFC.~~ **Resolved 2026-08-17**: the defense ownership-and-delegation criterion is now tagged `SO2, SO4`, giving three non-RFC individual SO4 points per year (SO4 total 5 to 8).
2. R scripts: team-size cap at 6 including self; Q7 individual-concern extraction stubbed. Fix or supersede with the instructor-tools page.
3. Lecture deck series (spec-writing for agents, AI-diff review, testing workshop) exists as a plan in STAFF-RUNBOOK.md, not as decks. `decks/Fall.md` week 1 deck is done.
4. The instructor-tools client-side page (README todo) is unbuilt; the runbook documents the manual pipeline until then.
5. ~~Week numbers assume the standard term calendar; verify against the actual academic calendar before publishing (#49, and a term-setup checkbox since #47).~~ **Verified 2026-09-13 against the registrar's calendar** (#49), recorded as weeks only per hard rule 5. Fall starts midweek and has eleven instructional weeks counted 0 to 10; **Thanksgiving takes the Thursday and Friday of week 9, and week 10 is a full week**. Veterans Day is the Wednesday of week 7. Winter: MLK Day is the Monday of week 3. Spring: Memorial Day is the Monday of week 10, and Commencement is the Saturday after week 10. Consequence for #25: the three-day week is week 9 (Term Retrospective), not week 10 (Sprint Note 4, Repo Checkpoint 2, demo day); #25's premise inverts and stays the instructor's call. Expo is confirmed as spring week 10 (instructor, 2026-08-19); the spring defense window is weeks 7 to 9 like every term (#31).
6. Examples library (good/bad examples per assignment) still to be collected from past projects.
7. ~~Canvas rubric TSVs drifting from the handbook.~~ **Resolved**: `validate-outcomes.mjs` now reconciles every TSV against the handbook rubric table it mirrors. It found five out of sync, not the one visible by inspection: `team-charter`, `project-retrospective`, `project-handoff`, and `project-landing-page` still carried pre-rewrite criteria and point splits, and `sprint-note` claimed outcome tags the handbook does not. All regenerated; **all five need re-importing into Canvas**.
8. ~~Defense format is an open instructor decision.~~ **Resolved 2026-08-17**: team session retained, with a mandatory anti-cueing protocol (order drawn at random in the room, a different artifact and a different "what breaks if X" per student) and a documented right to an individual follow-up on borderline scores. Session length changed from a flat 40 minutes to **6 minutes per student plus ~10 minutes of buffer**, which scales with team size instead of squeezing large teams. Because the average team is 3.5 students, sessions now roughly match the 30-minute check-in they replace: the marginal cost fell from +2.3 h to **+0.3 h per TA per term**, and the ledger row went from ~4 h to ~2 h.

   The reasoning, recorded because it will be asked again: individual slots use less total contact time (6.5 h vs 9.3 h per TA) but roughly triple the *marginal* cost, because a team session replaces a check-in and individual slots replace nothing. They also give up the peer-presence deterrent, which is the strongest thing the defense has going for it: claiming work you did not do is much harder in front of the people who did it.
9. ~~`npx biome check` fails at config resolution.~~ **Resolved 2026-09-11** (#46): ultracite 7 exports its preset at `ultracite/biome/core`; `npm run check` runs in CI and pre-commit on the code directories.
10. ~~`career.mdx` review pass.~~ **Resolved**: all 16 activities brought to the standard format, all six external links verified live, market framing kept statistic-free so it ages slowly, and a dated review marker added. Personal Branding and Mock Interviews promoted onto the career assignment, taking it from 3 promoted to 5.

## 15. Review Fixes and Unrecorded Work (September 2026)

Six commits after section 14 went unrecorded here, and the branch review (#21, 2026-09-10) found the governing documents disagreeing with each other as a result. This section records them, the creep the review found, and the review's agent-ready fixes.

**Unrecorded before the review:**

- `AssignmentMeta.astro` proposed on one page (`6928c30`) and rolled out to all 14 assignment pages (`71598d6`); the freehand bold "Grading" sentence it replaced is now banned by the assignments skill.
- The `cs46x-guides` and `cs46x-assignments` skills (`bb0ee29`), carrying the writing voice alongside `cs46x-activities`.
- Acknowledgements rewritten to credit the sources behind the course design (`bbee7e0`); a fact-check pass of guides and activities against primary sources (`fa099b8`); the conflict epigraph credited to Jeanne Larson (`61f602d`).
- The Canvas import package spec (`c22efc2`) and its §4 resolution that the assignment body is the full handbook page from the local build (`e9ee4a0`). Unbuilt; #5.
- Creep the review named: seven `.docx` templates deleted in favour of Markdown; `.vscode/` removed (`0cfb270`); `team-metadata.yml` and the pandoc-to-PDF flow on the assignments overview; `guides/conflict.mdx` extracted from `activities/conflict.mdx` as a new guide.

**Review fixes landed 2026-09-11, one commit per issue** (#9, #12, #13, #14, #16, #20, #33, #34, #35, #37, #38, #40, #41, #43, #45, #46, #47, #48):

- Founders pass (#8 children): the pitch-competition path to the New Product ladder's 100 rung is gone; the Handoff names the students as a possible successor with a guard that the spring rung is scored on what shipped by week 10; "patent it" is replaced and the IP answer sits beside the IP section; the Iterate activity's output is user contact, not a pitch; the entrepreneurship TODO is deleted and the New Product category is framed around real users and retention.
- Coherence: Term Retrospective is week 9 everywhere (deck, Canvas readme); role names are Project Manager (PM), AI Coordinator, Quality Owner on the charter, the defense, the scoresheet and the working-agreement guide; the workshop page no longer contradicts its own week table and says eight, not six; ten rehearsals, the Trailer criterion, the 4Ls template, the Expo-to-defense link, and the fall weeks 1 to 2 explanation.
- Standards: every assignment page with a deliverable carries an AI-use paragraph; no page restates grading; three criteria are observable checks (two TSVs regenerated, listed for re-import); the git-hygiene explanation moved to the git guide; the activity library's hard style violations are fixed and "The Parent Test" is "The Mom Test"; the Shipping and Generative AI guides have Best Practices and Industry and Academia sections; tool tables carry dated review markers.
- Canvas layer: the career TSV says "NDA teams"; the readme describes what the directory actually holds and lists the TSVs to re-import.
- Toolchain: Biome runs (`npm run check`) in CI and pre-commit; the TSV glob triggers the mirror check; `validate-outcomes.mjs` checks AssignmentMeta weight text, the AI-use paragraph, and rubric totals (Sprint Notes is a documented exception, deciding #29); `validate-activities.mjs` checks badge variants and placement, the closing line, outcome tags and grading language on activities and guides, and the "more than a hundred" library figure; `validate-dashes.mjs` is new and fails on any em dash under the content directories. Every check was proven to fail on the pre-fix tree.
- Governing documents resynced (this section, the spec status lines, the plan's checkboxes and deferrals, the tiering plan's activity name, the two specs' wording on deprecated Canvas directories, README's R-script line, IDEAS' zero-point claim).

**IDEAS proposals adjudicated** (one line each; the IDEAS entries carry the same marker):

- LLM PR reviewer as formative infrastructure (IDEAS 3.5): **defer**. Pilot with volunteer teams once the instructor-tools page exists; cost and access are unresolved.
- Term-config object replacing the per-term R scripts (IDEAS 4.1): **defer to #6**, the instructor tools page.
- Scheduled `linkinator` against production and a secret/PII scanner in CI (IDEAS 4.3): **defer**. The `data/` guard covers the PII path; external-link checking is the open half.
- MILP bids solver parameterization and mojibake (IDEAS 4.1): **defer** to before the fall 2027 bids run; the fall 2026 run has happened.
- Term facts as a data file (IDEAS 4.3): **wontfix**. Superseded by one canonical page per fact plus validators that reconcile the restatements.

**Found while fixing, still open:** the fall Term Retrospective has no Canvas TSV directory at all (`retrospective/` is the deprecated old form), so its rewritten Writing criterion is not mirrored; the readme records it. Decision issues #22 to #31 and #39 (survey dates) remain the instructor's, except that #29 was decided by #40 and #48 (Sprint Notes is a documented rubric exception and its meta states the term totals); #32 (syllabi), #36, #42 and #44 are agent-ready and untouched here, except that #48 replaced the nine `&mdash;` entities in the syllabi so the new check could land green.

## 16. The p0 Batch (September 2026)

Every open `p0-now` issue under #21, landed 2026-09-13, one commit per issue, in dependency order. All thirteen were closed on GitHub on 2026-09-14 with a comment naming the commit and any deviation.

**Decided by the instructor 2026-09-11, implemented here:**

- **#22** grade scale: the three syllabi mirror the 11-band handbook scale (A 93) row for row. The Canvas grading standard must be rebuilt by hand; the term-setup template carries the step.
- **#24** spring cadence: three two-week sprints, notes at weeks 2, 4, 6, 6% (Release 8 to 7, Handoff 6 to 5). Weeks 7 to 10 carry no note, and the overview says why.
- **#26** winter cadence: a fifth note at week 10, 10% (Definition of Shipped 4 to 3, Incident Postmortem 4 to 3). The year is fall 4, winter 5, spring 3. The postmortem's corrective action is verifiable at the week-10 checkpoint or sprint note; `incident-postmortem/` needs re-importing. Deviation from the issue text: the runbook's per-note grading row moves to ~6 h in winter and ~3.5 h in spring, because it is priced per note; the check-in row is unchanged.
- **#29** Sprint Notes has a two-band `| Item | Pass (20) | Fail (0) |` rubric table, band text lifted verbatim from the TSV. `validate-outcomes.mjs` totals a `Pass (N)` table like any other, so Sprint Notes left `RUBRIC_EXCEPTIONS`; negative-tested.
- **#31** no Expo Q&A substitution anywhere; the spring defense window is weeks 7 to 9 like every term.
- **#30** `canvas/assignments/` holds only the rubric TSVs: 40 tracked files removed (18 HTML bodies, 17 Markdown rubrics, 5 retired TSVs). `individual-contribution/` keeps one Full / Half / Zero TSV per term (4 x 25, 5 x 20, 34 / 33 / 33); its grader logic moved into the runbook. `CANVAS_DEPRECATED` is `_template` only.

**Agent-ready fixes:**

- **#32** syllabi: Winter 2027 and Spring 2027 labels; the late-policy block is a two-sentence summary linking the handbook. All three bodies need re-pasting.
- **#36** the spring charter refresh closes the Team Health Assessment workshop item; both pages say so.
- **#17** the Expo page is the end-of-spring event: no alternatives section, no infomercial, no mandatory-or-not language; the booth section and the presentations guide lead with the running demo. The BACKLOG Expo item is resolved.
- **#42** four oversized activities lost their explanation to guides: the architecture catalog into `guides/technical-design.mdx`, and the prioritization methods, brainstorming techniques and metric frameworks into a new `guides/planning.mdx`. Activities are 215, 198, 151 and 515 words; the last keeps its four per-category instrument sections.
- **#44** content skills: "three to six" criteria, "rubric point values", and heading case plus step-bullet style stated as targets for new activities only. Left out pending #28: the guides skill's derivation sentence.
- **#11** recent founders wanted in the mentor pool, alumni founders in the speaker mix, one clause on the homepage.
- **#49** week numbers verified against the registrar; open item 5 above holds the answer.

**Conflict resolved in favour of the later instruction.** #31 (2026-09-11, "lgtm on both") made the Expo mandatory through a zero-weight Canvas completion item stated on `expo.mdx`. #17's instruction (2026-09-14) says to present the Expo as an event with no mention of mandatory or not. The page follows #17; the Canvas completion item is therefore not written anywhere and waits on the instructor.

## 17. The Week-by-Week Schedule (September 2026)

`introduction/series.mdx` (#55, 2026-09-14) replaced its three prose course sections with a schedule: one table per term, fall week 0 through week 10, columns for the Friday lecture, what is due, what to read and what to do. Weeks only, no dates and no academic year: the registrar dates stay in open item 5 and the term-setup checklist, and the page holds nothing that goes stale in September. Fall has a week 0 because the term starts midweek. The Read and Do columns run one sprint ahead of the assignment they prepare and draw only on each assignment page's own recommendations; the tables are kept minimal, one or two links per cell.

Decisions recorded on #55, each vetoable alone: of the runbook's four unbuilt priority workshops, two are placed (testing as the safety net at fall week 4, the calendar exercise at winter week 1) and two are not (specs for agents, reviewing AI diffs), and the runbook's Lecture Plan says so; every other Friday reads "Announced in Canvas"; check-in weeks are not placed per row while #23 is open; survey rows say only "midterm surveys" and "final surveys", with exact dates on #39; spring week 10 lists both the Expo and demo day 2 without resolving whether one replaces the other; due weeks are duplicated by design, downstream of the assignment tables. `for-students.mdx` links the schedule from its lectures section, the term-setup template gains a fall-only confirmation checkbox, and `AGENTS.md` lists the page as the canonical home for lecture slots.

`validate-activities.mjs` rule 6 (#56) reconciles the schedule's activity links: every one must resolve and carry a Workshop or Recommended badge, so the schedule never sends a student to an activity no assignment page still recommends, and every Workshop activity must appear on the schedule. Pre-commit runs the validator on the series page too.

Two more p0 issues the instructor answered the same day. **#27**: the assignments skill now says three to six criteria is the working range and more is allowed when each criterion is a separable observable check and the grading cost is accepted; the RFC (nine) and Charter (seven) rubrics stay as they are. **#39**: survey timing is stated once on each survey page's AssignmentMeta, and matched on the partner page, the runbook, the Canvas readme and the schedule: midterm sent week 5 and closed at the end of week 6, final sent week 9 and closed at the end of week 10, peer and partner alike.

#25 was rewritten the same day around the corrected calendar: the three-day week is week 9 (Term Retrospective). The instructor kept it in week 9, so the page now states the due day (Wednesday before Thanksgiving) and why, and TAs book no defenses on the Thursday or Friday of fall week 9; the Canvas due date is the instructor's in the #50 pass. The student-perspective review of the 17 guides that #28 asked for before its decision is a comment on that issue.

## 18. The Guides Pass (September 2026)

#28 asked which guide sections are required for every guide and which only for guides about a producible artifact. The instructor took the review's recommendation on 2026-09-14. `cs46x-guides/SKILL.md` now splits guides into **artifact guides** (`adr`, `requirements`, `technical-design`, `working-agreement`: they show a document the team keeps in the repository) and **practice guides** (everything else, `documentation` included). Best Practices, Some Truths and Industry and Academia are required everywhere; What is X, Addressing a Problem, What Makes a Good X with the artifact in a fenced block, Validation and Measuring Success are required for artifact guides and kept on practice guides only where they say something (`conflict.mdx` keeps its two). "Let's be honest." became a content rule, the derivation sentence names what the exemplars actually contain, and three cross-guide topics got a single owner (performance conversations in `conflict`, AI norms split by concern, CI and branch protection in `devops` and `git-and-github`).

The review's change list landed in the same pass: `requirements.mdx` rewritten around a `docs/requirements.md` example, three kinds of requirement instead of six, and a Story Mapping section behind the fall workshop; `technical-design.mdx` gained a `docs/design.md` example (its Design Document section is now What Makes a Good Design Document?), a Measuring Success section, and a UML list cut to the four diagrams a team draws; `working-agreement.mdx` gained a `docs/charter.md` example, Validation and Measuring Success, a Tuckman pointer to the fall workshop, and lost its duplicate of the performance conversation, which now links `conflict.mdx`; `generative-ai.mdx` was reordered so judgment (Using AI Effectively) and setup precede the tool catalog, and gained an `AGENTS.md` example and the confidentiality one-pager the charter asks for; `testing-strategy.mdx` gained Testing as the Safety Net, the section the fall workshop reads, and dropped its duplicate CI workflow in favour of the DevOps guide; `devops.mdx` links the git guide for branch-protection settings and carries the reviewed-annually note; `conflict.mdx` names the Team Dysfunctions workshop. Stale bits fixed: "sprint report" twice in `sprint.mdx`, the "Is is" typo, the TODO comment in `adr.mdx`. Every artifact guide passes the corrected required list with one exception the skill names: `technical-design.mdx` has no Addressing a Problem section, because its opening failure list and What Is Technical Design? already carry the why.

## 19. Terms and Weeks Only (September 2026)

Instructor rule (#57): the handbook refers only to terms and weeks, with weekdays and named holidays allowed, and carries no calendar date and no academic year anywhere. The handbook is reused every year; a date is a fact that rots on a schedule. It is hard rule 5 in `AGENTS.md`, a line in each of the three content skills, and `scripts/validate-dates.mjs` (CI and pre-commit), which flags a term with a year, a month with a year, a month with a day, an ISO date, and an academic-year range under `src/`, `canvas/`, `public/`, `decks/` and in `STAFF-RUNBOOK.md`. It allows bare years, URLs, inline code spans (file names), citation access lines, and the showcase page's project years; the changelogs and skills keep their decision timestamps. It found 23 lines on the pre-fix tree, twelve of them missed by the grep that preceded it: the three syllabus Term cells (the #32 labels, now "Fall", "Winter", "Spring"), the runbook's opening line, the "Last reviewed September 2026" stamps on five guides (now "Reviewed each August"), two product-history months in the generative AI guide, the partner submission deadline (now "before the end of August", matching the student page), a dated reference in the ADR example, and open item 5 above, which now records the registrar check as weeks and holidays.



## 20. Check-ins in the Sprint-Note Week (September 2026)

#23 asked how bi-weekly check-ins line up with uniform sprint-note weeks; half of every cohort was meeting a week off the sprint boundary. The instructor decided, after a grilling pass: every check-in falls in the sprint-note week, Monday to Thursday, with the note due Friday (the only order that fits winter week 2 without a one-week sprint); note-less weeks keep a check-in (fall 2, spring 8 and 10), so every term has five check-in weeks and the ledger's 35 h holds; the defense moves out of the check-ins into a session of its own in week 7 or 9, the now-empty weeks, at about 7 h more per TA per term (ledger totals 69 / 70 / 64), because replacing the week-8 check-in would have turned every team's sprint-3 demo into a video; checkpoint 2 is graded in finals week so week 10 stays at check-in load; NDA walkthroughs take the team's nearest check-in, case by case, with no further specifics.

The same pass added the TA scaffolding the instructor asked for, after cohorts where TAs did not notice students doing no work (the same broken page shown at every check-in, "still working on it") and graded notes unevenly. The runbook gained **Check-in Format**: a five-minute prep list, a timed agenda, a probe bank reusing the defense's question shapes, challenge moves for teams that are fine, a tells list, what to do (an evidence note into the modifier process, never a deduction of its own), and a one-line-per-student record in the cohort sheet; and **Sprint Note Checks**, the five clicks behind the pass/fail. The load-bearing rule is student-visible on the assignments overview and the sprint-note page: **the TA picks what each student demos, from that student's previous contribution line**, and the same artifact at two check-ins running is nothing new. Work that is not code (research, user research, requirements, RFC sections) is stated as valid on the sprint-note page, the template and the runbook, on one condition: it landed in the repository as a written PR someone can open. The Contribution lines rubric item now says graders open one owned PR per student and fails on one that does not open, did not land this sprint, or is mechanical, with no explanation; the three sprint-note TSVs mirror it and need re-importing.

## Build Status

Verified 2026-09-13, all gates green (section 16 landed).

`npm run build` passes: `astro check` reports **0 errors**, warnings only (the pre-existing `z` deprecation in `content.config.ts`). 66 pages built. Internal link validation is running: `starlightLinksValidator()` reports "All internal links are valid," and CI gates on it because CI runs `npm run build`.

`node scripts/validate-outcomes.mjs` passes with rubric tables as source of truth: SO1: 7, SO2: 6, SO3: 10, SO4: 8, SO5: 9, SO6: 5, L07-L10 at 2 each, zero frontmatter drift. All three Team Deliverables tables sum to exactly 25%, every page's `assignment.weight` reconciles with the row that links it, every AssignmentMeta states its declared percentages, every deliverable page carries an AI-use paragraph, and every rubric totals 100 or is a documented exception (Sprint Notes now totals via its Pass (20) table).

`node scripts/validate-activities.mjs` passes: 8 Workshop, 53 Recommended, 57 Library, 118 total, every linked activity tiered, every Recommended badge earned, every badge line well-formed, every deliverable line closing its section, no outcome tags or grading language on activity or guide pages, and the library figure true.

`node scripts/validate-dashes.mjs` passes: no em dashes in 114 text files under `src/`, `canvas/`, `public/`, `decks/` (37 fewer after #30).

`npm run check` (Biome via Ultracite core) passes on 22 code files.

`node scripts/validate-downloads.mjs` passes: 14 downloads in `public/`, every one linked from a handbook page.

The TSVs that **need re-importing into Canvas** are listed in `canvas/assignments/assignment-readme.md` (defense from section 14; project-retrospective, project-landing-page and career-retrospective from section 15).

Each of the four scripts, and every check added in section 15, has been negative-tested by injecting the drift it exists to catch and confirming a non-zero exit.
