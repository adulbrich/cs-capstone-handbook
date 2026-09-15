# Design: Assessing Critical Thinking, AI Literacy, Leadership, and Collaboration

Date: 2026-08-17
Branch: `revision-fall-2026`
Status: design record. Implemented on the `revision-fall-2026` branch and merged through #62. §5 has a one-paragraph home on `learning-objectives/mapping.mdx`; §4.6 workshop decks remain unbuilt (#51).
Record type: a design record under `docs/decisions/`; the handbook pages are the source of truth where the two differ.

## 1. Context and Drivers

The Fall 2026 revision built an assessment architecture around AI-resistant evidence: live defenses, RFCs, PR-per-sprint ownership. Four skills now need explicit, defensible assessment: **critical thinking, AI literacy, leadership, collaboration**.

Two drivers, both from the instructor:

1. **Partner and employer feedback.** Four failure modes are reported, all real but concentrated in a minority of teams and students: students who cannot explain their own system; unverified AI output reaching the partner; nobody driving decisions to a conclusion; invisible or uneven contribution.
2. **The pace of change in AI/LLM practice.** Anything encoding 2026 tool specifics into a rubric table or Canvas TSV will be stale within a year, and those are the most expensive artifacts in the course to change.

### Baseline coverage before this design

| Skill | Existing instruments | Assessment strength |
|---|---|---|
| Critical thinking | RFC tradeoff analysis and options (SO1/SO6); Defense judgment and technical depth | Strongest. The live defense makes it hard to outsource. |
| AI literacy | One 10-point RFC disclosure self-report; Charter AI one-pager; AI Coordinator role; one defense question | Weakest. Nothing assesses skill, only disclosure. |
| Leadership | Defense role criterion (20 pts x 3 terms); rotating named roles; peer evaluation | Medium. Self-narrated; rotation is uncontrolled. |
| Collaboration | Peer evaluation 25%/term; partner Teamwork facet; CATME in spring | Wide, but almost entirely peer perception rather than observed behavior. |

AI literacy is weak for a structural reason: the other three map onto pre-existing ABET outcomes and inherited instruments. AI literacy has no ABET home, so it landed where new concerns land in an accredited course, as a disclosure appendix. Disclosure is a compliance instrument and cannot measure skill: a student who used AI expertly and one who used it recklessly write the same paragraph.

### The gap in the instruction layer

The activities library holds **105 exercises across 10 themed pages**. Not one teaches AI-assisted engineering practice. Every AI mention in the library is contextual commentary ("recruiters assume cover letters are AI-generated", "live coding does not allow AI assistance"), never an exercise. The library predates the agentic era and was never revised, while the assessment layer on this branch was designed entirely around it. The course is about to assess a skill its teaching layer does not cover.

## 2. Design Principles

These five principles resolve every subsequent decision. When implementation questions arise, resolve them here.

**P1. Rubrics assess invariants; guides and activities carry the volatile layer.** Specification, verification, judgment, and ownership are stable. Tool names, model capabilities, and workflow specifics are not. Rubric tables and Canvas TSVs are expensive to change; activity pages cost nothing. Never name a tool in a rubric criterion.

**P2. Capability-relative standard.** The graded invariant is that delegation must not exceed what the safety net catches, and that one-way-door decisions get human validation. How far a student can delegate varies with model quality and token budget, and is not graded. A weaker model means tighter gates and more human validation, which is more work, not less.

**P3. Score the triage decision, not the outcome.** A student who let an agent drive a schema migration and got lucky scores badly. A student who stopped at auth and validated scores well even if their feature code has bugs. Graders default to grading luck; the anchors must say otherwise explicitly.

**P4. Content aspires, assessment accommodates.** The instruction layer teaches the frontier stack because coverage of current industry practice is what a software engineering course owes, with caveats and cheaper substitutes stated inline. The graded criteria never require agentic tooling, so students with limited access are protected by the rubric rather than by watered-down content.

**P5. One deduction channel.** New behavioral signals feed the single existing individual contribution modifier decision as inputs. They never create new ways to lose points. The TA persona review already cost a round of work fixing double jeopardy across modifier, partner facet, and checkpoint criterion; the declared precedence order stays intact.

### Design consequence: the expert/novice gap is the curriculum target

The instructor's own practice is high-delegation: agent runs in auto mode, agent drives a browser through Playwright to exercise features and UI/UX, agent runs axe-core, agent writes unit/integration/e2e tests, agent performs self-audit and architectural review passes. The human keeps acceptance judgment ("does the product work as I expect") and validates at critical architectural and deployment decisions.

That is expert practice. It works because the practitioner has the calibration to recognize the critical moment. Students lack exactly that calibration, and that gap is what the curriculum must target. The answer is therefore neither forcing students into line-by-line review theater (a practice the instructor does not believe in and students will fake) nor permitting blind delegation. It is teaching the triage explicitly and assessing the fit between how far a student delegated and how strong a net they built.

## 3. Assessment Layer

### 3.1 Defense re-anchoring (the core move)

The defense is the only AI-resistant channel in the course and its budget is the binding constraint on the entire design: 6 minutes per student, 30 to 40 minutes per team, 5 criteria at 20 points, weeks 7 to 9, 10% of the term grade. No new questions may be added to that slot.

The five existing criteria already are, approximately, the four skills. They are not labeled or anchored that way. Re-anchor rather than add.

| Criterion | Pts | Outcome tag | Skill | Change |
|---|---|---|---|---|
| Judgment | 20 | SO1 | Critical thinking | Add to the anchor: identifies which parts of the decision were hard to reverse |
| Technical depth | 20 | SO6 | Critical thinking (depth) | None |
| Ownership | 20 | **SO2, SO4** | **AI literacy** | Re-anchor: what you delegated, what net made that safe, where you stopped and validated, and why there |
| Role and team accountability | 20 | SO5 | **Leadership + collaboration** | Split anchors: leadership (chaired a decision to a conclusion) vs collaboration (how the team's decisions actually got made and how work was distributed) |
| Communication | 20 | SO3 | Communication + reviewer-side check | Substitute one question: what was the strongest thing you told a peer whose RFC you reviewed |

SO2 survives on Ownership because "design, implement, and **evaluate** a computing-based solution" covers delegation-and-validation judgment directly.

**Ownership gains a second tag, `SO4`, and this is the fix for `IMPLEMENTED.md` open item 1.** The argument that justifies the RFC criterion rewrite applies verbatim here: deciding where professional responsibility requires your own attention, rather than an agent's, is "recognize professional responsibilities and make informed judgments in computing practice." Multi-tag criteria already exist in the branch (`rfc.mdx` carries `SO3, L08` and `SO3, L09`).

Effect: three non-RFC individual SO4 data points per student per year, one per term. The documented concentration (4 of 5 in-capstone SO4 points sitting on the RFC) drops from a known accreditor exposure to a non-issue. This is the highest-value side effect in the design and it costs nothing.

Requires `SO4: 1` added to `defense.mdx` frontmatter. Confirm the resulting counts with `node scripts/validate-outcomes.mjs` at implementation time; do not assume them.

All other outcome tags are unchanged.

The existing question at `defense.mdx:22`, "what did the AI get wrong along the way and how did you catch it", becomes **"where did you decide to stop and check, and why there."** The original wording assumes line-by-line review and is the same defect being removed from the RFC criterion.

Files touched: `src/content/docs/assignments/defense.mdx`, `public/defense-scoresheet.md`, `canvas/defense/` rubric TSV, and `src/content/docs/learning-objectives/mapping.mdx` (the SO4 row, plus the "Known concentration" sentence, which the dual-tag makes obsolete). The mapping page is hand-maintained against the validator, so it does not update itself.

Per P3, the scoresheet anchors and TSV bands must state that the triage decision is what is scored, not whether the code turned out fine.

### 3.2 RFC changes

**Criterion rewrite.** Replace:

> AI disclosure: tools, purposes, and verification performed | 10 | SO4

with:

> Delegation and validation: what you delegated, the safety net that made that rational, and the points at which you validated yourself | 10 | SO4

Points unchanged at 10. The SO4 tag survives and improves: "informed judgment about where professional responsibility requires your attention" is a stronger SO4 fit than a disclosure self-report. `rfc.mdx` frontmatter `SO4: 2` is unchanged. Confirm with the validator rather than assuming.

This criterion is answerable at any capability level, which is what makes P2 operational.

**Trigger tightening.** `rfc.mdx:23` currently requires "a real decision your team currently faces." Tighten to a decision that is **hard to reverse**, so choosing the RFC topic is itself an act of triage judgment. This must be a strong preference with a stated fallback, not a hard gate: some teams will not face a one-way door inside a given four-week window. Fallback wording: if no hard-to-reverse decision is live, write the RFC on the most consequential reversible decision and say in the problem framing why it is reversible and what would make it not.

**Peer review retained** per the prior turn's decision, with the two incentive fixes: the author-flags-reviewer channel extends from "no review arrived" to "review was generic and did not engage with my draft", and the reviewer-side check moves into the defense Communication criterion as a substitution.

Files touched: `src/content/docs/assignments/rfc.mdx`, `canvas/rfc/` rubric TSV, `public/rfc-template.md`.

### 3.3 Leadership: structural rotation enforcement

The defense role criterion currently accepts self-narration. Give it a record to check against: the sprint note's existing per-student contribution line records who chaired which decision that sprint. No new artifact, no new grading step. The defense anchor then asks about a chaired decision that appears in the record.

Files touched: `src/content/docs/assignments/sprint-notes.mdx`, `public/sprint-note-template.md`, `src/content/docs/assignments/team-charter.mdx` (rotation commitment).

### 3.4 Collaboration: observed behavior, not re-engineered perception

**Peer evaluation is explicitly out of scope.** It is 25% of every term, has a validated per-term instrument, an R pipeline with two known open bugs, and CATME in spring. "Invisible contribution" is real, but detection belongs on the structural side already required (PR-per-sprint ownership, sprint-note attribution lines) and on the defense's split role anchor. Peer evaluation remains corroboration in the outcome mapping and is not touched.

**RFC cross-team peer review is retained, and the reason is harder than previously recorded.** A live validator run shows `L07: 2`, sourced **entirely** from `rfc.mdx` (1 item x 2 terms). `term-retrospective.mdx` also tags `L07`, but it is `level: team`, so the validator scores it as corroboration and it contributes zero individual data points. Removing the RFC "Feedback given" criterion would therefore drop L07 to **0** and fail CI and pre-commit outright, not merely thin the coverage. The earlier assessment that L07 would survive on the term retrospective was wrong.

### 3.5 Trigger layer

Per the instructor: all four failure modes occur, but only in some teams and students. A universal new instrument taxes 300 students to catch a minority, which is the wrong trade at 6 TAs. Generalize the pattern the branch already uses for the contribution modifier: fast-pass by default, investigate on triggers.

Signals feeding the single modifier decision (P5):

| Signal | Source | Status |
|---|---|---|
| Blank or thin per-student contribution line | Sprint note | Existing |
| Peer evaluation flag | Peer survey | Existing |
| Partner individual concern | Partner survey Q7 | Existing (extraction currently stubbed) |
| Low Ownership or Role score at defense | Defense scoresheet | **New input** |

Team-level safety-net absence (no CI, no tests, no rollback path) is a **repo checkpoint** finding, not a modifier input. It grades the team's attribution and quality infrastructure, consistent with the existing decision that the checkpoint criterion grades infrastructure rather than individuals.

The declared precedence order across modifier, partner facet, and checkpoint criterion is unchanged. The appeal rule (evidence note, five business days, instructor decides) applies unchanged.

### 3.6 Repo checkpoint: the safety net becomes visible evidence

This is why the reframe makes AI literacy *more* verifiable than the disclosure it replaces. A caught-defect anecdote is a story. A safety net is visible in the repository: CI configuration, test layers present, branch protection on protected paths, a staging or preview environment, a documented rollback path, accessibility checks in the pipeline.

Add one item to the existing repo checkpoint checklist assessing net-versus-delegation fit at team level. Track B teams cover it in the existing 15-minute walkthrough, in the existing fixed order.

Files touched: `src/content/docs/assignments/repo-checkpoints.mdx`, `canvas/repo-checkpoint/` rubric TSV.

## 4. Instruction Layer

The instruction layer is downstream of the assessment layer: it exists to teach what section 3 grades.

### 4.1 New page: `src/content/docs/activities/ai.mdx`

Teaches the frontier baseline per P4, with caveats and cheaper substitutes stated inline per exercise. Three pillars:

**Pillar 1: which doors are one-way.** Architecture, database schema, authentication and authorization, deployment topology, data migration, licensing, third-party contracts: validate hard. Reversible feature code: delegate and let the net catch it. This concept **does not exist anywhere in the handbook**: reversibility appears only in `devops.mdx` in the context of deployment rollback. It is the conceptual spine of the design and the genuinely new material. Exercise: classify your team's next ten decisions as one-way or two-way, then check the classification against what actually happened.

**Pillar 2: you may delegate only as far as your net catches.** The frontier baseline, taught as an integrated harness:
- Agent drives a browser (Playwright) to exercise features and UI/UX flows
- Automated accessibility audit (axe-core) wired into the pipeline
- Agent writes the test pyramid: unit, integration, e2e
- A self-audit pass where the agent critiques its own work adversarially
- A separate architectural review pass as a distinct step, not folded into implementation

Caveat pattern per exercise: state the invariant, then the substitute at lower capability. Example: if your model cannot drive a browser, the invariant is that the critical user flow is exercised before every demo; the substitute is a written manual smoke script run by a human, and a recorded e2e test added when tooling allows.

Cross-reference rather than duplicate: `testing-strategy.mdx` already covers the pyramid, e2e, Playwright, manual and exploratory testing, and usability testing. `generative-ai.mdx:105` already names Playwright MCP.

**Pillar 3: do the work AI cannot.** Acceptance judgment: does the product do what a user expects. This is narrower and sharper than "manual testing". The agent can drive the browser, the human decides whether what it did is right. Mostly a pointer into `testing-strategy.mdx` plus the framing that this is now where the human's hours go.

### 4.2 Accessibility testing, in three forms

Accessibility is currently near-absent from the handbook. The only accessibility criterion in the entire branch is 20 points on the spring landing page (`landing-page.mdx:47`, tagged L08); rubric conventions mention alt text; WCAG is never named; no automated tooling appears anywhere. This is a real gap for a software engineering course.

**Accessibility adds no accreditation evidence, and the spec does not claim it does.** Everything in this subsection is teaching material: a guide and four activity pages, all ungraded per `activities/introduction.mdx:8`. Per `mapping.mdx` rule 2 a data point must be a rubric criterion scored per student, and per rule 1 the §3.6 repo-checkpoint item is team-level corroboration. The SO4 concentration is relieved by the `SO4` dual-tag on the defense Ownership criterion (§3.1), not by this. Accessibility is here because the course should cover it, which is reason enough.

Accessibility maps cleanly onto the verification/validation split `testing-strategy.mdx` already uses, so it is added in three forms rather than as one tooling mention.

**Form 1, automated (verification).** A new subsection in `testing-strategy.mdx` under Verification: axe-core in the test suite and in CI, Lighthouse or pa11y for page-level budgets, and lint-level checks (for example `eslint-plugin-jsx-a11y`) that catch violations before they reach a browser. Named as a CI gate, not a pre-release scramble. Add the tools to the existing tooling table. Name WCAG 2.2 AA as the reference standard so students have a target rather than a vibe.

**Form 2, manual (verification).** A new subsection under Manual and Exploratory Testing: keyboard-only navigation of the critical flow, a screen reader pass (VoiceOver, NVDA, or Orca), zoom to 200%, and contrast checks. These catch the large class of failures automated tools cannot: focus order, meaningful labels, whether a flow is actually completable without a mouse. Roughly half of real accessibility defects are invisible to axe-core, which is the point worth teaching.

**Form 3, user-based (validation).** A subsection under Usability Testing: where feasible, run a session with someone who uses assistive technology daily. Where not feasible, the substitute is a task-based session under simulated constraint (keyboard only, screen reader on) with the caveat stated in the writeup that simulation is not the same as lived use.

**Activities, in various forms.** An accessibility cluster distributed across the relevant pages rather than concentrated in one:
- `design.mdx`: accessible-by-default design review of an existing screen (contrast, target size, focus states, semantics before ARIA).
- `user.mdx`: recruit and run an assistive-technology user session, or the simulated-constraint substitute.
- `ai.mdx` pillar 2: wire an agent-run automated audit into the pipeline and triage what it reports (which findings are real, which are noise, which need a human to judge).
- `communication.mdx`: the existing "Write for Accessibility and ESL" item, cross-linked into the cluster so it stops sitting alone.

Files touched: `src/content/docs/guides/testing-strategy.mdx`, `src/content/docs/activities/design.mdx`, `user.mdx`, `communication.mdx`, `ai.mdx`.

### 4.3 The gen-AI guide becomes the automation hub

Everything automated in the course should be reachable from `generative-ai.mdx`, because that guide is where a student goes to ask "what can I hand off?" The guide does not own or duplicate the content; it becomes the delegation map, linking out to the guide that owns each topic.

Automatable checks to index there, each as a one-line entry plus a link:

| Automatable | Owning source |
|---|---|
| Test generation across the pyramid (unit, integration, e2e) | `testing-strategy.mdx` |
| Browser-driven flow exercising (Playwright, Playwright MCP) | `testing-strategy.mdx`, already partly at `generative-ai.mdx:105` |
| Accessibility auditing (axe-core, Lighthouse, lint-level a11y) | `testing-strategy.mdx` (new, form 1 above) |
| Lint and format gates | `guides/` code-quality material, `biome.jsonc` as the local example |
| CI pipeline construction and gate configuration | `devops.mdx` |
| Self-audit and adversarial review passes | `ai.mdx` pillar 2 |
| Architectural review as a distinct pass | `technical-design.mdx`, `ai.mdx` pillar 2 |
| Security scanning (dependency audit, SAST, secret scanning) | `security.mdx` |
| Documentation and changelog generation | `documentation.mdx` |

Two rules for this index, both following from P1: it links rather than restates, so the owning guide stays the single source of truth; and it is the page where tool names are expected to churn, so it is explicitly marked as reviewed each year.

The counterpart framing belongs on the same page: what stays human. Acceptance judgment, one-way-door decisions, user-facing tradeoffs, and whether the automated finding actually matters.

### 4.4 Tier the 105 exercises rather than prune them

Three tiers, marked in page frontmatter and visible on the page:

- **Workshop** (~6): taught in class, everyone does them.
- **Recommended** (~20): linked from the graded assignment they feed, with the specific rubric criterion named.
- **Library** (the remainder): kept, unpromoted, browsable by project category.

Nothing is deleted. The top ~25 get a reason to exist and the long tail stops competing for student attention. The 105 exercises are not rewritten in this design.

### 4.5 Replace extra credit with just-in-time prerequisite routing

The current motivator is "optional, ungraded, with a small curated extra-credit subset announced in Canvas" (`activities/introduction.mdx:29`). That is the weakest available motivator in an overloaded project course, which is why the activities are not being used.

Instead: every graded assignment page names the one or two activities that are the cheapest path to its rubric criteria, and every promoted activity states which criterion it earns points on. Students do the activity because it is the efficient route to a grade they already care about. Zero TA hours. The extra-credit subset shrinks to a formality or is removed.

This converts the activities from a parallel optional track competing for hours into the on-ramp of the graded track. Extra credit was always going to fail here because it tried to solve a routing problem with an incentive.

Files touched: `src/content/docs/activities/introduction.mdx`, all 10 themed activity pages (frontmatter tier tags and criterion pointers), each graded assignment page (a prerequisite line).

### 4.6 Workshop decks sourced from activities

`STAFF-RUNBOOK.md` specifies a needed deck series (spec-writing for agents, AI-diff review, testing workshop) that `IMPLEMENTED.md` open item 3 admits does not exist. Build those decks from the promoted activity pages plus the new `ai.mdx`. This closes an owed open item and makes activity usefulness a function of attendance rather than opt-in.

Deck targets: one-way doors and delegation triage; building the agent-operated verification harness; specification for agents. Existing `decks/Fall.md` week 1 is done and unaffected.

### 4.7 `generative-ai.mdx`: one section revised

The guide contains a section headed **"Verify, do not trust."** That directly contradicts the stance this design adopts and the instructor's actual practice. Revise that one section to the effect of "verify what matters, and build the net that lets you trust the rest," carrying pillar 1 and pillar 2 in compressed form with a pointer to `activities/ai.mdx`.

The rest of the guide is good (`IDEAS.md:29` says so) and is not rewritten, beyond adding the automation index from 4.3.

### 4.8 Infrastructure prerequisite: re-enable internal link validation

This design adds a large number of cross-references: nine entries in the automation index, activity-to-criterion pointers across roughly twenty pages, accessibility cross-links between the testing guide and four activity pages. All of it is exactly the kind of linking that rots silently.

**Status: done, 2026-08-17.** `starlightLinksValidator` had been commented out in `astro.config.mjs` at both the import and the plugin registration, so the build did not catch broken internal links despite the dependency being installed.

Maintenance check before re-enabling: installed version 0.25.3 is the current release, published 2026-08-12, with peer dependencies `@astrojs/starlight >=0.41.0` and `astro >=7.0.2` against this project's 0.41.7 and 7.2.2. Actively maintained and compatible, so no replacement was needed.

Re-enabled and verified:
- `npm run build` passes with "All internal links are valid" across all 66 pages. The anticipated cleanup of pre-existing broken links was not needed; there were none.
- Negative test: a deliberately broken link added to `index.mdx` produced "Found 1 invalid link in 1 file" and failed the build. The validator demonstrably fails rather than silently passing. Test file reverted.
- CI already runs `npm run build`, so link validation now gates every pull request without a workflow change.

This means the heavy cross-linking in Phase 2 is verified from the moment it lands.

## 5. Skill to Evidence Map

Every cell is per-student and observed or structural. No cell requires agentic tooling (P2, P4).

| Skill | Primary graded evidence | Secondary | Teaching |
|---|---|---|---|
| Critical thinking | Defense Judgment + Technical depth (40 pts x 3 terms); RFC options, tradeoff, and recommendation criteria | Hard-to-reverse RFC trigger forces triage before writing | `creative.mdx`, `design.mdx`, `ai.mdx` pillar 1 |
| AI literacy | Defense Ownership, tagged `SO2, SO4` (20 pts x 3 terms); RFC delegation-and-validation criterion (10 pts x 2 terms) | Repo checkpoint safety-net item (team level) | `ai.mdx` all three pillars; revised `generative-ai.mdx` section plus its automation index; accessibility in three forms; workshop decks |
| Leadership | Defense Role criterion, leadership anchor (x 3 terms), checked against the sprint-note chaired-decision record | Charter rotation commitment; peer evaluation as corroboration | `teamwork.mdx`, `conflict.mdx` (performance conversations, Situation-Behavior-Impact) |
| Collaboration | Defense Role criterion, collaboration anchor (x 3 terms); PR-per-sprint ownership; sprint-note attribution lines | Peer evaluation (untouched); partner Teamwork facet | `teamwork.mdx`, `conflict.mdx` |

## 6. Explicitly Out of Scope

- **Peer evaluation instrument and R pipeline.** See 3.4.
- **A new outcome namespace.** The drivers are partner feedback and AI pace, not an accreditation mandate, so no C-series outcomes, no new validator coverage floor. The four skills are assessed through existing SO tags.
- **A new dedicated AI-literacy instrument** (for example, a practicum handing students a defective AI-generated diff to find). Considered and rejected: a hand-authored defect exercise is precisely the artifact that goes stale under the AI-pace driver, and at roughly 7 hours per TA per term plus annual content authoring it is the most expensive option in both scarce currencies.
- **Rewriting the 105 activity exercises.** Tier tags and pointers only.
- **`mapping.mdx` L09 drift.** The mapping still claims L09 is satisfied because "combined polished output exceeds 2,000 words per student", which contradicts the single-document 2,000-word floor on the winter RFC (`rfc.mdx:71`). A real accreditation inconsistency and a separate fix; folding it in would muddy this spec.
- **Pre-existing broken internal links.** Anticipated as a risk of §4.8; the validator found none, so there is nothing to fix.

## 7. Cost

TA hours delta: approximately zero.

| Change | TA hours | Authoring |
|---|---|---|
| Defense re-anchoring | 0 (rewording; calibration hour already budgeted) | Low |
| RFC criterion rewrite and trigger tightening | 0 (same criterion, same points) | Low |
| Rotation enforcement | 0 (sprint-note line already exists) | Low |
| Trigger layer | 0 net (feeds the existing modifier decision) | Low |
| Repo checkpoint safety-net item | Negligible (one checklist line) | Low |
| Defense `SO4` dual-tag | 0 | Trivial (frontmatter plus one tag cell) |
| `ai.mdx` | 0 | One new page |
| `testing-strategy.mdx` accessibility, three forms | 0 | **Largest single authoring item**: three new subsections, tooling table, WCAG reference |
| Accessibility activity cluster | 0 | Moderate: entries in `design.mdx`, `user.mdx`, cross-link in `communication.mdx` |
| Gen-AI automation index (§4.3) | 0 | Moderate: nine indexed entries, each needing its target section to exist first |
| Tiering and prerequisite routing | 0 | Frontmatter plus pointer edits across ~20 pages |
| Workshop decks | 0 | **Net reduction**: closes an already-owed open item with existing content |

The per-TA ledger in `STAFF-RUNBOOK.md` (~64 h fall and winter, ~60 spring at 6 TAs) is unaffected. That is by design: the binding constraints were defense minutes and TA hours, and the whole design routes through re-anchoring rather than addition.

## 8. Validation

1. `node scripts/validate-outcomes.mjs`: must pass with zero frontmatter/rubric drift across every edited page. Specifically check that SO4 rises from 5 to 8 individual data points (RFC 4, defense 3 new, career retrospective 1) and that at least 3 are non-RFC, which is the condition `IMPLEMENTED.md` open item 1 asks for. Record the actual printed counts in the implementation notes rather than trusting this arithmetic.
2. `npm run build`: astro check plus internal link validation, which §4.8 enabled and verified. Must pass with the new `ai.mdx` and all new cross-references.
3. Canvas TSV point totals must match the handbook rubric tables exactly for defense, RFC, and repo checkpoint.
4. Manual: confirm the defense scoresheet anchors state P3 explicitly, and that no rubric criterion anywhere names a specific AI tool or a specific accessibility tool (P1).
5. Manual: every entry in the 4.3 automation index resolves to a section that actually exists and owns its topic, with no duplicated content. `starlight-links-validator` catches broken links at build time but not restatement.
6. Manual: accessibility appears in all three forms (automated, manual, user-based), not collapsed into a tooling mention.

## 9. Open Decisions

1. **Which ~6 activities are promoted to Workshop tier**, and which ~20 to Recommended. Requires an instructor pass over the 105.
2. **Whether the extra-credit subset is removed entirely or kept as a formality.** The design works either way; removal is simpler.
3. **Student tool access specifics.** The design does not depend on this (P2, P4), but the workshop's live exercises do. Worth confirming what the cohort actually has before the deck is built.
4. **Whether the hard-to-reverse RFC trigger needs a per-category fallback** (a FOSS team's one-way doors differ from a research team's). Possibly a line in `guides/shipping.mdx` per category.

## 10. Implementation Phases

**Phase 1, assessment layer.** Sections 3.1 through 3.6. Self-contained, validator-checkable, and the phase that must land before fall. Touches `defense.mdx`, `rfc.mdx`, `sprint-notes.mdx`, `team-charter.mdx`, `repo-checkpoints.mdx`, `learning-objectives/mapping.mdx`, the defense scoresheet, `public/rfc-template.md`, `public/sprint-note-template.md`, three Canvas TSVs, and `STAFF-RUNBOOK.md`.

**Phase 2, instruction layer.** Sections 4.1 through 4.8. Depends on Phase 1's final criterion wording so the activity pointers name real criteria.

Ordering inside the phase matters, because 4.3's index links to material that 4.2 creates:

1. `testing-strategy.mdx` accessibility subsections (forms 1 and 2 under Verification, form 3 under Usability Testing) plus tooling-table additions and the WCAG 2.2 AA reference.
2. New `activities/ai.mdx` (three pillars, caveat pattern per exercise).
3. Accessibility activity cluster: `design.mdx`, `user.mdx`, `communication.mdx` cross-link.
4. `generative-ai.mdx`: revise the "Verify, do not trust" section, then add the automation index (needs 1 through 3 to exist so the links resolve).
5. Tier tags and prerequisite routing across all 10 activity pages, `activities/introduction.mdx`, and the graded assignment pages.
6. Workshop decks.

(§4.8's link validator is already enabled, so every step above is link-checked as it lands.)

**Phase 3, propagation.** Section 11. Runs last, once criterion wording is final. Do not start it early: every satellite quotes text that Phases 1 and 2 are still changing.

## 11. Propagation Inventory

Every file below was found by grepping the load-bearing strings this design changes. The primary edits are in sections 3 and 4; these are the satellites that quote, mirror, or count them, and that go stale silently because nothing validates them. Line numbers are as of 2026-08-17 and will drift.

### 11.1 The RFC criterion rename (AI disclosure to delegation and validation)

| File | What to change |
|---|---|
| `src/content/docs/assignments/rfc.mdx:50` | "What the RFC Must Contain" item 6 still says "AI disclosure: which tools you used" |
| `src/content/docs/assignments/rfc.mdx:61` | Rubric row (the primary edit) |
| `canvas/assignments/rfc/rfc-rubric-details.tsv:6` | Criterion label plus all three band descriptions, which are written entirely around disclosure |
| `public/rfc-template.md:50` | `## AI Disclosure` section heading and its prompt |
| `src/content/docs/assignments/introduction.mdx:96` | **Course-wide AI Policy rule 2, "Disclose and verify."** This is the highest-leverage satellite: it states the old philosophy for every assignment, not just the RFC |
| `src/content/docs/learning-objectives/mapping.mdx:21` | SO4 row names "AI disclosure criterion" |
| `IDEAS.md:205` | The "AI disclosure appendix on major deliverables" recommendation |
| `IDEAS.md:257` | SO4 row of the outcome map |

### 11.2 The defense SO4 dual-tag and re-anchoring

| File | What to change |
|---|---|
| `src/content/docs/assignments/defense.mdx:22` | "what did the AI get wrong along the way and how did you catch it" |
| `src/content/docs/assignments/defense.mdx` frontmatter | Add `SO4: 1` |
| `src/content/docs/assignments/defense.mdx` rubric | Ownership row tag becomes `SO2, SO4`; all five anchors re-worded |
| `public/defense-scoresheet.md` | Anchors, plus the P3 "score triage not outcome" instruction |
| `canvas/assignments/defense/` TSV | Criterion labels, tags, and band descriptions; zero band preserved |
| `src/content/docs/learning-objectives/mapping.mdx:21` | SO4 row gains the defense; **delete the "Known concentration: 4 of 5 in-capstone points come from the RFC" sentence**, which the dual-tag makes false |
| `IMPLEMENTED.md:55` and `:208` | Validator output is quoted twice as `SO4: 5`; becomes 8 |
| `IMPLEMENTED.md:169` | "Known concern documented, not yet resolved: SO4's in-capstone evidence is concentrated in the RFC" |
| `IMPLEMENTED.md:199` | Open item 1; **closes** |
| `IDEAS.md:194` | Defense description quoting the old AI question |
| `IDEAS.md:266` | "Three defense rounds a year give every SO **except SO4** a live, staff-observed data point" becomes false |
| `STAFF-RUNBOOK.md` | Defense Logistics and the calibration-hour instruction |

### 11.3 Activities tiering and prerequisite routing

| File | What to change |
|---|---|
| `src/content/docs/activities/introduction.mdx:3` | Frontmatter description ("optional, well-crafted exercises") |
| `src/content/docs/activities/introduction.mdx:8` | "None of them are graded" and the practice-library framing |
| `src/content/docs/activities/introduction.mdx:29` | The extra-credit paragraph |
| All 10 themed activity pages | Tier tags plus criterion pointers |
| Each graded assignment page | Prerequisite line naming its activities |
| `README.md:28` | "activities repositioned as a practice library" |
| `IDEAS.md:273` | The "keep a small curated subset as low-stakes extra credit" recommendation |
| `src/content/docs/guides/introduction.mdx` | Maps guides to the assignments they feed; gains the accessibility and AI material |
| `canvas/syllabus/cs463.html` | References activities six times (cs461 and cs462 reference them once each) |

### 11.4 The AI policy stance change

All three syllabi carry an **AI Policy** section (`canvas/syllabus/cs461.html`, `cs462.html`, `cs463.html`, two matches each). If the course-wide policy in `assignments/introduction.mdx:96` changes from "disclose and verify" to the delegation-and-net framing, all three must follow or Canvas will contradict the handbook. `canvas/assignments/assignment-readme.md` carries the source-of-truth statement and the full week-by-week schedule, so it is the natural place to record the change.

### 11.5 Deliberately unaffected

Recording these so implementation does not waste effort on them:

- **`astro.config.mjs` sidebar.** The Activities group uses `autogenerate: { directory: 'activities' }`, so `ai.mdx` appears with no config change. (The file does need the §4.8 link-validator edit.)
- **`scripts/validate-outcomes.mjs`.** The counting logic already handles multi-tag criteria and multi-term multiplication correctly. No script change; only its output numbers move.
- **`canvas/assignments/` deprecated directories** (`memo`, `research-brief`, `progress-report`, `adr-code-review`, `requirements-update`, `technical-design-update`, `setup`, `retrospective-and-career`). Removed 2026-09-13 per #30 (decided 2026-09-11), together with every `*-assignment.html` and `*-rubrics.md`; the readme's deprecation table and git history record them. The Canvas import package spec §6 says the same.
- **Package-manager references.** `README.md` and `IMPLEMENTED.md` already use `npm` and `npx` correctly; the `pnpm` strings remaining in `IMPLEMENTED.md:103-108` are historical narrative describing the migration and are accurate as written.

### 11.6 Closing check

After propagation, re-grep the load-bearing strings to confirm none survive outside historical narrative:

```
grep -rn -i "ai disclosure\|verify, do not trust\|get wrong\|extra credit\|currently faces" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git .
```

Expected survivors: `IDEAS.md` passages that are explicitly framed as the original July 2026 rationale, and this spec. Everything else should be updated.
