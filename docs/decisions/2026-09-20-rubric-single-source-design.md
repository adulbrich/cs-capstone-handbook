# Design: One Rubric, Rendered From the Canvas TSV

Date: 2026-09-20
Branch: `docs/rubric-single-source`
Status: implemented in #144. Section 6's open decisions are resolved; the resolutions are recorded inline.
Companion documents: `AGENTS.md` hard rule 4 (which this design inverts), `canvas/assignments/assignment-readme.md`, `.claude/skills/cs46x-assignments/SKILL.md`, `scripts/validate-outcomes.mjs`.

## 1. Why

Every graded rubric in this repository exists twice, and both copies are written by hand.

1. The `## Rubric (100 points)` table in `src/content/docs/assignments/*.mdx`, three columns: criterion, points, outcome tags.
2. `canvas/assignments/<dir>/*-rubric-details.tsv`, twelve or fifteen tab-separated fields per criterion, holding the same points and tags plus three or four band descriptions.

Nothing generates one from the other. `scripts/validate-outcomes.mjs:325-378` reconciles only the **set of outcome tags** between them. Criterion names, point values, and band text are unchecked, and they have already drifted:

| Source | Polish criterion, `landing-page` |
|---|---|
| `landing-page.mdx` | `alt text, sufficient contrast, descriptive link text, no broken anything` |
| `project-landing-page-rubric-details.tsv` | `alt text on every meaningful image, sufficient color contrast, descriptive link text, and nothing broken.` |

#141 proposes validating band descriptions as a third reconciliation. This design removes the need for any reconciliation instead: the TSV becomes the single source and the handbook page renders it.

The same instructor already runs this pattern in
[`adulbrich/cs312`](https://github.com/adulbrich/cs312/blob/main/src/components/RubricTable.astro),
which is the reference implementation this design ports.

## 2. What changes

The TSV is the source. The MDX page imports it as a raw string and renders it:

```mdx
import RubricTable from '../../../components/RubricTable.astro';
import rubricTsv from '../../../../canvas/assignments/rfc/rfc-rubric-details.tsv?raw';

## Rubric

<RubricTable tsv={rubricTsv} sourceLabel="canvas/assignments/rfc/rfc-rubric-details.tsv" />
```

`?raw` is a Vite feature and needs no Astro configuration. The TSV stays exactly what the Canvas rubric-import browser extension consumes, so the Canvas workflow is unchanged.

## 3. The field the handbook needs already exists

The handbook criterion cell and TSV field 1 are not the same text. Taking `defense`, criterion 1:

| Where | Text |
|---|---|
| `defense.mdx:52` | `Ownership and delegation: presents work they demonstrably own, and explains what they handed to AI tools, what safety net made that reasonable, and where they stopped to validate` |
| TSV field 1 | `Ownership and delegation [SO2, SO4]` |
| TSV field 6 (Exceeds band) | `Presents work they demonstrably own end to end (authored or drove it, responded to review, merged it); claims match the repo record when spot-checked.` |

The handbook's clause after the colon appears nowhere in the TSV, so a naive port would delete it.

It does not need a new field. **TSV field 2 (index 1) is Canvas's criterion description column**, which every capstone TSV currently leaves empty, and which `cs46x-assignments` documents only as "empty". The cs312 component already reads it as `description` and renders it under the title. So:

- TSV field 1 keeps the short name plus bracketed outcome tags, as today.
- TSV field 2 takes the handbook's "what is being judged" clause, moved verbatim from the MDX criterion cell.

This is a gain on the Canvas side too: the clause becomes the criterion description a grader sees in the Canvas rubric, where today they see only the short name.

## 4. The component

Port `RubricTable.astro` from cs312 into `src/components/`. Three changes for this repository:

1. **Drop the "Always refer to Canvas" paragraph.** In cs312 Canvas is authoritative. Here `AGENTS.md` hard rule 4 says the handbook wins, and after this change the repository is upstream of Canvas in both directions. The line would be false.
2. **Render the outcome tags as their own column or badge.** The capstone's field 1 carries `[SO2, SO4]`; cs312's does not use tags. Parse them out of the title so the page keeps the accreditation record visible rather than burying it in a bracket.
3. **Keep the variable-width rating-group loop unchanged.** It reads repeating three-column groups until an empty one, which is why `defense` (four bands, 15 fields, with a `Missing` band at 0) works with no special case, alongside the twelve-field three-band rubrics and the nine-field pass/fail ones.

Tailwind v4 is already a dependency (`@tailwindcss/vite`, `astro.config.mjs:157`), so the component's utility classes port as written.

## 5. What `validate-outcomes.mjs` becomes

The validator currently parses the MDX rubric table as the source of truth (`extractTags`, `rubricTotal`) and separately parses the TSVs (`canvasTags`) to reconcile them. After this change it parses the TSV only:

- Outcome tags come from TSV field 1, reconciled against the page's `assignment.outcomes` frontmatter. The frontmatter stays: it is what the coverage minimums are computed from.
- Rubric totals sum the maximum points per criterion across that criterion's rating groups.
- `canvasTags()` and the two `MIRROR DRIFT` errors are deleted. There is no mirror left to drift.
- #141 closes as superseded.

## 6. Open decisions

**6.1 The four pages with no TSV. Resolved.** Fourteen of eighteen assignment pages had one.

| Page | State | Proposal |
|---|---|---|
| `term-retrospective.mdx` | Had a rubric, no TSV. | **Done.** Authored 12-field, three bands at 25/20/20/25/10, tags `SO5, SO3, SO2, SO3, SO3` matching the frontmatter. Needs creating in Canvas. |
| `peer-evaluations.mdx` | Qualtrics instrument, table carries weights not points. One of three `RUBRIC_EXCEPTIONS`. | **Stays hand written, no weights mode.** A weights mode would be a second rendering path serving two pages, and their tables are not rubrics: they carry no bands and no points. The validator reads their tags from the Markdown table, as before. |
| `project-partner-evaluation.mdx` | Same. | Same. |
| `workshop-activities.mdx` | Three tagless pass/fail TSVs, and the page has no rubric section at all. | **Canvas only.** Rendering them would add three tables to a page that deliberately has none. Listed in the validator's `CANVAS_ONLY`. |
| `introduction.mdx` | No rubric, correctly. | No change. |

**6.2 One page, several TSVs. Resolved: neither is rendered.** `workshop-activities` and `individual-contribution` hold one TSV per term because the item count differs by term, and `sprint-notes.mdx` was mapped from two directories at once. Both turned out to be Canvas-only: the workshop page has no rubric section, and the individual contribution modifier is described in prose on the Sprint Notes page rather than shown as a table. So the component keeps its single `tsv` prop, `sprint-notes.mdx` renders `sprint-note/` only, and the validator's new `CANVAS_ONLY` set holds the two directories so the unmapped-directory guard does not fire on them.

## 9. What implementation changed about this design

Two things the record did not anticipate, both found by reading the rendered output:

**Descriptions that only restate the top band were dropped.** Moving every handbook criterion clause into field 2 produced 68 descriptions, of which **18 were near-identical to their own Exceeds band** (`incident-postmortem` row 1 was a character-for-character match). Rendered, the row said the same sentence twice. Those 18 are empty; the remaining 50 add something the bands do not.

**Code spans were stripped.** Four descriptions inherited backticks from the MDX (`docs/design.md`). No band description anywhere in the corpus uses them and Canvas renders a backtick literally, so they were removed rather than teaching the component Markdown for four rows.

## 7. What this inverts

`AGENTS.md` hard rule 4 reads "The handbook outranks Canvas. If a rubric TSV and a handbook rubric table disagree, the handbook is right and the TSV is the bug." After this change there is no handbook rubric table to disagree with, and the TSV is the rubric. The rule needs rewriting rather than deleting: the handbook still outranks what is *in* Canvas, because the TSV is imported into Canvas and never read back out. The `cs46x-assignments` skill's **Canvas Mirroring** section needs the same treatment, and its "twelve fields" claim is already wrong for `defense`.

## 8. Sequencing

After #140 and #143 merge. Both touch assignment pages, and #143 rewrites prose on all eighteen of them; landing a structural change to the same files underneath an in-flight prose migration buys nothing and costs a merge.
