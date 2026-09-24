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
   lines do not say what it is for and who it is for. On an assignment page,
   any sentence about course design is a hard finding: why the assignment
   exists, what it replaced, what past cohorts did, "by design", "on
   purpose", "in this course there is no". The page talks to the student
   about the student's work; rationale lives in `STAFF-RUNBOOK.md` or the
   issue tracker.
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
   date in a code comment, grading language on an activity or guide page.
5. **The Canvas mirror.** A rubric, weight, or syllabus change carries the
   matching change under `canvas/` and the PR body says a re-import is needed.
6. **Section contracts.** Each content skill defines the section skeleton for
   its directory. A missing required section is a hard finding; section order
   is a judgement call.
7. **Length and scope.** Guides and activities have ceilings in their skills;
   over one is a finding with the number, never a blocker on its own. Audience
   pages (students, partners, mentors) have no word ceiling but must stay
   short enough to read in one sitting; their other check is scope: run the
   link count in `AGENTS.md` (Audience pages are orientation) and flag each
   outbound link that answers no question the page's reader asks.
8. **The reverse outline**, on every guide and audience page in the diff. For
   each changed paragraph, write one line: the idea it carries and what it
   contributes to the page. A paragraph with no contribution, or with two
   ideas, is a hard finding. So is a paragraph whose last sentence restates
   the paragraph instead of adding information. This is the review step from
   the instructor's Writing 101; `docs/agents/voice.md` links it. Put the
   outline in the review output, not the PR body.
9. **Claims and voice**, on the same pages. Check the diff against the Claims,
   Person, Structure, and Sentences and words sections of
   `docs/agents/voice.md`, and cite the section in each finding. The findings
   that recur: an unsourced "research shows" or "most teams", an Evidence
   citation whose source doesn't say what the page says, "I", a "we" outside
   the audience pages and syllabi, a "not A; it's B" that closes a paragraph,
   and a bolded sentence beyond the one critical instruction a section may
   carry. Each is a hard finding.

## What the Standards axis ignores

- Prose taste: synonyms, comma placement, reflowed paragraphs, sentence
  rhythm. The reverse outline and the claims check above are not taste; they
  are the voice rules, and they stay in.
- The Fowler smell baseline, except on `scripts/*.mjs`, `.claude/hooks/*.mjs`,
  `astro.config.mjs`, `src/lib/*.mjs`, and `src/components/*.astro`. MDX is not
  code.
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
