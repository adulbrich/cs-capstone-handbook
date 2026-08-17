# IDEAS: Full Assessment and Redesign Proposals for the CS Capstone

Written 2026-07-03, revised same day with instructor corrections. A complete review of this repository (handbook site, Canvas assignment sources, syllabi, R scripts, templates) plus external research on what other programs do, with concrete proposals for the upcoming course revision.

## Context this document is written against

- Three terms of 10 weeks: CS 461 (3 cr), CS 462 (3 cr), CS 463 (2 cr). Per-student effort budget is roughly 90 + 90 + 60 hours, about 240 hours across the year. Every comparison with other programs must be scaled to this.
- **~300 students, 2 instructors, at most 6 TAs** (correction 2026-07: earlier drafts assumed 10-12 TAs; all staffing math now assumes 6, which forces bi-weekly rather than weekly cohort check-ins at ~14 teams per TA; see STAFF-RUNBOOK.md for the per-TA hours ledger). TAs run the cohort check-ins. Teams aim for 3-4 students but range from 2 to 4+. That is roughly 80-100 teams. Nothing in this document is allowed to assume boutique-program staffing.
- Students must be assessed individually on ABET outcomes with minimal overhead for them and for staff.
- Project partner evaluation and peer review stay. Everything else is open.
- Students should deliver on an **outcome**, end to end: coding, prototyping, getting results, testing with real people and real data. Judgment over document production.
- AI-era premise (instructor's directive): with LLMs, standalone requirements/PRD and technical design documents as submitted deliverables can largely go away. These live in the repository as continuously updated docs, which is now standard practice, and the repo is graded, not a PDF export of it.
- **NDA constraint:** some industry projects operate under NDAs and teaching staff may not have repo access. Every repo-based assessment mechanism needs an NDA-safe fallback; individual evidence channels that survive NDAs (live defense, demos, exported evidence) carry more weight in the design than they otherwise would.
- ABET evidence rule: **at least two data points per student per outcome** (two rubric items or two assignments both count). Some data points come from other courses (SO4 is partly covered by the ethics course). See the map in 3.8.

## Parked for later (deliberately out of scope for this revision)

- **WIC.** An official revision of the WIC requirements is coming. The current gap (the draft-feedback-revision cycle on 2000 polished words is asserted in the CS 462 syllabus but not operationalized in any assignment) is real and documented in section 1.2, but design work should wait for the new requirements. Note: the RFC mechanism proposed in Part 3 would likely satisfy most plausible versions of a revised WIC at zero added cost, so nothing proposed here paints us into a corner.
- **CATME every term.** CATME proper is currently used once, at the end of spring; the per-term instrument is the simpler four-criteria survey because full CATME is painful to run in Qualtrics. Desired but blocked on tooling. The instructor-tools work in Part 4 is the natural unblock (generate the CATME item matrix per team programmatically, or move peer eval off Qualtrics entirely), so it is parked, not dropped.

---

## Part 1: Assessment of What Exists

### 1.1 What works well

**The Guides section is the strongest asset in the repo.** The sprint, technical design, working agreement, testing strategy, security, git-and-github, and generative-ai guides are opinionated, concrete, and current. They recommend real defaults (GitHub Flow, squash merge, testing pyramid, STRIDE, managed auth), and the recurring "Some Truths About X" and "In Industry and Academia" sections give them a credible professional voice. They read like an engineering handbook, not a syllabus. This is the foundation to build on.

**AI is threaded through, not bolted on.** `guides/generative-ai.mdx` covers agentic tools, project-level instructions (CLAUDE.md, copilot-instructions), MCP servers, and skills. `technical-design.mdx` has a genuinely good argument that design docs are the coordination layer when N people run N AI contexts. Very few capstone courses are at this level in 2026. The repo-centric redesign in Part 3 is a natural continuation of this argument, not a reversal.

**The evaluation architecture has real design in it:**

- The partner-evaluation facet weights migrate sensibly across the year (Requirements 40% in fall, Design/Implementation 40% in winter, Verification and Validation 40% in spring). That is a coherent narrative arc encoded in grading.
- The category-specific V&V ladders in `project-partner-evaluation.mdx` ("Patch is vaporware" = 50, "System is in production and public-facing" = 100) are the single best idea in the evaluation section: outcome-based, category-appropriate, memorable.
- The peer evaluation formula is fully specified, with a documented conversion and multiplier. Transparent and reproducible.
- Individual accountability on progress reports exists operationally: a parallel Canvas assignment worth half the progress-report points, defaulting to full credit, from which graders deduct for non-contribution. (This lives only in Canvas, not in this repo, which is why it looks missing from the outside; see 1.2.)

**The newer rubrics are evidence-anchored.** The winter and spring rubrics demand verifiable things ("commit hash for code," "at least five project-specific risks," "8-12 minutes"). Hard to fake, gradeable. The 3-band structure with TSV import files (via the Canvas rubric browser extension, with `_template/` as the required import format) is a working pipeline worth keeping.

**The candid failure-mode content is unusual and valuable.** `working-agreement.mdx` "When Things Go Wrong" and `activities/conflict.mdx` "Performance Conversations" name the real dominant failure (a teammate quietly stops delivering) and give scripts and an escalation timeline. Keep and feature this.

**Data hygiene is currently safe.** `data/` (rosters, grades, PII) is gitignored, never committed in 185 commits of history. Good, though see 1.5 for fragility.

### 1.2 Individual evidence: real but deduction-shaped and undocumented

With the corrections in hand, the individual-accountability picture is better than the repo suggests, but it still has a structural weakness for ABET purposes:

- The individual half of the progress-report grade is a **deduction-only** channel: everyone gets full points unless a grader notices non-contribution. It punishes free-riding when detected; it does not generate positive evidence that a specific student attained outcomes 1, 2, or 6. Detection depends on graders reading work logs across ~90 teams.
- The routine positive individual artifacts are few: Memo, Research Brief, ADR + Code Review, Retrospective and Career, roughly four per year, some of them one page.
- The corroboration-review design in `project-partner-evaluation.mdx` is good but discretionary, and the partner-survey hook that would feed it (the Q7 individual-concern extraction) is a dead stub in every survey script.
- **Nothing maps to outcomes.** No assignment or rubric criterion is tagged with any learning outcome ID. `LEARNING_OUTCOMES.json` defines L01-L10, the syllabi list them, and no artifact traces to them. This is the actual accreditation exposure: not that individual evidence is absent, but that nobody could point to where each outcome is evidenced without reconstructing it by hand.
- Reassuring research finding: ABET assesses the program, not each student, and ABET's own guidance explicitly blesses representative sampling of student work. You need fair individual grading plus per-student artifacts available to sample, not per-student-per-outcome scoring. The fix is lighter than it feels.

Also documented here for later (parked): the WIC draft-feedback-revision cycle is asserted in the CS 462 syllabus and operationalized nowhere; revisit when the official WIC revision lands.

### 1.3 The repo does not reflect the course (documentation drift)

Several things I initially flagged as missing or contradictory are actually "exists in Canvas or in practice, absent or stale here." That is its own finding: **the repo currently cannot serve as the source of truth the handbook wants to be.**

| Drift | Reality | What the repo/handbook says |
|---|---|---|
| Individual deduction assignment | Exists in Canvas, half the progress-report points | Referenced in `progress-report-assignment.html`, no file, handbook silent |
| Assignment set | Lives in Canvas; only some copied to `canvas/` | `canvas/` has 14 of them, four without TSVs; handbook index omits two that exist |
| Peer instrument | Four-criteria survey per term, CATME once in spring | `breakdown.mdx` lists the five CATME dimensions as the per-term facets |
| Team size | Aim 3-4, real range 2 to 4+ | "3-4" (`series.mdx`), "3-6" (`showcase.mdx`), formula calibrated to 5 (`peer-evaluations.mdx`) |
| Grade split | 25/25/50 across all terms | Only in `breakdown.mdx`; neither syllabus states it |

Remaining genuine confusions to fix in the rewrite:

- Two divergent assignment taxonomies (`for-partners.mdx` "Major Assignments" vs `project-evaluation/assignments.mdx`): Design Document vs Technical Design, Code Releases vs Spring Release, etc.
- Midterm partner eval described as "0-5%" while the facet table implies a different composition of the 25%; the arithmetic is never reconciled.
- Letter conversion has five B rungs but no C+/C- and a 10-point C-to-D cliff (`conversion.mdx`).
- "Does Not Meet" rubric band spans "barely there" to "almost nothing"; a true zero/missing state is never codified (already on the README todo).
- The Setup assignment is internally a Sprint 1 progress report (filename, copy-pasted red-box text).
- Activities read as graded assignment specs ("Submit the original resume...") while claiming to be an optional menu.
- Peer-eval mechanics should state the intended team-size range explicitly and be robust across it (n=2 teams interact oddly with the self-rating rule and the 100-point split; the scripts hard-cap at 6 including self).

The direction is already decided (instructor): **everything moves into the handbook, likely as an "Assignments" sidebar group**, and Canvas becomes an import target. Part 4 designs that.

### 1.4 Staleness, rot, and polish debt

- The two most modern-practice guides, `devops.mdx` (380 lines, the best deployment content in the repo) and `documentation.mdx`, are `draft: true` and invisible to students. `testing-strategy.mdx:230` links to the hidden documentation guide, a broken link in production.
- `project-evaluation/rubrics.mdx` is a 6-line `draft: true` stub titled "TBD". `status.mdx.bak` sits orphaned in the content tree. Several pages still have `description: TBD`.
- 8 of 9 templates in `public/` (charter, progress report, walking skeleton, mom test cheat sheet, etc.) are linked from no page in the handbook. They are good; they are just unreachable except from Canvas.
- Large commented-out backlogs sit inside published pages (the full CATME rubric in `peer-evaluations.mdx:24-114`, about eight planned activities in `communication.mdx`, more in `creative.mdx`, plus TODOs in `adr.mdx`, `expo.mdx`, `index.mdx`). Move to issues.
- Term-specific strings that rot annually: `expo.mdx` "under revision for 2025-2026" (already stale), "published in September", "Fourteen reports over the academic year", a progress-report template hardcoded to CS461.
- `decks/Fall.md` is a 19-line stub cut off mid-table. Lecture material effectively does not live in this repo, which matters because the README todo list wants more valuable lecture content.
- Numerous typos ("evaluatuated", "The rmemo", "Quality Checlist", "colletected", "evluations"), and empty alt text on most images in a handbook that teaches accessibility.
- Referenced in the schedule readme but without files: Stakeholder Presentation, Walking Skeleton (both flagged "to be updated/removed" there).

### 1.5 Operational overhead (the instructor tax, at 300 students)

The ops layer works, but it is a hand-run, copy-paste-per-term pipeline, and at ~300 students every manual step is multiplied:

- **Five to six near-duplicate project-partner survey scripts** (`project-partner-survey-{f2024,f2025,s2025,s2026,w2026}.R` plus the newer unified one). The bids script is rewritten wholesale each term. Every filename is a hardcoded dated path ("!!! change filenames below !!!"), Canvas assignment IDs are pasted in per term, and midterm/final and course selection are toggled by commenting lines out.
- **Real bugs found in the scoring pipeline:**
  - The peer-evaluation penalty ("Correction", up to -24) is computed and emailed to students, but the gradebook merge uses the **uncorrected** score (the corrected line is commented out). Students are told about penalties that are never posted.
  - `project-partner-survey-s2026.R` maps one Requirements answer to 3 points where every other script uses 3.5.
  - Team members are matched by string-comparing emails across "Team Member 1..6" columns; **teams larger than 6 including self silently break or drop data**, and 4+ teams do occur.
  - `Q7 == 1` individual-concern handling is a dead stub in every partner-survey variant: the one hook that would surface per-student partner concerns is unfinished.
  - A mojibake project name (`LLM-DRIVEN MIGRATION OF LEGACY�`) in a tracked script.
- **The email step is the worst of it:** an Excel CONCAT formula builds bodies, then `send-emails-macos.vba` sends via Outlook with a loop hardcoded to `For i = 2 To 2`, one row at a time. At 300 students this is untenable.
- **No CI at all.** No GitHub Actions, lefthook installed but fully commented out. The README wants automated link checking; it does not exist.
- **Data-leak protection is one line deep.** Everything rests on the single `data/` line in `.gitignore`. It has held, but a pre-commit guard (lefthook is already installed) would make it structural.

### 1.6 Grading-load hotspots (the binding constraint)

Two instructors plus TAs, ~90 teams, ~300 students. Current load centers:

- **Progress reports: ~14 per team per year, each against a 15-criterion rubric, times ~90 teams.** That is on the order of 1,200 rubric gradings a year, plus the parallel individual-deduction assignment to police. This is the dominant line item and it produces mostly team-level evidence.
- Retro-flavored deliverables appear four times (fall retro, winter retro with the identical rubric, spring project retro, spring individual retro-and-career).
- Risk registers are maintained in three living documents (charter, requirements, technical design) with partition rules students will not internalize.
- The writing-quality criteria triplet is copy-pasted across about seven rubrics, including a leak: the Team Charter rubric grades "requirements and acceptance criteria use consistent formatting", which the charter does not contain.

Any redesign must reduce this, not add to it. Every proposal in Part 3 is costed against it.

---

## Part 2: What Other Programs Do (research synthesis, read through the OSU scale lens)

Full citations in Part 5. The scale lens matters everywhere here: OSU runs ~300 students / ~90 teams / 2 instructors on 10-week quarters with a 240-hour annual per-student budget. Harvey Mudd Clinic and Olin SCOPE run a handful of teams with $50-60k sponsor fees and per-team faculty advisors. Their mechanisms transfer; their staffing does not.

**The strong programs share five traits:** (a) year-long duration with a formal midpoint review, (b) a named liaison and a fixed weekly touchpoint, (c) a public terminal event that externalizes quality pressure (Harvey Mudd Projects Day, MSU Design Day, Olin SCOPE Summit, WPI/Waterloo symposia), (d) explicit student roles (Harvey Mudd's formal student Project Manager; Olin runs role-based workshops), and (e) deliverable flexibility bounded by process discipline (Rose-Hulman lets teams choose product-track or investigation-track; Mudd accepts a feasibility study as a legitimate outcome). OSU already has (a) and (b); (c) exists as the Expo; (d) and (e) are cheap to add and scale-free.

**The scale-relevant models:**

- **MSU CSE Capstone / Design Day** is the closest structural cousin: high enrollment, one coordinating instructor for decades, low sponsor fee ($3k), corporate clients, and a large judged public expo with awards. Their well-documented weekly logistics and all-team-meeting format are directly reusable at OSU's size. The judged-awards mechanism is free quality pressure.
- **Georgia Tech Junior Design** runs at large scale and is the precedent for double-counting project deliverables for communication credit (parked with WIC, but the structure survives any WIC revision).
- **ANU ENGN4300** is the best worked example of individual-in-team grading at scale: group project audits carry the weight, modulated by a peer-rated contribution multiplier and an individual "project review" where each student critiques audit criteria for their own team and a **shadow team**. The shadow-team review is a clever dual-purpose device: individual analytical writing plus free cross-team peer review, no extra staff time.
- **Berkeley CS169L** (Armando Fox's ESaaS) handles large cohorts with client projects for nonprofits, heavy process automation, and TA-run iteration ceremonies. The automation-first attitude is the transferable part.

**The boutique models (steal mechanisms, not structure):** Harvey Mudd's formal student PM role and thrice-yearly community presentations; Olin's weekly liaison call and bi-weekly sprint reviews; Stanford CS210's deliberately loosely-defined corporate challenges (ambiguity as the point, students must define the product); Cornell Tech's studio critique cadence (regular "Maker Day" crits by rotating external practitioners); CMU 17-356's launch-under-startup-constraints framing; Rose-Hulman's two-track choice (build a product with defensible process, or investigate a problem with a documented research approach) on a quarter system very like OSU's.

**The AI-era consensus (2024-2026) is converging fast, and it aligns with the instructor's directive 9:**

- Allow AI, require disclosure plus verification evidence; bans are gone from serious programs. Clients in the best empirical study (Hannover, n=178 across 15 client projects) overwhelmingly wanted AI use encouraged, but worried students would lose independent comprehension in client meetings. That worry is precisely the case for live demos and defenses.
- The assessed skill moves from code authorship to **intent specification, orchestration, and verification** ("The Rise of AI-Native Software Engineering", 48-paper review). Assessment should "privilege process, specification, evaluation, and defense of work over artifact production alone." This is the research backing for grading the repo and the live demo rather than submitted documents.
- **Oral assessment is back and it scales in groups**: the "Conversational Exam" ran 58 students through group sessions of 5-6 (students live-code and explain; AI open for explaining, closed for generating) in 10 sessions over two days with a staff of three. Extrapolated to 300 students: ~50-55 sessions, ~27 staff-hours per round, entirely TA-distributable if run inside existing cohort check-ins. Feasible once per term; not more.
- A cheaper variant: short AI-free quizzes about **your own team's submission** (why is this designed this way, what breaks if X). Early data shows near-zero correlation between AI use and quiz performance, meaning it measures understanding, not typing. Near-zero marginal cost at any enrollment.
- Melbourne runs an **LLM code reviewer as a GitHub Action** giving rubric-aligned PR feedback (never fixing code) across ~100 capstone students per year; students developed healthy skepticism. This is the scale multiplier for a 2-instructor course: formative feedback that grows with enrollment for free.
- The Hannover study recommends a **team AI-coordinator role** and explicit client-data-confidentiality rules for AI tools (directly relevant with external partners and NDAs).
- The OSPO capstone model has each student individually resolve one issue per two-week sprint via a PR reviewed by a tech lead. The per-student-PR cadence is the cleanest individual-evidence generator that requires zero new grading: the evidence accumulates in the repo as a side effect of working.

**Individual ABET evidence generators programs actually use:** CATME peer evaluation (well documented for outcome 5; parked here for tooling reasons but already used in spring), per-student signature contributions, per-student PR cadences, 360-style performance reviews, and rubric-anchored individual reflections. ABET's own sampling guidance means a handful of individual channels is enough.

**Open design space nobody has claimed:** graded incident postmortems after real project setbacks, and telemetry/success-metric requirements ("define your metrics and instrument the product before the final demo"). Both fit directive 9 (results, real users, real data) and would be genuinely distinctive.

---

## Part 3: The Redesign

The organizing idea, per the instructor's directive: **the repository is the product and the documentation. Standalone document deliverables mostly disappear. Students spend their hours coding, prototyping, getting results, and testing with real people and real data. Individual credit moves to specification, verification, and live defense**, the three things AI cannot fake for a student and graders can assess quickly. Partner evaluation and peer review stay as required.

### 3.1 Kill the document deliverables; grade the repo

Requirements Update and Technical Design Update stop being submitted documents. Instead:

- Each team keeps `docs/` in the repo current: a requirements/spec file, a design overview with the key diagrams, ADRs/RFCs, and the risk register (one, not three). This is exactly what LLM-assisted teams do anyway, because agents need current context files to work well; the course requirement and the effective-AI-usage advice become the same thing. The existing technical-design guide already makes this argument; the assignment finally matches it.
- **Repo checkpoints replace document grading.** Twice a term, graders review the repo against a short checklist (docs current and consistent with the code, decisions recorded, risk register alive, CI green, README honest). 10-band-free, ~10 minutes per team with a fixed rubric, TA-distributable. The current 17-and-21-criterion document rubrics collapse into this.
- The change-log discipline survives (git history IS the change log). What disappears is the export-to-PDF-and-upload theater and the drift between the document and the code.
- Grading tooling: the instructor-tools page (Part 4) gets a "checkpoint mode" that takes a list of repo URLs and renders each team's docs/ and CI status for fast review. Optionally, an LLM pre-pass drafts checkpoint notes per repo for the grader to confirm or override; graders judge, the machine collates.

**The NDA problem, and the two-track evidence model.** Some industry projects sit behind NDAs and staff may not get repo access, so "grade the repo" cannot be the only path:

- **Track A (default, staff-accessible repo):** checkpoints as described above. FOSS, research, new-product, and most consultancy projects land here. Make staff read access a stated default in the partner agreement so Track B is the exception, not the norm.
- **Track B (NDA, no staff access):** the checkpoint runs as a **15-minute screen-shared walkthrough** during the cohort check-in: a designated student drives, the TA follows the same checklist (docs current, decisions recorded, risk register alive, CI green) against the live repo without retaining anything. Where the partner permits, teams supplement with a sanitized evidence pack (docs snapshot, redacted PR list, CI screenshots). Where even that is out, the partner attests via the existing survey channel.
- Design consequence worth stating plainly: **live channels (defense, demo, walkthrough) are the only assessment instruments that work identically on both tracks**, which is an independent reason the redesign leans on them. NDA teams get assessed on exactly the same criteria, just synchronously.
- The LLM PR reviewer (3.5) is Track A only; NDA teams cannot install course tooling on partner infrastructure, and the AI-confidentiality one-pager in the charter must say what, if anything, may leave the partner's boundary.

### 3.2 The RFC spine (the individual writing that remains)

With Memo, Research Brief, and standalone ADR gone as separate genres, keep exactly one individual written artifact per term for fall and winter: **each student authors one RFC per term, in the repo** (`docs/rfcs/`), on a real decision their team faces. Context, options including "do nothing", tradeoffs, recommendation, verification plan. One to two pages; the Pragmatic Engineer template survey gives ready-made formats.

- Fall RFC absorbs the Memo and Research Brief (the stakeholder context and background research become the RFC's evidence section).
- The RFC becomes the ADR when the team decides; the current ADR + Code Review assignment folds in (the code-review half moves to the PR cadence in 3.4).
- **Peer feedback from two students on other teams** (the ANU shadow-team device: individual analytical reading of another team's thinking, free cross-team review, no staff cost), then a brief revision. An LLM reviewer can give a formative pass on drafts.
- Staff grading: short rubric, TA-graded with instructor calibration on a sample. ~600 RFCs/year at ~10 minutes each is ~100 staff-hours spread across the TA pool, largely paid for by deleting Memo + Research Brief + ADR grading (~900 gradings under the current design).

Why keep this at all, given directive 9: the RFC is intent specification, the one written genre whose value went **up** with AI, and it is the cleanest routine positive evidence of ABET outcomes 1, 2, and 6 attributable to a named student. It also future-proofs for whatever the WIC revision demands (draft, feedback, revision are built in).

### 3.3 Demos over reports

The ~14 progress reports shrink to a lightweight cadence built for 90 teams:

- **Bi-weekly sprint note, graded pass/fail against a 4-5 item checklist** (not 15 criteria): link to the release/PR list and board, top risk, next goal, one decision needed, a five-line human judgment layer. Teams may draft it with AI from their own repo history; the judgment layer must be human. If the team runs its repo properly this takes 15 minutes.
- **Live demos run in the existing TA cohort check-ins**, rotating so every team demos live at least twice per term to their TA cohort (5 minutes, working software or an honest "here is why not"). Two **all-hands demo days** per term in lecture with a sampled/volunteer lineup plus partner invitations give the public-pressure effect (MSU Design Day energy, quarterly scale).
- **Async 3-minute demo video attached to every other sprint note** for the sprints without a live slot. Graders can watch at 2x; partners can watch at all, which doubles as partner-communication practice.
- The **individual-deduction assignment stays** (it exists and works), but it gets teeth cheaply: the working agreement requires **each student to own at least one reviewed PR per sprint** (OSPO cadence). The deduction channel then reads repo evidence rather than prose work logs, and the corroboration review finally has the data stream it was designed around. For NDA teams (Track B), the sprint note carries a per-student contribution line (PR titles/IDs, no content) and the claim is spot-verified at the walkthrough or defense; the partner survey's Q7 individual-concern channel corroborates.

Net: roughly 1,200 fifteen-criterion gradings a year become ~600 pass/fail checks plus demos that happen inside already-scheduled meetings, and students get 8-12 reps of demoing before the Expo.

### 3.4 Individual defense: the conversational layer

Once per term, a **defense segment inside the existing cohort check-in**: 30-40 minutes per team, each student walks through something they own (a PR, a subsystem, an RFC decision, a test strategy) and answers live questions: why this way, what breaks if X, where did you decide to stop and check the work yourself and why there. (That last question originally asked what the AI got wrong and how they caught it; revised in the August 2026 four-skills pass because it assumed line-by-line review of AI output.) Docs and AI open for explaining, closed for generating (the Conversational Exam protocol, demonstrated at 58 students with a staff of three; at 300 students this is ~27 TA-hours per round inside meetings that already exist).

- Scored live on a pre-printed sheet, three or four criteria tagged with outcome IDs (L01, L02, L06). No after-hours grading.
- Fallback if a term is too tight: five AI-free minutes at the start of lecture, two questions about your own team's latest release. Same evidence channel, near-zero cost.

This is the strongest anti-outsourcing instrument available (human or AI), it directly addresses the client worry from the Hannover study (students who cannot explain their own system in meetings), and it produces per-student, staff-observed outcome evidence three times a year. It is also the assessment channel that is completely NDA-proof: no artifact changes hands, so Track A and Track B teams are assessed identically.

### 3.5 AI-native course structure

Build on the existing generative-ai guide, which is already good, and make it operational:

- **AI disclosure appendix on major deliverables**: tool, what it was used for, and, crucially, **what verification was performed**. Grade the verification, not the usage. (Superseded August 2026: disclosure is a compliance instrument and cannot measure skill, since a student who used AI well and one who used it recklessly write the same paragraph. Replaced by a delegation-and-validation criterion grading the fit between how far the student delegated and how strong a safety net they built.)
- **Named team roles, rotating by term**: Project Manager (Harvey Mudd's formal role), AI Coordinator (owns the team's CLAUDE.md/context files, tool norms, and the confidentiality rules for what may be pasted where, per the partner agreement; the Hannover clients flagged exactly this risk), Quality/Release Owner. Roles give individuals visible, gradeable surface inside team work and give the partner a clear interface. Rotation means everyone carries a leadership outcome (L05) at least once.
- **Adopt an LLM reviewer as formative infrastructure** (Melbourne model): a GitHub Action giving rubric-aligned feedback on PRs and RFC drafts, never fixing the work. At 2 instructors for 300 students, this is the only feedback channel that scales with enrollment for free, and it showcases the course's philosophy.
- **Teach the verification skills explicitly**: one lecture/workshop each on writing specs for agents, reviewing AI-generated diffs, and regression/property testing as the safety net. The testing-strategy guide already carries most of this content. This is also the answer to the README todo asking for more valuable lecture material.

### 3.6 Outcome, not output: the ship requirement

Make "deliver on an outcome" structural rather than aspirational:

- **Definition of Shipped, per team, agreed with the partner by early winter.** Extend the existing category-specific V&V ladders into a forward-looking contract: what does "done and in use" mean for this project, who are the real users, what is the success metric. Spring partner evaluation scores against the team's own agreed definition.
- **Metrics and telemetry requirement**: before the final release, every team defines 2-3 success metrics and instruments the product to measure at least one for real (analytics events, download counts, benchmark results, user task completion). The literature search found essentially no undergrad capstone doing this; it is the difference between "we built it" and "it worked", and it fits directive 9 exactly.
- **A real-user checkpoint in winter**: at least one session of someone outside the team using the product or the results, evidence in the sprint note. (The Mom Test cheat sheet already in `public/` finally gets linked and used.)
- **Incident postmortem as a first-class assignment** (winter or spring, when something has actually gone wrong, and it will): blameless, industry template, one per team, replacing one retrospective flavor. Also novel: nobody in the literature grades these.
- Keep Landing Page, Spring Release video, and Handoff; they are the right end-of-line artifacts. Add judged awards at Expo (MSU model) for external quality pressure.

#### Scaffolding the spring outcome ladder (student-requested)

Students report the spring partner-survey outcomes are hard to reach (which is the point) but under-supported (which is fair). The complaint has a precise shape: **the top rungs are gated by external lead times that begin in fall**, while the course only makes the bar heavy in spring (V&V weighs 5% in fall, 10% in winter, 40% in spring). Getting a PR merged upstream depends on maintainer response latency measured in weeks or months; app store review, IRB or data access, partner IT security review, and real-user recruitment all have similar clocks. A team that starts climbing in April is out of runway regardless of skill. The bar should stay; the support should make the failure modes skill-addressable instead of luck-shaped:

1. **Backward-design the ladder from week one.** The Definition of Shipped moves earlier: a v0 draft in fall (which rung are we targeting, what are its prerequisites, which have lead times), refined with the partner in early winter. Each category's known lead-time bombs get named in the template so no team discovers them in spring.
2. **Category playbook guides**, one per category, extending the handbook's strongest section: "Shipping a FOSS contribution" (first trivial PR merged by end of fall to open the maintainer channel, substantive PR in review by winter), "Getting a product to real users" (production URL by end of fall, beta users by winter, store-review clocks), "Making research reproducible" (data access and pipeline running end-to-end on sample data by fall), "Delivering consultancy work into production" (partner IT, security review, acceptance criteria). Each maps every ladder rung to prerequisites, timeline, common blockers, and what evidence to collect for the partner survey. This is where the thin activities get replaced by targeted support.
3. **Milestone gates that pull the risk forward.** Fall ends with "hello, production": walking skeleton deployed to a production-like environment, or first FOSS PR submitted upstream, or research pipeline running end-to-end on sample data (the walking-skeleton template already in `public/` finally becomes load-bearing). Winter ends with a release candidate plus the real-user checkpoint. Spring is then hardening and evidence collection, not first deployment.
4. **Make ladder position continuously visible.** Sprint notes and repo checkpoints carry a standing line: current rung, target rung, biggest blocker to the next rung. The spring midterm partner pulse asks the partner where they think the team stands on the ladder, leaving weeks to react instead of none.
5. **Ship clinics and worked examples.** Publish the DevOps guide (the deployment manual for this exact problem is currently `draft: true` and invisible). Run a deployment clinic in fall and a "ship week" early in spring. Collect annotated examples per category of what each rung looked like for past teams, plus "how we shipped" lightning talks from spring teams to the fall cohort (the README todo already wants an examples library; this is the highest-value place to start it).
6. **A resource kit with the boring blockers pre-solved:** hosting credits and limits (resources.mdx exists but is thin), domain and TLS, app-store and TestFlight lead times, an analytics/telemetry starter (which also feeds the metrics requirement), user-recruitment channels, and usability-test templates.
7. **Teach the AI-era inversion explicitly.** With LLMs, building the prototype is no longer the long pole; the external world is (maintainers, reviewers, users, data owners). One lecture on "the outcome-critical path" that has students plot their ladder prerequisites on the calendar would reframe the whole year, and it is exactly the judgment skill this course claims to teach.

### 3.7 The grade architecture (proposal)

Keep the 25/25 partner/peer as required. Restructure the 50%:

| Component | Weight | Level | Outcomes evidenced |
|---|---|---|---|
| Project Partner Evaluation | 25% | Team (individual corroboration via Q7 + repo evidence) | 1, 2, 3, 6 (via facets) |
| Peer Evaluation | 25% | Individual | 5 |
| Individual: RFC (fall, winter) or career doc (spring), defense segments, PR ownership, disclosure/verification quality | 25% | Individual | 1, 2, 3, 4, 6 |
| Team: charter + working agreement, repo checkpoints, sprint notes/demos, postmortem, release + metrics, handoff | 25% | Team (with the deduction assignment attached) | 2, 3, 5 |

- **Tag every rubric criterion with outcome IDs** from `LEARNING_OUTCOMES.json` and generate the traceability matrix automatically from the rubric TSVs so it never drifts. That artifact is what an ABET visit wants, and it costs a script. The preliminary map, honoring the two-individual-data-points-per-outcome rule, is in 3.8.
- Document the peer-eval reality in the handbook (four-criteria instrument per term, CATME in spring), state the intended team-size range (aim 3-4, supported 2-6+), and make the formula and scripts robust across it. Full CATME-every-term stays parked pending tooling.
- Wire the individual-deduction assignment into the handbook and repo (it exists in Canvas; nobody reading this repo can tell), and feed it from the PR-per-sprint evidence rather than prose logs.
- Fix the letter scale (add C+/C-, define the zero/missing rubric state).

### 3.8 Preliminary map: ABET outcomes to individual data points

Rules applied: every data point below is an **individual** instrument (a rubric item or assignment scored per student, not per team); each outcome gets **at least two** data points per student; team-level instruments (partner evaluation, repo checkpoints, team deliverables) appear only as corroboration because they cannot serve as individual evidence. SO4 is partly covered by the ethics course, as planned at the program level.

| ABET SO | Data point 1 | Data point 2 | Additional / backup | Team-level corroboration |
|---|---|---|---|---|
| **SO1** Analyze a complex computing problem, identify solutions | RFC fall: problem framing, constraints, and options-considered rubric items | Defense (fall or winter): "why this approach, what alternatives did you reject" criterion | RFC winter, same rubric items (a third point for free) | Partner eval Requirements facet |
| **SO2** Design, implement, evaluate a solution to requirements | RFC: recommendation and verification-plan rubric items | Defense (winter): owned-subsystem walkthrough criterion (design intent vs. behavior) | Spring career/retro doc: individual PR portfolio section citing shipped work | Partner eval Design and V&V facets; repo checkpoints |
| **SO3** Communicate effectively in professional contexts | RFC written-communication rubric items (fall and winter) | Live demo or defense oral-communication criterion (scored per student) | Spring career doc; Expo Q&A | Landing page, release video, handoff |
| **SO4** Professional responsibility, legal and ethical judgment | Ethics course (external program-level data point) | Delegation-and-validation rubric item on each RFC (what was delegated, the safety net that made it reasonable, where the author validated) plus the dual-tagged defense ownership criterion each term, added August 2026 | RFC constraints item covering licensing, data use, IP, and the partner-confidentiality boundary; spring reflection item on responsible practice | Charter AI/confidentiality one-pager; blameless postmortem conduct |
| **SO5** Function effectively as team member or leader | Peer evaluations, mid and end of every term (six individual scores per year) | Named rotating role (PM / AI Coordinator / Quality Owner), assessed via a role-accountability criterion at the defense | CATME instrument in spring | Partner eval Teamwork facet |
| **SO6** Apply CS theory and development fundamentals | Defense technical-depth criterion ("what breaks if X", complexity/correctness reasoning) | RFC technical tradeoff-analysis rubric item | Reviewed PR-per-sprint record (deduction assignment reads it; spot-verified at walkthrough for NDA teams) | Repo checkpoints: tests, CI, code health |

WIC (parked until the official revision lands): the RFC cycle already contains the draft, external feedback, and comprehensive revision per student, and two RFCs plus revision notes clear 2,000 polished words; informal writing accrues in sprint-note judgment layers. L10 (Beyond OSU) stays on the spring career document as the CS 463 syllabus already has it.

Two implementation notes that make this audit-proof rather than aspirational:

- **Tag the rubric items, not the assignments.** Each TSV criterion gets an outcome ID (SO1-SO6, L07-L10) in the assignment source. The traceability matrix is then generated at build time, and a check fails the build if any SO has fewer than two individual-level tagged items. Coverage can never silently regress.
- **Defense scoresheets are the swing resource.** Three defense rounds a year give every SO a live, staff-observed data point, SO4 included since August 2026 (the ownership criterion is dual-tagged `SO2, SO4`). If a term's defenses get cut, SO1/SO2/SO6 fall back to two RFC-based points each, which still satisfies the rule but loses the AI-resistant channel. Protect the defenses first when trading scope.

### 3.9 What to do with the Activities section

The activities are currently worded as graded submissions ("Submit the original resume...") because they once were, and the handbook cannot decide if they are a menu or a syllabus. Proposed disposition, in order of preference:

1. **Recast the best ones as practice companions to the guides.** Each guide gets a "Try it" section (or sidebar link) pointing at 2-3 rewritten activities in how-to voice ("How to run a Mom Test interview", not "Submit a one-page summary"). The activity content is good; only the imperative-submission framing is wrong. This also fixes the audience confusion for free.
2. **Superseded August 2026, replaced by three-tier activity routing** (workshop activities recorded as zero-point complete/incomplete, recommended activities named per rubric criterion, the rest browsable). The original proposal: **keep a small curated subset as low-stakes extra credit**, selected per project category (the README todo already wants recommended-activities-by-category). Cap it (say two per term, a point or two each) so it stays a nudge, not a grading surface: at 300 students every extra-credit item is ~300 more things to check, so anything extra-credit must be pass/fail on submission or TA-checkable in under a minute.
3. **Mine the rest for lecture and workshop material.** The conflict, planning, and design pages are close to ready-made session plans, which answers the README todo asking for more valuable lecture time.
4. Delete or archive what no assignment, guide, or session claims. An activity nothing points to is maintenance debt.

The one activity family worth promoting rather than demoting: the user-research activities become load-bearing under the real-user checkpoint (3.6). Rewrite those first.

### 3.10 The year at a glance (10-week terms, 3/3/2 credits)

| | Fall 461 (3 cr, ~90 h) | Winter 462 (3 cr, ~90 h) | Spring 463 (2 cr, ~60 h) |
|---|---|---|---|
| Theme | Discover, specify, walking skeleton | Build, verify, real users | Ship, prove, hand off |
| Individual | RFC 1 (draft, peer feedback, revision); defense 1; PR-per-sprint begins | RFC 2; defense 2 | Career/retro doc; defense 3 (Expo Q&A can count) |
| Team | Charter with AI + confidentiality norms; repo stood up with living docs; walking-skeleton demo | Repo checkpoints; Definition of Shipped; real-user checkpoint; postmortem | Release + metrics evidence; landing page; handoff; project retrospective |
| Cadence | Sprint notes + cohort demos | Sprint notes + cohort demos | Sprint notes, demo days, Expo |
| Partner eval focus | Requirements 40% | Design/Implementation 40% | V&V/outcome 40%, scored against the agreed Definition of Shipped |

Spring is 2 credits: it deliberately carries no RFC and the lightest cadence; the effort goes into shipping and the Expo.

Deletions and merges that pay for the additions: Memo and Research Brief fold into RFC 1; standalone ADR folds into the RFC decision record; Requirements Update and Technical Design Update become repo checkpoints; Setup merges into Sprint 1; retrospectives go from four flavors to one per term with distinct formats (4Ls fall, postmortem winter, project retro spring); three risk registers become one in the repo; ~14 heavy progress reports become pass/fail sprint notes plus demos inside existing meetings.

---

## Part 4: Operational and Repo Modernization

### 4.1 Instructor tools (kill the R + Excel + VBA pipeline)

Your README todo already names the right endgame: a **client-side instructor-tools page** in this Astro site (everything in-browser so no student data ever touches a server or the repo). At 300 students this is not a nicety; it is the thing that makes the rest of the redesign affordable. Port the R scripts to TypeScript:

- Upload Qualtrics export + roster + Canvas gradebook CSV, get back computed scores, per-student feedback emails, and a Canvas-importable CSV.
- One **term config** object (course ID, term dates, facet weights, Canvas assignment IDs, team-size range) replaces the per-term copy-paste scripts and the comment-toggling.
- Email step: generate a Canvas-Inbox-ready batch or mail-merge file instead of the one-row-at-a-time VBA macro.
- While porting, fix the found bugs: apply the peer-eval correction to the gradebook (or remove it from the student emails), the 3 vs 3.5 facet mapping in s2026, the 6-member ceiling (support 2 through 7+), and implement the Q7 individual-concern extraction that is stubbed everywhere (it feeds the corroboration review).
- Add a **repo checkpoint mode**: paste the team-repo list, get each team's docs/, CI status, and PR-per-student counts rendered for fast review (see 3.1, 3.3). Track A teams only; the tool should track which teams are NDA (Track B) so their checkpoints are scheduled as walkthroughs instead of silently showing up as missing data.
- This is also where **CATME-every-term** eventually unblocks: generate the per-team CATME item matrix for import, or run peer eval directly in the tools page and skip Qualtrics for it entirely. Parked, but the architecture should leave the door open.
- Team formation (the MILP bids solver) can stay in R; it runs once a year. But parameterize it (project list, caps, forced teams as a config file, not code edits) and fix the mojibake.

### 4.2 Assignments into the handbook, Canvas as build target

Direction confirmed by the instructor: everything lives in the handbook, likely an **"Assignments" sidebar group**, and Canvas receives copies.

- One markdown/MDX source per assignment in `src/content/docs/assignments/`, containing the student-facing spec and the rubric. Generate from it: the Canvas-paste HTML and the rubric TSV **in the exact `_template/` format the Canvas rubric browser extension imports** (that format is a hard requirement, keep it as the compiler target). This eliminates the current three-file drift (four assignments missing TSVs) and gets the full assignment set out of Canvas-only existence.
- Tag rubric criteria with outcome IDs in frontmatter or inline markers; the traceability matrix (3.7) is generated from the same source at build time.
- Include the currently-invisible pieces: the individual-deduction assignment and a partner-evaluation assignment page, so the repo finally reflects the course.

### 4.3 Repo hygiene and CI

- GitHub Actions: build + `astro check` on PR, scheduled `linkinator` against production (your todo), and a secret/PII scanner.
- Activate lefthook (installed, fully commented out) with a pre-commit guard blocking any path under `data/` and files matching student-ID or email patterns. The single-gitignore-line protection has held for 185 commits; make it structural.
- Content sweep: publish `devops.mdx` and `documentation.mdx` (fixes the broken link from testing-strategy), delete `status.mdx.bak`, write or delete the rubrics stub, fill the `description: TBD`s, fix the typos, add alt text, link the eight orphaned `public/` templates from relevant pages, move commented-out backlogs into issues, state the team-size policy (aim 3-4, range 2-6) once and reference it everywhere.
- Replace hardcoded term facts (dates, "fourteen reports", "September") with a data file rendered into pages or deliberately timeless phrasing.

### 4.4 Sequencing

1. **Now, cheap, regardless of the redesign:** hygiene sweep (4.3), publish the draft guides, fix the drift table in 1.3 (document the peer instrument reality, the deduction assignment, team size), fix the scoring bugs.
2. **Summer, the redesign core:** write the RFC and defense rubrics, the repo-checkpoint checklist, and the sprint-note checklist; restructure the 50% bucket; build the assignment source-of-truth pipeline (4.2) with outcome tagging and the generated traceability matrix; merge the retro/risk redundancy; draft the four category playbook guides and the fall Definition of Shipped v0 template (the ladder scaffolding in 3.6 only works if it exists before fall week one).
3. **Fall, operational:** instructor-tools page before the first peer-eval cycle; pilot the LLM PR reviewer with volunteer teams; first RFC cycle and first defense round in cohort check-ins.
4. **Winter/Spring, prove it:** repo checkpoints replace document updates; Definition of Shipped; postmortems; metrics requirement at release; revisit WIC and CATME-per-term when the WIC revision lands and the tools page exists.

---

## Part 5: Key Sources

Programs: [MSU Capstone + Design Day](https://capstone.cse.msu.edu/) (the scale-comparable model: high enrollment, $3k client fee, judged expo), [Georgia Tech CS Junior Design](https://sites.gatech.edu/csjuniordesigncapstone/) (deliverables double-counted for communication credit, at scale), [ANU ENGN4300 assessment](https://eng.anu.edu.au/courses/engn4300/students/assessment/) (individual multipliers, shadow-team reviews), [Berkeley CS169L](https://www2.eecs.berkeley.edu/Courses/CS169L/) (large-cohort client projects, automation-first), [Rose-Hulman CSSE 497-499](https://www.rose-hulman.edu/academics/course-catalog/current/programs/Computer%20Science/csse-497.html) (three-quarter client capstone, two tracks), [Harvey Mudd Clinic](https://www.hmc.edu/clinic/), [Olin SCOPE](https://www.olin.edu/academics-capstone-programs/scope), [Stanford CS210](http://web.stanford.edu/class/cs210/), [CMU 17-356](https://cmu-17-356.github.io/), [Cornell Tech Studio](https://tech.cornell.edu/studio/curriculum/startup-studio/), [WPI MQP](https://www.wpi.edu/project-based-learning/project-based-education/major-qualifying-project).

ABET/assessment: [ABET on sampling](https://assessment.abet.org/planning_article/sampling/), [CATME in capstones (ASEE)](https://peer.asee.org/using-catme-to-document-and-improve-the-effectiveness-of-teamwork-in-capstone-courses), [7-outcome rubric toolkit (ASEE)](https://peer.asee.org/tools-for-comprehensive-assessment-of-the-7-abet-student-outcomes-in-mechanical-engineering-with-application-to-capstone-design), [SE capstone systematic review, 127 studies](https://arxiv.org/abs/2301.03554), [OSU WIC outcomes](https://wic.oregonstate.edu/wic-learning-outcomes) (parked).

AI-era: [GenAI in real client capstones, n=178 (Hannover)](https://arxiv.org/html/2604.24521v1), [The Rise of AI-Native Software Engineering](https://arxiv.org/html/2606.12986v1), [The Conversational Exam](https://arxiv.org/html/2601.10691v1), [Own-submission AI-free quizzes](https://arxiv.org/abs/2601.17024), [LLM PR reviewer in capstone (Melbourne, ICSE-SEET)](https://arxiv.org/html/2604.23251v1), [OSPO capstone, PR-per-student cadence](https://arxiv.org/pdf/2406.08679).

Industry practice: [Pragmatic Engineer on RFCs and design docs](https://blog.pragmaticengineer.com/rfcs-and-design-docs/), [Squarespace "Yes, if" RFC reviews](https://engineering.squarespace.com/blog/2019/the-power-of-yes-if).
