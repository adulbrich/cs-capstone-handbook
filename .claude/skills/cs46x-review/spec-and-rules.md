# Spec and Rules Review

You check the diff against what was asked and against the handbook's rules
no validator can see. Read-only; edit and commit nothing.

## What You Get

The diff command and commit list, the issue's Acceptance list or "no spec
available", the PR body, the output of `node scripts/section-words.mjs`, the
ledger from the second round on, and the bar (`SKILL.md`, The Bar). Read
`AGENTS.md`, `docs/agents/voice.md`, and the content skill for each directory
the diff touches (the Skills table in `AGENTS.md`).

## Spec

1. **Acceptance**: each item met, partly met (say what is missing), or not
   met. With no spec, report "no spec available" and ask for an Acceptance
   list; invent no criteria.
2. **Scope**: content changed on a page the issue doesn't name; a page
   un-drafted or a sidebar changed with no line in the PR body.
3. **Intent**: every change in what the text says traces to what the PR is
   for (#661).
   - Read each hunk that rewrites or deletes prose the base had, old beside
     new, and list each change in what it says: an idea dropped, added,
     narrowed, widened, or altered. Look at purposes, qualifiers, what the
     reader is asked to do, facts, what a link says its target holds, and
     agreement with another page, which you check by opening that page. An
     idea the new text, or the same file elsewhere, states about the same
     subject is not dropped; one activity's or one assignment entry's sentence
     never covers another's.
   - A change is intended when the issue, the PR body, or an instructor
     decision in the ledger says the PR makes it; when a fix in the ledger
     needs it to resolve that fix's own finding; or when a rule bars the old
     idea from the page (`docs/agents/voice.md`, Concrete sentences, second
     paragraph). Any other change is **drift**. Concrete sentences 1, 2, and 5
     to 8 govern wording, so a change they would explain is drift unless the
     issue, the PR body, or an instructor decision names it.
   - Every requirement, number, procedure, or rule the diff adds traces to the
     issue, an instructor decision or a fix in the ledger, or a canonical home
     the page links. One that traces to none is a finding for the instructor,
     however reasonable it reads. One that restates a fact whose home is
     elsewhere becomes a link.
4. **PR body**: the Canvas line and the Ran locally line, against the diff.

## Rules

5. **Register**: staff procedure on a page a student reads is a hard
   finding (`docs/agents/voice.md`, Person). On an assignment page, a
   sentence about course design is a hard finding: why the assignment exists,
   what it replaced, what past cohorts did, "by design", "on purpose"
   (`cs46x-assignments`, Section Skeleton, item 2).
6. **Section contracts**: each content skill's section shape
   (`cs46x-activities`, Required Section Shape; `cs46x-assignments` and
   `cs46x-guides`, Section Skeleton). A missing required section is hard;
   section order is judgement.
7. **Checkable expectations**: a rubric criterion (`cs46x-assignments`,
   Rubric Rules) or a stated expectation (`docs/agents/voice.md`, Concrete
   sentences) that names nothing a reader could observe is a finding.
8. **The hard rules where patterns miss**: the date forms `AGENTS.md`, hard
   rule 5, says `validate-dates` misses; grading words with no number beside
   them on an activity or guide (`cs46x-activities`, What an Activity Is;
   `cs46x-guides`, Guides Are Standalone);
   and a page body that names Canvas (hard rule 7).
9. **Length**: each section `section-words.mjs` flags `OVER` or `GREW`, with
   its numbers (`cs46x-assignments`, Length); a guide past its split-check
   (`cs46x-guides`, Length) or an activity past its 400-word test
   (`cs46x-activities`, Explanation versus instrument), with the number; on an
   audience page, each outbound link that answers no question its reader asks
   (`AGENTS.md`, Audience pages are orientation, not a course index).
10. **Voice**, on every handbook page in the diff: the reverse outline
    (`docs/agents/voice.md`, Structure) of each changed paragraph, in the
    report; then its Person, Claims, Structure, Concrete sentences, Sentences
    and words, Asides, Examples of project work, and The floor sections,
    cited per finding.

Done when each of the ten has a line in the report, its findings or
"checked, clean", and Intent accounts for every rewritten or deleted hunk:
its drift, or a count of the hunks whose changes are all intended.

## Report

Findings above the bar only, each with Hard or Judgement, `file:line`, the
quoted hunk, the rule or spec line, and the smallest fix by the ladder
(`SKILL.md`, Fix by the Ladder). Drift gives the old text and the new;
restoring the old wording is always one fix. Under 600 words, the reverse
outline and the drift list aside.
