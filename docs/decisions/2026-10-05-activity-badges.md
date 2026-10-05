# Design: The Activity Badge Line Is Generated

Date: 2026-10-05
Branch: `feat/415-generated-activity-badges`
Status: implemented in #415, the first sub-issue of #121. The effort backfill, the regroup into twelve pages, and the activity merges follow as separate sub-issues.
Companion documents: `AGENTS.md` ("How activity tiers stay true"), `.claude/skills/cs46x-activities/SKILL.md` (Tiers, the badge line), `.claude/skills/cs46x-assignments/SKILL.md` (the "Activities That Prepare This" section), `src/lib/activity-links.mjs`, `src/components/ActivityMeta.astro`, `scripts/validate-activities.mjs`.

## 1. Why

Each activity carried hand-written badges: an audience badge (Individual, Team, or both) and, where it applied, a tier badge (Workshop or Recommended). Three things were wrong with them.

- **The Recommended badge was a second copy of a fact.** An activity is Recommended because an assignment's "Activities That Prepare This" section links it. The badge restated that by hand, and `scripts/validate-activities.mjs` carried two rules (a linked activity must be badged, a badge must be earned) whose only job was catching the two copies drifting. The Workshop badge was a third copy of what `assignments/workshop-activities.mdx` already says, with its own reconciliation leg.
- **A bare tier badge told the student nothing they could act on.** Recommended for what? Under the standalone rule the activity could not say which assignment, criterion, or term it served.
- **The audience badges misled.** Definition of Done, Kanban Board Setup, and Risk Management Plan were all marked Individual, though none of them works without the team.

## 2. The rule

The badge line under every activity heading is `<ActivityMeta>`, computed at build. In order:

1. `Whole team`, optional, only on an activity that fails without everyone present.
2. The effort, optional for now, on the fixed scale `15 min`, `30 min`, `1 h`, `1 to 2 h`, `Half day`, `Multi-day`, `Ongoing`.
3. `Workshop N, <term>`, linking the activity's `### Workshop N:` section on `assignments/workshop-activities.mdx`.
4. `Prepares:`, then one badge per assignment whose "Activities That Prepare This" section links the activity, each linking that section.

The tier is computed from the same two sources and never written: Workshop when the workshop page names the activity, Recommended when an assignment links it, library otherwise. A workshop that assignments also link counts as Workshop and shows both badges. Promoting or demoting an activity is therefore an edit to an assignment page only.

The Individual and Team badges are retired. Whether one person or several run an activity rarely changes what to do; whether the whole team must be present does, so that is the one audience fact the line keeps.

The standalone rule is amended: the generated badge line may name course pages (assignments, workshops, terms), because it is computed from them. Prose on activity and guide pages still may not.

A second rule joins the `cs46x-activities` skill: an activity that needs a capable AI agent ends its steps with an "If your tooling can't ..." substitute that reaches the same artifact without it.

## 3. How it works

`src/lib/activity-links.mjs` holds pure functions over raw MDX: the prep-section parser (the section ends at the next `## `), the workshop-entry parser, the index from activity key (`page#anchor`) to its workshop entry and the assignments it prepares, the tier, and a `slugify` matching github-slugger. Two consumers share it, so the badge a student sees and the tier the validator counts cannot disagree:

- `src/components/ActivityMeta.astro` reads the assignment pages from the docs collection (`entry.body` is the raw MDX) and caches the index per build, keyed on the entries' digests so the dev server rebuilds it when an assignment changes. Linked badges are Starlight's `Badge` inside an anchor: `Badge` takes no `href`, and its styles are scoped to its own instances, so an anchor carrying the same classes would render unstyled.
- `scripts/validate-activities.mjs` reads the same pages with `fs`. It defines an activity as a `##` section with `<ActivityMeta` on its badge line, checks that `anchor` equals the heading's slug and that `effort` is on the scale, reports any hand-written audience or tier badge left over, and keeps its anchor, schedule, workshop-week, closing-line, standalone, outcome-tag, and library-claim checks. Rules 1 and 2 and the "workshop not badged" leg are gone, because nothing is left to drift.

Two details changed in passing. The prep section used to run from its heading to end of file; it now ends at the next `## ` (only Peer Evaluations has one after it, `## References`, which links no activity, so the linked set is unchanged at 97 page-activity pairs). And the validator's old `slugify` collapsed runs of hyphens, so `Is / Is-Not` became `is-is-not` there while Starlight emits `is--is-not`; the shared one keeps the run.

## 4. What it left open

- The effort backfill: 28 of 119 activities carry an effort badge after this change, set only where the opening already stated one that sits on the scale. The rest wait for the backfill sub-issue, after which the validator requires it.
- Whether the Recommended count of 46 should shrink toward the roughly 20 budgeted in `docs/decisions/2026-08-17-four-skills-assessment-design.md` §4.4 is a separate decision about the prep sections, not about badges.
