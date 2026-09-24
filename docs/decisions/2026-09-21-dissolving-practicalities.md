# Design: Audience Pages Are Orientation, Not a Course Index

Date: 2026-09-21
Branch: `feat/162-dissolve-practicalities`
Status: implemented. Term Startup, cited below as an ungraded item, is graded since #305 (1% every term). `src/content/docs/practicalities/` no longer exists. The rule it broke is now written in `AGENTS.md` under "Audience pages are orientation, not a course index".
Companion documents: `AGENTS.md` (canonical homes, and the register rule), `.claude/skills/cs46x-guides/SKILL.md` (the equivalent rule for guides), `docs/decisions/2026-09-21-outcome-type-ownership.md`.

## 1. Why

The Practicalities section was meant to orient a student, a project partner, or a mentor: FAQ, not instruction. In practice its three pages carried 24 outbound links into assignments, guides, and activities, which made them a second table of contents for the course. Every one of those links is a page that can be renamed, split, or retired, and each rename silently made an orientation page wrong.

The guides register already forbids exactly this. `cs46x-guides` states that a guide is standalone and never references an assignment, and it gives the reason: the link between a guide and an assignment runs one way, from the assignment, so the page that changes is the page that carries the link. Practicalities never got the same rule, and nothing else in the repository said an orientation page should not accumulate links.

The second argument was inbound dependency, which is how this repository decides whether a page earns its place. Measured against `types.mdx`:

| Section | Inbound anchors |
|---|---|
| `#where-the-code-starts` | 6 (the fall week 5 gate defers to it) |
| `#who-runs-the-result-the-outcome-type` | 2 |
| `#where-it-comes-from` | 1 |
| `#new-product-or-game` | 1 |
| `## What Constrains It` | 0 |

`## What Constrains It` was restatement in every clause: the mandated stack and hosting are owned by the requirements guide, IP and NDA by `projects-and-teams.mdx`, lead times by the Shipping guide, and the no-production case by the fall week 5 gate. It was deleted rather than moved. The four outcome-type subsections had one inbound anchor between them and each duplicated a section of the Shipping guide.

## 2. The rule

**An audience page is orientation for one reader and does not become a course index.** It links an assignment, a guide, or an activity only where that page is the answer to the question being asked, and it states the fact the reader needs rather than sending them somewhere to look it up. The closing card grid is the page's index; the body is not a second one.

**Policy with two audiences gets its own page.** IP, NDA, and licensing terms are not orientation: they are rules with a legal edge that a student and a project partner both need, and restating them per audience is how three copies drift. The page is `introduction/ip-nda-and-licensing.mdx` and the audience pages link it.

The check is a count, not a judgment call:

```bash
grep -oE '\(/(assignments|guides|activities)/[^)]*\)' src/content/docs/introduction/for-students.mdx
```

`for-students.mdx` absorbed the most content of the three and finished with six such links, against the 24 the dissolved section carried.

## 3. What changed

| Content | Destination |
|---|---|
| `expo.mdx` | `assignments/expo.mdx`, an ungraded spring assignment: no `assignment:` block, a hand-created 0-point `omit_from_final_grade` Canvas item, same shape as Term Startup |
| How teams form, how projects are proposed and bid on, changing teams, pivoting | `introduction/for-students.mdx`, as two new sections |
| Submission deadline and what a proposal declares | Stated inline on `for-partners.mdx` and `for-mentors.mdx`, which previously deferred to Practicalities for both |
| IP, NDA, and Licensing | `introduction/ip-nda-and-licensing.mdx`, its own page |
| The inherited-codebase audit | `assignments/repo-checkpoints.mdx`, under a `### The Inherited-Codebase Audit` heading next to the fall week 5 gate that grades it |
| The four outcome types | `guides/shipping.mdx`, which already had a section each and now opens each one by saying what the type is |
| Who agrees the outcome type | `assignments/definition-of-shipped.mdx`, item 1 |
| `## What Constrains It` | Deleted |

Three guides linked into Practicalities and could not simply be repointed, because a guide may not link an assignment. `shipping.mdx` dropped the link and owns the definitions itself; `requirements.mdx` now points at `shipping.mdx`; `presentations.mdx` lost its Expo link and says what a public demonstration is instead of where the logistics live.

Eight redirects, not three. The five pre-existing `/practicalities/*` redirects chained through pages that this change deletes, so they were repointed at surviving destinations rather than left to resolve to a 404 through one hop.

## 4. Also settles #159

`types.mdx` told multi-team students that their split is "evaluated" in the Team Charter. The charter has eight required sections and seven rubric criteria and none of them is scope or the split, so the promise was unkeepable. The sentence went with the page.

What replaces it is a conditional item 6 in the Definition of Shipped's required contents: if other teams work on this project, what your team owns, agreed with the partner. It is scored under the existing 25-point target-rung criterion, so no criterion was added and the Canvas TSV did not change. The template in `public/` grew a matching section 6 so the two do not drift.

The fall week 5 gate did **not** get a parallel conditional clause, although the issue offered it. The reason the split lands in the Definition of Shipped rather than the Team Charter is that its scope is often not knowable in fall week 2; putting it back on a fall week 5 gate would reintroduce exactly the deadline that argument rejects. Week 1 already raises it as a discussion, as item 6 of Term Startup.

## 5. Why this record exists

The mechanical half of this change is checkable: `starlight-links-validator` fails the build on a broken internal link or anchor, so the 38 retargeted links verify themselves. The rule does not. Nothing in the toolchain can tell an orientation page from an index, and the previous section drifted into one over several years of individually reasonable edits, each of which added one helpful link. The count in section 2 is the cheapest check anyone has, and this file is what the next editor adding a link to `for-students.mdx` should find.
