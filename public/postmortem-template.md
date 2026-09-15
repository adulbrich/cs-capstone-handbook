<!-- docs/postmortems/YYYY-MM-DD-short-title.md -->

# Postmortem: [Short, Factual Title]

<!-- 2 to 3 pages. Blameless: the unit of analysis is the system, not the person.
     "Alex broke the deploy" is banned; "the deploy process allowed an untested
     migration to reach production because nothing checked for it" is the genre.
     The test: every person involved would happily co-sign this document. -->

**Team:** | **Incident date(s):** | **Date written:** | **Authors:**

## 1. Summary and Impact

What happened, when, and who or what was affected, in factual and measurable terms (hours lost, sprint items dropped, users affected, data at risk). 1 to 2 paragraphs.

## 2. Timeline

The sequence of events, decisions, and signals, including the signals that were missed. Timestamp where possible.

| When | What happened / what was known |
| --- | --- |
| | |
| | |
| | |

## 3. Root Cause Analysis

Why it happened, past the first answer. Use five-whys or a contributing-factors style. If detection was slow, include what made it slow. Stop when you reach causes the team can actually change.

## 4. What Went Well

What limited the damage. Honest credit: the backup that existed, the teammate who noticed, the rollback that worked.

## 5. Corrective Actions

3 to 5 specific changes. Distinguish "prevent recurrence" from "detect faster". At least one must be verifiable at the next repo checkpoint.

| Action | Owner | Due date | Type (prevent / detect) | Verifiable how |
| --- | --- | --- | --- | --- |
| | | | | |
| | | | | |
| | | | | |

## 6. AI Involvement (if any)

If AI-generated code or advice contributed to the incident or to the recovery, say so plainly. Both are normal and instructive; neither is an excuse or a scapegoat.
