---
name: cs46x-activities
description: Use when creating or editing activity pages (MDX files in src/content/docs/activities/) for the CS 461/462/463 capstone handbook. Defines the required section shape, badge vocabulary, tiering, and heading rules. Always load this skill before writing or editing any activity file.
---

# Activity Style Guide

This skill governs how activities are written for the CS capstone handbook
(Astro/Starlight, MDX). It exists because the activity library grew to 100-plus
entries across twelve pages without a written format, and pages added later
drifted from the ones added first. **The format below is the format. Bring
non-conforming activities into line rather than adding a second convention**,
with two exceptions marked below as targets for new activities only: heading
case and step-bullet style. Both are followed by a minority of the library,
and "fixing" the majority would rename about 110 headings and break every
inbound anchor for no reader benefit.

## Writing Voice (applies to everything below)

**Read `docs/agents/voice.md` first.** It is the single home for document
voice and this skill does not restate it. The short version: every claim a
reader could doubt carries its reason, every named tool or standard carries a
link to its authoritative source on first mention, and no em dashes.

Document voice is not chat voice. A maintainer's `CLAUDE.md` asks for
compression in the terminal, where the reader can ask a follow-up. That rule
applied to a handbook page deletes the why, and what survives is an aphorism
the student cannot check or argue with.

## The How-To Register

An activity is **how-to** in the Diataxis sense: task-oriented procedure for a
reader who has already decided to do the thing. It is the third of the
handbook's three registers, and keeping them apart is what keeps each page
short.

| Page type | Register | Answers |
|---|---|---|
| Guide | Explanation | Why does this practice exist, and what does good look like? |
| Activity | How-to | What do I run, right now, to produce it? |
| Assignment | Reference | What is due, when, and how is it scored? |

The consequence for voice: **an activity does not argue.** It does not need the
causal clause a guide owes its reader, because the guide already carried it and
is one link away. Terseness here is correct, where in a guide it is the failure
mode. What an activity still owes is precision: a step a team can misread is a
step that wastes their hour.

`docs/agents/voice.md` holds the floor that applies to all three.

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

**Mechanically, an activity is a `##` section carrying an audience badge.**
That is the definition the validator uses, and it is why the badge is
load-bearing rather than decorative. Page framing and closing prose also use
`##`, so a heading count alone silently counts non-activities as activities.
A section with no audience badge is prose; a section with one is an activity
and must satisfy everything below.

### Explanation versus instrument

An activity over roughly 400 words is usually a guide with an exercise stapled
to it. The test is what the bulk *is*:

- **Explanation** teaches a concept, a model, or a practice, and it belongs in
  a guide. `activities/conflict.mdx` was four sections of this, up to 1,100
  words each, and became `guides/conflict.mdx` plus four short exercises.
- **An instrument** is something the student fills in, scores, or works
  through *during* the activity: an assessment table, a scoring rubric, a
  canvas, a checklist. It stays, however long it is. `Team Health Assessment`
  keeps its 1,219 words because they are the health check itself, not a
  lecture about health checks.

When you move explanation out, leave a `LinkCard` to the guide near the top of
the page rather than a link buried mid-activity.

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
also reconciles the week-by-week schedule on `introduction/series.mdx`: every
activity it links must be Workshop or Recommended, and every Workshop
activity must appear on it. Demoting an activity therefore means removing it
from the schedule in the same commit. It runs in CI and pre-commit.

The same validator also enforces the section shape below: a tier badge with
no audience badge; audience badge variants (Team is `note`, Individual is
`success`); all badges on one line, two lines below the heading; the closing
"A good output" line being last (only the Feeds line may follow); a Feeds line
on every Workshop or Recommended activity; no outcome tags and no point values
or percentages next to grading words, on activity and guide pages alike; and
the "more than a hundred" library figure on the index and the workshop page.
What it does not check: heading case, the `mb-6` class, the effort clause,
the 400-word test, and the opener rules. Those are still on you.

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

**Heading.** No trailing punctuation, and see **Heading Rules** below; they
are load-bearing. Sentence case is the target for **new** activities only:
about 110 of the 118 existing headings are Title Case and stay that way,
because renaming a heading breaks every inbound anchor. Never re-case an
existing heading.

**Badge line.** Always present, always immediately after the heading, always
one blank line below it. The audience badge comes first and is mandatory. There
are exactly three legal states:

- `<Badge text="Individual Activity" variant="success" class="mb-6"/>`
- `<Badge text="Team Activity" variant="note" class="mb-6"/>`
- **both**, on the same line, when the activity genuinely works either way.
  This is a real pattern used across the library, not drift, and the validator
  allows it. Use it only when solo and team both make sense; defaulting to both
  because you cannot decide makes the badge useless.

The tier badge, if any, comes last on the same line. Never invent a fourth
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
`- **Step name**: description.` so the list scans; this is the target for
**new** activities, and the many existing activities that use plain
`- Name: text` bullets or numbered lists are left as they are. Prose paragraphs are
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

## Outcome Types

Every project has one of four **outcome types** (see `/practicalities/types/`):
**FOSS**, **Research**, **Consultancy**, and **New Product or Game**. The
outcome type is guidance: it says how the outcome ladder's rungs read for a
project and which shipping playbook applies. Assignment pages offer activity
options keyed to it in a **By outcome type** table, because an activity that is
central for a new product is often meaningless for a team contributing upstream
to someone else's repository. "Project type" is the wider word: the Project
Types page also covers where a project comes from, where its code starts, and
what constrains it.

When an activity is materially specific to one outcome type, say so in the
opening sentences rather than adding a badge for it. When an activity is
general, do not mention outcome types at all. Do not write an activity that
silently assumes one: "deploy your app" is unwritable for a FOSS team and "get
a PR merged upstream" is unwritable for a greenfield product.

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
- **Name the paired guide.** Every activity links the guide whose practice it
  exercises, in the opening sentences or the first step. Guides now close with
  an `## Additional Readings` section listing the activities that exercise
  them, so the link runs both ways; an activity with no named guide is either
  missing its link or exercising a practice the handbook never explained.

### Worked examples

These are constructed to the rule rather than quoted. The register model is
`docs/agents/voice.md`.

**Opening sentences.**

> Before: Map your one-way doors. Know what you cannot undo.
>
> After: List the decisions your team cannot cheaply reverse, then mark which
> ones are already made. One hour as a team, once a term.

The first sounds like a slogan and leaves the team guessing at scope, output,
and cost. The second names the artifact and the time.

**Effort clause.**

> Before: Budget some time for this one.
>
> After: Two to three hours to set up, minutes per run after.

**A step.**

> Before: **Audit your tests**: check they are meaningful.
>
> After: **Pick three critical paths**: for each, break the behavior on purpose
> and confirm a test goes red. A path where nothing fails has no test, whatever
> coverage reports.

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
- Calendar dates or an academic year. Terms and weeks only.
  `validate-dates.mjs` fails on a date.

## Before Finishing

1. Run `npm run validate:activities`. It reconciles badges against assignment
   links, checks the section shape, and prints the tier counts. Run
   `npm run validate:dashes` too; it catches the em dashes the grep below would.
2. Run `npm run build`. It runs `astro check`, compiles the MDX, and validates
   every internal link and anchor, which is the only reliable check of the
   anchors you just wrote.
3. If you promoted or demoted any activity, check the tier counts the
   validator prints against the library-size claim on
   `activities/introduction.mdx` and `assignments/workshop-activities.mdx`.
4. Grep for em dashes in what you wrote.
