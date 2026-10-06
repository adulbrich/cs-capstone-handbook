---
name: cs46x-activities
description: Use when creating or editing activity pages (MDX files in src/content/docs/activities/) for the CS 461/462/463 capstone handbook. Defines the required section shape, the generated badge line, tiering, and heading rules. Always load this skill before writing or editing any activity file.
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
voice: whose voice the handbook uses, person, claims, structure, and the
word-level rules. This skill does not restate it; it adds only what the
how-to register needs. The bold step name in the step format below is one of
the labels voice.md allows.

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
causal clause a guide owes its reader, because a guide carries it where one
exists. Terseness here is correct, where in a guide it is the failure
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

### Standalone

**An activity page never refers to this course.** No link to an assignment
page, no assignment name, no mention of a workshop, no week number, no term, no half of a class
session. A reader who is not enrolled should be able to run any activity here.
The `guides/` directory has held this line since it was written and has zero
assignment links across nineteen files; activities had drifted to sixty-one
`Feeds:` backlinks and ten activities describing their slot by the clock.

The direction of travel is one way. **Assignments link to activities**, in
their "Activities That Prepare This" section, and that link is what puts a
Prepares badge on the activity. An activity does not link back. What stays:
guide links, LinkCards, and external sources, which should grow rather than
shrink.

**The one exception is the generated badge line.** `<ActivityMeta>` names
the workshop and the assignments an activity serves, with links, because it
computes them from the assignment pages; nobody writes those names into the
activity. Prose on the page still may not.

`validate-activities.mjs` enforces this per line, skipping the badge line,
with two exemptions listed in the script for events outside the team.
It also rejects an assignment's name in activity prose ("an RFC", "your
sprint notes", "the Expo"): describe the practice instead ("a design
document"). Every assignment title is classified in `ASSIGNMENT_NAMES` in
the script, as a course name it rejects or as an industry practice's own
name it allows ("team charter", "incident postmortem"), so a new assignment
fails the check until someone classifies it.
`activities/introduction.mdx` is exempt as a whole, because it is the page
that explains what the badge line means.

**Mechanically, an activity is a `##` section carrying an `<ActivityMeta>`
badge line.** That is the definition the validator uses, and it is why the
line is load-bearing rather than decorative. Page framing and closing prose
also use `##`, so a heading count alone silently counts non-activities as
activities. A section with no badge line is prose; a section with one is an
activity and must satisfy everything below.

### Explanation versus instrument

An activity over roughly 400 words is usually a guide with an exercise stapled
to it. The test is what the bulk *is*:

- **Explanation** teaches a concept, a model, or a practice, and it belongs in
  a guide. The old conflict activities page was four sections of this, up to
  1,100 words each, and became `guides/conflict.mdx` plus four short exercises.
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

Every activity sits in one of three tiers. **The tier is computed, never
written**: `src/lib/activity-links.mjs` reads it from the assignment pages,
and the badge line shows it.

| Tier | Comes from | Badge line shows | Meaning |
|---|---|---|---|
| Workshop | a `### Workshop N:` section on `assignments/workshop-activities.mdx` naming the activity | `Workshop N, <term>`, linking that section | Everyone does it. Runs in class, graded complete/incomplete. |
| Recommended | an assignment's "Activities That Prepare This" section linking the activity | `Prepares:`, then one badge per linking assignment, each linking that section | The cheapest route to a specific rubric criterion. |
| Library | neither | no tier badge | Kept because it is good and some project will need it. Nobody is expected to do most of these. |

A workshop that assignments also link shows both: the Workshop badge first,
then Prepares, and it counts as Workshop.

So **promoting or demoting an activity is an edit to an assignment page**,
never to the activity. Add it to, or remove it from, that page's "Activities
That Prepare This" section (the `cs46x-assignments` skill owns its shape), and
the badge line follows at the next build.

`npm run validate:activities` computes the tiers through the same lib and
prints the counts. It fails if an assignment links an anchor matching no
heading. It also reconciles the week-by-week schedule on
`introduction/schedule.mdx`, reading it by term, week and line label: an
activity on any line but **In class** must be Workshop or Recommended tier,
an **In class** line may link a library activity, and every Workshop
activity must sit on an In class line in the same week
`assignments/workshop-activities.mdx` gives it. Demoting an activity
therefore means removing it from the schedule in the same commit. It runs in
CI and pre-commit.

The same validator also enforces the section shape below: the badge line two
lines below the heading, once, with `anchor` equal to the heading's slug and
`effort` on the scale; no hand-written Individual, Team, Workshop, or
Recommended badge; the closing "A good output" line being last, with nothing
after it; the standalone rule above; no outcome tags and no point values or
percentages next to grading words, on activity and guide pages alike; and the
"more than a hundred" figure on the index and the workshop page, which
counts every activity other than the workshops (Recommended plus Library).
What it does not check: heading case, whether `wholeTeam` is warranted, the
effort clause in prose, the 400-word test, the opener rules, and the AI
substitute rule. Those are still on you.

## Required Section Shape

Every activity is one `##` section with exactly this structure:

````mdx
## Activity Name

<ActivityMeta anchor="activity-name" effort="1 h" />

One or two sentences saying what this produces and why it is worth the time.

- **Step name**: what to do.
- **Step name**: what to do.
- **Step name**: what to do.

A good output is <the concrete artifact, described so a student knows whether they have it>.
````

Line by line:

**Heading.** No trailing punctuation, and see **Heading Rules** below; they
are load-bearing. Sentence case is the target for **new** activities only:
nearly all existing headings are Title Case and stay that way,
because renaming a heading breaks every inbound anchor. Never re-case an
existing heading.

**Badge line.** Always present, always immediately after the heading, always
one blank line below it, one per activity. It takes three props, and only
two of them are yours to judge:

- `anchor` (required): the heading's slug, as Starlight derives it:
  lowercase, punctuation dropped, each space a hyphen, runs of hyphens kept
  (`Is / Is-Not` is `is--is-not`). It is how the component finds the
  activity, and the validator fails when it differs from the heading.
  Renaming a heading means changing its `anchor` too.
- `effort` (optional): one value from the fixed scale `15 min`, `30 min`,
  `1 h`, `1 to 2 h`, `Half day`, `Multi-day`, `Ongoing`, for the whole
  activity as one team or student runs it once. Set it only when the
  opening's effort clause states one that sits on the scale; a wrong badge is
  worse than none. Every activity will carry one once the backfill lands.
- `wholeTeam` (optional, a bare flag): only when the activity fails without
  everyone present, such as a team agreement every member must accept or an
  assessment that needs every member's view. It is not "a team activity":
  most team activities work with whoever shows up, and an individual activity
  carries no badge at all.

The Workshop and Prepares badges are not props. The component computes them
(see **Tiers**), so never write a `<Badge>` for audience or tier: the
Individual, Team, Workshop, and Recommended badges are retired, and the
validator fails on one.

Import once per page, after the frontmatter:

```mdx
import ActivityMeta from '/src/components/ActivityMeta.astro';
```

Forgetting this import is the most common way to break the build, and the
error message (`Expected component 'ActivityMeta' to be defined`) does not
name the file helpfully. If you add the first activity to a page, check the
import.

**Opening sentences.** One or two, no heading, no list. Say what the student
ends up with and why it matters for their project. Do not open with "In this
activity you will" or "This activity helps you". Start with the substance.

Close the opening with a plain **effort clause** where you can state one
with confidence: "Thirty minutes as a team, once a term." "One to two hours, once."
"Two to three hours to set up, minutes per run after." Write it as a sentence,
not as an italic metadata line above the prose, and set the matching `effort`
on the badge line when it sits on the scale. Effort is the single most
useful thing a student weighing an activity wants to know, and a wrong estimate
is worse than none, so omit it rather than guess.

**Body.** A bulleted list of steps is the default and fits most activities. Use
`- **Step name**: description.` so the list scans; this is the target for
**new** activities, and the many existing activities that use plain
`- Name: text` bullets or numbered lists are left as they are. Prose paragraphs are
acceptable when the activity is a discussion or a judgment exercise
rather than a procedure, but prose is the exception and should not run past
three short paragraphs. Sub-headings (`###`) are allowed only for activities
with distinct phases, and they create anchors, so name them carefully.

**"A good output is..." line.** Mandatory, always the closing line of the body
with nothing after it,
always starting with that exact phrase (or "A good output shows/details/is"
where the verb reads better). This is the only quality signal in the activity,
and its job is to let a student self-check. Be concrete: "a comparison matrix
and a justification for the chosen technology" is useful; "a thoughtful
analysis" is not.

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

## Different Projects Need Different Preparation

**FOSS**, **Research**, **Consultancy** and **New Product or Game** are the
paths projects have most often taken (see `/guides/shipping/`), and plenty of
projects look like none of them.

**Never name a category.** The words "outcome type", "project type" and
"project category" are retired, and `check-prose` rejects all three under the
content paths. The handbook presented a four-way taxonomy for a year and
students spent it asking which one they were, rather than agreeing expectations
with their partner. Refer to the four by name, as examples, or say what the
project is.

Assignment pages offer activity options in an **Examples** table whose first
column reads "If your project is", because an activity that is central for a
new product is often meaningless for a team contributing upstream to someone
else's repository.

When an activity is materially specific to one kind of project, say so in the
opening sentences rather than adding a badge for it. When an activity is
general, do not raise the question at all. Do not write an activity that
silently assumes one: "deploy your app" is unwritable for a FOSS team and "get
a PR merged upstream" is unwritable for a greenfield product.

## Page-Level Structure

Each page in `src/content/docs/activities/` groups activities by the kind of
work they are, so every activity has one predictable home. The pages and
their two halves, project practice and growth, are listed in
`src/lib/activities-sidebar.mjs`. A new activity goes on the page whose work
it is; a new page is a decision for the owner, not a way to place one
activity.

```yaml
---
title: <The kind of work, e.g. Technical Design>
description: <one sentence naming what the page covers; quote it if it contains a colon>
---
```

The title names the work, never a project category, and carries no
"Activities" suffix: the sidebar group already says it. There is no
`sidebar.order`. The Activities sidebar is an explicit list in
`src/lib/activities-sidebar.mjs` (Project practice in first-use order, then
Growth), which ignores `order`, so a new page must be added there;
`validate:sidebar` fails until it is, and fails on an activity page that
declares an `order`. Retiring a page needs a redirect in
`astro.config.mjs` and every inbound link rewritten.

The `description` field is YAML: **an unquoted colon inside it breaks the
build** with `bad indentation of a mapping entry`, which does not obviously
point at the description. Quote any description containing a colon.

After the import, each page opens with two or three sentences framing the work,
optionally followed by a pull quote. Then the activities, each a `##` section.
Ordering within a page is by rough sequence of use, not alphabetical.

## Writing Style

- **No em dashes.** Use colons, semicolons, commas, or periods. This is a
  project-wide rule.
- Second person. "List the next ten decisions your team expects to make."
- Imperative for steps. "Compare options", not "You should compare options".
- Short sentences, one idea each. Students read these under deadline pressure.
- No hedging ("you might want to consider possibly"), no rule-of-three padding,
  no "it's worth noting". Hedge a time estimate ("about an hour"), never the
  instruction.
- No line that restates the activity. The body ends on the "A good output
  is..." line, which describes the artifact, and nothing follows it.
- Do not explain concepts at length. Link to the relevant page in
  `src/content/docs/guides/` and move on. Guides explain; activities exercise.

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

- Links to assignment pages, assignment names, the word "workshop", week
  numbers, term names, or any other reference to this course's calendar. See
  **Standalone** above.
- Point values, rubric bands, or any grading language.
- Submission mechanics ("upload to Canvas"). The one exception is the Workshop
  tier, and even there the mechanics live on the assignment page, not here.
- Claims about accreditation outcomes (`SO1`-`SO6`, `L07`-`L10`). Outcome tags
  belong exclusively in the assignment rubric CSVs, where the validator reads
  them. An activity tagged with an outcome creates the appearance of coverage
  that the validator will not count, which is worse than no tag.
- Tool requirements presented as mandatory when a cheaper substitute exists. If
  an activity assumes a paid service or specific hardware, state the
  substitute for students who do not have it.
- **An activity that needs a capable AI agent without ending on a
  substitute.** Its steps close with one step that starts "If your tooling
  can't ..." and says how to get the same artifact without the agent: by
  hand, with a smaller model, or by pairing with a teammate who has access.
  Tool access is unequal, and the artifact is what the activity is for.
- Calendar dates or an academic year. Terms and weeks only.
  `validate-dates.mjs` fails on a date.

## Before Finishing

1. Run `npm run validate:activities`. It checks every badge line and the
   section shape, resolves the assignment links, and prints the tier counts. Run
   `npm run validate:dashes` too; it catches the em dashes the grep below would.
2. Run `npm run build`. It runs `astro check`, compiles the MDX, and validates
   every internal link and anchor, which is the only reliable check of the
   anchors you just wrote.
3. If you promoted or demoted any activity (on an assignment page), check
   the tier counts the
   validator prints against the library-size claim on
   `activities/introduction.mdx` and `assignments/workshop-activities.mdx`.
4. Grep for em dashes in what you wrote.
