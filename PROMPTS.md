# GPT-5 Prompts

## Assessment Plan Prompt

You are a senior US college instructor in computer science with prior software engineering experience in tech. You are designing a senior software engineering project series, in the 400-level range (advanced). Prerequisites are two software engineering courses. The series is for up to 350 students. The series includes three courses (3 credits in Fall, 3 credits in Winter, 2 credits in Spring). Terms are 10 weeks. Here's the course description:

"Utilize software engineering methodology in a team environment to develop a real-world application. Teams will be responsible for all phases of software development, including project planning, requirements analysis, design, coding, testing, configuration management, quality assurance, documentation, and delivery."

Students will work for the 3 terms on a single project, which will be a real-world application (from industry, faculty, or brought by students themselves, subject to approval by course instructors). Teams are 3-5 students. Each project is different.

And here are the learning outcomes with notes:

<LEARNING_OUTCOMES.json>

Create an assessment plan for the course series that includes a variety of assessments aligned with the learning outcomes. The assessments should include: coming up with requirements, technical design, prototypes, presentations, peer-evaluations. Students will have progress reports to submit every 2 weeks, term retrospectives, and a final project report. We want them to code as early as possible (even if onl prototypes). Their project partner will evaluate them on the following facets: https://capstone.alexulbrich.com/project-evaluation/project-partner-evaluation/

Make sure you search for good assessment ideas that align with the learning outcomes.

The learning outcomes must be assessed individually even though this is a project-based course. Multiple outcomes can be assessed by a single assessment. Outcomes L1 through L6 need to be assessed at least twice. Outcome L9 could be assessed individually for example with a pre-requirements or per-design document which would involve research or prototyping. L10 can be assessed simply, once in CS463.

Reduce writing overhead and focus on practical, real-world writing. Prefer individually authored contribution to team-authored documents. Use peer evaluations to assess teamwork and individual contributions.

Provide the assessments using the following JSON format:

```json
{
  "assessments": [
    {
      "id": "id starting with A and 3 digits, e.g., A001",
      "title": "Assessment title here",
      "type": "Assessment type here",
      "description": "Description of the assessment here",
      "learning_outcomes": [
        "Aligned outcome 1",
        "Aligned outcome 2",
        ...
      ],
      "term_week": "which terms and weeks this assessment is due (can be multiple)"
    },
    ...
  ]
}
```

Generate the JSON as a file, and an additional XLSX table mapping the assessments as rows and the learning outcomes as columns, with an X in each cell where the assessment maps to the outcome. Add the term+week column.

## Rubrics Prompt

You are a senior US college instructor in computer science with prior software engineering experience in tech. You are designing a senior software engineering project series, in the 400-level range (advanced). Prerequisites are two software engineering courses. The series is for up to 350 students. The series includes three courses (3 credits in Fall, 3 credits in Winter, 2 credits in Spring). Terms are 10 weeks. Here's the course description:

"Utilize software engineering methodology in a team environment to develop a real-world application. Teams will be responsible for all phases of software development, including project planning, requirements analysis, design, coding, testing, configuration management, quality assurance, documentation, and delivery."

Students will work for the 3 terms on a single project, which will be a real-world application (from industry, faculty, or brought by students themselves, subject to approval by course instructors). Teams are 3-5 students. Each project is different.

Here are the learning outcomes with notes:

<LEARNING_OUTCOMES.json>

Here are the assessments and their learning outcomes:

<ASSESSMENTS.json>

Create analytic grading rubrics for a project-based computer science course that are aligned to outcomes, reliable for multiple TAs, and practical to grade at scale.

Rubric requirements (apply to each assessment):

- Criteria selection: Choose 4–7 criteria that directly map to the outcomes the assessment evidences. For CS projects, consider: functional correctness, code quality/design, testing practice, documentation/communication, process & tooling (e.g., version control, issues/PRs/CI), usability or UX, security/ethics where relevant, and teamwork (for team items).
- Performance levels: Use 3 levels (Exceeds Expectations / Meets Expectations / Does Not Meet Expectations).
- Descriptors: For every cell, write observable, evidence-based descriptors (no vague adjectives). Where applicable, reference objective signals (e.g., “≥90% unit tests pass; branch protection rules met; linter passes with 0 errors; demo meets 100% of high-priority requirements”).
- Weights: Give each criterion a % weight; total 100% per rubric. Heavier weights should align to the most important outcomes.
- Evidence sources: List what graders should inspect (e.g., test report/CI run, repository history and PRs, deployed app demo, API docs, design doc, user study notes).
- TA grading notes: Provide brief guidance for graders: common error patterns to watch for, what earns partial credit, when to request re-submission, and anchor examples that distinguish adjacent levels.
- Individual vs team scoring: If team-based, include a separate individual-contribution component (e.g., calibrated peer assessment + repo activity review) and specify how it modifies the team score.
- Equity & accessibility: Use inclusive, plain language; avoid penalizing superficial formatting unless it is an outcome; ensure accommodations don’t trigger unintended penalties.
- Automation hooks (optional): Suggest simple checks (unit tests, lint/format, coverage threshold, static analysis) that can pre-fill portions of the rubric while leaving space for qualitative judgment.
- Time estimate: Suggest a target minutes-per-submission for TAs and any batching tips.

Return one JSON object with this exact structure and key names (snake_case). Do not include any markdown fencing around the JSON.

```json
{
  "assessments": [
    {
      "id": "id starting with A and 3 digits, e.g., A001",
      "title": "Assessment title here",
      "type": "Assessment type here",
      "description": "Description of the assessment here",
      "learning_outcomes": [
        "Aligned outcome 1",
        "Aligned outcome 2",
        ...
      ],
      "term_week": "which terms and weeks this assessment is due (can be multiple)",
      "criteria" : [
        {
          "name": "<string>",
          "weight_percent": <number>,
          "outcomes_aligned": ["LO1","LO3"],
          "descriptors": {
            "Exceeds Expectations": "<concise, observable descriptor>",
            "Meets Expectations": "<concise, observable descriptor>",
            "Does Not Meet Expectations": "<concise, observable descriptor>"
          },
          "evidence_sources": ["<bullet>", "<bullet>"]
        }
        // ... 3–6 more criteria
      ],
      "evidence_to_check": ["<artifact or report>", "..."],
      "ta_notes_and_anchors": ["<guidance>", "..."],
      "individual_contribution_adjustment": {
        "applies": true,
        "method": "Calibrated peer assessment + repo analytics review",
        "range_percent": "+/-10",
        "rules": [
          "If peer median < 0.8 and repo activity materially lower, apply -5% to -10%",
          "If peer median > 1.1 with strong review activity, apply +5% to +10%"
        ]
      },
      "automation_hooks": ["<check>", "..."],
      "time_estimate_minutes": <number>
    },
    ...
  ]
}
```

JSON rules

- Use the exact level labels above inside descriptors.
- Ensure all criterion weights for an assignment sum to 100.
- Every criterion must list at least one LO under outcomes_aligned.
- Keep descriptors brief (1–2 sentences each).
- Provide concrete, checkable evidence cues wherever possible.

After the JSON, create one XLSX table per assignment with columns in this exact order: Criteria, Weight, Does Not Meet Expectations, Meets Expectations, Exceeds Expectations

Follow each table with short bulleted sections:

- Evidence to check
- TA notes & anchors
- (Team assignments only) Individual contribution adjustment

Constraints & quality checks

- Keep total criteria manageable (4–7).
- Use inclusive, plain language.
- Make sure each assignment and criterion can map to multiple LOs when appropriate.
- Be precise about evidence and automation suggestions to aid TA consistency.
- Include a realistic time_estimate_minutes for graders.

## Assessment Content Prompt

You are a senior US college instructor in computer science with prior software engineering experience in tech. You are designing a senior software engineering project series, in the 400-level range (advanced). Prerequisites are two software engineering courses. The series is for up to 350 students. The series includes three courses (3 credits in Fall, 3 credits in Winter, 2 credits in Spring). Terms are 10 weeks. Here's the course description:

"Utilize software engineering methodology in a team environment to develop a real-world application. Teams will be responsible for all phases of software development, including project planning, requirements analysis, design, coding, testing, configuration management, quality assurance, documentation, and delivery."

Students will work for the 3 terms on a single project, which will be a real-world application (from industry, faculty, or brought by students themselves, subject to approval by course instructors). Teams are 3-5 students. Each project is different.

Here are the learning outcomes with notes:

<LEARNING_OUTCOMES.json>

Here are the assessments and their rubrics:

<ASSESSMENTS_WITH_RUBRICS.json>

Generate a COMPLETE, publish-ready student-facing assignment brief only. Do NOT include any grading rubrics, TA notes, or grader guide content. If needed, reference them with a placeholder link (e.g., “[See Grading Rubric & TA Guide]”).

Return one clean Markdown document per assignment/assessment with the following structure:

1. Overview & Purpose
   - 2–3 sentences on what the assignment is and why it matters.
   - Add a sentence to briefly connect to specific learning outcomes (mention LO IDs/titles).
2. Tasks & Milestones
   - Step-by-step instructions for what students must do.
   - Include a concise milestone table with dates, expected artifacts, and quick success checks.
3. Deliverables & Success Criteria
   - Bullet list of exact items to submit with precise paths/filenames and formats.
   - Concrete, observable “done” conditions (no points)—e.g., CI green, coverage threshold, performance/security/UX bars.
   - Add: “Detailed scoring is in [See Grading Rubric & TA Guide].”
4. Logistics, Policies & Support
   - Submission workflow (where/how), naming/tag format, and late policy.
   - Team collaboration expectations (roles, PR reviews) and how individual credit is acknowledged (peer eval + brief orals)—link to separate policy if needed.
   - Academic integrity & GenAI usage expectations (what’s allowed, what must be disclosed, what’s not allowed).
   - Accessibility & inclusion notes (alt formats, captions, time-zone fairness), and where to get help.
   - Time expectations (estimated hours and suggested pacing).

Must-Include Checklist (work these into the sections above):

- Assignment title and one-paragraph summary tied to real-world practice.
- Reference to the relevant LO IDs/titles.
- Clear steps for required processes (e.g., ADRs, design review, tests, scans, usability check).
- Team roles (if Team) and PR review rules (e.g., ≥1 approval, small PRs).
- Exact deliverable paths (e.g., `/docs/requirements.md`, `/docs/ADR-00X.md`, `/docs/test-plan.md`).
- CI requirement (badge/link) and minimum coverage threshold for named modules.
- Security/static analysis expectation (no High/Critical or documented mitigation).
- Any perf/UX target (e.g., p95 ≤ [ms] under [load], ≤[N] Sev-2 issues post-heuristic review).
- Release/tag format (e.g., `v0.3.0`) and changelog entry in `CHANGELOG.md`.
- Links/IDs for issues and PRs included in this milestone.
- Submission location(s) and what counts as “on time”.
- GenAI disclosure line example (e.g., in README and/or code comments).
- Accessibility requirements (captions for video, color-safe diagrams) and support channels.
- “See Grading Rubric & TA Guide” placeholder link where grading is referenced.

Style constraints

- Be concise and scannable; prefer bullets and small tables.
- Use precise, testable language; avoid vague adjectives.
- Keep to four sections only as specified above.

## Single Assessment Content Prompt

You are a senior US college instructor in computer science with prior software engineering experience in tech. You are designing a senior software engineering project series, in the 400-level range (advanced). Prerequisites are two software engineering courses. The series is for up to 350 students. The series includes three courses (3 credits in Fall, 3 credits in Winter, 2 credits in Spring). Terms are 10 weeks. Here's the course description:

"Utilize software engineering methodology in a team environment to develop a real-world application. Teams will be responsible for all phases of software development, including project planning, requirements analysis, design, coding, testing, configuration management, quality assurance, documentation, and delivery."

Students will work for the 3 terms on a single project, which will be a real-world application (from industry, faculty, or brought by students themselves, subject to approval by course instructors). Teams are 3-5 students. Each project is different.

You are writing an academic assignment using TILT (Purpose, Task, Criteria). Delivery is in Canvas LMS. Do NOT restate due dates, availability windows, points/weight, submission type, allowed file types, rubric weights/levels, group/peer-review settings, plagiarism/anonymity/moderation toggles, or module timelines. Canvas is the single source of truth.

Use the provided rubric(s) ONLY to:
- derive Task steps (observable actions),
- specify Deliverable content/format that Canvas can’t infer,
- produce a qualitative “What Good Looks Like” summary,
- create a short self-checklist and peer-review questions,
- generate TA calibration notes and a comment bank.
Do NOT copy numeric levels/points into the student doc.

INPUTS:
<SINGLE_ASSESSMENT_WITH_RUBRICS.json>

TRANSFORMATION RULES:
1) Map each rubric criterion → (a) a Task action verb, (b) a Deliverable element, (c) a qualitative success cue.
2) Extract “evidence to show” (tests, traces, citations, logs, demos) from descriptors/examples.
3) Turn pitfalls into peer-review prompts and TA comment-bank starters.
4) If multiple rubrics exist (e.g., Technical, Communication), combine into a single student-facing checklist; keep instructor crosswalks separate.
5) Keep student text concise; do not include numbers or level names from the rubric; link students to the Canvas rubric.

OUTPUT: TWO markdown docs in this exact order.

=== BEGIN: ASSIGNMENT_STUDENT.md ===
# <Assignment Title>
*Course/Context:* <optional>  
*Canvas note:* Deadlines, points, submission type, and the full rubric appear in Canvas.

## Purpose
- Brief, 2–4 bullets explaining why this matters and what you’ll learn.

## Task
Numbered, step-by-step instructions derived from the rubric’s criteria.
State the intended audience/genre (e.g., technical memo, research brief, demo).
List allowed tools/resources at a high level (link detailed policies).

## Deliverables & Format
Only include elements Canvas can’t infer:
- Required sections/structure and word/time limits
- Evidence to include (e.g., tests, benchmarks, citations, logs, screencast)
- Code/docs conventions (style/linting, docstrings, README keys)
- Naming and packaging (folder layout, manifest)

## What Good Looks Like
Qualitative indicators distilled from the rubric (no points/levels):
- …  
- …
See the Canvas rubric for detailed performance levels.

## Self-Check (brief)
A short checklist aligned to the rubric (3–7 items).

## Policies & Support
Link to integrity/collaboration/accessibility and GenAI use policy. Add assignment-specific constraints if any.

## Reflection (optional, ~5–8 min)
1–2 prompts to identify what you learned and next steps.

=== END: ASSIGNMENT_STUDENT.md ===

=== BEGIN: ASSIGNMENT_INSTRUCTOR.md ===
# Instructor Guide — <Assignment Title>

## Alignment & Rationale
Outcomes addressed; why this task/genre fits them; target cognitive level.

## Canvas Setup — single source of truth
- Attach rubric; “Use this rubric for assignment grading”
- Points/weight; due/available/until; submission type & file types
- Group settings; peer-review config; plagiarism/anonymity/moderation
- Module placement and requirements
(Do not echo these in the student prose.)

## Rubric Crosswalk
For each rubric and criterion:
- LO mapping
- Intended evidence to look for
- Observable behaviors (what graders should see)

## Grading & Calibration
- Anchors/samples per criterion (snippets or links)
- Common pitfalls (from rubric) + ready-to-paste SpeedGrader comments
- TA norming plan (10–15 min with 2 anonymized samples)
- Feedback strategy (what gets inline vs overall comments)

## Scaffolding Plan (Canvas objects, not dates in prose)
List related draft/review/demo as separate Canvas items (names/IDs) and their purpose.

## Integrity & Policy Notes
Permitted tools/AI boundaries; reuse of prior work; late/make-up scenarios — link to canonical Canvas pages.

## Accessibility & Inclusion
Anticipated barriers and alternatives; assistive-tech notes.

## Variations & Extensions
Lighter/heavier variants; alternative media; honors/extra credit ideas.

## Post-mortem Prompts
Questions to capture what worked and what to change next time.

=== END: ASSIGNMENT_INSTRUCTOR.md ===