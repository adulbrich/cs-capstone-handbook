# Design: Examples by Concept, Not by Kind of Project

Date: 2026-10-30
Branch: `docs/608-examples-by-concept`
Status: implemented in #608. Supersedes `2026-09-22-retiring-the-category.md` in full. The words that record retired stay retired, and `scripts/check-prose.mjs` still rejects them.
Companion documents: `2026-09-21-outcome-type-ownership.md` (whose rule survives: the team and the partner agree what shipped means), `guides/shipping.mdx`, `assignments/definition-of-shipped.mdx`, `assignments/project-partner-evaluation.mdx`, the `cs46x-assignments`, `cs46x-activities`, and `cs46x-guides` skills.

## 1. Why

The 2026-09-22 record retired the collective noun for the four kinds of project (FOSS, Research, Consultancy, New Product or Game) and kept the four themselves as worked examples. The structure outlived the noun. Examples tables had one row per kind, the Shipping guide had one section per kind, the success metrics activity had one subsection per kind, and every rung of the spring outcome ladder gave one labelled example per kind. A student's first job was still to decide which kind they were, and a project that was two of them, or none, had to translate.

Renaming the four would keep the same structure, so the fix changes what the examples are organized by.

## 2. The rule

Where students need an example, the examples illustrate the concept on that page (what deployed means, what CI runs, what a success metric counts, what a committed rung reads like), drawn from varied work. A project may match several examples or none. Every example set includes:

- **A slow start, stated well.** Some projects can't move fast early: the partner asks for research and planning or design work first, or the data agreement, the IRB, or the partner's IT review sets the pace. One example shows a team saying plainly where it is and why.
- **The way out.** If none of the examples fits, the team agrees with its partner or mentor what does, and records it where that page records things.

An Examples table of activities is the exception: it carries only the way out, in its lead-in, because a slow start is a state of the work, not a choice of activity.

Three wording rules apply to every example:

- **Open source means open source.** An example that turns on maintainers deciding what merges says "an open-source project you contribute to". Contributing to the partner's own codebase is not that case, even in a public repository.
- **No tool names, weeks, or dates** in an example whose concept doesn't need them.
- **Say who.** The top rungs ask for independence: someone who didn't build it, using or rerunning it without the team's help and not as a favor. Examples name that person (a graduate student in the lab, a peer, the partner's staff, people outside the team) rather than "a stranger".

Retired: any table, heading, badge, or rubric text that enumerates projects by kind, under the old four names or new ones. A clause that names a trigger ("if the project is part of a research study with human subjects", "if you contribute to an open-source project") is fine, and so is a single example that happens to be one kind of project.

## 3. What changed

- **Examples tables** on assignment pages key their rows on what that assignment cares about (`| If | Activities |`), rows may overlap, and the lead-in carries the way out.
- **The Shipping guide** is organized by whose action the top rungs wait on: maintainers merging a contribution, people using it without the team, someone reproducing a result, the partner's environment. A project reads every section its target rung depends on.
- **The outcome ladder** keeps one rung list for every project. Each rung now gives one "For example" sentence of mixed, unlabelled examples, and `RubricCriterion`'s `split` prop, which existed only to list the labelled examples, is gone.
- **Repo Checkpoint 1** accepts CI that builds the project and checks the quickstart, with no tests yet, at Meets when `README.md` says why and what will trigger the first tests. Repo Checkpoints 2 to 4 still expect tests.
- **Showcase badges** naming a kind of project are dropped; the platform badges and descriptions already say what each project is.

## 4. How it is enforced

No lint rule. What the rule prevents is a structure that enumerates by kind of project, which no word list catches; review does, against the `cs46x-activities`, `cs46x-assignments`, and `cs46x-guides` skills. Design records stay outside the checked paths, so this file can say what the old structure was.
