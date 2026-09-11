# Four-Skills Assessment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make critical thinking, AI literacy, leadership, and collaboration explicitly assessable in the CS capstone series, and give the instruction layer the AI and accessibility material it currently lacks.

**Architecture:** Re-anchor existing instruments rather than adding new ones. The defense's five 20-point criteria already approximate the four skills, so they get re-worded, not extended, because its 6-minutes-per-student budget is the binding constraint on the whole course. The RFC's AI-disclosure self-report becomes a delegation-and-validation criterion. The instruction layer then teaches what those criteria grade.

**Tech Stack:** Astro 7.2.2, Starlight 0.41.7, MDX content collections, `scripts/validate-outcomes.mjs` (custom Node validator), `starlight-links-validator` 0.25.3, npm, lefthook pre-commit, GitHub Actions CI.

**Spec:** `docs/superpowers/specs/2026-08-17-four-skills-assessment-design.md`

## Status

**Phase 1 complete, 2026-08-17.** Validator: SO4 5 to 8, zero drift, all other outcomes unchanged. Build: 66 pages, all internal links valid.

| Task | Commit |
|---|---|
| 1. Defense re-anchoring and SO4 dual-tag | `c0ce51c` |
| 2. Scoresheet and Canvas TSV | `50c357c` |
| 3. RFC criterion and hard-to-reverse trigger | `8051065` |
| 4. Course-wide AI policy | `2c2276c` |
| 5. Leadership rotation record | `273dc26` |
| 6. Repo checkpoint safety net and modifier trigger | `287dfd2` |
| 7. Outcome mapping | `04bf051` |

Deviation from plan in Task 6: the checkpoint rubric was already at 100 points across five criteria, so the safety net extended the existing **Build health** criterion rather than adding a sixth and redistributing points. Same SO6 tag, same total, no validator movement. The spec's intent (assess net-versus-delegation fit at team level) is met.

**Phase 2 partially complete, 2026-08-17.** Build: 67 pages, all internal links valid.

| Task | Commit |
|---|---|
| 8. Accessibility in three forms | `83aa01c` |
| 9. New `activities/ai.mdx` | `26aac96` |
| 10. Accessibility activity cluster | `039fee8` |
| 11. Gen-AI reframe and automation index | `a75dc2b` |

Task 9 note: the page's YAML `description` needed quoting because it contains a colon. Worth remembering for any new content page.

| 12. Activity tiering | `e1e9037` |
| 13. Prerequisite routing | `015837b` |

Tiering decision recorded separately in `2026-08-17-activity-tiering.md` (`1dce0e3`), which corrected this plan's cap logic: recommendations are now sized to how many times each assignment runs.

**Phase 3 complete, 2026-08-17.**

| Task | Commit |
|---|---|
| 14. Root docs propagation | `758e024` |
| 15. Canvas mirror and syllabi | `f7f87d7` |

**All 15 tasks complete, 2026-08-19; see `IMPLEMENTED.md` §10.** The per-task step lists below were checklists while the work ran and are kept as the record of what each task did, not as open work; the checkboxes were removed on 2026-09-11 because ninety unchecked boxes under a "complete" status read as ninety open items. Final state: validator passes with SO4 at 8 and zero drift; build passes 67 pages with all internal links valid; all three edited Canvas TSVs total 100 with field counts intact; closing grep finds no stale stance wording in `src/`, `canvas/`, or `public/`.

Deferred by instructor decision, not oversight:

1. `career.mdx` excluded from both promoted tiers pending its own review pass, leaving the Career Retrospective's resume and PR-portfolio criteria without a promoted activity.
2. Workshop decks (spec §4.6) are still unbuilt. The six workshop activities and their timing are now decided, which was the blocker.
3. ~~Whether the six workshop Canvas items should carry weight instead of being zero-point. Recommendation on record: keep them at zero.~~ Superseded by the tiering decision (`2026-08-17-activity-tiering.md`): workshop items carry 2% in fall, 1% in winter, 1% in spring, graded complete/incomplete.

## Global Constraints

- **Package manager is npm.** `npm run build`, `npx <tool>`. Never `pnpm` or `bun`; the lockfile is `package-lock.json` and Dependabot reads it.
- **Never name a specific AI tool or accessibility tool in a rubric criterion** (spec P1). Tool names live in guides and activity pages only.
- **Score the triage decision, not the outcome** (spec P3). Every anchor that touches delegation must say this explicitly.
- **The graded standard is capability-relative** (spec P2). No criterion may require agentic tooling to satisfy.
- **New behavioral signals feed the single existing individual contribution modifier** (spec P5). Never create a new deduction channel.
- **Canvas TSV point values must match the handbook rubric tables exactly.** TSV format is tab-separated: `label\t\ttrue\t<pts>\tExceeds Expectations\t<desc>\t<pts>\tMeets Expectations\t<desc>\t<pts>\tDoes Not Meet Expectations\t<desc>\t0\tMissing\t<desc>`.
- **The validator is the test.** `node scripts/validate-outcomes.mjs` parses rubric tables as source of truth and fails on any frontmatter/rubric drift. It counts `items x terms` for `level: individual` pages only; `level: team` pages contribute zero data points.
- **Baseline validator output before any change:** SO1: 7, SO2: 6, SO3: 10, SO4: 5, SO5: 9, SO6: 5, L07: 2, L08: 2, L09: 2, L10: 2.
- **Prose style:** no em dashes (use commas, colons, or full stops). Match the surrounding handbook voice: direct, second person, concrete.
- **Line numbers in this plan are pre-edit references, captured 2026-08-17.** They shift as soon as a task edits a file. Always locate the target by the quoted text, never by the line number alone.

---

# Phase 1: Assessment Layer

Must land before fall term. Self-contained and validator-checkable.

### Task 1: Defense re-anchoring and SO4 dual-tag

This is the highest-value task in the plan. The `SO4` dual-tag closes `IMPLEMENTED.md` open item 1 (the documented accreditor concern that 4 of 5 in-capstone SO4 points sit on the RFC) at zero cost.

**Files:**
- Modify: `src/content/docs/assignments/defense.mdx` (frontmatter lines 10-16, prose line 22, rubric table lines 34-40)
- Test: `node scripts/validate-outcomes.mjs`

**Interfaces:**
- Produces: defense rubric criterion names used by Task 2's scoresheet and TSV. Exact names: `Ownership and delegation`, `Judgment`, `Technical depth`, `Role and team accountability`, `Communication`.
- Produces: `SO4: 8` total, consumed by Task 7's mapping page.

- **Step 1: Write the failing test.** Add `SO4: 1` to the frontmatter outcomes block only, leaving the rubric table untouched. The frontmatter becomes:

```yaml
  outcomes:
    SO1: 1
    SO2: 1
    SO3: 1
    SO4: 1
    SO5: 1
    SO6: 1
```

- **Step 2: Run the validator to verify it fails**

Run: `node scripts/validate-outcomes.mjs`
Expected: FAIL, exit 1, with `DRIFT defense.mdx: outcome SO4 declared 1 in frontmatter but tagged on 0 rubric criteria.`

This confirms the validator is actually reconciling frontmatter against rubric tables rather than trusting the frontmatter.

- **Step 3: Re-anchor the rubric table.** Replace the whole table (currently lines 34-40) with:

```markdown
| Criterion | Points | Outcome |
|---|---|---|
| Ownership and delegation: presents work they demonstrably own, and explains what they handed to AI tools, what safety net made that reasonable, and where they stopped to validate | 20 | SO2, SO4 |
| Judgment: explains why this approach, what credible alternatives were rejected, and which parts of the decision were hard to reverse | 20 | SO1 |
| Technical depth: answers "what breaks if X" with correct, specific reasoning about the system's behavior and limits | 20 | SO6 |
| Role and team accountability: articulates what their named role or comparable ownership area required this term, how the team's decisions actually got made, and how work was distributed | 20 | SO5 |
| Communication: clear, honest, right level of detail for the audience, handles not-knowing gracefully | 20 | SO3 |
```

Note the last cell of row 1 is `SO2, SO4`. The validator splits the final cell on commas and requires every part to match `/^(SO[1-6]|L(07|08|09|10))$/`, so the spacing must be exactly `SO2, SO4`.

- **Step 4: Run the validator to verify it passes**

Run: `node scripts/validate-outcomes.mjs`
Expected: PASS. `SO4: 8` with sources `career-retrospective.mdx (1 item(s) x 1 term(s))`, `defense.mdx (1 item(s) x 3 term(s))`, `rfc.mdx (2 item(s) x 2 term(s))`. All other outcomes unchanged from baseline.

- **Step 5: Reframe the prose question.** In `defense.mdx` line 22, replace:

> what did the AI get wrong along the way and how did you catch it.

with:

> where did you decide to stop and check the work yourself, and why there.

Rationale: the original assumes line-by-line review of AI output, which is the practice this design explicitly rejects. Do not add a question; this is a substitution.

- **Step 6: Add the delegation framing paragraph.** After line 26 (the paragraph ending "your project partner will expect the same of you in every meeting."), add:

```markdown
Delegating work to AI tools is expected and is not penalized. What is assessed is the fit between how far you delegated and how strong a safety net you built: a student who let an agent drive a database migration unchecked and got lucky scores badly, and a student who stopped to validate an authentication change scores well even if some feature code has bugs. Students working with less capable tools or tighter budgets are not disadvantaged, because a weaker tool simply means tighter gates and more validation of your own, which this criterion rewards.
```

- **Step 7: Build**

Run: `npm run build`
Expected: PASS, 66 pages, "All internal links are valid."

- **Step 8: Commit**

```bash
git add src/content/docs/assignments/defense.mdx
git commit -m "Re-anchor defense criteria to the four skills; dual-tag Ownership SO2,SO4

Closes the SO4 concentration concern (IMPLEMENTED.md open item 1) by
adding three non-RFC individual SO4 data points, one per term.
Validator: SO4 5 -> 8."
```

---

### Task 2: Defense scoresheet and Canvas rubric TSV

The scoresheet is the live grading instrument and the TSV is what Canvas imports. Both must match Task 1's wording or graders will score against stale anchors.

**Files:**
- Modify: `public/defense-scoresheet.md`
- Modify: `canvas/assignments/defense/defense-rubric-details.tsv`
- Test: `npm run build`, plus manual TSV column count

**Interfaces:**
- Consumes: criterion names and tags from Task 1.

- **Step 1: Read both files in full** so the existing structure (behavioral anchors, per-student timebox, artifact/PR line, repo-check field, assessor-split and dominance-redirect rules) is preserved rather than overwritten.

Run: `cat public/defense-scoresheet.md; cat canvas/assignments/defense/defense-rubric-details.tsv`

- **Step 2: Update the TSV row 1** (Ownership). Change the label from `Ownership: work they demonstrably own [SO2]` to `Ownership and delegation [SO2, SO4]` and rewrite the four band descriptions:

- Exceeds (20): `Presents work they demonstrably own end to end; claims match the repo record when spot-checked. Explains what was handed to AI tools, the safety net that made that reasonable (tests, CI, review gates, staging, rollback), and the specific points where they stopped to validate, with a defensible reason for choosing those points.`
- Meets (16): `Ownership is credible and some delegation reasoning is present, but the account of the safety net or of where they validated is thin or partly reconstructed after the fact.`
- Does Not Meet (4): `Cannot credibly demonstrate ownership, or describes delegating work with no safety net and no validation points, or claims contradict the repo record.`
- Missing (0): keep the existing wording verbatim.

- **Step 3: Update the TSV row 3** (Technical depth). Its Exceeds band currently ends with `including what the AI got wrong along the way and how they caught it`. Replace that clause with `including where they chose to verify the system's behavior themselves rather than rely on generated output`. Leave the rest of the row alone.

- **Step 4: Update TSV rows 2 and 4** to match Task 1's criterion wording (Judgment gains "which parts of the decision were hard to reverse"; Role gains "and how work was distributed"). Adjust only the label and the Exceeds/Meets descriptions; leave points and the Missing band untouched.

- **Step 5: Verify TSV structural integrity**

Run: `awk -F'\t' '{print NR": "NF" fields"}' canvas/assignments/defense/defense-rubric-details.tsv`
Expected: 5 rows, every row the same field count as before the edit. A changed field count means a tab was lost and Canvas will reject the import.

- **Step 6: Verify point totals**

Run: `awk -F'\t' '{s+=$4} END {print "total: " s}' canvas/assignments/defense/defense-rubric-details.tsv`
Expected: `total: 100`, matching the handbook rubric table.

- **Step 7: Update the scoresheet anchors** to mirror the five criteria, and add this line to the scoresheet's grading-instructions section:

```markdown
**Score the decision, not the luck.** A student who delegated a hard-to-reverse change (schema, auth, deployment, migration) with no safety net scores low on Ownership and Delegation even if nothing broke. A student who stopped and validated at the right point scores high even if some reversible feature code has bugs.
```

- **Step 8: Build and commit**

```bash
npm run build
git add public/defense-scoresheet.md canvas/assignments/defense/defense-rubric-details.tsv
git commit -m "Sync defense scoresheet and Canvas TSV to re-anchored criteria"
```

---

### Task 3: RFC criterion rewrite and hard-to-reverse trigger

**Files:**
- Modify: `src/content/docs/assignments/rfc.mdx` (line 23 trigger, line 50 contents item 6, line 61 rubric row)
- Modify: `canvas/assignments/rfc/rfc-rubric-details.tsv` (line 6)
- Modify: `public/rfc-template.md` (line 50, the `## AI Disclosure` section)
- Test: `node scripts/validate-outcomes.mjs`, `npm run build`

**Interfaces:**
- Consumes: nothing.
- Produces: criterion name `Delegation and validation`, used by Task 4's policy wording and Task 7's mapping row. `rfc.mdx` frontmatter `SO4: 2` is unchanged, because the criterion count does not change.

- **Step 1: Rewrite the rubric row.** Replace line 61:

```markdown
| AI disclosure: tools, purposes, and verification performed | 10 | SO4 |
```

with:

```markdown
| Delegation and validation: what you handed to AI tools, the safety net that made that reasonable, and the points where you validated yourself | 10 | SO4 |
```

Points stay at 10 and the tag stays `SO4`, so the validator output must not move. The SO4 fit improves: deciding where professional responsibility requires your own attention is squarely "recognize professional responsibilities and make informed judgments in computing practice."

- **Step 2: Run the validator**

Run: `node scripts/validate-outcomes.mjs`
Expected: PASS with `SO4: 8` (unchanged from Task 1). If SO4 moved, the criterion count changed by accident; revert and recount.

- **Step 3: Rewrite "What the RFC Must Contain" item 6.** Replace line 50:

```markdown
6. **AI disclosure**: which tools you used, for what, and what verification you performed on their output.
```

with:

```markdown
6. **Delegation and validation**: what you handed to AI tools on this decision, what safety net made that reasonable (tests, CI, review gates, staging, a rollback path), and the specific points where you stopped and validated the result yourself. What is assessed is the fit between how far you delegated and how strong your net is, not how sophisticated your tooling is.
```

- **Step 4: Tighten the RFC trigger.** In line 23, replace `about a **real decision your team currently faces**` with `about a **real decision your team currently faces that is hard to reverse**`, and add this admonition immediately after the paragraph:

```markdown
:::note[What counts as hard to reverse]
Architecture, database schema, authentication and authorization, deployment topology, data migrations, licensing, and third-party commitments are typically one-way doors: undoing them later costs far more than getting them right now. Most feature code is a two-way door. Choosing which of your team's live decisions is genuinely hard to reverse is itself part of the exercise.

If no hard-to-reverse decision is live in your four-week window, write the RFC on the most consequential reversible decision you face, and say in the problem framing why it is reversible and what would make it not. Do not invent a one-way door you are not actually facing.
:::
```

- **Step 5: Rewrite the Canvas TSV row 6.** Change the label from `AI disclosure: tools, purposes, verification [SO4]` to `Delegation and validation [SO4]` and rewrite the bands:

- Exceeds (10): `States what was handed to AI tools on this decision, the safety net that made that reasonable, and the specific points where the author validated the result themselves, with a defensible reason for choosing those points. Credible and specific to this project.`
- Meets (8): `Delegation and validation are described but the safety net is vague, or the validation points are asserted without reasons.`
- Does Not Meet (2): `Not addressed, or describes delegating a hard-to-reverse decision with no net and no validation.`

- **Step 6: Verify TSV integrity**

Run: `awk -F'\t' '{print NR": "NF" fields"}' canvas/assignments/rfc/rfc-rubric-details.tsv; awk -F'\t' '{s+=$4} END {print "total: " s}' canvas/assignments/rfc/rfc-rubric-details.tsv`
Expected: field count unchanged per row; `total: 100`.

- **Step 7: Rewrite the template section.** In `public/rfc-template.md`, rename the `## AI Disclosure` heading to `## Delegation and Validation` and replace its prompt with three bullets: what you handed to AI tools on this decision; what safety net made that reasonable; the specific points where you stopped and validated yourself, and why those points.

- **Step 8: Build and commit**

```bash
npm run build
git add src/content/docs/assignments/rfc.mdx canvas/assignments/rfc/rfc-rubric-details.tsv public/rfc-template.md
git commit -m "Replace RFC AI-disclosure criterion with delegation and validation

Disclosure is a compliance instrument and cannot measure skill: a
student who used AI well and one who used it recklessly write the
same paragraph. Also tightens the RFC trigger to hard-to-reverse
decisions so topic choice is itself a triage exercise."
```

---

### Task 4: Course-wide AI policy

The highest-leverage satellite in the whole design. `assignments/introduction.mdx` states the AI policy for every assignment, so leaving it on "disclose and verify" would contradict every criterion changed in Tasks 1 and 3.

**Files:**
- Modify: `src/content/docs/assignments/introduction.mdx` (the AI Policy section, rule 2 at line 96)
- Test: `npm run build`

- **Step 1: Replace rule 2.** Currently:

```markdown
2. **Disclose and verify.** Major deliverables include a short AI disclosure: which tools, for what, and, most importantly, **what verification you performed**. Verification quality is graded; usage is not penalized.
```

Replace with:

```markdown
2. **Delegate deliberately, and build the net that makes it reasonable.** Major deliverables ask what you handed to AI tools, what safety net made that reasonable (tests, CI, review gates, staging, a rollback path), and where you stopped to validate the result yourself. Validate hard at decisions that are hard to reverse: architecture, database schema, authentication, deployment, data migrations, licensing. Delegate freely where your net catches mistakes cheaply. What is graded is the fit between how far you delegated and how strong your net is, never how sophisticated your tooling is, so a weaker model or a tighter budget is not a disadvantage: it simply means tighter gates and more validation of your own.
```

- **Step 2: Build and commit**

```bash
npm run build
git add src/content/docs/assignments/introduction.mdx
git commit -m "Restate the course-wide AI policy as delegation and net, not disclosure"
```

---

### Task 5: Leadership rotation record

Gives the defense's Role criterion a record to check against instead of accepting self-narration.

**Files:**
- Modify: `src/content/docs/assignments/sprint-notes.mdx` (item 4 of the sprint note)
- Modify: `public/sprint-note-template.md`
- Modify: `src/content/docs/assignments/team-charter.mdx` (rotation commitment)
- Test: `node scripts/validate-outcomes.mjs`, `npm run build`

**Interfaces:**
- Produces: the chaired-decision record that Task 1's Role criterion checks against.
- Note: `sprint-notes.mdx` is `level: team` with **no** `outcomes:` block, so nothing here moves the validator. Do not add outcome tags to it; its outcome over-claim was deliberately removed in an earlier review.

- **Step 1: Extend sprint note item 4.** Replace:

```markdown
4. **Contribution lines**: one line per student listing the reviewed PR(s) they owned this sprint (titles or IDs; Track B teams list IDs only).
```

with:

```markdown
4. **Contribution lines**: one line per student listing the reviewed PR(s) they owned this sprint (titles or IDs; Track B teams list IDs only), and, for the student who chaired a decision this sprint, which decision they drove to a conclusion. Over a term every student should appear as the decision chair at least once; this is the record your [defense](/assignments/defense/) role criterion is checked against.
```

- **Step 2: Mirror it in the template.** Add a `Decision chaired this sprint:` field to the contribution-lines block of `public/sprint-note-template.md`.

- **Step 3: Add the rotation commitment to the charter.** In `team-charter.mdx`, in the named-roles section, add: teams commit to a rotation such that every student chairs at least one decision per term and holds a named role or comparable ownership area at least once across the year.

- **Step 4: Verify no validator movement**

Run: `node scripts/validate-outcomes.mjs`
Expected: PASS, identical to Task 3's output. Any change means an outcome tag was added to a rubric table by accident.

- **Step 5: Build and commit**

```bash
npm run build
git add src/content/docs/assignments/sprint-notes.mdx public/sprint-note-template.md src/content/docs/assignments/team-charter.mdx
git commit -m "Record chaired decisions in sprint notes so the defense role criterion has evidence"
```

---

### Task 6: Repo checkpoint safety net and trigger inputs

**Files:**
- Modify: `src/content/docs/assignments/repo-checkpoints.mdx`
- Modify: `canvas/assignments/repo-checkpoint/` rubric TSV
- Modify: `STAFF-RUNBOOK.md` (Defense Logistics, Individual Contribution Modifier)
- Test: `node scripts/validate-outcomes.mjs`, `npm run build`

**Interfaces:**
- Consumes: Task 1's defense criteria, referenced as a modifier trigger.

- **Step 1: Read the checkpoint page and its TSV** so the new item matches the existing checklist voice and the "How Graders Review" anchors.

- **Step 2: Add one checklist item** assessing the team's safety net: CI configured and passing, test layers present, protected paths gated by review, a staging or preview environment, and a documented rollback path. Grade the presence and fitness of the net at team level, not individuals. Track B teams cover it in the existing 15-minute walkthrough in the existing fixed order.

- **Step 3: Keep the criterion team-level.** Do not add an individual-level outcome tag. Per spec §3.6 and `mapping.mdx` rule 1 this is corroboration, and the existing decision that the checkpoint criterion grades infrastructure rather than individuals must hold.

- **Step 4: Update the TSV** with matching bands, verifying field count and point total as in Task 2 Steps 5 and 6.

- **Step 5: Add the defense signal to the runbook's modifier section.** In `STAFF-RUNBOOK.md` under Individual Contribution Modifier, add a low Ownership or Role score at defense to the existing trigger list. State explicitly:

```markdown
These signals are inputs to the single modifier decision, not separate deductions. A student is never penalized twice for the same behavior; the declared precedence order across the modifier, the partner facet, and the checkpoint criterion is unchanged.
```

- **Step 6: Update the runbook's Defense Logistics** to note that the calibration hour now covers the re-anchored delegation criterion, and that graders score the triage decision rather than whether the code turned out fine.

- **Step 7: Validate, build, commit**

```bash
node scripts/validate-outcomes.mjs
npm run build
git add src/content/docs/assignments/repo-checkpoints.mdx canvas/assignments/repo-checkpoint/ STAFF-RUNBOOK.md
git commit -m "Assess the team safety net at repo checkpoints; add defense signal to the modifier"
```

---

### Task 7: Outcome mapping page

The mapping page is hand-maintained against the validator and does not update itself.

**Files:**
- Modify: `src/content/docs/learning-objectives/mapping.mdx` (SO4 row line 21, SO2 row, L07 note)
- Test: `npm run build`

**Interfaces:**
- Consumes: `SO4: 8` from Task 1, criterion names from Tasks 1 and 3.

- **Step 1: Rewrite the SO4 row.** Replace the whole cell with:

```markdown
Ethics course (CS 391, program-level data point); RFC fall and winter: constraints criterion + delegation-and-validation criterion (4); [Defense](/assignments/defense/) each term: ownership-and-delegation criterion (3); Career Retrospective: responsible practice criterion (1)
```

- **Step 2: Delete the concentration sentence.** Remove `Known concentration: 4 of 5 in-capstone points come from the RFC; diversifying is on the roadmap`. The dual-tag makes it false: SO4 is now 8 points, 4 of them non-RFC.

- **Step 3: Update the SO2 row** to name the ownership criterion by its new name.

- **Step 4: Add an L07 accuracy note** under the WIC table, because this is a live accreditation trap:

```markdown
L07's individual coverage comes entirely from the RFC (one criterion, two terms). The term retrospective also carries an `L07` tag, but it is a team-level assignment, so the validator counts it as corroboration and it contributes no individual data points. Removing the RFC's peer-feedback criterion would drop L07 to zero and fail CI.
```

- **Step 5: Verify the page matches the validator**

Run: `node scripts/validate-outcomes.mjs`
Expected: `SO4: 8`. Cross-read the printed sources against the SO4 row cell; they must agree item for item.

- **Step 6: Build and commit**

```bash
npm run build
git add src/content/docs/learning-objectives/mapping.mdx
git commit -m "Update outcome mapping for SO4 dual-tag; record the L07 team-level trap"
```

---

# Phase 2: Instruction Layer

Depends on Phase 1's final criterion wording so activity pointers name real criteria. Order matters: the automation index in Task 11 links to material Tasks 8 through 10 create.

### Task 8: Accessibility testing in three forms

**Files:**
- Modify: `src/content/docs/guides/testing-strategy.mdx` (add subsections under Verification, under Manual and Exploratory Testing, and under Usability Testing; extend the tooling table)
- Test: `npm run build`

**Interfaces:**
- Produces: anchor targets `#automated-accessibility-testing`, `#manual-accessibility-testing`, `#testing-with-assistive-technology-users`, consumed by Tasks 10 and 11.

- **Step 1: Add "Automated Accessibility Testing" under Verification.** Content: axe-core in the test suite and in CI; Lighthouse or pa11y for page-level budgets; lint-level checks such as `eslint-plugin-jsx-a11y` that catch violations before a browser is involved. Frame it as a CI gate rather than a pre-release scramble. Name **WCAG 2.2 AA** as the reference standard so students have a target instead of a vibe.

- **Step 2: Add "Manual Accessibility Testing" under Manual and Exploratory Testing.** Content: keyboard-only navigation of the critical flow; a screen reader pass (VoiceOver on macOS, NVDA on Windows, Orca on Linux); zoom to 200%; contrast checks. State the teachable point plainly: a large share of real accessibility defects are invisible to automated tools, because focus order, meaningful labels, and whether a flow is completable without a mouse are judgment calls.

- **Step 3: Add "Testing with Assistive Technology Users" under Usability Testing.** Content: where feasible run a session with someone who uses assistive technology daily; where not feasible, the substitute is a task-based session under simulated constraint (keyboard only, screen reader on), with the caveat stated in the writeup that simulation is not lived use.

- **Step 4: Extend the tooling table** with an accessibility row naming axe-core, Lighthouse, pa11y, and the relevant lint plugin.

- **Step 5: Build and commit**

```bash
npm run build
git add src/content/docs/guides/testing-strategy.mdx
git commit -m "Add accessibility testing to the testing guide in three forms"
```

---

### Task 9: New page `activities/ai.mdx`

**Files:**
- Create: `src/content/docs/activities/ai.mdx`
- Modify: `src/content/docs/assignments/introduction.mdx` (the deferred link from Task 4 Step 2)
- Test: `npm run build`

**Interfaces:**
- Consumes: Task 8's anchors.
- Produces: route `/activities/ai/`, linked from Tasks 4, 11, 12, 13.
- No `astro.config.mjs` change needed: the Activities sidebar uses `autogenerate: { directory: 'activities' }`.

Frontmatter must match the sibling activity pages' shape (`title`, `description`, `sidebar.order`). Do **not** add an `assignment:` block; the validator only reads `src/content/docs/assignments/`, and activities are ungraded.

- **Step 1: Write pillar 1, "Which doors are one-way."** The conceptual spine, and genuinely new: reversibility currently appears in the handbook only in `devops.mdx` for deployment rollback. Content: one-way doors are architecture, database schema, authentication and authorization, deployment topology, data migrations, licensing, third-party commitments. Two-way doors are most feature code. Exercise: classify your team's next ten decisions as one-way or two-way before making them, then revisit at the end of the sprint and check the classification against what actually happened.

- **Step 2: Write pillar 2, "You may delegate only as far as your net catches."** Teach the frontier baseline as an integrated harness: an agent driving a browser (Playwright) to exercise features and UI flows; an automated accessibility audit (axe-core) wired into the pipeline, linking to Task 8's section; an agent writing the test pyramid across unit, integration, and e2e, linking to the existing pyramid section; a self-audit pass where the agent critiques its own work adversarially; a separate architectural review pass run as its own step rather than folded into implementation.

- **Step 3: Apply the caveat pattern to every pillar-2 exercise.** Each exercise states the invariant, then the substitute at lower capability. Worked example to follow:

```markdown
**If your tools cannot drive a browser:** the invariant is that the critical user flow is exercised before every demo. The substitute is a written manual smoke script that a human runs and initials, plus a recorded end-to-end test added once tooling allows. This is more work, not less, which is the honest tradeoff.
```

- **Step 4: Write pillar 3, "Do the work AI cannot."** Acceptance judgment: does the product do what a user actually expects. Sharper than "manual testing", because an agent can drive the browser but only you can decide whether what it did is right. Mostly a pointer into `testing-strategy.mdx` plus the framing that this is where your hours now go.

- **Step 4b: Add the "set up your repo's skills" exercise.** Hands-on and repo-changing, which is what makes it an activity rather than a guide entry. Students install a published skill collection, run one of its workflows against their own repository, and report what changed in the output.

Name the two real collections, verified 2026-08-17:

- [obra's Superpowers](https://github.com/obra/superpowers): brainstorming, subagent-driven development with built-in code review, systematic debugging, red/green TDD, and authoring new skills.
- [Matt Pocock's skills](https://github.com/mattpocock/skills): grilling, spec and ticket flows, TDD, code review, domain modelling.

State why each is relevant here rather than listing them as trivia: a separate architectural-review pass and a code-review pass are pillar-2 net components, and a plan-before-you-build skill is what turns a vague prompt into the kind of specification the [RFC](/assignments/rfc/) grades. The caveat pattern applies: skill collections assume a tool that can load and run them, so state the substitute (a written checklist in `CONTRIBUTING.md` that a human follows) for students whose tooling cannot.

Add the standing warning: **a skill is someone else's opinion, executed automatically.** Read one before installing it, because the team owns whatever it produces (AI policy rule 1).

- **Step 5: Add the capability-and-equity note.** State plainly that models vary greatly in capability, that this page teaches the current industry baseline because a software engineering course owes coverage of it, and that no graded criterion requires these tools. Link to the [AI policy](/assignments/introduction/#ai-policy-applies-to-every-assignment).

- **Step 6: Add pointers to the graded work it feeds:** the [RFC](/assignments/rfc/) delegation-and-validation criterion and the [Defense](/assignments/defense/) ownership-and-delegation criterion, naming the criteria explicitly so the just-in-time routing of Task 13 has something concrete to point at.

- **Step 7: Build**

Run: `npm run build`
Expected: 67 pages (up from 66), all internal links valid.

- **Step 8: Add the pointer from the AI policy** to `assignments/introduction.mdx`, now that `/activities/ai/` exists. Append to the AI Policy section:

```markdown
The [AI practice activities](/activities/ai/) teach all three of these, including how to tell a one-way door from a two-way door and how to build a safety net you can actually trust.
```

This is deliberately here rather than in Task 4: the link validator runs in the build, so adding the link before the page exists would fail Task 4's build.

- **Step 9: Build again and commit**

```bash
npm run build
git add src/content/docs/activities/ai.mdx src/content/docs/assignments/introduction.mdx
git commit -m "Add activities/ai.mdx: one-way doors, delegation nets, acceptance judgment"
```

---

### Task 10: Accessibility activity cluster

**Files:**
- Modify: `src/content/docs/activities/design.mdx`
- Modify: `src/content/docs/activities/user.mdx`
- Modify: `src/content/docs/activities/communication.mdx`
- Test: `npm run build`

- **Step 1: Add to `design.mdx`** an accessible-by-default design review of an existing screen: contrast, target size, focus states, and semantics before ARIA. Link to Task 8's manual accessibility section.

- **Step 2: Add to `user.mdx`** an assistive-technology user session, with the simulated-constraint substitute stated. Link to Task 8's assistive-technology section.

- **Step 3: Add to `ai.mdx`** (created in Task 9) an exercise on wiring an agent-run automated audit into the pipeline and triaging what it reports: which findings are real, which are noise, which need a human to judge.

- **Step 4: Cross-link `communication.mdx`'s** existing "Write for Accessibility and ESL" item into the cluster so it stops sitting alone.

- **Step 5: Build and commit**

```bash
npm run build
git add src/content/docs/activities/
git commit -m "Add accessibility activity cluster across design, user, ai, communication"
```

---

### Task 11: Gen-AI guide rewrite and automation index

**Files:**
- Modify: `src/content/docs/guides/generative-ai.mdx` (the "Verify, do not trust" section at line 143; add the automation index)
- Test: `npm run build`

**Interfaces:**
- Consumes: anchors from Tasks 8, 9, 10. Must run after them or the link validator fails the build.

- **Step 1: Rewrite the "Verify, do not trust" section.** It directly contradicts the stance the whole design adopts. Rename it to `Verify what matters, build the net that lets you trust the rest` and carry pillars 1 and 2 in compressed form, with a pointer to `/activities/ai/` for the full treatment. Do not rewrite the rest of the guide; it is otherwise good.

- **Step 2: Add the automation index** as a new section. It links, never restates, so each owning guide stays the single source of truth:

| Automatable | Owning source |
|---|---|
| Test generation across the pyramid | `testing-strategy.mdx` |
| Browser-driven flow exercising | `testing-strategy.mdx` |
| Accessibility auditing | `testing-strategy.mdx` (Task 8) |
| Lint and format gates | code-quality material, `biome.jsonc` as the local example |
| CI pipeline construction | `devops.mdx` |
| Self-audit and adversarial review | `activities/ai.mdx` |
| Architectural review as a distinct pass | `technical-design.mdx`, `activities/ai.mdx` |
| Security scanning | `security.mdx` |
| Documentation and changelog generation | `documentation.mdx` |

- **Step 3: Add the counterpart list, "what stays human":** acceptance judgment, one-way-door decisions, user-facing tradeoffs, and deciding whether an automated finding actually matters.

- **Step 3b: Add named skill collections to the existing `### Skills` subsection.** The subsection currently lists generic categories (code review, commit messages, test generation, documentation) with no real examples, so students have nothing to actually go look at. Add [obra's Superpowers](https://github.com/obra/superpowers) and [Matt Pocock's skills](https://github.com/mattpocock/skills) as published collections worth reading, note that reading a well-built skill is the fastest way to learn what a good one looks like, and point to the hands-on exercise in `activities/ai.mdx`.

Keep the guide entry short: the guide says what exists and why it matters, the activity is where students actually do it. This subsection is squarely in the volatile layer flagged for annual review in Step 4.

- **Step 4: Mark the section for annual review.** Add a line stating this index is where tool names churn fastest and is reviewed each August, per the principle that rubrics carry invariants and guides carry the volatile layer.

- **Step 5: Build and commit**

```bash
npm run build
git add src/content/docs/guides/generative-ai.mdx
git commit -m "Reframe verification stance; make the gen-AI guide the automation index"
```

---

### Task 12: Activity tiering and the end of extra credit

**Files:**
- Modify: `src/content/docs/activities/introduction.mdx` (frontmatter description line 3, framing line 8, extra-credit paragraph line 29)
- Modify: all 10 themed activity pages (tier tags)
- Test: `npm run build`

- **Step 1: Define the three tiers on the introduction page.** Workshop (~6, taught in class, everyone does them), Recommended (~20, linked from the graded assignment they feed with the criterion named), Library (the remainder, kept and browsable). Nothing is deleted.

- **Step 2: Replace the extra-credit paragraph** with just-in-time prerequisite framing: each graded assignment names the one or two activities that are the cheapest path to its rubric criteria. Students do the activity because it is the efficient route to a grade they already care about.

- **Step 3: Update the framing sentence at line 8** so "None of them are graded" no longer contradicts the Workshop tier being done in class.

- **Step 4: Update the frontmatter description at line 3**, which still says "optional".

- **Step 5: Tag the promoted activities** in each themed page. This requires the instructor's selection of which ~6 and ~20; if that decision is not yet made, tag only the ones this design names (the AI pillars, the accessibility cluster, `conflict.mdx` performance conversations, `teamwork.mdx` health checks) and leave the rest for a follow-up pass. Record what was left untagged in the commit message rather than silently deferring.

- **Step 6: Build and commit**

```bash
npm run build
git add src/content/docs/activities/
git commit -m "Tier activities and replace extra credit with prerequisite routing"
```

---

### Task 13: Prerequisite routing on graded assignment pages

**Files:**
- Modify: each page in `src/content/docs/assignments/` that has a feeding activity
- Modify: `src/content/docs/guides/introduction.mdx`
- Test: `npm run build`

- **Step 1: Add a one-line prerequisite pointer** to each graded assignment page naming its feeding activities and what they make easier. Concrete pairs: RFC to `activities/ai.mdx` pillar 1 and `activities/design.mdx`; Defense to `activities/ai.mdx`; Definition of Shipped to `activities/user.mdx`; Term Retrospective to `activities/reflective.mdx`; Career Retrospective to `activities/career.mdx`; Landing Page to the accessibility cluster.

- **Step 2: Update `guides/introduction.mdx`**, which maps guides to the assignments they feed, to include the new accessibility and AI material.

- **Step 3: Build and commit**

```bash
npm run build
git add src/content/docs/
git commit -m "Route each graded assignment to the activities that prepare it"
```

---

# Phase 3: Propagation

Runs last. Every satellite quotes text that Phases 1 and 2 are still changing, so starting early guarantees rework. Source: spec §11.

### Task 14: Repository-root satellites

**Files:**
- Modify: `IMPLEMENTED.md` (lines 55, 169, 199, 208)
- Modify: `IDEAS.md` (lines 194, 205, 257, 266, 273)
- Modify: `README.md` (line 28)
- Test: manual grep

- **Step 1: Update `IMPLEMENTED.md` validator quotes.** Lines 55 and 208 both quote `SO4: 5`; both become the actual number printed by the validator. Do not hand-compute it; paste what the command prints.

- **Step 2: Close open item 1.** Line 199 currently reads `SO4 evidence concentration in the RFC (accreditor concern; add a second non-RFC individual SO4 criterion in a future pass)`. Mark it resolved, naming the defense ownership-and-delegation criterion as the fix. Also update line 169, the "Known concern documented, not yet resolved" entry in the ABET review record.

- **Step 3: Update `IDEAS.md` where it states things now false.** Line 266 says three defense rounds give every SO **except SO4** a live data point; that is no longer true. Line 194 quotes the old defense question. Lines 205 and 257 describe the AI-disclosure appendix approach. Line 273 recommends the extra-credit subset.

Keep `IDEAS.md` passages that are explicitly framed as the July 2026 rationale as historical narrative; annotate rather than rewrite where the text is describing what was originally proposed.

- **Step 4: Update `README.md` line 28**, which describes activities as repositioned into a practice library.

- **Step 5: Commit**

```bash
git add IMPLEMENTED.md IDEAS.md README.md
git commit -m "Propagate four-skills changes to root docs; close SO4 open item"
```

---

### Task 15: Canvas satellites and the closing check

**Files:**
- Modify: `canvas/assignments/assignment-readme.md`
- Modify: `canvas/syllabus/cs461.html`, `cs462.html`, `cs463.html`
- Test: closing grep

- **Step 1: Update the Canvas assignment readme.** It carries the source-of-truth statement, the grade architecture, and the week-by-week schedule. Record the criterion renames and the AI policy change.

- **Step 2: Update the AI Policy section in all three syllabi.** Each has two matches for "AI Polic". They must agree with `assignments/introduction.mdx` or Canvas will contradict the handbook on the most visible policy in the course.

- **Step 3: Update the activities references.** `cs463.html` references activities six times; `cs461.html` and `cs462.html` once each. Align with the tiering from Task 12.

- **Step 4: Run the closing grep**

```bash
grep -rn -i "ai disclosure\|verify, do not trust\|get wrong\|extra credit\|currently faces" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git .
```

Expected survivors: `IDEAS.md` passages explicitly framed as the original July 2026 rationale, the spec, and this plan. Every other hit is a missed satellite; fix it before closing out.

- **Step 5: Full verification**

```bash
node scripts/validate-outcomes.mjs
npm run build
```
Expected: validator passes with SO4 at 8 and zero drift; build passes 67 pages with all internal links valid.

- **Step 6: Commit**

```bash
git add canvas/
git commit -m "Propagate four-skills changes to the Canvas mirror and syllabi"
```

---

## Verification Summary

Run after every task, not just at the end:

| Command | Gate |
|---|---|
| `node scripts/validate-outcomes.mjs` | Frontmatter/rubric reconciliation, ABET floor, WIC coverage |
| `npm run build` | astro check, plus internal link validation (enabled 2026-08-17) |
| `awk -F'\t' '{print NF}' <tsv>` | Canvas TSV column integrity |
| `awk -F'\t' '{s+=$4} END {print s}' <tsv>` | TSV points match the handbook table |

Both the validator and the build run in CI (`.github/workflows/ci.yml`), and the validator also runs in the lefthook pre-commit hook when files under `src/content/docs/assignments/` are staged.

## Known Deferrals

These are open decisions from spec §9, not oversights. Each needs an instructor call:

1. ~~Which ~6 activities become Workshop tier and which ~20 become Recommended.~~ Superseded by `2026-08-17-activity-tiering.md`: 8 Workshop (six fall, one winter, one spring) and Recommended sized per assignment instance.
2. ~~Whether the extra-credit subset disappears entirely or survives as a formality.~~ Superseded by the same decision: extra credit is gone, replaced by graded workshop items at 2/1/1%.
3. Whether the hard-to-reverse RFC trigger needs per-category fallbacks in `guides/shipping.mdx`, since a FOSS team's one-way doors differ from a research team's.
4. Workshop decks (spec §4.6) are not in this plan. They depend on decision 1 and are a separate authoring effort.
