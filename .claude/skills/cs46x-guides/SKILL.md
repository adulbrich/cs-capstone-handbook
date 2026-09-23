---
name: cs46x-guides
description: Use when creating or editing guide pages (MDX files in src/content/docs/guides/) for the CS 461/462/463 capstone handbook. Defines the explanation register, the rule that guides are standalone and never reference assignments or workshops at all, the section skeleton including the required Some Truths, Industry and Academia, and Additional Readings sections, the sourcing rule, and the word band. Always load this skill before writing or editing any guide file.
---

# Guide Style Guide

This skill governs how guides are written for the CS capstone handbook
(Astro/Starlight, MDX). The opening and the closing three sections below are
what every guide on the branch does. The four artifact sections come from
`adr.mdx` and `requirements.mdx`; `retrospectives.mdx` is the model for a
practice guide and has none of them. When in doubt, open the one that matches
your guide's kind and follow it.

## Writing Voice (applies to everything below)

**Read `docs/agents/voice.md` first.** It is the single home for document
voice and this skill does not restate it. The short version: every claim a
reader could doubt carries its reason, every named tool or standard carries a
link to its authoritative source on first mention, and no em dashes.

Document voice is not chat voice. A maintainer's `CLAUDE.md` asks for
compression in the terminal, where the reader can ask a follow-up. That rule
applied to a handbook page deletes the why, and what survives is an aphorism
the student cannot check or argue with.

## What a Guide Is

A guide is **explanatory reference material**: it teaches a practice, gives the
reader a mental model, and shows what good looks like. It is read once for
understanding and returned to for reminders.

The three-way split in this handbook is load-bearing, so keep it clean:

| Section | Answers | Graded? |
|---|---|---|
| **Guides** | "How does this practice work, and what does good look like?" | No |
| **Activities** | "What exercise do I run to produce this?" | Workshop tier only |
| **Assignments** | "What is due, when, and how is it scored?" | Yes, and they are the source of truth |

A guide **never** states due dates, point values, rubric criteria, or weights,
and beyond that it does not reference assignments, workshops, or checkpoints
anywhere. See [Guides Are Standalone](#guides-are-standalone): the link runs
from the assignment to the guide, never back. Guides may aspire beyond what assessment requires; that is
their job. Assignments accommodate.

Guides are also where explanatory bulk belongs when an activity starts growing
one. An activity over roughly 400 words is usually a guide with an exercise
attached: move the explanation here and leave the activity pointing at it.

### Artifact guides and practice guides

A guide is one of two kinds, and the kind decides which sections are required:

- **Artifact guides** teach a document the team produces and keeps in the
  repository: `adr.mdx`, `requirements.mdx`, `technical-design.mdx`,
  `working-agreement.mdx`. They show the artifact.
- **Practice guides** teach a way of working: everything else,
  `documentation.mdx` included, because it covers several artifacts and none
  of them is the guide's subject.

A new guide that could be either is an artifact guide if a checkpoint or an
assignment grades a file it describes.

## The Explanation Register

A guide is **explanation** in the Diataxis sense: understanding-oriented
material that permits reflection. It is not a tutorial (step by step), not a
how-to (task oriented, which is what activities are), and not reference (a dry
enumeration, which is what assignment rubrics are). Its job is to leave the
reader with a web of connections: why things are the way they are, how they
relate, what the tradeoffs are.

That job sets the register, and the register has four rules.

**Define, explain, show, then say why it matters.** Every term, tool, or
mechanism gets all four on first use. Define it in plain language, explain how
it works at the level this course needs, give one concrete example, and say
what breaks if you get it wrong. A definition without the "what breaks" is
trivia.

**Prose over lists.** Favor paragraphs. Use a list only for genuinely discrete
parallel items, a side-by-side comparison, or an end-of-section checklist. A
list of five bolded fragments is the most common way a guide looks finished
while explaining nothing: the bolding carries the claim and the prose that
would have justified it was never written. When a concept can be a flowing
paragraph, make it one.

**Never open a section with a list, table, code block, or component.** Lead
with prose that says what the section covers and why it matters here.

**Give the reader the alternative.** Where a real disagreement exists, name the
competing position, link whoever argues for it, and then say what you
recommend and on what grounds. A guide that presents one option as the only
option is the marketing the Some Truths section is supposed to prevent.

### Sourcing

Link the authoritative reference the first time a concept appears in the body:
official documentation, an RFC, a standard, a paper, the author who named the
thing. Roughly six external links per 1,000 words is the target, measured from
the same instructor's unaided lecture notes, which run 7.4.

This is not decoration. An unsourced claim makes verification the reader's
problem; a sourced one hands them the door. It is also the cheapest defense
against a confidently wrong page, because writing the link means checking the
claim.

## Section Skeleton

Sections in **bold** are required for every guide. Sections marked *artifact*
are required for artifact guides and optional for practice guides, which keep
them only when they say something (`conflict.mdx` keeps Validation and
Measuring Success because its signals are real). The middle flexes with the
topic.

1. **Opening (no heading).** The purpose line, then two to four paragraphs. Say what the thing is, link the
   authoritative external reference, and state what goes wrong without it. `adr.mdx` and `requirements.mdx` both use a short bulleted list of
   failure modes here, which works well and is worth copying:

   ```md
   Without clear ADRs:

   - Teams forget why decisions were made, leading to repeated debates or mistakes.
   - New contributors struggle to understand the rationale behind the architecture.
   - Projects risk inconsistency, technical debt, or costly rework.
   ```

2. *Artifact:* `## What is X?` or an equivalent definition section. What the
   artifact contains, usually as a bulleted list of its parts.

3. *Artifact:* `## Addressing a Problem` (or `## Addressing an Architectural
   Problem`, matching the topic). The why. Good practice starts from a real
   problem statement: what it is, who is affected, why it matters. Known
   exception: `technical-design.mdx` has no such section, because its
   opening failure list and "What Is Technical Design?" already carry the
   why; do not add one there.

4. *Artifact:* `## What Makes a Good X?` The quality bar, **with the artifact
   itself in a fenced code block**, under about 30 lines: an ADR, a
   `docs/requirements.md`, a `docs/design.md`, a `docs/charter.md`. It is the
   section students copy from and the one the fall workshops run on. Show the
   artifact, do not describe it. `technical-design.mdx` names it "What Makes
   a Good Design Document?"; `working-agreement.mdx` puts the file under
   "Writing Your Agreement", which is where its reader is when they need it.

5. *Topic-specific middle sections.* Flex freely. `retrospectives.mdx` uses
   `## Types`, `## Formats`, and `## Running a Good Retrospective` instead of
   steps 3 and 4, which is correct for that topic. Use `###` subsections for
   variants a reader picks between.

6. *Artifact:* `## Validation`. How you know the artifact is any good: who
   reviews it, what they check, what a failed check looks like.

7. *Artifact:* `## Measuring Success`. The signals that the practice is
   working in real life, not the artifact's own quality.

8. **`## Best Practices for Writing X`.** A bulleted list of concrete,
   actionable rules. No hedging.

9. **`## Some Truths about X`.** Required, and the section that gives these
   guides their credibility. Say the uncomfortable thing first: where the
   practice is busywork, where it goes stale, where teams reasonably skip it.
   Then say when it genuinely does matter. A guide that only advocates is
   marketing, and students can tell.

   **Every truth carries its reason, and a source where one exists.**
   One-sentence truths are banned. This section is where the compression
   failure concentrates, because an uncomfortable claim compresses into a
   memorable line more easily than any other kind, and the line is the part
   that teaches nothing. "Most teams skip this" is a rumor. "Most teams skip
   this because the cost is diffuse and shows up three sprints later as two
   people solving the same problem twice" is a claim a student can weigh.
   Where a named source disagrees with the guide, link it and say why you
   still recommend what you recommend.

10. **`## X in Industry and Academia`.** Required. What this looks like in real
    organizations, with named examples where you have them (Amazon's PR/FAQ,
    Google's postmortem culture). This is what makes the practice feel like
    professional preparation rather than a course invention.

11. **`## Additional Readings`.** Required, and always last. Two groups, in
    this order, each a plain bulleted list:

    - **Sources and further reading.** External links only: official
      documentation, standards, papers, books, conference talks, and the
      authors who coined the terms the guide uses. Five to twelve per guide.
      Titles carry the author or publisher so the reader can judge before
      clicking. Do not annotate every entry; if an entry needs a sentence to
      justify it, it probably belonged in the body.
    - **Activities that exercise this.** Every `/activities/` page that puts
      the guide's practice into a student's hands, as markdown links. This is
      the guide's exit into the hands-on work and it replaces scattering
      LinkCards down the page. A guide whose practice has no activity says so
      in one line rather than leaving the group out.

    This section is not a dumping ground for links already used in the body.
    A reference cited inline stays inline; this list is where a reader goes
    next, not a bibliography of what was already said.

### Purpose line

Every guide opens, after the imports and before any heading or paragraph, with one sentence under 30 words in the form "Read this when ...; it gives you ...". It is the only thing a student reads before deciding whether the page is for them now, so it names the moment and the payoff, nothing else. The guides index is exempt.

## Frontmatter

```yaml
---
title: <Topic Name>
description: <one sentence; quote it if it contains a colon>
sidebar:
  order: <number>
---
```

An unquoted colon inside `description` breaks the build with `bad indentation
of a mapping entry`, which does not point at the description.

## Components

```mdx
import { LinkCard, Aside, Steps, Tabs, TabItem } from '@astrojs/starlight/components';
```

- **LinkCard**: routes a reader onward mid-page, when one specific section
  has one specific destination. Place it directly after that section. The
  page's full set of onward links belongs in `## Additional Readings`, so a
  LinkCard is now the exception rather than the default: use one when leaving
  the link to the bottom would strand a reader who needs it right there.
- **Aside** / `:::note`, `:::tip`, `:::caution`: short, immediate, one idea.
  Always give a title. Do not use an aside to smuggle in a section you did not
  want to write.
- **Steps**: only for genuinely ordered procedures.
- **Tabs**: only when instructions truly differ by platform or language.

Import only what you use.

## Guides Are Standalone

**A guide teaches a practice to someone who might not be taking this course.**
It never tells the reader to do something because an assignment requires it.
This is the rule that keeps guides reusable term to term and readable by a
student who arrives at the page from a search engine, and it is the rule most
often broken by an author trying to be helpful.

Concretely, the body of a guide does not mention assignments, workshops,
checkpoints, grades, terms, or weeks of the course. Not "your
`docs/requirements.md` is checked at every repo checkpoint", not "this is the
fall workshop", not "deploy the walking skeleton by the end of fall". Say what
the practice is and why it matters, and let the reader decide when to apply it.

Time in a guide is relative to the project, never to the course calendar. An
argument that spans months is written in phases ("in your first weeks", "by the
middle of the project", "a month before the end"), and that includes a generic
illustration: "a plan made at the start is wrong a month later", not "a plan
made in week 2 is wrong by week 6". The validator cannot tell a course week from
an illustrative one, so no week number appears at all. `shipping.mdx` is the
worked example: its argument is that external clocks take months, and it makes
that argument with Early, Middle and Late phases rather than terms (#194).

There is no exception, including an aside at the top. **The link between a
guide and an assignment runs one way: the assignment points at the guide.**

The reason is maintenance, not purity. Assignments change every year: they get
renamed, split, retired, reweighted. A guide that names one has to be revisited
whenever that happens, and in practice it is not, so the handbook accumulates
guides that point at pages which have moved. Keeping the reference on the
assignment side means the page that changes is the page that carries the link,
and a guide is only ever edited when the practice it teaches changes.

So: no `/assignments/` link anywhere in a guide, and no prose that assumes the
reader is enrolled. If a reader needs to know that a practice is assessed, they
are already on the assignment page, and that page links here.

**Activities are different and are welcome anywhere.** A guide may recommend an
activity in the body and lists them in `## Additional Readings`, because an
activity is an exercise the reader may choose to run, not an obligation the
course imposes. Describe what the activity does, not its place in the course
calendar: write "runs Lencioni's five-dysfunction ladder over your team", never
"the winter workshop".

If you find yourself needing a course fact to make a sentence work, the sentence
belongs on the assignment page instead. Do not restate an assignment's
requirements in a guide. Two descriptions of the same requirement drift, and the
assignment page wins.

## Cross-Linking

Every link between a guide and an assignment points **in**, from the assignment.
Renaming a heading in a guide breaks those inbound links, so grep
`src/content/docs/**` for the old anchor before you rename, and let
`npm run build` confirm.

Guides link **out** freely to other guides, to activities, and to external
sources. Those are the three destinations a guide may name.

Three topics tempt every guide to restate them. Each has one owner; the
others link:

- **Performance conversations and escalation**: `conflict.mdx`.
  `working-agreement.mdx` says only what the agreement contributes (hours,
  blockers, the minimum deliverable) and links.
- **AI norms**, split by concern rather than duplicated: individual habits in
  `generative-ai.mdx`; the configuration files in `ai-project-setup.mdx`;
  team process norms in `working-agreement.mdx` under AI Tool Usage;
  architectural constraints in `technical-design.mdx` under Technical Design
  in the Age of AI.
- **CI and branch protection**: the workflow file in `devops.mdx`, the
  repository settings in `git-and-github.mdx`. `testing-strategy.mdx` links
  both and owns what to test.
- **Accessibility**: `accessibility.mdx` owns all three checks.
  `testing-strategy.mdx` keeps one short pointer under Verification and
  another under Validation, each naming what its check is for, and links.

## Length

**Typical band: 2,500 to 5,000 words. Split-check at 6,000.** Section
overview and index pages are exempt and run short.

The old band of 950 to 1,750 never described this corpus: the guides already
had a median of 2,605 words and a maximum of 4,265 when it was written, so its
only real effect was compression pressure on every page that tried to explain
something. The new band is anchored on two numbers: what the guides already
are, and the same instructor's unaided lecture notes, which run a 4,795-word
median for a comparable explanatory page.

Explanation costs words. A guide that hits 2,500 by cutting the reason for
every claim is worse than one that reaches 4,500 by keeping them. If a guide
passes 6,000, look for a section that wants to be its own guide.

**The test is the reader.** If you can name someone who reads the candidate
section *instead of* the rest of the page, it is a split; `accessibility.mdx`
and `ai-project-setup.mdx` both came out that way (#113). If everyone who
reads one reads the other, it is not a split, and the fix is to cut whatever
dates fastest, which is almost always a tool catalog.

Word count is a diagnostic, not a target. A page that genuinely covers several
distinct layers can sit over the line; when one does, write the reason on the
issue that measured it rather than trimming a working section to hit a number.

## What Guides Must Not Contain

- Due dates, weights, point values, rubric criteria, or bands.
  `validate-activities.mjs` fails on a point value or percentage within a few
  words of "grade", "rubric" or "criterion" on any guide page; the rest of
  this rule is on you.
- Accreditation outcome tags (`SO1`-`SO6`, `L07`-`L10`). Those live only in
  assignment rubric tables, where `validate-outcomes.mjs` reads them, and
  `validate-activities.mjs` fails on one appearing in a guide.
- Tool requirements presented as mandatory. Guides may show the current
  industry baseline; say what the substitute is for students without the tool.
- Em dashes. `validate-dashes.mjs` fails on one.
- Calendar dates or an academic year. Weekdays and named holidays are fine.
  `validate-dates.mjs` fails on a date.
- A term, a week number, "first half" or "second half", the word "workshop",
  or a link to an assignment page. `validate-activities.mjs` applies the
  activity patterns to every guide: a week followed by a digit, "in the fall"
  or "fall week" (and the same for winter and spring), either half, the word
  "workshop", and a `](/assignments/` link. The target of a Markdown link to
  another site is not read, so a third-party slug passes. The patterns are a
  floor. A spelled-out week ("week two", "the fourth week"), a bare "term",
  "Fall has", and a course artifact named in plain prose ("Team Charter", "the
  Expo") all pass them and are still violations, which is what the greps under
  Before Finishing are for. Write "before the midpoint", not "the first half of
  the project".

Nothing checks the section skeleton, the length, or the opener rules; those
are read for, not validated.

## Worked Examples

The anchor pair is real: the same topic written both ways, in this repository
and in the same instructor's CS 362 lecture notes. The constructed pairs after
it are illustrations of the rule, not quotations. When in doubt about the
register, read `docs/agents/voice.md` and the CS 362 lectures, not these.

**The anchor: the testing pyramid, same topic, two treatments.**

> Before, from `guides/testing-strategy.mdx`: "The pyramid is a guideline, not
> a rule." Eight words, no source, nothing to follow.
>
> After, the shape the CS 362 lecture uses: name the model and link
> [Fowler](https://martinfowler.com/bliki/TestPyramid.html), then name the
> competing model and link
> [Kent C. Dodds](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests),
> explain what its proponents argue and why better tooling made the argument
> viable, and close by saying the right balance depends on how expensive your
> integration tests actually are.

The second is four times longer and it is the only one of the two a student can
act on or disagree with. That is the trade this skill is making.

The remaining pairs are constructed to the rule.

**A Some Truths entry.**

> Before: Most teams never write an ADR. The cost is diffuse, which is why it
> keeps not getting written.
>
> After: Most teams never write an ADR, and they ship anyway. The cost is real
> but diffuse: six months later someone reverses a decision without knowing it
> was a decision, and the rework is charged to that sprint instead of to the
> missing record. That is why it keeps not getting written. It is also why the
> teams that do write them tend to be the ones who have already paid once.

**Defining a term.**

> Before: **Flaky tests** are tests that pass and fail without code changes.
> Fix them or delete them.
>
> After: A **flaky test** passes and fails on the same code and the same
> inputs, usually because it depends on timing, ordering, or a network it does
> not control. The cost is not the failing run, it is that the team learns to
> rerun red builds without reading them, which is the same as having no test
> suite. Quarantine a flaky test the day you find it, then fix or delete it,
> because a quarantined test at least does not train anyone to ignore red.

**What the "before" column has in common:** each one is shorter, sounds more
confident, and has deleted the causal clause that made it checkable. That is
the failure this skill exists to prevent.

## Before Finishing

1. Run `npm run build`. It compiles the MDX and validates every internal link
   and anchor, which is the only reliable check on the anchors you wrote.
2. Run `npm run validate:activities` and `npm run validate:dashes`; the first
   covers the standalone patterns, outcome tags, and grading language on
   guides, the second em dashes.
3. Confirm the guide is standalone. Three greps, because the validator's
   patterns are a floor and a link check misses an assignment named in plain
   prose:

   ```bash
   grep -nE '/assignments/|[Ww]orkshop|checkpoint' <file>
   grep -nE 'Definition of Shipped|Team Charter|Sprint Notes?|Peer Evaluations?|Repo Checkpoints?|Project Handoff|Landing Page|Project Partner Evaluation|Expo\b' <file>
   grep -nEi '\b(fall|winter|spring)\b|\bterms?\b|\b(this|the) course\b|\bweek (one|two|three|four|five|six|seven|eight|nine|ten)\b|\b(second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth) week\b|\b(mid-?year|all year|the year ends)\b' <file>
   ```

   The third catches the time forms the validator misses: a spelled-out or
   ordinal week, a bare "term", a term name used without "in" or "week", and
   the school year standing in for the project. It returns many false
   positives ("long-term", "fall short", "in terms of", "the term comes
   from"); read each hit with the test below.

   The first must return nothing but a third-party URL (the Crazy 8s link in
   `planning.mdx` is one). The second returns false positives and needs
   a human: it is the capitalized, course-specific use that is the violation,
   not the ordinary English phrase. Known-good cases that will match and should
   be left alone: "the defense" meaning defense in depth (`security.mdx`), "your
   public landing page" as a web term (`planning.mdx`), and "a working agreement
   (sometimes called a team charter)" as a synonym for the artifact
   (`working-agreement.mdx`). A third-party URL whose slug contains one of these
   words is also fine.

   The test when you are unsure: would this sentence still be true and useful
   for a reader who is not enrolled in the course? If yes, it is ordinary
   English. If it only makes sense to someone holding a syllabus, it is a
   violation.
4. Confirm the final four sections are present and in order: Best Practices,
   Some Truths, Industry and Academia, Additional Readings. Their absence is
   the most common way a new guide fails to match the others. For an artifact
   guide, also confirm the fenced artifact is there and still matches what the
   assignment page requires.
5. Read the Some Truths section back and check that no entry is a single
   sentence and that each one says why. This is where compression re-enters.
6. Count external links against the body's word count. Under roughly four per
   1,000 words means the guide is asserting where it should be citing; find
   the claims that need a source and give them one.
7. Check the Additional Readings activity list against
   `src/content/docs/activities/`. An activity that exercises this practice and
   is not listed is a dead end for the reader.
