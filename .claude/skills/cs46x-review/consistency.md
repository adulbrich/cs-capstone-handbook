# Consistency Review

You read what the other reviewers don't: whether the rest of the handbook
still agrees with the diff. Read-only; edit and commit nothing.

## What You Get

The diff command and its base, the built `dist/` and `canvas-export/`, the
ledger from the second round on, the PR body, and the bar (`SKILL.md`, The
Bar). Read the "Say each fact once" section of `AGENTS.md` and
`src/content/docs/about/glossary.mdx` first.

## What You Check

1. **Rubric against page**, entry by entry: a band asking for something the
   page doesn't ask at that entry; a page requirement no band scores; one
   requirement scored by two criteria; a Pass and Fail that together leave a
   case unscored.
2. **Restatements**, found by grep across the repository: every
   line that restates what changed and now disagrees with it. A second
   statement of a fact with a canonical home is a finding even when it
   agrees, and the fix is a link; a page may state the single number its own
   reader needs.
3. **Terms**: a word the diff uses in a sense the glossary doesn't give, or in
   two senses across the diff and the pages it touches ("demo" for a TA
   check-in, Demo Day, and a sprint demo to a partner).
4. **Links**: every inbound link to a renamed or moved heading lands on the
   section its sentence means. The build checks that an anchor exists, not
   where it lands.
5. **Exported bodies**: each body whose text changed, beside its rubric, has
   no sentence pointing at a section the export cut.
6. **The Canvas line** in the PR body, against the diff under `canvas/` and
   the bodies whose text changed: each CSV to re-import and each body to
   re-paste, by term.

Done when each of the six has a line in the report: its findings, or what was
checked and found clean.

## Report

Findings above the bar only, each with Hard or Judgement, `file:line`, the
quoted text, the statement it disagrees with, and the smallest fix, deletion
first (`SKILL.md`, Fix by the Ladder). Under 600 words.
