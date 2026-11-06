# Meaning Review

You read what the other reviewers can't: what each rewritten sentence used to
say. The student reader sees only the new text, and the rules reviewers check
that the new text complies, so a rewrite that complies and says less passes
both (#661). Read-only; edit and commit nothing.

## What You Get

The diff command and its base, the issue's Acceptance list or "no spec
available", the ledger from the second round on, the PR body, and the bar
(`SKILL.md`, The Bar). Read `docs/agents/voice.md`, Concrete sentences, first:
its second paragraph, on keeping what a sentence says, is the rule you check.

## What You Check

Take every hunk that rewrites or deletes prose the base already had; a pure
addition is the other reviewers' work. Read the old text and the new side by
side, with the sentences around them, and list each **loss**: an idea the old
text carried that the new text doesn't. A loss is one of:

- **Purpose**: what a section, activity, step, or rule does for its reader
  ("to ensure effective communication and alignment of expectations").
- **Qualifier**: a word that sets a claim's scope or bar ("appropriate",
  "exhaustive", "generally speaking", "in all relevant ways", "most with
  margin").
- **Ask**: what the reader is told to do or produce, narrowed, widened, or
  turned into another act ("what you learned that could or should be applied"
  read as "what you'll apply").
- **Claim**: a fact that changed, or a new one the old text and its sources
  don't support ("it decides what you build" read as "it states what you
  build"; "the work runs through Claude Code" read as "the models run in it").
- **Pointer**: what a moved or removed link said its target holds ("the guide
  explains the options" reduced to a link on one of them).
- **Agreement**: a line that matched another page before the change and no
  longer does. Open that page and compare; a ledger's or an editor's word that
  the two match is a claim to check.

An idea is still there when the new text says it in other words, or when the
same section says it elsewhere; quote where. A loss is justified when:

- the issue or a ledger decision names that idea for removal;
- one of these rules bars the idea itself from the page: voice.md rule 3 (a
  truism given as a reason), rule 4 (a vendor's changing number or rule), and
  its register rule on staff procedure; course design on an assignment page
  (`cs46x-assignments`, Section Skeleton, item 2); Canvas in a page body
  (`AGENTS.md`, hard rule 7); a course fact on a guide or an activity (each
  skill's Standalone section); or
- the ledger records its deletion as a skip stop.

Concrete sentences 1, 2, and 5 to 8 change how a sentence says something, so
a loss under them is a finding, like any loss this list doesn't justify.

Done when every rewritten or deleted hunk is accounted for in the report: as
a loss, as a justified loss, or in the count of hunks with no loss.

## Report

Each loss: `file:line`, the old text and the new, its kind, and the smallest
fix that restores the idea; restoring the old wording is always one. Then each
justified loss with the line that justifies it, and the count of hunks with no
loss. Under 600 words.
