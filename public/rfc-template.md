<!-- docs/rfcs/YYYY-MM-DD-short-title.md (or docs/adr/, whichever your repo uses) -->

# RFC: [Short, Specific Title]

<!-- Decision record header. Leave Status as "Draft" while the RFC is under review.
     When your team decides, fill in the outcome and the decision date. The
     document stays where it is; this header is what makes it a record. -->

| Field | Value |
| --- | --- |
| Author | |
| Date | YYYY-MM-DD |
| Status | Draft / In Review / Accepted / Rejected / Superseded |
| Decision Date | (fill when decided) |
| Deciders | (who agreed to the outcome) |
| Superseded By | (link, if applicable) |

## Problem and Context

What decision is needed, why now, and what happens if the team does nothing. Write this so a newcomer to the project understands the stakes. 2 to 4 paragraphs.

## Options

At least three credible options, **including "do nothing"**. Give each option a short name and an account of its real costs. An option you would be embarrassed to recommend is not credible; a strawman weakens the whole document.

### Option A: [Name]

Description, benefits, costs.

### Option B: [Name]

Description, benefits, costs.

### Option C: Do Nothing

What staying on the current path actually costs, and when that cost arrives.

## Analysis

The technical tradeoffs that matter for this decision: performance, complexity, maintainability, security, cost. Argue from evidence (benchmarks, prototypes, documentation, prior art) and cite what you relied on so a reviewer can check it. Acknowledge what you are uncertain about.

## Recommendation and Verification Plan

Which option you propose and why it wins the analysis above. Then, concretely: how will the team know it worked? List the tests, metrics, or acceptance criteria that would detect failure, and when they will be checked.

## Constraints

Licensing, data use, IP, and the partner confidentiality boundary as they bear on this decision. If none apply, say so explicitly and briefly explain why.

## Delegation and Validation

- **What you handed to AI tools** on this decision, whether that was the analysis, the prototype, the tests, or the writing.
- **What checks made that reasonable**: tests, CI, review gates, a staging environment, a rollback path. Name the ones that actually exist in your repo, not the ones you intend to build.
- **Where you stopped and validated the result yourself, and why those points.** If this decision is hard to reverse, say what you personally checked before committing to it.

What is assessed is in the [AI policy](https://capstone.alexulbrich.com/assignments/introduction/#ai-policy-applies-to-every-assignment).

## Response to Feedback

Written at revision time, after the week 5 peer review. One short paragraph per reviewer:

- **What they raised**, in your words, not a quote dump.
- **What you changed because of it**, pointing at the section above that moved. If you changed nothing, say why the objection does not hold.

Reviewers whose points you accepted should be able to find their fingerprints in the document.

## Decision

Accepted, rejected, or superseded, with the date and who chaired the decision. If superseded, link the RFC that replaces this one.
