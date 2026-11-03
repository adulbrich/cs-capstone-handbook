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
   un-drafted or a sidebar changed with no line in the PR body; a fact whose
   meaning moved while its wording was tidied.
3. **Source trace**: every requirement, number, procedure, or rule the diff
   adds traces to the issue, an instructor decision or a fix in the ledger,
   or a canonical home the page links. One that traces to none is a finding
   for the instructor, however reasonable it reads. One that restates a fact
   whose home is elsewhere becomes a link.
4. **PR body**: the Canvas line and the Ran locally line, against the diff.

## Rules

5. **Register**: staff procedure on a page a student reads (who flags, who
   confirms, a response window, what a grader opens or clicks) is a hard
   finding; it belongs in `STAFF-RUNBOOK.md`. On an assignment page, a
   sentence about course design is a hard finding: why the assignment exists,
   what it replaced, what past cohorts did, "by design", "on purpose"
   (`cs46x-assignments`, Section Skeleton, item 2).
6. **Section contracts**: each content skill's skeleton. A missing required
   section is hard; section order is judgement.
7. **Checkable expectations**: a rubric criterion or stated expectation reads
   as an observable behavior or artifact. An adjective with no observable
   ("professional", "clear") is a finding.
8. **The hard rules where patterns miss**: a bare "May" or "Mar" used as a
   month, "academic year" or "this year" with no year number, a season
   standing in for a term week, grading words with no number beside them on
   an activity or guide, and a page body that names Canvas (`AGENTS.md`, hard
   rules 5 and 7).
9. **Length**: each section `section-words.mjs` flags `OVER` or `GREW`, with
   its numbers (`cs46x-assignments`, Length); a guide or an activity past
   its skill's length check, with the number; on an
   audience page, each outbound link that answers no question its reader asks
   (`AGENTS.md`, Audience pages are orientation).
10. **Voice**, on every guide and audience page in the diff: the reverse
    outline (`docs/agents/voice.md`, Structure) of each changed paragraph,
    in the report; then the Claims, Person, Structure, and Sentences and
    words sections, cited per finding.

Done when each of the ten has a line in the report: its findings, or
"checked, clean".

## Report

Findings above the bar only, each with Hard or Judgement, `file:line`, the
quoted hunk, the rule or spec line, and the smallest fix, deletion first
(`SKILL.md`, Fix by the Ladder). Under 600 words, the reverse outline aside.
