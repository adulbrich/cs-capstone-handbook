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

(Completed by the canvas workstream; see its section below when finalized.) Rubric TSVs in the browser-extension import format for the new assignments; an individual-contribution assignment page documenting the deduction logic; `assignment-readme.md` rewritten to the new schedule with a deprecation table; syllabi updated with the explicit grade split; a CS 461 syllabus created.

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

(Persona review results recorded here after the review passes.)

## Build Status

`pnpm run build` passes: astro check clean, 66 pages, internal links validated at build time. `node scripts/validate-outcomes.mjs` passes.
