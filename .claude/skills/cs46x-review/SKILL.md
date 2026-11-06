---
name: cs46x-review
description: Review loop for a CS 461/462/463 handbook pull request. Use before opening a pull request, or when asked to review a branch, a pull request, or a round of fixes.
---

# Handbook Review

Every pull request gets review rounds until one changes nothing and a reader
who sees only what students see can do the work. Most of a diff here is prose,
rubric CSVs, and MDX that a student reads under deadline, so one reviewer
reads it the way they will, blind, and the others check it against what the
pull request is for, the rest of the handbook, and its rules.

## The Bar

A finding clears the bar when it:

- changes what a student does or how a grader scores;
- changes what a script, hook, or agent does;
- shows two statements that disagree;
- points at a broken or misdirected link;
- cites a documented rule broken;
- is **drift**: a change in what the text says that has no settled trace to
  what the pull request is for ([`spec-and-rules.md`](spec-and-rules.md),
  Intent); or
- is a **stop** that holds up against the text: a place the student reader
  would stop or guess, of a kind [`student-read.md`](student-read.md) lists.

A wording the reviewer would prefer, where the current one is clear and
correct, does not clear it. A skip stop on a sentence that says what a
section, activity, or step does for its reader doesn't clear it either, and
the sentence stays: a purpose changes no team's work and still belongs on the
page (#661). Any other skip stop is deleted, or goes to
the instructor when deleting it would lose a requirement or reverse an
instructor decision.

**Hard** is a documented rule broken, cited by file and rule. **Judgement**
is labelled as such, with the hunk quoted.

## 1. Prepare the Round

- Pin the base, `git merge-base origin/main HEAD`, after a fetch. The spec is
  the issue's Acceptance list (`gh issue view`, per
  `docs/agents/issue-tracker.md`); with no issue or no list, the spec is "no
  spec available".
- When the diff touches anything a reader sees (a page, `canvas/`, `public/`),
  run `npm run build` and `npm run canvas:export` once, so every reviewer
  reads the same `dist/` and `canvas-export/`.
- Run `node scripts/section-words.mjs` for the assignment pages' word counts,
  base against head (`cs46x-assignments`, Length).
- From the second round on, keep the **ledger**, one file in the session's
  scratchpad: the instructor's decisions, each decline with its ground, each
  fix (its round, its finding, what changed), and the bar. Each reviewer but
  the student reader reads it first and raises only what it does not already
  answer.
- In round 1, save the issue and the drafted PR body in the scratchpad as the
  **round-1 copies**, and give them to every later spec and rules reviewer
  (#661).

Done when the build, the export, the word counts, the drafted PR body, and
the ledger all reflect `HEAD`, and in round 1 the round-1 copies are saved.

## 2. Run the Reviewers

Fresh sub-agents, in parallel, in the foreground. Each gets the path of its
brief, the inputs the brief lists, and nothing else.

| Reviewer | Brief | Runs when the diff touches |
|---|---|---|
| Student read | [`student-read.md`](student-read.md) | text a student, partner, or mentor reads: a page under `src/content/docs/`, a rubric CSV, a syllabus, a download in `public/` |
| Consistency | [`consistency.md`](consistency.md) | an assignment page, anything under `canvas/`, a fact with a canonical home in `AGENTS.md`, or a heading other pages link |
| Spec and rules | [`spec-and-rules.md`](spec-and-rules.md) | anything |
| Code | `mattpocock-skills:code-review` (Standards and Spec), with The Bar above pasted into both prompts, on those paths only: MDX is not code | `src/lib/`, `scripts/`, `.claude/hooks/`, `src/components/`, `src/pages/`, or `astro.config.mjs` |

The student reader is the one reviewer that must not know what the change
meant. From the second round on it runs again only on pages whose text or rubric changed
since its last read, always as a new agent, and never with the ledger.

Beside them, the main session does its own correctness read: the built-in
`code-review` skill, or a line-by-line read of the diff with each rewritten
line beside the line it replaced (#661).

Done when every report is in. Fix nothing before then.

## 3. Triage Each Finding

Check a finding before acting on it; reviewers are wrong too. Each one is:

- **fixed**, when it is a defect in the diff that clears the bar and is not
  drift, by the fix ladder;
- **declined**, on one of three grounds, in one line under Declined in the PR
  body: wrong once checked; below the bar; or outside the diff, where real
  work becomes an issue. A drift finding is declined only as wrong once
  checked, naming a trace from Intent's list of what makes a change intended
  (`spec-and-rules.md`), other than a ledger fix;
- **sent to the instructor** as options, when it is drift, a design choice, a
  fix the ladder sends up, a fix that would reverse an earlier round's, or a
  student-read stop on text an instructor decision set. The round waits for
  the answer, which the PR body records under Decisions.

Whether drift was meant is the instructor's call (#661): send the round's
drift to the instructor as one list, each item with the old text and the new,
and a recommendation among keeping the change, which the PR body then names;
restoring the base wording; or a rewording, quoted, that keeps the old idea.

Done when each finding is marked to fix, declined, or sent, and the
instructor has answered every one sent.

## 4. Fix by the Ladder

Take the first rung that resolves the finding without adding drift
(`spec-and-rules.md`, Intent):

1. Delete the text that causes it.
2. Rewrite it in place, no longer than it was, or than the base had it where
   that was longer.
3. Add one clause, where the section stays within its budget and was not
   already over it.

Past the third rung (a new sentence, a new rule, a section taken over its
budget or grown past it), or where every rung would add drift, the fix
goes to the instructor with the proposed text and its word cost.

A fix that also rewrites its neighborhood buys another round. One commit per
round.

## 5. Record the Round

Add the round's fixes, decisions, and declines to the ledger, and its
decisions and declines to the PR body's Review loop lines: Rounds as a count,
then one line per decision and per decline. A resumed session rebuilds the
ledger from those lines and the round commits.

The loop ends on a round that changed no repository file, in which the latest
student read of every page reports no stop that clears the bar and that
round's spec and rules review reports no drift that still stands. A fix to
the PR body alone starts no round.

When a round's fixes stay within one file and rename no heading, the next
round may be one reviewer on every brief but the student read's for those lines, with a regression
check of the whole diff, beside the main session's read and a student read of
any page whose text or rubric changed.

## What No Reviewer Raises

- Anything a validator, Biome, or the commit-message check enforces.
- Intermediate states inside a stacked sequence of pull requests that the PR
  body discloses (an empty sidebar group, a description ahead of the tree).
