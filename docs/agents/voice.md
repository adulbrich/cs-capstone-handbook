# Document voice

The voice the handbook uses when it speaks to students, partners, and mentors.
This is the only home for the rules every page follows. `AGENTS.md` and the
three content skills (`cs46x-activities`, `cs46x-assignments`,
`cs46x-guides`) point here by section and don't restate it; each skill adds
only what its own page type needs. Every example in this file is constructed
to illustrate its rule.

## Pages are not chat

Chat replies are often terse and point-first, with every supporting sentence
cut. That works in a conversation, where the reader can ask a follow-up. It
fails on a page, where the reader can't. Applied to a teaching page, it
deletes the reason, the tradeoff, and the source, which is the material the
page exists to carry.

Students read these pages under deadline pressure, so length is a cost they
pay. Spend it on the reason and the source, never on restating the point.

When the clause explaining *why* is cut, what survives is the punchline. It
reads as confident and teaches nothing, because a reader who already agreed
nods and a reader who disagrees has no argument to engage and no source to
check. The same point, written both ways:

> Aphorism: "Small deploys are safe deploys."
>
> Explanation: "The DORA report found its elite group
> deploying on demand, several times a day, while low performers deployed
> between once a month and once every six months
> <Cite id="forsgren-2019" form="parenthetical" />. A small deploy changes
> little, so when one breaks, the change to roll back is easy to find. The
> report's sample likely came from teams already familiar with DevOps, though, and
> frequent deploys only get cheap once CI and a one-command deploy exist, so
> build those before you raise the pace."

The second is longer. It's also the only one a student can act on or
disagree with.

## Registers

Each page type has one job, and its register follows from that job. This
table is the one map of them; each content skill holds the rules for its own
register.

| Page type | Register | Its job | What it cites |
|---|---|---|---|
| Guide (`guides/`) | Explanation | Why a practice works, how it compares with the alternatives, and what good looks like. Read once for understanding, then returned to for reminders. | Evidence for every evidence-type claim (Claims), plus the links The floor requires. |
| Activity (`activities/`) | How-to | The steps that produce one artifact in one sitting, for a reader who has already decided to do it. It gives steps and doesn't argue. | No citation duty beyond the links The floor requires. It links the guide that explains the practice. |
| Assignment (`assignments/`) | Brief | What is due, by when, how it is judged, and why it matters to the student, as a client brief does for a professional. Read through once at the start, then checked against while working. | The standard it grades against, plus the links The floor requires. No research: on an assignment page it is course-design rationale and belongs in the guide the page links. |
| Audience page (`introduction/for-*.mdx`) and syllabus | Orientation | What this is and what it asks of one reader, short enough to read before the term starts (`AGENTS.md`, Audience pages are orientation, not a course index). | No citation duty beyond the links The floor requires. |

"Brief" names the assignment register only. `cs46x-review` also calls its
reviewer prompts briefs, which is a different sense.

## Person

- The reader is "you", and only the reader is: "you will configure", not
  "students will configure".
- The handbook never says "I". It's a professional handbook with more than
  one instructor, and it outlives any one of them.
- The people who run the course, instructors and TAs together, are "the
  instruction team" (the glossary lists the words it replaces). When only the
  instructors or only a TA is meant, say so.
- "We" appears only on the audience pages and in the syllabi, where the team
  speaks directly to someone before the term starts. Everywhere else, name
  the instruction team or say nothing.
- A page a student reads speaks to the student. Staff procedure (who flags,
  who confirms, a response window, what a grader opens or clicks) goes in
  `STAFF-RUNBOOK.md`, never on the page. An assignment's per-criterion
  grading notes are not staff procedure: they tell the student what is
  checked first.

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
   says, linked on first mention (The floor).
3. Recommendation: the instruction team's view, written as "The instruction
   team recommends X, because Y." Use "believes" only where the evidence is
   mixed and you say so. A recommendation always carries its reason. A guide
   states it as an imperative with its reason (`cs46x-guides`, Sourcing).

A practitioner essay is an argument, not evidence: "Fowler argues..." is
right; "research shows" with a blog post behind it is wrong. An unsourced
"research shows", "studies find", or "most teams" gets a source, gets
relabeled as a recommendation, or gets cut.

Read every source the page paraphrases. When a sentence says what a
framework, a standard, an essay, or a paper contains, open the source and
check the sentence against it, because a citation can carry a finding the
source does not report: Klein's premortem essay credits Mitchell et al.
(1989) with one.

A cited claim is verified when someone has read the passage that supports it
and recorded where it is (a section, a page, a figure). A working link proves
nothing: it can lead to a real paper whose title the page misquotes, or to
the same author's other paper, which never made the claim. A claim checked
against an abstract alone can say only what the abstract says.

Be blunt about the stance and hedge the number. "Demo to your partner every
sprint" sits next to "plan on roughly 30 minutes, probably more the first
time". Hedge a quantity you are estimating; never hedge the recommendation
itself.

What each page type must cite is in the Registers table.

## Structure

- Settle why the page exists, what its reader needs from it, and who that
  reader is before working on organization, wording, or polish. Revising the
  wording of a page aimed at the wrong reader is wasted work. The reader also
  sets the register (Registers).
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
- Each page type opens its own way, as its skill sets out. Every other
  handbook page opens on the reader's situation, except a reference page
  (the home page and the pages under `about/`), which opens on what it
  holds. On every page, two
  openers are banned: a claim about the topic's importance ("X is the
  backbone, the foundation, the fundamental unit of...") and a "Without X:"
  list of what goes wrong. `check-prose` enforces both only in a guide's
  opening, so on any other page only review catches them.
- A page has no closing summary and no closing moral. It ends on its last
  useful section.
- A heading names its section and never carries a percentage, a length, or a
  format ("Midterm Pulse", not "Midterm Pulse (5%)"; "What You Submit", not
  "What You Submit (one PDF)"). The fact already lives where the page states
  it (frontmatter, the summary card, the section's first line), and a copy in
  a heading drifts and breaks every inbound anchor when it changes.
  `check-prose` fails a percentage.

## Concrete sentences

A sentence built from abstractions sounds finished and gives the reader
nothing to act on. These rules follow Joseph Williams and Joseph Bizup,
*Style: Lessons in Clarity and Grace*: a sentence reads clearly when its
subject names who acts and its verb names what they do.

Each rule below changes how a sentence says something. A fix made for one of
them keeps what the sentence says: what it is for, the qualifiers that set its
scope, what it asks the reader to do, and the facts it states. When no version
that follows the rules keeps all of that, the sentence stays as it was. Only a
rule that bars the idea itself from the page removes it:
rule 3's truism, rule 4's vendor number, staff procedure under Person, or
what a content skill or a hard rule keeps off that page, such as course design
on an assignment page, a course fact on a guide or an activity, a calendar
date, or Canvas in a page body. Saying something else is a content change:
make it on purpose, and name it in the pull request (#661).

1. The subject is a person or a named system, and the verb is what it does:
   "the partner's IT staff review new software", not "approvals run on
   someone else's schedule". The page never acts for the reader: "give each request
   an owner", not "this document gives each request an owner".
2. Name the case. A category word (access, approvals, prerequisites,
   requests) comes with its concrete instance in the same sentence: "a VPN
   account from the partner's IT staff", "Apple's review of your App Store
   build".
3. A reason gives the reader a fact they didn't have. A "because" clause that
   is true of every project ("because no lead time gets shorter for starting
   late") is a truism: replace it with the fact that holds for this one, or
   cut it. A sentence that says what a section, activity, or step does for
   its reader states its purpose, not a reason, so rule 3 keeps it (#661).
4. Durations and quantities are numbers, sourced or hedged as Claims
   requires: "three of the five endpoints have no tests", not "test coverage
   is weak"; "two to six weeks", not "runs in weeks". Where nobody on the team
   knows the number, say who does: "ask the partner how long their security
   review takes". A rule or number a vendor sets and changes (a store's
   review time, a tester count, a price, a plan limit) is never restated: name
   the requirement, link the vendor's current documentation, and tell the
   reader to check it before planning on it.
5. Use the reader's words. Don't coin compounds or turn verbs into nouns
   ("adds waits", "real-user recruitment"). A term the handbook needs has
   one meaning, given in `src/content/docs/about/glossary.mdx`, and is used
   that way everywhere, as "start-by date" is.
6. No filler for rhythm: an appositive that repeats the sentence's own nouns
   ("access and approvals alike"), a tacked-on "both X and Y", a pair or
   triple added for cadence, or a phrase that announces a point instead of
   making it ("it's worth noting that").
7. Put a link on the words that name its topic: "read
   [Google Play's testing requirements](...)", not "..., which
   [Shipping](...) covers".
8. An expectation names what someone could observe: "a README a new teammate
   follows without asking anyone", not "professional documentation". An
   adjective with no observable behind it ("clear", "thorough", "high
   quality") tells the reader nothing to check.

## Sentences and words

- One idea per sentence. Split a sentence that holds two, and join a run of
  short declaratives that reads as a string of slogans.
- Contract negative imperatives and everyday prose: "don't commit `data/`",
  "you'll", "it's". Keep the full form for factual negatives and hard
  requirements, where the weight is intended: "the validator does not read
  Canvas", "late work is not accepted".
- Bold marks a term where it is defined, and at most one critical instruction
  per section. Beyond that, bold is allowed only as a label: a term and its
  definition in a list, an activity step's name (`cs46x-activities`,
  Required Section Shape), and a label a validator requires, such as
  `**AI use:**` on assignment pages. No bolded sentences for emphasis.
- Allowed, sparingly: a parenthetical aside ("open a pull request for every
  change (yes, even a one-line fix)"), a rhetorical question answered in the
  next sentence ("Need production data? Ask the partner for a sanitized copy
  in your first meeting."), an analogy to something familiar, and "Let's".
  An exclamation mark appears only on an audience page, at most once per
  page.
- Not allowed: deadpan one-word beats, staccato emphasis ("Ship. Then.
  Iterate."), sarcasm, and sign-offs ("Happy coding!").
- Banned words: "honest", "honesty", and "honestly" (except in "academic
  honesty"), "genuinely", "worth stealing", "one-way door" and "two-way door"
  (say "hard-to-reverse decision" and "easy-to-reverse decision"), and "the
  net" (say "the checks": tests, CI, review gates, staging, a rollback path).
  Keep "actually" and "evidence".
- An activity's tier names are internal. A student page never calls an
  activity "Recommended" or "a library activity"; its badge line says what a
  student needs to know.
- Keep the Latin abbreviations: "e.g." for an example, "i.e." for "that is",
  "cf.", "etc.", "vs.", and "et al.". Write "cf.", not "cfr.", and put a comma
  after "e.g." and "i.e.".
- Use American spelling. Keep parentheses, "Note that", and "make sure";
  write "respectively", not "resp.". Fix calques ("consists in", "choose
  for") and typos.

## Asides

An aside holds something only some readers need at that point, or a
warning, and the page reads complete without it. The handbook uses three
forms of Starlight aside and no others:

- `:::note[tl;dr]`, in a guide's opening, after the situation and scope
  paragraphs (`cs46x-guides`, The Opener). It is the only aside that holds a
  list, and its bullets are exempt from the length limit
  below.
- `:::note[If <situation>]`, for a variation one situation needs: "If your
  project is under NDA", "If your partner stops responding". The title starts
  with "If" and names the situation.
- `:::caution[<what goes wrong>]`, for a mistake that costs data, a grade, or
  days. The title names the mistake ("Committing `.env` publishes your
  keys"), never a slogan.

No `:::tip`, no `:::danger`, and no `<Aside>` component in their place. Every
aside has a title, holds one idea in at most 60 words, and never opens a
section. An aside never holds what every reader needs (that is body text), a
concept explanation, a tool list, a vendor's current terms, a summary other than
the tl;dr, or anything addressed to the instruction team.

## Examples of project work

Projects differ in what they wait on: an existing codebase, maintainers who
decide what merges, another institution's data, a partner's environment,
users nobody has found yet. When a page illustrates with someone's project,
or says which projects need something:

- Name the trigger, the situation that makes it matter ("if you need another
  institution's data", "if you contribute to an open-source project"), never
  a kind of project (#608). The glossary lists the retired category words,
  and `check-prose` rejects them.
- Draw examples from varied work, and say a project may match several or
  none. A set of examples of where a project should be includes a slow start
  stated well (the partner asked for research and planning first, or an
  approval sets the pace) and the way out: agree with the partner or mentor
  what fits.
- "An open-source project you contribute to" is the case where maintainers
  decide what merges. The partner's own codebase is not that case, even in a
  public repository.
- Say who ran it, used it, or is needed: "someone who didn't build it", "the
  partner's staff", "a graduate student in the lab", "people outside the
  team". "Stranger" stays only where it means untrusted, as in a pull request
  from a stranger.
- No tool names, weeks, or dates in an example whose concept doesn't need
  them: "add analytics early", not a list of analytics products.

## The floor

- No em dashes and no emoji (`AGENTS.md`, hard rule 3).
- Name the source on first mention. When a page introduces a tool, a
  standard, a model, or a named technique, link the authoritative reference.
  A practice every stack has, such as pinning dependency versions, has no
  single owner: state it plainly and link nothing, because one ecosystem's
  documentation tells readers on every other stack that the page wasn't
  written for them.
- Present no tool as mandatory. Where a page assumes a paid service, specific
  hardware, or a capable AI agent, name the substitute for a student without
  it, because tool access is unequal.
- Use the active voice: "the validator rejects the file", not "the file is
  rejected by the validator".
- Define a term before using it. Which pages spell out an acronym is under
  Acronyms in `src/content/docs/about/glossary.mdx`.
- Use precise nouns: not "the server" when you mean "the staging server", not
  "the file" when you mean `lefthook.yml`.
- Copy code exactly. Commands, paths, filenames, and flags are copied, not
  paraphrased. A wrong flag costs a student an hour.

## Before and after

In each pair, the "before" breaks a rule above and the "after" makes the same
point within the rules.

A paragraph that ends on a punchline:

> Before: Run your tests in CI. A suite that only runs on one laptop is a
> suite nobody trusts.
>
> After: Run the test suite in CI on every pull request, so a failure shows
> up on the change that caused it instead of on whoever next runs the tests
> locally.

The after names the practice and what skipping it costs, and it ends on its
last piece of information.

An opener that claims the topic's importance:

> Before: Requirements are the foundation of every successful project.
> Without them:
>
> After: Your partner described the project in one meeting, and three
> teammates left with three different versions of it. This page covers how to
> write the requirements down so the partner can confirm them, and what to
> leave out until later.

An unsourced claim:

> Before: Most security incidents start with a leaked credential.
>
> After: Keep secrets out of the repository with a `.env` file listed in
> `.gitignore`, because a key you commit stays in the Git history after you
> delete the file.

"Most security incidents" is a statistic with no source. The after states the
practice as a recommendation and gives the mechanism behind it.

A contrast used as a thesis:

> Before: Code review is not about finding bugs; it is about sharing
> knowledge.
>
> After: You may think of code review as a bug hunt. It catches some bugs, but
> on a team of four its larger payoff is that two people understand every
> change, so a teammate who is sick on demo day doesn't take a feature with
> them.

The reader plausibly holds the bug-hunt view, so naming it is fair. The after
names it once and spends the rest of the paragraph on the reason.

A bolded sentence:

> Before: **Never push directly to main.** Branch protection should be on
> from day one.
>
> After: Turn on branch protection for `main` on the first day, so every
> change arrives through a pull request someone else approved.

The bold sentence was the rule's slogan. The after states the rule once and
bolds nothing.

A banned word and uncontracted prose:

> Before: Give your partner an honest estimate. Do not promise a date you
> cannot meet.
>
> After: Give your partner a range with its condition: "two to three sprints,
> depending on when the API keys arrive." Don't promise the low end.

"Honest" added nothing a reader could check; the range and its condition do.

An abstraction as the actor, and a page that acts:

> Before: Access requests run on someone else's timeline, so surface them
> early. This page gives each one an owner.
>
> After: The partner's IT staff decide when you get a VPN account and access
> to their repositories. Ask for both in your first meeting, and give each
> request an owner on the team.

A truism for a reason, and filler for rhythm:

> Before: Book user tests early, testers and observers alike, because no
> schedule gets easier for starting late.
>
> After: Book your first user test before the feature is finished: the people
> you test with have their own calendars, and a test in the week before the
> demo leaves no time to fix what they find.

A coined term, a vendor's number, and a trailing pointer:

> Before: Store review adds release latency of about a day, which the
> Shipping guide covers.
>
> After: Apple reviews App Store submissions, and a rejection sends you back
> to fix and resubmit. Apple changes its review process, so check
> [Apple's App Review page](https://developer.apple.com/distribute/app-review/)
> for current review times before you set a release date.

A vague phrase replaced while every idea stays:

> Before: Demo to the partner every sprint to keep them informed and make sure
> their feedback is effective.
>
> After: Demo to the partner every sprint to keep them informed and hear what
> they'd change in time to plan it into the next.

## What this file does not cover

- Each page type's section skeleton, required headings, word budgets, opener
  shape, and badge vocabulary: the three content skills, `cs46x-activities`,
  `cs46x-assignments`, and `cs46x-guides`.
- Grading language, rubric tables, and outcome tags: `cs46x-assignments` and
  the validators it names.
- Chat replies, commit messages, and pull request text. Commit and pull
  request text follow `scripts/check-commit-message.mjs` and the Git section
  of `AGENTS.md`.
