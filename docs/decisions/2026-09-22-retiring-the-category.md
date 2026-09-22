# Design: Show Examples, Never Name a Category

Date: 2026-09-22
Branch: `feat/outcome-types-and-links`
Status: implemented. The words "outcome type", "project type" and "project category" are retired from the handbook, the Canvas mirrors and the downloads. `scripts/check-prose.mjs` rejects all three under the content paths, and `about/glossary.mdx` records the retirement on the **Definition of Shipped** entry.
Companion documents: `2026-09-21-outcome-type-ownership.md` (whose rule survives, whose vocabulary does not), `about/glossary.mdx`, `assignments/definition-of-shipped.mdx`, `guides/shipping.mdx`.

## 1. Why

The four paths were introduced to help. A team building a product and a team contributing upstream do not need the same preparation, and saying so is useful. Naming the set was the mistake.

Once the four had a collective noun, they read as a classification. The handbook then spent its own words fighting the reading it had created: "it is guidance, not a classification you are assigned", "not every project is one of the four", "plenty of projects fit none of the four cleanly". Three separate issues (#156, #161, #177) each corrected one facet of the same misreading, and the misreading kept coming back, because the noun was still there inviting it.

The concrete cost is that a student's first question became "which one am I?" rather than "what did we agree shipped means?". Those are not the same question and only the second one is graded. The rubrics never read the type: they read the rung the team committed to and whether the partner agreed it.

## 2. The rule

**Show the examples. Name no category.**

- `guides/shipping.mdx` keeps its four sections, FOSS, New Product or Game, Research and Consultancy, as worked examples of getting up the outcome ladder. Their headings are unchanged, because two pages link into them by anchor.
- Nothing collects them under a noun. Assignment pages carry an **Examples** table whose first column reads "If your project is".
- `assignments/definition-of-shipped.mdx` asks for **the expectations the team and the partner agreed**, in the team's own words, plus the rung. A project that matches none of the four writes its own expectations, which costs nothing.
- The **outcome ladder** is a different thing and stays. It is one scale for every project, it is what the spring Verification and Validation facet is scored against, and `scripts/project-partner-end-of-term-surveys.R` builds its Q6 from it.

## 3. What this replaces

The previous position, from #177, was that the four were "example paths" but still collectively "outcome types". That kept the noun and therefore kept the problem; it is superseded here.

## 4. How it is enforced

`scripts/check-prose.mjs` rejects `outcome type`, `project type` and `project category` under `src/content/docs/`, `canvas/`, `public/` and `decks/`. The glossary's **Definition of Shipped** entry carries the matching `Not:` list, and `glossaryDrift()` keeps the two equal in both directions. The two content skills state the rule for agents.

Design records and this file are outside the checked paths on purpose: the history has to be able to say what the words were.
