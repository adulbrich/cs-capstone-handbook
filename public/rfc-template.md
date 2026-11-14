<!-- docs/rfcs/YYYY-MM-DD-short-title.md (or docs/adr/, whichever your repo uses) -->

# RFC: [Short, Specific Title]

<!-- Decision record header. Set Status to where the decision stands, and fill in
     the decision date once your team decides.
     The document stays where it is; this header is what makes it a record. -->

| Field | Value |
| --- | --- |
| Author | |
| Date | YYYY-MM-DD |
| Status | Proposed / Accepted / Rejected / Superseded |
| Decision Date | (fill when decided) |
| Deciders | (who agreed to the outcome) |
| Superseded By | (link, if applicable) |

## Problem and Context

What decision is needed, why now, and what happens if the team does nothing. Write this so a newcomer to the project understands the stakes. 2 to 4 paragraphs.

## Options

At least three options, **including "do nothing"**. Give each option a short name, an account of its real costs, and the condition under which it would be the right choice. An option with no such condition is a strawman, and a strawman weakens the whole document.

### Option A: [Name]

Description, benefits, costs.

### Option B: [Name]

Description, benefits, costs.

### Option C: Do Nothing

What staying on the current path actually costs, and when that cost arrives.

## Analysis

The technical tradeoffs that matter for this decision: performance, complexity, maintainability, security, cost. Argue from evidence (benchmarks, prototypes, documentation, prior art) and cite what you relied on so a reviewer can check it. Acknowledge what you are uncertain about.

## Recommendation and Verification Plan

Which option the analysis above supports and why, even if your team chose another. Then, concretely: how does the team know, or how will it know, that the decision worked? List the tests, metrics, or acceptance criteria that would detect failure, and when they are checked.

## Constraints

The licensing, data use, IP, or confidentiality limits this decision must respect. Leave out the areas that don't bear on it. For each limit that does, say what it changes: the option it rules out, the condition it puts on the recommendation, or the check it adds to the verification plan. If none applies, say what you checked (the licenses of what an option adds, the data it stores, who owns the code it touches) and why none limits this decision.

## Delegation and Validation

- **What you handed to AI tools** on this decision, whether that was the analysis, the prototype, the tests, or the writing, or that you handed nothing, and why.
- **What checks made that reasonable**: tests, CI, review gates, a staging environment, a rollback path, or your project's equivalent, such as a held-out test set. Name the ones that actually exist in your repo, not the ones you intend to build.
- **Where you stopped and validated the result yourself, and why those points.** If this decision is hard to reverse, say what you personally checked before committing to it.

## Decision

Where the decision stands: proposed, or accepted, rejected, or superseded, with the date and who chaired the decision. If superseded, link the RFC that replaces this one.

## References

Every source the RFC cites, with a link where one exists.
