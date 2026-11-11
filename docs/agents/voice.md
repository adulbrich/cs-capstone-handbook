# Document voice

How the handbook speaks to students, partners, and mentors. This file is the
one home for the rules every page follows. `AGENTS.md` and the three content
skills (`cs46x-activities`, `cs46x-assignments`, `cs46x-guides`) point here by
section and add only what their own page type needs.

Every page is reviewed for three faults (Joseph Williams and Joseph Bizup,
*Style: Lessons in Clarity and Grace*; #680):

- a **hidden actor**: the subject isn't who acts, or the action is buried in a
  noun (Concrete sentences, rule 1);
- **vague wording**: a noun stack, a reference with no clear target, a coined
  phrase (Concrete sentences, rules 2 and 5, and The floor's precise nouns);
- a **buried point**: the reader understands every word and can't say what
  the paragraph is for (Structure).

## Pages are not chat

A page leads with its point and keeps the reason its reader needs. A claim
gets a reason when a CS senior would doubt it, or when the reason changes what
they do; an instruction the reader follows anyway gets none. The reason comes
after the point: one clause for a recommendation, and what Claims asks for an
evidence claim (#680).

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

Every claim a reader could doubt is one of three kinds, and the sentence shows
which.

1. **Evidence**: a finding from a peer-reviewed venue, a research book, or an
   industry report with a published method (name it as an industry report:
   "the DORA report found"). Mark a preprint "(preprint)". Cite it, and name the author in the
   sentence where that helps the reader judge it: "Edmondson (1999) found...".
   Where research on the question exists, cite the research, not a blog post
   about it.
2. **Reference**: what a standard, a specification, or official documentation
   says, linked on first mention (The floor).
3. **Recommendation**: the instruction team's view, "The instruction team
   recommends X", with a reason when Pages are not chat calls for one. Use
   "believes" only where the evidence is mixed, and say so. A guide states a
   recommendation as an imperative (`cs46x-guides`, Sourcing).

A practitioner essay is an argument: "Fowler argues..." is right, and
"research shows" with a blog post behind it is wrong. An unsourced "research
shows", "studies find", or "most teams" gets a source, becomes a
recommendation, or goes.

Read every source the page paraphrases, and check the sentence against the
passage: a citation can carry a finding its source doesn't report (Klein's
premortem essay credits Mitchell et al. (1989) with one). A cited claim is
verified when someone has read the supporting passage and recorded where it
is (a section, a page, a figure). A working link proves nothing, and an
abstract supports only what the abstract says.

Be blunt about the stance and hedge the number: "Demo to your partner every
sprint" sits next to "plan on roughly 30 minutes, probably more the first
time".

## Structure

- Instruction first, reasoning after. At the page level, say what to do before
  why, so a student under deadline can stop reading early. Inside a section,
  state the claim, then its reason.
- A paragraph's first sentence states its point, and the rest supports that
  point and nothing else (#680). One paragraph carries one idea, with a
  transition into the next, and ends on its last piece of information, never
  on a line that restates it.
- The reverse outline: one line per paragraph, stating its point. Cut a
  paragraph with no point, split one with two, and drop a last sentence that
  restates. Write the outline before drafting a page, and run it again on the
  draft (#680).
- Lists hold what you can count: steps, options, checklists. Prose holds
  arguments. An option list may label its pick "(Preferred)".
- "Not A; it's B" only when the reader plausibly believes A, with the
  explanation after it. It never closes a paragraph and is never the page's
  thesis.
- Each page type opens its own way, as its skill sets out. Any other page
  opens on the reader's situation, except a reference page (the home page and
  the pages under `about/`), which opens on what it holds. Two openers are
  banned on every page: a claim about the topic's importance ("X is the
  backbone of...") and a "Without X:" list of what goes wrong. `check-prose`
  enforces both only in a guide's opening, so on any other page only review
  catches them.
- A page has no closing summary and no closing moral. It ends on its last
  useful section.
- A heading names its section, never a percentage, a length, or a format
  ("Midterm Pulse", not "Midterm Pulse (5%)"). The fact lives in frontmatter,
  the summary card, or the section's first line; a copy in a heading drifts
  and breaks inbound anchors when it changes. `check-prose` fails a
  percentage.

## Concrete sentences

A sentence reads clearly when its subject names who acts and its verb names
what they do.

A fix made for these rules keeps what the sentence says: its purpose, the
qualifiers that set its scope, what it asks the reader to do, and its facts.
When no version that follows the rules keeps all of that, the sentence stays.
Only a rule that bars the idea itself removes it: rule 3's truism, rule 4's
vendor number, staff procedure under Person, or what a content skill or a hard
rule keeps off that page, such as course design on an assignment page, a
course fact on a guide or an activity, a calendar date, or Canvas in a page
body. Saying something else is a content change: make it on purpose, and name
it in the pull request (#661).

1. The subject is a person or a named system, and the verb is what it does:
   "the partner's IT staff review new software", not "approvals run on
   someone else's schedule". The page never acts for the reader: "give each
   request an owner", not "this document gives each request an owner".
2. Name the case. Replace a category word (access, approvals, prerequisites,
   requests) with its instance: "ask for a VPN account", not "request
   access". Keep the category word where the sentence means the whole
   category (#680).
3. A reason gives the reader a fact they didn't have. A "because" clause true
   of every project ("because no lead time gets shorter for starting late")
   is a truism: replace it with the fact that holds for this one, or cut it.
   A sentence that says what a section, activity, or step does for its reader
   states a purpose, not a reason, and stays (#661).
4. Durations and quantities are numbers, sourced or hedged as Claims
   requires: "three of the five endpoints have no tests", "two to six weeks".
   Where nobody on the team knows the number, say who does: "ask the partner
   how long their security review takes". A rule or number a vendor sets and
   changes (a store's review time, a tester count, a price) is never
   restated: name the requirement, link the vendor's page, and tell the
   reader to check it before planning on it.
5. Use the reader's words. Write the verb, not a noun made from it, and name
   the thing instead of stacking nouns or coining a compound: "recruit users",
   not "real-user recruitment". A sentence that defines a thing by itself
   ("record it in the document where you record the level") names the thing
   instead (#680). A term the handbook needs has one meaning, given in
   `src/content/docs/about/glossary.mdx`, and is used that way everywhere.
6. No filler for rhythm: an appositive that repeats the sentence's own nouns
   ("access and approvals alike"), a tacked-on "both X and Y", a pair or
   triple added for cadence, or a phrase that announces a point instead of
   making it ("it's worth noting that").
7. Put a link on the words that name its topic: "read [Google Play's testing
   requirements](...)", not "..., which [Shipping](...) covers".
8. An expectation names what someone could observe: "a README a new teammate
   follows without asking anyone", not "professional documentation". An
   adjective with no observable behind it ("clear", "thorough", "high
   quality") gives the reader nothing to check.

## Sentences and words

- One idea per sentence. Split a sentence that holds two, and join a run of
  short declaratives that reads as a string of slogans.
- Contract negative imperatives and everyday prose: "don't commit `data/`",
  "you'll", "it's". Keep the full form for factual negatives and hard
  requirements, where the weight is intended: "late work is not accepted".
- Bold marks a term where it is defined, and at most one critical instruction
  per section. Otherwise bold is only a label: a term in a definition list, an
  activity step's name (`cs46x-activities`, Required Section Shape), or a
  label a validator requires, such as `**AI use:**` on assignment pages. No
  bolded sentences.
- Allowed, sparingly: a parenthetical aside, a rhetorical question answered in
  the next sentence, an analogy to something familiar, and "Let's". An
  exclamation mark appears only on an audience page, at most once.
- Not allowed: deadpan one-word beats, staccato emphasis ("Ship. Then.
  Iterate."), sarcasm, and sign-offs ("Happy coding!").
- Banned words: "honest", "honesty", and "honestly" (except in "academic
  honesty"), "genuinely", "worth stealing", "one-way door" and "two-way door"
  (say "hard-to-reverse decision" and "easy-to-reverse decision"), and "the
  net" (say "the checks": tests, CI, review gates, staging, a rollback path).
  Keep "actually" and "evidence".
- An activity's tier names are internal: a student page never calls an
  activity "Recommended" or "a library activity".
- American spelling. Write "e.g.," "i.e.," "cf.," "etc.," "vs.," and "et
  al.", with a comma after "e.g." and "i.e."; "cf.", not "cfr."; and
  "respectively", not "resp.". Parentheses, "Note that", and "make sure" are
  fine. Fix calques ("consists in", "choose for") and typos.

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
decide what merges, another institution's data, a partner's environment, users
nobody has found yet. When a page illustrates with a project, or says which
projects need something:

- Say what the project is or what makes the need arise, whichever the reader
  recognizes: "if you're building a mobile app", "a research project", "if you
  need another institution's data". Sorting projects into kinds stays retired:
  no table, heading, badge, or rubric enumerates them, under any names (#608,
  #680).
  The glossary lists the retired category words, and `check-prose` rejects
  them.
- Draw examples from varied work, and say a project may match several or
  none. A set of examples of where a project should be includes a slow start
  stated well (the partner asked for research and planning first, or an
  approval sets the pace) and the way out: agree with the partner or mentor
  what fits.
- "An open-source project you contribute to" is the case where maintainers
  decide what merges. The partner's own codebase is not that case, even in a
  public repository.
- Say who ran it, used it, or is needed: "someone who didn't build it", "the
  partner's staff", "a graduate student in the lab". "Stranger" means
  untrusted only, as in a pull request from a stranger.
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

Each "before" breaks a rule above. Each "after" follows the rules and keeps
what the before says, except where its label names a change.

A noun stack as the subject, with a hidden actor. The after is the opening
sentence #682 sets, which also names the level a partner can agree to:

> Before: Your spring grade's largest partner-evaluation facet (Verification
> and Validation, 40 of the End-of-Term Survey's 100 points) is scored
> against outcomes: is the thing in production, merged upstream,
> reproducible, in real use?
>
> After: In spring, your partner awards up to 40 of the End-of-Term Survey's
> 100 points for one question: is your software in production, merged
> upstream, reproducible, or in real use, or at the level you and your
> partner agreed on?

A reference with no target, and a reason that buries the point. The after is
the text #681 sets, which also gives a project change its own reason:

> Before: Both are possible, and both need your instructors' approval,
> because both disrupt more than your own team.
>
> After: You can switch teams or change projects, but your instructors have
> to approve it. A team switch changes the work of two teams, and a new
> project may need a new partner.

A sentence that defines a thing by itself:

> Before: If your level waits on none of them, agree what it means with your
> partner or mentor and record it in the document where you and your partner
> record the level.
>
> After: If none of these fits your project, agree with your partner or
> mentor what shipped means, and write it down.

A reason on an instruction nobody would doubt, which the after drops:

> Before: Link each piece of evidence from the document where you and your
> partner recorded the level as soon as you capture it, because that document
> is where anyone checking your progress, your partner included, looks first.
>
> After: Link each piece of evidence from your agreement with your partner the
> day you capture it.

A contrast used as a thesis, split into slogans:

> Before: What separates open from merged isn't your code alone. It's a
> maintainer's attention and approval.
>
> After: Merging takes a maintainer's attention and approval, not just good
> code.

An unsourced claim, where the after is longer because a reader would doubt it:

> Before: Most security incidents start with a leaked credential.
>
> After: Keep secrets out of the repository with a `.env` file listed in
> `.gitignore`, because a key you commit stays in the Git history after you
> delete the file.

## What this file does not cover

- Each page type's section skeleton, required headings, word budgets, opener
  shape, and badge vocabulary: the three content skills.
- Grading language, rubric tables, and outcome tags: `cs46x-assignments` and
  the validators it names.
- Chat replies, commit messages, and pull request text: those follow
  `scripts/check-commit-message.mjs` and the Git section of `AGENTS.md`.
