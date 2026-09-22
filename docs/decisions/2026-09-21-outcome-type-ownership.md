# Design: The Outcome Type Is Agreed, Not Assigned

Date: 2026-09-21
Branch: `fix/outcome-type-ownership`
Status: implemented. `practicalities/types.mdx` is the canonical statement; every other page carries a short form and links to it.
Companion documents: `AGENTS.md:161` (canonical homes), `about/glossary.mdx:44`, `assignments/definition-of-shipped.mdx`.

## 1. Why

The team and the project partner or mentor agree the outcome type together, along with what counts as delivered. Between #109 and #110 the handbook said the opposite in three places, and the change was not argued anywhere: it rode along inside a vocabulary rename.

| Page | Before | PR |
|---|---|---|
| `introduction/for-partners.mdx:30` | "The team classifies the project ... you do not pick one" | #109 (`cc7ef1b`) |
| `practicalities/projects-and-teams.mdx:30` | "the team names it in its Definition of Shipped" | #109 (`cc7ef1b`) |
| `practicalities/types.mdx:12` | "nobody picks it for you: you name it" | #110 (`75a3c50`) |

Before #109, `for-partners.mdx` read "Pick one of the four project categories." The rename's real job was separating the submission portal's topic tag from the four outcome types, which is correct and is preserved. Deleting the partner's role was the cheapest way to delete the word, not a position anyone took.

The claim also contradicted the artifact it pointed at. The outcome type is named in the Definition of Shipped, which is due "Winter, week 3 (v1, partner-agreed)", is described as "a short, explicit agreement with your project partner", and carries `Partner agreement evidenced [SO3]` as a 15-point rubric criterion. The handbook told teams to name a field unilaterally inside a document they are graded on getting the partner to sign. Two pages already stated the correct rule for the neighbouring question: `for-partners.mdx:39` and `for-mentors.mdx:21` both say expectations are set with the students in the first sprint.

## 2. The rule

**The outcome type is guidance, and it is agreed.** It selects the shipping playbook and says how the outcome ladder's rungs read for a project. It does not change the grade and it is not a classification anyone is assigned. The team and the project partner or mentor agree it, and the team records it in the Definition of Shipped, which the partner confirms.

**Nobody names one at submission**, because no team exists yet and the portal's topic tag is a different thing. This is what #109 was right about and it stands.

## 3. What changed

Canonical statement in `practicalities/types.mdx`. Short form plus a link in `introduction/for-partners.mdx` and `practicalities/projects-and-teams.mdx`. Three further team-unilateral framings corrected: `types.mdx` student-proposed scope, `guides/shipping.mdx:8` ("before you pick your spring rung"), and the `for-mentors.mdx` Project Types card.

`about/glossary.mdx:44` already said "used only to read the outcome ladder and pick the shipping playbook" and is silent on ownership, which is correct for a glossary entry; it is unchanged.

## 4. Why this record exists

No validator can catch this. `validate-outcomes.mjs` reconciles weights, rubric tags and TSV totals, because those are machine-checkable relations. "Who decides this" is a semantic invariant spread across prose on five pages and one rubric criterion, and a rename can invert it with every gate green. The only place the #109 change was visible was its commit message, and nobody greps commit messages for policy. This file is what the next rename should find.
