# Code review

`mattpocock-skills:code-review` runs on every pull request, as `AGENTS.md` and
`CONTRIBUTING.md` say. This repository is a student-facing handbook, not an
application: most of a diff is prose, tables, and MDX, and the review reads it
that way. This file is the local delta from the skill's default brief. The
Standards sub-agent gets it pasted alongside `AGENTS.md` and the three content
skills under `.claude/skills/`.

## What the Standards axis checks

1. **Audience first.** A student in week 3, under deadline, can act on the
   page without asking staff. Findings: a rule stated without the action it
   implies; a term used before it is defined or linked; a page whose first
   lines do not say what it is for and who it is for.
2. **One purpose per page, one home per fact.** `AGENTS.md` lists the canonical
   home of each shared fact. A second statement of a weight, a week, a scale,
   or a policy is a finding; the fix is a link. A page may state the single
   number its own reader needs.
3. **Expectations are checkable.** A rubric criterion or a stated expectation
   reads as an observable behavior or artifact. An adjective without an
   observable ("professional", "clear", "genuinely useful") is a finding. The
   `cs46x-assignments` skill has the pattern.
4. **The hard rules where scripts cannot see.** Validators catch em dashes,
   emoji, calendar dates, weights, tags, and links. The reviewer catches the
   rest: month names standing in for a term week, "academic year" phrasing, a
   date in a code comment, an em dash entity in an HTML attribute, grading language
   on an activity or guide page.
5. **The Canvas mirror.** A rubric, weight, or syllabus change carries the
   matching change under `canvas/` and the PR body says a re-import is needed.
6. **Section contracts.** Each content skill defines the section skeleton for
   its directory. A missing required section is a hard finding; section order
   is a judgement call.
7. **Length.** Audience pages (students, partners, mentors) run about 400
   words. Guides and activities have ceilings in their skills. Over budget is a
   finding with the number, never a blocker on its own.

## What the Standards axis ignores

- Prose taste: synonyms, comma placement, reflowed paragraphs, sentence rhythm.
- The Fowler smell baseline, except on `scripts/*.mjs`, `.claude/hooks/*.mjs`,
  `astro.config.mjs`, and `src/components/*.astro`. MDX is not code.
- Anything a validator, Biome, or the commit-message check already enforces.
  Do not re-report a passing check.
- Intermediate states inside a stacked PR sequence when the PR body discloses
  them (an empty sidebar group, a description that runs ahead of the tree).

## The Spec axis

- The issue's **Acceptance** list is the spec. A PR without an issue, or an
  issue without an Acceptance list, gets "no spec available" and a request to
  add one; the reviewer does not invent acceptance criteria.
- The PR body's claims are part of the spec: counts, "ran locally" lines, and
  disclosures are checked against the diff.
- Scope: content changed on pages the issue does not name, a page un-drafted
  or a sidebar changed without a line in the body, a fact whose meaning moved
  while the wording was being tidied.

## Severity and the loop

- **Hard**: a documented rule broken, cited by file and rule. **Judgement**:
  labelled as such, with the hunk quoted.
- The loop ends when a pass raises nothing unanswered. Each finding is fixed,
  or declined in one line in the PR body. A declined finding that is real work
  becomes an issue under the current review parent; a declined judgement call
  needs no issue.
- One full pass is the norm. A second pass runs only when the first pass
  changed more than it declined.
