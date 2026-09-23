# Design: One Canvas Entry per Due Date

Date: 2026-09-23
Branch: `feat/259-canvas-entry-model`
Status: implemented in #259, part of the fall assignment feedback cycle (#258). Rules 3 and 4's survey exception was reversed by #300: every survey entry is 100 points in a group of its own, and names a rubric.
Companion documents: `AGENTS.md` hard rule 6, `canvas/assignments/assignment-readme.md`, `.claude/skills/cs46x-assignments/SKILL.md`, `scripts/validate-outcomes.mjs`, `src/lib/canvas-entries.mjs`, `docs/decisions/2026-08-19-canvas-import-package-design.md` (whose one-assignment-per-page mapping this refines).

## 1. The rule

A Canvas assignment carries its own due date, late window, grade and submission. **Several Canvas entries are never bundled into one**, even when the handbook keeps them on one page so students read one page instead of four. Four sprint notes are four entries; a draft and a final are two.

The handbook page is still the unit students read. What changes is that the page says, in machine-readable form, which Canvas entries it owns.

## 2. Why

Bundling had already happened in two places, and both hid a grade from the student until the last due date had passed:

- **Sprint Notes Individual Contributions**, one 400-point column per term holding four sprints. A deduction in sprint 1 was invisible until the column was touched, and one late regrade meant reopening all four.
- **Workshop activities**, one column per term with one checkbox per workshop, while Canvas already held Workshop 1 to 5 as separate entries. The handbook described the bundle, Canvas described the split.

The RFC was the third case in waiting: a draft, a peer review and a final in one term, with one rubric that graded the peer review as a 5-point criterion of the final.

## 3. The model

`assignment.canvas` in each graded page's frontmatter lists **families**. A family is one Canvas name pattern, one Canvas assignment group, the weeks it is due in each term, the weight it carries per term, its Canvas points, its submission type, and its rubric TSV. It expands to one Canvas entry per week listed; `{n}` in the name numbers them.

```yaml
canvas:
  - name: "Sprint Notes {n}: Individual Contribution"
    group: Sprint Notes
    weeks: { fall: [4, 6, 8, 10], winter: [2, 4, 6, 8, 10], spring: [2, 4, 6] }
    weight: { fall: 4, winter: 5, spring: 3 }
    points: 100
    submission: none
    rubric: individual-contribution/individual-contribution-rubric-details.tsv
```

A family whose entries differ by more than a number adds `titles`, one per week listed in each term, and puts `{title}` in its name: `"Workshop {n}: {title}"` gives "Workshop 2: Map Your Hard-to-Reverse Decisions" (#285). The page table then lists a titled family's entries one row each.

`weight` is the whole family's share of the term grade, split evenly across its entries. Entries sharing a rubric share one TSV: the TSV is one per distinct rubric, not one per entry. `peer_review_week` marks an entry that uses Canvas's own peer review, so one entry legitimately carries two dates.

`src/lib/canvas-entries.mjs` expands the list. `src/components/CanvasEntries.astro` renders it on the page, reading the page's own frontmatter, so the table students see is the list the validator checks.

## 4. What the validator checks

`scripts/validate-outcomes.mjs`, in CI and pre-commit:

1. Every graded page declares at least one family.
2. Per term, the families' weights sum to the page weight.
3. Within one Canvas assignment group in one term, every entry carries the same weight per point. Canvas weights a group's entries by points, so this is the check that the gradebook will add up. It is why the surveys sit at 5 and 20 points and everything else at 100.
4. Every family's rubric is rendered on the page, and every rendered TSV belongs to a family. Only the two survey pages may omit a rubric.
5. A page owning more than one entry in a term renders `<CanvasEntries />`.
6. No two entries in one group and term share a name.
7. A page may render several `<RubricTable>`s. Each totals 100, each sits under a heading containing "Rubric", and the outcome tags sum across them against the frontmatter.

## 5. What moved

| Before | After |
|---|---|
| `individual-contribution/` three per-term TSVs, one criterion per sprint | one single-criterion TSV (Full 100 / Half 50 / Zero 0) for every sprint's sibling entry, rendered on Sprint Notes |
| `workshop-activities/` three per-term TSVs, one row per workshop | one complete/incomplete TSV for every workshop entry, rendered on Workshop Activities |
| `rfc/rfc-rubric-details.tsv`, nine criteria | `rfc-draft-` (draft completeness, reviews submitted, review quality) and `rfc-final-` (the other eight, Revision absorbing the 5 feedback points) |
| `CANVAS_ONLY` in the validator | gone: every Canvas directory is rendered by a page |

The RFC split keeps every outcome tag count, so the accreditation floors are unchanged. The RFC's 15% is now two Canvas groups, RFC Draft at 5% and RFC Final at 10%, because two entries at 100 points in one group would weight 50/50.

## 6. The import package

The package design (#5) mapped one Canvas assignment to one handbook page. With this model it generates one assignment per expanded entry, its group from `group`, its points from `points`, its rubric association from `rubric`, and its due date from the week plus the term calendar. The page body is the same for every entry of a family.
