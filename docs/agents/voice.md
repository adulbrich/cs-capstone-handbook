# Document voice

The voice the handbook uses when it speaks to students, partners, and mentors.
This is the only home for it. `AGENTS.md` and the three content skills point
here and don't restate it; each skill adds only what its own register needs.

This is not chat voice. A maintainer's `CLAUDE.md` may ask an agent to
compress in the terminal: lead with the point, cut every sentence that doesn't
change what the reader will do. That works in a conversation, where the reader
can ask a follow-up. It fails on a page, where the reader can't. Applied to a
teaching page, it deletes the reason, the tradeoff, and the source, which is
the material the page exists to carry.

## Whose voice

The handbook should read like its instructor, Alex Ulbrich, wrote it for a
professional audience. The reference is that writing, in three parts:

- The base register is the
  [portfolio](https://www.alexulbrich.com/portfolio/): team voice, sentences
  around 16 words, a problem stated with numbers, and a piece that ends on its
  outcome rather than a moral.
- Personality, in small doses, comes from the blogs,
  [capucity.be](https://www.capucity.be/) and
  [alexulbrich.com/blog](https://www.alexulbrich.com/blog/): parenthetical
  asides, a question answered in the next breath, a blunt instruction next to a
  hedged number.
- The stated rules are in
  [Writing 101](https://www.alexulbrich.com/blog/writing-101/), which draws on
  the OSU Writing Intensive Curriculum seminar led by Dr. Sarah
  Tinker-Perrault. Its core is the hierarchy of rhetorical concerns: settle
  why, what, and for whom you are writing before organization, register, and
  polish. From it come one paragraph, one idea; every paragraph must
  contribute to the argument; and the register matches the audience. Its
  sources are the [Purdue OWL](https://owl.purdue.edu/) and Gottschalk and
  Hjortshoj, *The Elements of Teaching Writing* (2004).

Four short passages show the register. They are quoted as written.

> "Fighting insurance fraud is an expensive process. Let's have a look at how
> new technologies can help save time and increase detection rates."
> ([Fraud Detection](https://www.alexulbrich.com/portfolio/fraud-detection/))

The problem, then the promise, in two sentences. No definition of fraud, no
list of what goes wrong without the project.

> "Avoid credit at all cost." ... "This should probably be around 3 to 6 months
> of salary."
> ([Personal Finance 101](https://www.capucity.be/posts/personal-finance-101/))

The recommendation is blunt; the number is hedged. That is the calibration
rule under Claims, in the instructor's own words.

> "(Preferred) Split the scientific leadership from the computing division
> altogether."
> ([Blue Brain Nexus](https://www.alexulbrich.com/portfolio/blue-brain-nexus/))

Options laid out as a list, with the pick labeled. The reader sees the
alternatives and the stance at once.

> "Writing is not a one-shot process. It's an iterative process to achieve a
> communication objective."
> ([Writing 101](https://www.alexulbrich.com/blog/writing-101/))

This is the contrast construction as the reference writing uses it, and the
only way it's allowed here: it corrects a belief the reader plausibly holds,
and the post then spends several sections explaining it.

What does not transfer: the "I" of a personal blog, sign-offs ("Stay safe"),
sarcasm tags, staccato emphasis ("Every. Single. Time."), and first-draft slips.

## The failure this file exists to prevent

The handbook drifted into a voice nobody on the instruction team writes in.
Measured against the reference corpus (about 23,600 words), counting the
pages under `src/content/docs/`:

| Habit | Handbook, before the rewrite | Reference corpus |
|---|---|---|
| "X is not A; it is B" as a thesis or a paragraph's last line | about 20 in guides | 2, both followed by an explanation |
| A paragraph ending on a punchline of 7 words or fewer | about 68 | none that restate the paragraph |
| "Without it:" and four bullets as a guide's opening | 14 of 19 guides | none |
| Bolded whole sentences | about 154 | about 9, each a single instruction |
| "honest", "honesty", "honestly" | 54 | none |
| Uncontracted forms against contractions | about 1,070 to 42 | roughly even |

Most of these come from one edit: compression. When the clause explaining
*why* is cut, what survives is the punchline. It reads as confident and
teaches nothing, because a reader who already agreed nods and a reader who
disagrees has no argument to engage and no source to check.

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
nothing: the handbook once cited a real paper, with a misquoted title, for a
finding from a different paper by the same author. A claim checked against an
abstract alone can say only what the abstract says.

Be blunt about the stance and hedge the number. "Avoid credit at all cost"
sits next to "this should probably be around 3 to 6 months of salary". Hedge a
quantity you are estimating; never hedge the recommendation itself.

Guides owe evidence wherever they make an evidence-type claim. Assignments
cite the standard they grade against and nothing else, because research on an
assignment page is course-design rationale. Activities and the audience pages
have no citation duty, though they may link.

## Structure

- Instruction comes first and reasoning after. At the page level, say what to
  do before explaining why, so a student under deadline can stop reading
  early. Inside a section, state the claim, then its reason.
- One paragraph carries one idea, with a transition into the next. A
  paragraph ends on its last piece of information, never on a line that
  restates it.
- Lists hold things you can count; prose holds arguments. Steps, options, and
  checklists are lists. Reasons are paragraphs. An option list may label its
  pick "(Preferred)".
- "Not A; it's B" is allowed only when A is something the reader plausibly
  believes, and the explanation follows. It never closes a paragraph, and it
  is never the page's thesis.
- A page opens on the reader's situation: the moment they are in when the
  page is useful, then what the page covers and what it does not. A guide
  then gives a tl;dr of three to seven bullets, each a concrete action or fact
  the reader could act on without reading further. Two openers are banned: a
  claim about the topic's importance ("X is the backbone, the foundation, the
  fundamental unit of...") and a "Without X:" list of what goes wrong.
- A page has no closing summary. It ends on its last useful section.

## Sentences and words

- Contract negative imperatives and everyday prose: "don't commit `data/`",
  "you'll", "it's". Keep the full form for factual negatives and hard
  requirements, where the weight is intended: "the validator does not read
  Canvas", "late work is not accepted".
- Bold marks a term where it is defined, and at most one critical instruction
  per section. Beyond that, bold is allowed only as a label: a term and its
  definition in a list, an activity step's name (the activities skill's step
  format), and a label a validator requires, such as `**AI use:**` on
  assignment pages. No bolded sentences for emphasis.
- Allowed, sparingly: a parenthetical aside ("(Yes, mail can get lost.)"), a
  rhetorical question answered in the next sentence ("Want to get paid?
  You'll need a US bank account."), an analogy to something familiar, and
  "Let's". An exclamation mark appears only on an audience page, at most once
  per page.
- Not allowed: deadpan one-word beats, staccato emphasis, sign-offs.
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
  parentheses. `validate-dashes.mjs` fails the build on one, including the
  `--` convention.
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

Each "before" is a real line from the handbook. Each "after" is the same point
in the voice above.

A paragraph that ends on a punchline (`guides/conflict.mdx`):

> Before: Silence is the worst available option. A team can plan around a
> member who is struggling. It cannot plan around one who disappears.
>
> After: If you're falling behind, tell the team before the stand-up where it
> would come out anyway. A teammate who says "I'm stuck on the auth flow and
> won't finish it this sprint" gives everyone else two days to re-plan; one who
> goes quiet gives them a surprise at the demo.

The after keeps the point and trades the aphorism for the situation and the
cost. It ends on its last piece of information.

An opener that claims the topic's importance (`guides/documentation.mdx`):

> Before: Documentation is the infrastructure of knowledge transfer. It is what
> lets someone else [...] understand and use your work without having to ask
> you. Without it:
>
> After: Sooner or later someone other than you needs to run your system: a
> new teammate, your project partner, whoever maintains it after you graduate.
> This page covers which documents to write for each of them, from the README
> to the API reference, and how much detail each one needs.

An unsourced claim (`guides/testing-strategy.mdx`):

> Before: Boundary conditions (empty inputs, maximum values, invalid data,
> concurrent access) are where most bugs live.
>
> After: The instruction team recommends testing boundaries first (empty
> inputs, maximum values, invalid data, concurrent access), because a boundary
> is where a single wrong comparison flips the result, and it's the case a
> happy-path test never reaches.

"Where most bugs live" is a statistic with no source. The after owns it as a
recommendation and gives the reason.

A contrast used as a thesis (`guides/accessibility.mdx`):

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

A bolded sentence (`assignments/introduction.mdx`):

> Before: **Missing is not a band on a submitted artifact.** Work that is not
> submitted, is off-topic, or is inaccessible to graders [...] scores **zero**
> on the affected criteria.
>
> After: Work that is not submitted, is off-topic, or cannot be opened by a
> grader [...] scores zero on the affected criteria. "Does Not Meet" is only
> for work you submitted that falls short.

The bold sentence was the rule's slogan; the after states the rule once, in
the order a student needs it, and bolds nothing.

A banned word and uncontracted prose (`assignments/team-charter.mdx`):

> Before: owes the team a repository that is always one honest step from
> demoable.
>
> After: owes the team a repository that's always one step from a demo.

"Honest" added nothing a reader could check. The after drops it and the
stiffness with it.

## What this file does not cover

- Section skeletons, required headings, word bands, and badge vocabulary: the
  three skills under `.claude/skills/`.
- Grading language, rubric tables, and outcome tags: `cs46x-assignments` and
  the validators it names.
- Chat voice: a maintainer's own `CLAUDE.md`, unchanged by this file.
