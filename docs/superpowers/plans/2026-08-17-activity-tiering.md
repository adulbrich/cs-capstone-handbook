# Activity Tiering Decision

Companion to `2026-08-17-four-skills-assessment.md` (Tasks 12 and 13). Resolves spec §9 open decision 1.

## Sizing Principle

The spec guessed "~20 Recommended". That was wrong, because it ignored **how many times each assignment runs**:

| Assignment | Instances per year |
|---|---|
| Sprint Notes | 10 (4 fall, 4 winter, 2 spring) |
| Repo Checkpoints | 4 (2 fall, 2 winter) |
| Defense | 3 (one per term) |
| RFC | 2 (fall, winter) |
| Everything else | 1 |

A repeated assignment needs a **pool** sized to its instances, not a fixed pair, or students hit the second instance with nothing left to do. Three rules follow:

1. **One-time setup activities are named once and not recycled.** Kanban Board Setup and Definition of Done are done once and benefit every later instance; listing them against instance 3 is useless.
2. **Repeated assignments get a pool mapped to what differs between instances.** The four repo checkpoints escalate through different term gates, so the pool is organized by gate rather than offered as an undifferentiated list.
3. **Category pointers cover the long tail.** Each assignment names one or two activity *categories* to browse when the specific suggestions are exhausted. This is what keeps the Library tier alive instead of dead weight.

## Workshop Tier: 6 slots

Graded complete/incomplete: **fall 2% across 6 items, winter 1%, spring 1%** (instructor decision, 2026-08-17, revising an earlier zero-point recommendation). Scored on submission existing, never on quality, because at ~300 students with 6 TAs anything requiring judgment per submission is unaffordable. Funded by re-cutting Team Deliverables (Charter 5 to 4 and Term Retro 4 to 3 in fall, Postmortem 5 to 4 in winter, Project Retro 4 to 3 in spring), leaving Sprint Notes and Repo Checkpoints untouched. Documented as its own assignment page, `assignments/workshop-activities.mdx`, since the Assignments section is the source of truth for all graded work.

| Slot | Activity | When | Criteria fed |
|---|---|---|---|
| 1 | **Set Up Your Repository's Skills** (`ai`) | Fall wk 1-2 | Charter CONTRIBUTING/AI-context (15), AI-confidentiality one-pager (15) |
| 2 | **User Story Mapping** ⭐️ (`requirements`) | Fall wk 2-3 | Checkpoint living docs (25); winter DoS target rung (25), metrics (25) |
| 3 | **Describe your Architecture** ⭐️ (`design`) | Fall wk 3-4 | Checkpoint living docs (25); RFC framing (15), tradeoffs (15); Defense technical depth (20) |
| 4 | **Map Your One-Way Doors** (`ai`) | Fall wk 3-4 | RFC topic choice, RFC framing (15); Defense judgment (20) |
| 5 | **Audit Your Safety Net** (`ai`) | Fall wk 4-5 | Checkpoint build health and safety net (20); RFC delegation (10); Defense ownership and delegation (20); Postmortem corrective actions (25) |
| 6 | **A teamwork assessment, rotating** (`teamwork`) | Once per term | Charter conflict and inclusion (15); Defense role criterion (20); Project Retro team dynamics |

Slot 6 rotates so it does not recycle: **Team Formation Strategies Assessment** in fall, **Team Dysfunctions Assessment** in winter, **Team Health Assessment** in spring. All three already exist on `teamwork.mdx`.

Slots 4 and 5 must land **before the RFC draft at end of week 4**, or students choose RFC topics without the triage vocabulary the tightened trigger now expects.

Slot 5 feeds four criteria across three assignments and two terms, more than any other activity in the library. It is both the highest-value workshop and the best available modifier trigger: a team that skipped it is disproportionately likely to fail checkpoint build health *and* have students stumble on the defense delegation question. Worth telling TAs to watch that pairing.

## Repo Checkpoints: pool of 15, organized by gate

The four instances are not interchangeable. Each gate needs different preparation, so the pool is mapped to the gate rather than to the criteria alone.

### Fall wk 5, "rails stood up"

| Activity | Page | Criterion |
|---|---|---|
| Describe your Architecture ⭐️ | `design` | Living docs (25) |
| User Story Mapping ⭐️ | `requirements` | Living docs (25) |
| Kanban Board Setup | `planning` | Term gate (25), one-time setup |
| Definition of Done | `planning` | Build health (20), one-time setup |
| Audit Your Safety Net | `ai` | Build health and safety net (20) |

### Fall wk 10, "hello, production"

| Activity | Page | Criterion |
|---|---|---|
| Deployment Plan | `design` | Term gate (25) |
| Plan Prototype | `planning` | Term gate (25) |
| Put a Browser Agent on Your Critical Flow | `ai` | Build health and safety net (20) |
| Software Release and Versioning | `planning` | Term gate (25) |

### Winter wk 5, "integration health, real-user session scheduled"

| Activity | Page | Criterion |
|---|---|---|
| Test Plan | `design` | Build health (20) |
| Wire an Accessibility Audit Into CI | `ai` | Build health and safety net (20) |
| Find Users, then Engage Users | `user` | Term gate (25) |
| Risk Management Plan | `planning` | Decision and risk hygiene (15) |

### Winter wk 10, "release candidate, real-user evidence"

| Activity | Page | Criterion |
|---|---|---|
| Test with an Assistive Technology User | `user` | Term gate (25), real-user evidence |
| Run an Acceptance Pass | `ai` | Term gate (25) |
| Describe your API Reference | `design` | Living docs (25) |
| Fishbone Diagram | `planning` | Decision and risk hygiene (15) |

**Browse when exhausted:** `design` and `planning`.

This also gives **Test with an Assistive Technology User** the home it lacked under the old cap: the winter checkpoint's real-user gate is exactly where an assistive-technology session counts as evidence.

## Sprint Notes: category-first, 10 instances

Ten instances make per-instance activity lists absurd. Recommend by category, with three one-time setups and one repeatable.

**One-time setup (fall, then never again):** Kanban Board Setup (`planning`), Definition of Done (`planning`), Regular Stand-Up Meetings (`teamwork`).

**Repeatable every sprint:** Prioritization (`planning`) for the top-risk-and-decision item; Learning Journal (`reflective`) for the human judgment layer, which is the part staff actually read.

**Browse when you need more:** `planning` for anything touching the board, estimates, or risk.

## Defense: rotate by term, 3 instances

| Term | Activities |
|---|---|
| Fall | Map Your One-Way Doors (`ai`), Audit Your Safety Net (`ai`) |
| Winter | Run a Self-Audit and an Architectural Review Pass (`ai`), Peer Technical Design Review (`design`) |
| Spring | Run an Acceptance Pass (`ai`), Learn from Patrick Winston (`communication`) |

**Browse when exhausted:** `ai` and `communication`.

## RFC: differentiate by term, 2 instances

Fall is short (800-1,500 words); winter is the WIC term with a 2,000-word floor and needs source work.

| Term | Activities | Criterion |
|---|---|---|
| Fall | Map Your One-Way Doors (`ai`) | Topic choice, framing (15) |
| Fall | Evaluate Different Technologies (`design`) | Options (10), tradeoffs (15) |
| Fall | Six Thinking Hats (`creative`) | Options (10) |
| Winter | Write a Literature Review (`creative`) | Tradeoff analysis (15), and the 2,000-word source work |
| Winter | Proof-of-Concept (`design`) | Recommendation and verification plan (15) |
| Winter | Peer Technical Design Review (`design`) | Feedback given (5), revision (10) |
| Both | Apply the Privacy by Design (PbD) Guidelines (`design`) | Constraints (10) |
| Both | Run a Self-Audit and an Architectural Review Pass (`ai`) | Delegation and validation (10) |

**Browse when exhausted:** `design` and `creative`.

## Single-instance assignments: 2 each plus categories

| Assignment | Activities | Browse |
|---|---|---|
| **Team Charter** | Thomas-Kilmann Conflict Mode Instrument (`conflict`) → conflict and inclusion (15); Responsibility Assignment Matrix RACI (`planning`) → roles (20) | `teamwork`, `conflict` |
| **Term Retrospective** (fall) | Learning Journal (`reflective`) → individual pages (25, L07); External Feedback Session (`reflective`) → evidence (20) | `reflective`, `teamwork` |
| **Definition of Shipped** (winter) | Identify Success Metrics (`planning`) → metrics and instrumentation (25); Dependency Mapping or Critical Path Analysis (`planning`) → prerequisites and lead times (25) | `planning`, `user` |
| **Incident Postmortem** (winter) | Fishbone Diagram (`planning`) → root cause (25); Performance Conversations (`conflict`) → blameless (15) | `planning`, `conflict` |
| **Release and Metrics** (spring) | Run an Acceptance Pass (`ai`) → showcase (25); Learn from TED Presentation Advice (`communication`) → production quality | `communication`, `user` |
| **Landing Page** (spring) | Designing for Accessibility (`design`) → polish and accessibility (20); The Parent Test (`creative`) → value proposition | `communication`, `design` |
| **Project Retrospective** (spring) | Team Health Assessment (`teamwork`) → team dynamics; Learning Journal (`reflective`) → arc and pivots (20) | `reflective`, `teamwork` |
| **Project Handoff** (spring) | Planning for Maintenance and Long-Term Support (`design`) → known issues and future work (20); Describe your API Reference (`design`) → living docs (10) | `design`, `communication` |
| **Career and Individual Retrospective** (spring) | Portfolio Development and Public Code Repository (`career`) → PR portfolio; Resume Building (`career`) → resume and the peer-review exchange; Learning Journal (`reflective`) → judgment and responsible practice (25, SO4); Learn from Jean-Luc Doumont (`communication`) → writing (10) | `career`, `reflective` |

**Career activities are promoted only onto the career assignment** (instructor decision, revised 2026-08-17): Portfolio Development, Public Code Repository, Personal Branding, and Mock Interviews for the PR-portfolio criterion and its captions, and Resume Building for the resume and peer-review criteria. The other 11 career activities stay in the Library tier, and no career activity is recommended for any non-career assignment.

`career.mdx` had its own review pass in August 2026: all 16 activities brought to the standard format, all six external links verified live, and the market framing kept free of statistics and named tools so it ages slowly. It remains the most time-sensitive page in the library and carries a dated review marker; re-read it every August.

## Revision, August 2026: Routing by Project Category

The tables above route by *assignment instance*, which was the right first cut but still assumed every team needs the same preparation. It does not survive contact with the four [project categories](/practicalities/categories/): a FOSS team contributing upstream, a research team running experiments, a consultancy team waiting on a partner's security review, and a product team hunting for users need materially different activities from the same rubric.

Five assignment pages now carry a **By project category** table alongside the shared list: repo checkpoints, definition of shipped, RFC, release and metrics, and project handoff. This is what allows a repeated assignment to name more than two or three options without asking anyone to redo an exercise, which was the sizing constraint the whole document is built around.

Six research and R&D activities were added, each tied to a gate in the Shipping guide rather than invented: Start the Approval Clocks, Choose Your Evaluation Metric Before You Run Anything, Reproduce Your Baseline, Make Your Artifact Reproducible, Keep an Experiment Log, and a rewritten Complete an IRB Application. A seventh was merged into the existing `Define Your Research Questions` stub instead of shipping a near-duplicate.

## Counts

| Tier | Count (Aug 2026 revision) |
|---|---|
| Workshop | 6 slots, 8 distinct activities (slot 6 rotates through 3) |
| Recommended | 54 |
| Library | 58, kept and browsable |
| **Total activities** | **120** |

Higher than the spec's "~20" and correctly so: the figure follows from instance counts and now from category counts, neither of which the spec had worked out.

**Counts are no longer maintained by hand.** `scripts/validate-activity-tiers.mjs` derives them from the badge markup and fails the build if a linked activity carries no badge, if a Recommended badge has no assignment linking to it, or if an assignment links to an anchor matching no heading. Run `npm run validate:activities`.

## Source Bugs Found While Building This

All fixed.

- `planning.mdx`: `## Software Development Process` had a **leading space** in the heading, producing a malformed anchor. Fixed.
- `teamwork.mdx`: `## Regular Stand-Up Meetings ` had a **trailing space**, same problem. Fixed.
- `design.mdx` and `requirements.mdx` had a decorative emoji in two headings, producing anchors containing an invisible variation selector (`#user-story-mapping-\uFE0F`). Stripped, with all seven inbound links fixed. The `cs46x-activities` skill now bans emoji in headings.
