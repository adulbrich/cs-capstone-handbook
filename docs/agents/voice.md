# Document voice

The voice the handbook uses when it speaks to students, partners, and mentors.
This is the only home for it. `AGENTS.md` and the three content skills
(`cs46x-activities`, `cs46x-assignments`, `cs46x-guides`) point here and don't
restate it; each skill adds only what its own register needs.

## Pages are not chat

Chat replies are often written compressed: lead with the point, cut every
sentence that doesn't change what the reader will do. That works in a
conversation, where the reader can ask a follow-up. It fails on a page, where
the reader can't. Applied to a teaching page, it deletes the reason, the
tradeoff, and the source, which is the material the page exists to carry.

When the clause explaining *why* is cut, what survives is the punchline. It
reads as confident and teaches nothing, because a reader who already agreed
nods and a reader who disagrees has no argument to engage and no source to
check. The same point, written both ways:

> Aphorism: "The pyramid is a guideline, not a rule."
>
> Explanation: "The pyramid rests on an assumption, which
> [Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html) spells out:
> broad tests are slow, expensive, and brittle compared with focused ones.
> That's usually true, but where your high-level tests are fast, reliable, and
> cheap to change, you need fewer low-level ones. The
> [testing trophy](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)
> takes that further and puts most of the effort into integration tests,
> because tests that use the software the way people do give more confidence.
> Which shape fits depends on how expensive your integration tests actually
> are, so measure before you commit to one."

The second is longer. It's also the only one a student can act on or
disagree with.

## Person

- The reader is "you", and only the reader is: "you will configure", not
  "students will configure".
- The handbook never says "I". It's a professional handbook with more than
  one instructor, and it outlives any one of them.
- The people who run the course, instructors and TAs together, are "the
  instruction team". Use it in place of "teaching staff" and similar. When
  only the instructors or only a TA is meant, say so.
- "We" appears only on the three audience pages (for students, partners,
  mentors) and in the syllabi, where the team speaks directly to someone
  before the term starts. Everywhere else, name the instruction team or say
  nothing.

## Claims

Every claim a reader could reasonably doubt is one of three kinds, and the
reader can tell which from the sentence.

1. Evidence: a finding from a peer-reviewed venue or a research book, or from
   an industry report with a published method (name it as an industry report:
   "the DORA report found"). A preprint is marked "(preprint)". Cite it, and
   name the author in the sentence where it helps the reader judge the source:
   "Edmondson (1999) found...". Where research on the question exists, cite
   the research, not a blog post summarizing it.
2. Reference: what a standard, a specification, or official documentation
   says. Link it on first mention.
3. Recommendation: the instruction team's view, written as "The instruction
   team recommends X, because Y." Use "believes" only where the evidence is
   mixed and you say so. A recommendation always carries its reason. In a
   guide, which never names the course or its staff, the same claim is an
   imperative with its reason: "Keep the agreement to one page, because it's
   read mid-disagreement."

A practitioner essay is an argument, not evidence: "Fowler argues..." is
right; "research shows" with a blog post behind it is wrong. An unsourced
"research shows", "studies find", or "most teams" gets a source, gets
relabeled as a recommendation, or gets cut.

A cited claim is verified when someone has read the passage that supports it
and recorded where it is (a section, a page, a figure). A working link proves
nothing: it can lead to a real paper whose title the page misquotes, or to
the same author's other paper, which never made the claim. A claim checked
against an abstract alone can say only what the abstract says.

Be blunt about the stance and hedge the number. "Demo to your partner every
sprint" sits next to "plan on roughly 30 minutes, probably more the first
time". Hedge a quantity you are estimating; never hedge the recommendation
itself.

Guides owe evidence wherever they make an evidence-type claim. Assignments
cite the standard they grade against and nothing else, because research on an
assignment page is course-design rationale. Activities and the audience pages
have no citation duty, though they may link.

## Structure

- Settle why the page exists, what its reader needs from it, and who that
  reader is before working on organization, wording, or polish. Revising the
  wording of a page aimed at the wrong reader is wasted work.
- Instruction comes first and reasoning after. At the page level, say what to
  do before explaining why, so a student under deadline can stop reading
  early. Inside a section, state the claim, then its reason.
- One paragraph carries one idea, with a transition into the next. A
  paragraph ends on its last piece of information, never on a line that
  restates it.
- The reverse outline: one line per paragraph naming its idea and what it
  contributes to the page. A paragraph with no contribution is
  cut, one with two ideas is split, and one whose last sentence restates it
  loses that sentence.
- Lists hold things you can count; prose holds arguments. Steps, options, and
  checklists are lists. Reasons are paragraphs. An option list may label its
  pick "(Preferred)", so the reader sees the alternatives and the stance at
  once.
- "Not A; it's B" is allowed only when A is something the reader plausibly
  believes, and the explanation follows. It never closes a paragraph, and it
  is never the page's thesis.
- A page opens on the reader's situation: the moment they are in when the
  page is useful, then what the page covers and what it does not. A guide
  then gives a tl;dr of three to seven bullets, each a concrete action or fact
  the reader could act on without reading further. Two openers are banned: a
  claim about the topic's importance ("X is the backbone, the foundation, the
  fundamental unit of...") and a "Without X:" list of what goes wrong.
- A page has no closing summary and no closing moral. It ends on its last
  useful section.
- A heading names its section and never carries a percentage ("Midterm
  Pulse", not "Midterm Pulse (5%)"). The number already lives where the page
  states it (frontmatter, the meta box, a table), and a copy in a heading
  drifts and breaks every inbound anchor when it changes. `check-prose` fails
  it.

## Sentences and words

- Sentences average around 16 words. A run of short declaratives reads as a
  string of slogans; a sentence that holds two ideas is split.
- State a problem with its numbers: "three of the five endpoints have no
  tests", not "test coverage is weak".
- Contract negative imperatives and everyday prose: "don't commit `data/`",
  "you'll", "it's". Keep the full form for factual negatives and hard
  requirements, where the weight is intended: "the validator does not read
  Canvas", "late work is not accepted".
- Bold marks a term where it is defined, and at most one critical instruction
  per section. Beyond that, bold is allowed only as a label: a term and its
  definition in a list, an activity step's name (the step format in
  `cs46x-activities`), and a label a validator requires, such as
  `**AI use:**` on assignment pages. No bolded sentences for emphasis.
- Allowed, sparingly: a parenthetical aside ("(Yes, mail can get lost.)"), a
  rhetorical question answered in the next sentence ("Want to get paid?
  You'll need a US bank account."), an analogy to something familiar, and
  "Let's". An exclamation mark appears only on an audience page, at most once
  per page.
- Not allowed: deadpan one-word beats, staccato emphasis ("Every. Single.
  Time."), sarcasm, and sign-offs ("Stay safe").
- Banned words: "honest", "honesty", and "honestly" (except in "academic
  honesty"), "genuinely", "worth stealing", "one-way door" and "two-way door"
  (say "hard-to-reverse decision" and "easy-to-reverse decision"), and "the
  net" (say "the checks": tests, CI, review gates, staging, a rollback path).
  Keep "actually" and "evidence".
- Use American spelling. Keep "i.e.", "e.g.", parentheses, "Note that", and
  "make sure"; write "respectively", not "resp.". Fix calques ("consists in",
  "choose for") and typos.

## The floor, in every register

- No em dashes (hard rule 3). Use a colon, semicolon, comma, period, or
  parentheses. `validate-dashes.mjs` and `check-prose.mjs` reject one at
  commit and in CI. A `--` written in its place is still a dash, and no check
  sees it.
- Name the source on first mention. When a page introduces a tool, a
  standard, a model, or a named technique, link the authoritative reference.
- Use the active voice: "the validator rejects the file", not "the file is
  rejected by the validator".
- Define an acronym on first use, then use the short form: "CI (continuous
  integration)" and thereafter "CI".
- Use precise nouns: not "the server" when you mean "the staging server", not
  "the file" when you mean `lefthook.yml`.
- Copy code exactly. Commands, paths, filenames, and flags are copied, not
  paraphrased. A wrong flag costs a student an hour.

## Before and after

Each pair is a constructed illustration. The "before" breaks a rule above;
the "after" makes the same point within the rules.

A paragraph that ends on a punchline:

> Before: Silence is the worst available option. A team can plan around a
> member who is struggling. It cannot plan around one who disappears.
>
> After: If you're falling behind, tell the team before the stand-up where it
> would come out anyway. A teammate who says "I'm stuck on the auth flow and
> won't finish it this sprint" gives everyone else two days to re-plan; one who
> goes quiet gives them a surprise at the demo.

The after keeps the point and trades the aphorism for the situation and the
cost. It ends on its last piece of information.

An opener that claims the topic's importance:

> Before: Documentation is the infrastructure of knowledge transfer. It is what
> lets someone else understand and use your work without having to ask you.
> Without it:
>
> After: Sooner or later someone other than you needs to run your system: a
> new teammate, your project partner, whoever maintains it after you graduate.
> This page covers which documents to write for each of them, from the README
> to the API reference, and how much detail each one needs.

An unsourced claim:

> Before: Boundary conditions (empty inputs, maximum values, invalid data,
> concurrent access) are where most bugs live.
>
> After: Test boundaries first (empty inputs, maximum values, invalid data,
> concurrent access), because a boundary is where a single wrong comparison
> flips the result, and it's the case a happy-path test never reaches.

"Where most bugs live" is a statistic with no source. The after owns it as a
recommendation and gives the reason.

A contrast used as a thesis:

> Before: Accessibility is not a polish task for the last sprint; it is a
> correctness property, and like every other correctness property it belongs
> in CI.
>
> After: Teams often leave accessibility to the last sprint, as polish. Treat
> it like any other correctness property instead: a missing form label breaks
> the page for a screen-reader user the same way a null pointer breaks it for
> everyone, so the check belongs in CI next to your tests.

The reader plausibly believes the "polish" framing, so it's worth naming. The
after names it once and spends the rest of the paragraph on why.

A bolded sentence:

> Before: **Missing is not a band on a submitted artifact.** Work that is not
> submitted, is off-topic, or is inaccessible to graders scores **zero** on
> the affected criteria.
>
> After: Work that is not submitted, is off-topic, or cannot be opened by a
> grader scores zero on the affected criteria. "Does Not Meet" is only for
> work you submitted that falls short.

The bold sentence was the rule's slogan; the after states the rule once, in
the order a student needs it, and bolds nothing.

A banned word and uncontracted prose:

> Before: owes the team a repository that is always one honest step from
> demoable.
>
> After: owes the team a repository that's always one step from a demo.

"Honest" added nothing a reader could check. The after drops it and the
stiffness with it.

## What this file does not cover

- Section skeletons, required headings, word bands, and badge vocabulary: the
  three content skills, `cs46x-activities`, `cs46x-assignments`, and
  `cs46x-guides`.
- Grading language, rubric tables, and outcome tags: `cs46x-assignments` and
  the validators it names.
- Chat replies, commit messages, and pull request text. Commit and pull
  request text follow `scripts/check-commit-message.mjs` and the Git section
  of `AGENTS.md`.
