---
name: cs46x-guides
description: Use when creating or editing guide pages (MDX files in src/content/docs/guides/) for the CS 461/462/463 capstone handbook. Defines the section skeleton, the required honest-caveats and industry sections, and the line between a guide and an assignment. Always load this skill before writing or editing any guide file.
---

# Guide Style Guide

This skill governs how guides are written for the CS capstone handbook
(Astro/Starlight, MDX). The opening and the closing three sections below are
what every guide on the branch does. The four artifact sections come from
`adr.mdx` and `requirements.mdx`; `retrospectives.mdx` is the model for a
practice guide and has none of them. When in doubt, open the one that matches
your guide's kind and follow it.

## Writing Voice (applies to everything below)

Lead with the point. Specific nouns and verbs. Cut every sentence that does not
change what the reader will do or understand. No "it's worth noting,"
rule-of-three padding, or vague intensifiers. Opinion is preferred when a
recommendation is required. Code stays exact. For prose, never use emdashes but
use proper punctuation instead.

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

A guide **never** states due dates, point values, rubric criteria, or weights.
If you find yourself writing one, it belongs on the assignment page and the
guide should link to it instead. Guides may aspire beyond what assessment
requires; that is their job. Assignments accommodate.

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

## Section Skeleton

Sections in **bold** are required for every guide. Sections marked *artifact*
are required for artifact guides and optional for practice guides, which keep
them only when they say something (`conflict.mdx` keeps Validation and
Measuring Success because its signals are real). The middle flexes with the
topic.

1. **Opening (no heading).** Two to four paragraphs. Say what the thing is,
   link the authoritative external reference, and state what goes wrong without
   it. `adr.mdx` and `requirements.mdx` both use a short bulleted list of
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
   problem statement: what it is, who is affected, why it matters.

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
   Then say when it genuinely does matter. "Let's be honest." is an opener a
   few guides use, not a rule; the rule is that the first bullet is the one
   an advocate would leave out.
   A guide that only advocates is marketing. Students can tell.

10. **`## X in Industry and Academia`.** Required. What this looks like in real
    organizations, with named examples where you have them (Amazon's PR/FAQ,
    Google's postmortem culture). This is what makes the practice feel like
    professional preparation rather than a course invention.

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

- **LinkCard**: the standard way to route a reader onward, especially to the
  activities that exercise the practice. Place one directly after the section
  it belongs to, not in a pile at the bottom.
- **Aside** / `:::note`, `:::tip`, `:::caution`: short, immediate, one idea.
  Always give a title. Do not use an aside to smuggle in a section you did not
  want to write.
- **Steps**: only for genuinely ordered procedures.
- **Tabs**: only when instructions truly differ by platform or language.

Import only what you use.

## Cross-Linking

Guides sit in the middle of the handbook's graph and should be linked in both
directions:

- Link **out** to the activities that exercise the practice (`/activities/...`)
  and to the assignment where it is graded (`/assignments/...`).
- Expect links **in** from assignment pages. Renaming a heading in a guide
  breaks those, so grep `src/content/docs/**` for the old anchor before you
  rename, and let `npm run build` confirm.

Do not restate an assignment's requirements in a guide. Link to it. Two
descriptions of the same requirement drift, and the assignment page wins.

Three topics tempt every guide to restate them. Each has one owner; the
others link:

- **Performance conversations and escalation**: `conflict.mdx`.
  `working-agreement.mdx` says only what the agreement contributes (hours,
  blockers, the minimum deliverable) and links.
- **AI norms**, split by concern rather than duplicated: individual habits and
  tool setup in `generative-ai.mdx`; team process norms in
  `working-agreement.mdx` under AI Tool Usage; architectural constraints in
  `technical-design.mdx` under Technical Design in the Age of AI.
- **CI and branch protection**: the workflow file in `devops.mdx`, the
  repository settings in `git-and-github.mdx`. `testing-strategy.mdx` links
  both and owns what to test.

## Length

The validated guides run 950 to 1,750 words. `testing-strategy.mdx` at 4,000 is
the outlier and only earns it by covering several distinct testing layers. If a
guide passes about 3,000 words, look for a section that wants to be its own
guide. Word count is a diagnostic, not a target.

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

Nothing checks the section skeleton, the length, or the opener rules; those
are read for, not validated.

## Before Finishing

1. Run `npm run build`. It compiles the MDX and validates every internal link
   and anchor, which is the only reliable check on the anchors you wrote.
2. Run `npm run validate:activities` and `npm run validate:dashes`; the first
   covers outcome tags and grading language on guides, the second em dashes.
3. Confirm the final three sections are present: Best Practices, Some Truths,
   and Industry and Academia. Their absence is the most common way a new guide
   fails to match the others. For an artifact guide, also confirm the fenced
   artifact is there and still matches what the assignment page requires.
