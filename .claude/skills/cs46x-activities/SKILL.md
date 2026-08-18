---
name: cs46x-activities
description: Use when creating or editing activity pages (MDX files in src/content/docs/activities/) for the CS 461/462/463 capstone handbook. Defines the required section shape, badge vocabulary, tiering, and heading rules. Always load this skill before writing or editing any activity file.
---

# Activity Style Guide

This skill governs how activities are written for the CS capstone handbook
(Astro/Starlight, MDX). It exists because the activity library grew to 100-plus
entries across twelve pages without a written format, and pages added later
drifted from the ones added first. **The format below is the format. Bring
non-conforming activities into line rather than adding a second convention.**

## Writing Voice (applies to everything below)

Lead with the point. Specific nouns and verbs. Cut every sentence that does not
change what the reader will do or understand. No "it's worth noting,"
rule-of-three padding, or vague intensifiers. Opinion is preferred when a
recommendation is required. Code stays exact. For prose, never use emdashes but
use proper punctuation instead.

## What an Activity Is

An activity is a **self-contained exercise a team or student can run in one
sitting** to make a specific piece of graded work easier. It is not a tutorial,
not a lecture, and not an assignment. Three properties define it:

- **Bounded.** One sitting, stated up front. If it needs more than a few hours,
  it is a project, not an activity.
- **Productive of an artifact.** Something exists at the end that did not exist
  before: a diagram, a list, a matrix, a configured tool, a written page. The
  artifact is what makes the activity checkable and what makes it worth doing.
- **Attached to graded work.** Every activity should be traceable to a rubric
  criterion it prepares. Activities that prepare nothing are library filler.

Activities are **not graded on quality** anywhere in this course. Workshop-tier
activities are graded complete/incomplete on submission existing. Everything
else is ungraded. Never write grading language, point values, or rubric bands
into an activity page.

## Tiers

Every activity sits in one of three tiers, expressed as a badge:

| Tier | Badge | Meaning |
|---|---|---|
| Workshop | `Workshop`, `variant="caution"` | Everyone does it. Runs in class, graded complete/incomplete via [Workshop Activities](/assignments/workshop-activities/). |
| Recommended | `Recommended`, `variant="tip"` | Named on a specific assignment page as the cheapest route to a specific rubric criterion. |
| Library | no tier badge | Kept because it is good and some project will need it. Nobody is expected to do most of these. |

Tier is decided by which assignment pages link to the activity, so **do not
promote an activity to Recommended without adding it to an assignment page's
"Activities That Prepare This" section in the same commit.** A `Recommended`
badge that no assignment references is a lie to the student.

This is enforced, not merely requested. `npm run validate:activities` fails if a
linked activity carries no badge, if a Recommended badge has no assignment
linking to it, or if an assignment links to an anchor matching no heading. It
runs in CI and pre-commit.

## Required Section Shape

Every activity is one `##` section with exactly this structure:

````mdx
## Activity Name

<Badge text="Team Activity" variant="note" class="mb-6"/> <Badge text="Recommended" variant="tip" class="mb-6"/>

One or two sentences saying what this produces and why it is worth the time.

- **Step name**: what to do.
- **Step name**: what to do.
- **Step name**: what to do.

A good output is <the concrete artifact, described so a student knows whether they have it>.

**Feeds:** the [assignment](/assignments/slug/) criterion-name criterion.
````

Line by line:

**Heading.** Sentence case, no trailing punctuation. See **Heading Rules**
below; they are load-bearing.

**Badge line.** Always present, always immediately after the heading, always
one blank line below it. The audience badge comes first and is mandatory:

- `<Badge text="Individual Activity" variant="success" class="mb-6"/>`
- `<Badge text="Team Activity" variant="note" class="mb-6"/>`

The tier badge, if any, comes second on the same line. Never invent a third
badge. `class="mb-6"` is required on every badge; without it the badge collides
with the paragraph below.

Import once per page, after the frontmatter:

```mdx
import { Badge } from '@astrojs/starlight/components';
```

Forgetting this import is the most common way to break the build, and the error
message (`Expected component 'Badge' to be defined`) does not name the file
helpfully. If you add the first badge to a page, check the import.

**Opening sentences.** One or two, no heading, no list. Say what the student
ends up with and why it matters for their project. Do not open with "In this
activity you will" or "This activity helps you". Start with the substance.

Close the opening with a plain **effort clause** where you can state one
honestly: "Thirty minutes as a team, once a term." "One to two hours, once."
"Two to three hours to set up, minutes per run after." Write it as a sentence,
not as an italic metadata line above the prose. Effort is the single most
useful thing a student weighing an activity wants to know, and a wrong estimate
is worse than none, so omit it rather than guess.

**Body.** A bulleted list of steps is the default and fits most activities. Use
`- **Step name**: description.` so the list scans. Prose paragraphs are
acceptable when the activity is genuinely a discussion or a judgment exercise
rather than a procedure, but prose is the exception and should not run past
three short paragraphs. Sub-headings (`###`) are allowed only for activities
with genuinely distinct phases, and they create anchors, so name them carefully.

**"A good output is..." line.** Mandatory, always the closing line of the body,
always starting with that exact phrase (or "A good output shows/details/is"
where the verb reads better). This is the only quality signal in the activity,
and its job is to let a student self-check. Be concrete: "a comparison matrix
and a justification for the chosen technology" is useful; "a thoughtful
analysis" is not.

**"Feeds:" line.** Required for Workshop and Recommended tier, optional for
Library tier. Names the assignment and the specific rubric criterion this
activity prepares, with a link. This is what lets a student working backward
from a rubric find the activity, and what lets a future editor tell whether the
activity still earns its tier.

## Heading Rules

Headings become anchor slugs, `starlight-links-validator` runs on every build,
and assignment pages link to activities by anchor. So:

1. **No emoji in headings.** An emoji produces a slug like
   `#user-story-mapping-️` with an invisible variation selector in it. Nobody
   will ever type that correctly, and the link is unreadable in source.
2. **No leading or trailing whitespace.** `## Regular Stand-Up Meetings ` and
   `##  Software Development Process` both produce malformed anchors. This has
   already happened twice.
3. **Renaming a heading breaks every inbound link.** Grep for the old anchor
   across `src/content/docs/**` before renaming, and fix all of them in the same
   commit. The build will catch what you miss, which is the point of not
   guessing.

## Project Categories

Projects fall into four categories (see `/practicalities/categories/`): **FOSS**,
**Research**, **Consultancy**, and **New Product or Game**. Assignment pages
offer activity options keyed to these categories, because an activity that is
central for a new product is often meaningless for a team contributing upstream
to someone else's repository.

When an activity is materially category-specific, say so in the opening
sentences rather than adding a badge for it. When an activity is general, do not
mention categories at all. Do not write an activity that silently assumes a
category: "deploy your app" is unwritable for a FOSS team and "get a PR merged
upstream" is unwritable for a greenfield product.

## Page-Level Structure

Each page in `src/content/docs/activities/` groups activities by theme.

```yaml
---
title: <Theme> Activities
description: <one sentence naming what the page covers; quote it if it contains a colon>
sidebar:
  order: <number>
---
```

The `description` field is YAML: **an unquoted colon inside it breaks the
build** with `bad indentation of a mapping entry`, which does not obviously
point at the description. Quote any description containing a colon.

After the import, each page opens with two or three sentences framing the theme,
optionally followed by a pull quote. Then the activities, each a `##` section.
Ordering within a page is by rough sequence of use, not alphabetical.

## Writing Style

- **No em dashes.** Use colons, semicolons, commas, or periods. This is a
  project-wide rule.
- Second person. "List the next ten decisions your team expects to make."
- Imperative for steps. "Compare options", not "You should compare options".
- Short sentences, one idea each. Students read these under deadline pressure.
- No hedging ("you might want to consider possibly"), no rule-of-three padding,
  no "it's worth noting".
- Do not explain concepts at length. Link to the relevant page in
  `src/content/docs/guides/` and move on. Guides explain; activities exercise.

## What Activities Must Not Contain

- Point values, rubric bands, or any grading language.
- Submission mechanics ("upload to Canvas"). The one exception is the Workshop
  tier, and even there the mechanics live on the assignment page, not here.
- Claims about accreditation outcomes (`SO1`-`SO6`, `L07`-`L10`). Outcome tags
  belong exclusively in assignment rubric tables, where the validator reads
  them. An activity tagged with an outcome creates the appearance of coverage
  that the validator will not count, which is worse than no tag.
- Tool requirements presented as mandatory when a cheaper substitute exists. If
  an activity assumes a capable AI agent, a paid service, or specific hardware,
  state the substitute for students who do not have it.

## Before Finishing

1. Run `npm run validate:activities`. It reconciles badges against assignment
   links and prints the tier counts.
2. Run `npm run build`. It runs `astro check`, compiles the MDX, and validates
   every internal link and anchor, which is the only reliable check of the
   anchors you just wrote.
3. If you promoted or demoted any activity, update the tier counts in
   `docs/superpowers/plans/2026-08-17-activity-tiering.md` and `IMPLEMENTED.md`.
4. Grep for em dashes in what you wrote.
