# Code review

`mattpocock-skills:code-review` runs on every pull request, as `AGENTS.md`
says. This repository is a student-facing handbook, not an
application: most of a diff is prose, tables, and MDX, and the review reads it
that way. This file is the local delta from the skill's default brief. Every
reviewer gets it pasted, for the bar under Severity and the loop; the
Standards sub-agent also gets `AGENTS.md` and the three content skills under
`.claude/skills/`.

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
  `astro.config.mjs`, `src/lib/**/*.{js,mjs}`, and `src/components/**/*.{astro,svelte}`. MDX is not
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

## The consistency axis

A pull request that changes an assignment page, a rubric CSV, or a fact with
a canonical home in `AGENTS.md` gets a third reviewer beside Standards and
Spec. It reads what
neither of them does:

- Each rubric band against the page, entry by entry: a band that asks for
  something the page does not at that entry, a page requirement no band
  scores where it applies, or one requirement scored by two criteria.
- Each body `npm run canvas:export` writes, read alone beside its rubric, as a
  student who has only those two: a sentence that points at a section the
  body no longer contains, or that reads differently once the export has cut
  the other entries' sections.
- Every page, deck, syllabus, template, and runbook line that restates what
  changed, found by grep.
- Every inbound link to a renamed or moved heading. The build checks that an
  anchor exists, not that it lands on the section its sentence means.
- The re-import and re-paste notes in `canvas/assignments/assignment-readme.md`
  against the diff under `canvas/` and the bodies whose text changed.

The main session runs `npm run build` and `npm run canvas:export` once per
round, before the reviewers start, so every reviewer reads the same output.

## Severity and the loop

- **Hard**: a documented rule broken, cited by file and rule. **Judgement**:
  labelled as such, with the hunk quoted.
- **The bar.** A finding changes what a student does or how a grader scores,
  changes what a script, hook, or agent does, shows two statements that
  disagree, points at a broken or misdirected link, or cites a documented
  rule broken. A wording the reviewer would prefer, where the current one is
  clear and correct, is not a finding.
- **Each finding is fixed, declined, or sent to the instructor.** Check a
  finding before acting on it; reviewers are wrong too. A defect in the diff
  that clears the bar is fixed. A decline gives one of three grounds, in one
  line under Declined in the PR body: wrong once checked, below the bar, or
  outside the diff, where real work becomes an issue (under the current
  review parent, when one is open). A design choice rather than a defect,
  and a finding that would reverse an earlier round's fix, go to the
  instructor as options; the round waits for the answer, which the PR body
  records under Decisions.
- **The ledger.** From the second round on, every reviewer reads one file
  first: the instructor's decisions, each decline with its ground, and the
  bar. Every round adds its decisions and declines, so each round raises only
  what the ledger does not already answer. It lives in the session's
  scratchpad, not the repository; a resumed session rebuilds it from the PR
  body's Decisions and Declined lines.
- **Rounds run until one changes nothing.** A round is the axes run in
  parallel by fresh sub-agents, plus the main session's own correctness
  read (the built-in `code-review` skill, or a line-by-line read of the
  diff), with every report in before anything is fixed, and one commit per
  round. If the round fixed anything, the next round runs. The loop ends on a
  round whose findings are all declined, or none. When a round's fixes
  touched only a few lines, the next round may be one reviewer covering every
  axis for those lines and checking the whole diff for regressions, beside
  the main session's read.
- **Keep each fix to what its finding needs.** Most findings after the second
  round are in text an earlier round wrote, so a fix that also rewrites its
  neighborhood buys another round.
- Record the number of rounds in the PR body, beside the decisions and the
  declines.
