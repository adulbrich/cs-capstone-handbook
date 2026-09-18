# Document voice

The voice the handbook uses when it speaks to students. This is the only home
for it. `AGENTS.md` and the three content skills reference this file; none of
them restates it.

**This is not chat voice.** A maintainer's `CLAUDE.md` may ask an agent to
speak in the terminal like a senior engineer tired of corporate writing: lead
with the point, cut every sentence that does not change what the reader will do.
That is correct for a conversation, where the reader can ask a follow-up
question the moment something is unclear. It is wrong for a handbook, where the
reader cannot. Applied to a teaching page, "cut every sentence that does not
change what the reader will do" deletes the reason, the history, the tradeoff,
and the alternative, which is the material the page exists to carry.

## The failure mode this file exists to prevent

Compression manufactures aphorisms. When the clause explaining *why* is cut,
what survives is the punchline. The result reads as confident and teaches
nothing, because a reader who already agreed nods and a reader who did not has
been given no argument and no source to check.

Measured against the same instructor's unaided lecture notes, handbook prose
made short standalone assertions at roughly twice the rate and cited sources at
roughly half the rate. Both numbers are symptoms of the same edit.

The comparison holds for **guides**, which are explanatory pages like lecture
notes. It does not transfer to assignments or activities: a lower-division
programming assignment is a different artifact from a term-long team
deliverable, so nothing here imports a number from one to the other. Where a
register still lacks a real capstone example, the skill says so rather than
borrowing one.

> **Aphorism.** The pyramid is a guideline, not a rule.
>
> **Explanation.** The pyramid is one of two competing models. The
> [testing trophy](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)
> argues for more integration tests than unit tests, on the grounds that
> integration tests buy more confidence per test and that modern tooling has
> made them fast enough to write in bulk. Which one fits depends on how
> expensive your integration tests actually are, so measure before you commit
> to a shape.

The second is longer. It is also the only one of the two a student can act on
or disagree with.

## The floor, in every register

These hold for guides, assignments, and activities alike. Register-specific
rules live in the matching skill.

- **Every claim a reader could reasonably doubt carries its reason.** A
  sentence asserting a preference without the "because" is unfinished.
- **Name the source on first mention.** When a page introduces a tool, a
  standard, a model, or a named technique, link the authoritative reference
  where it exists: official documentation, an RFC, a paper, the author who
  coined it. An unsourced claim is the reader's problem to verify; a sourced
  one is a door.
- **No em dashes.** Hard rule 3. Use a colon, semicolon, comma, period, or
  parentheses. `validate-dashes.mjs` fails the build on one, including the
  `--` convention. This rule stands even though it differs from how the
  instructor punctuates elsewhere: in this repository it is deliberate.
- **Active voice.** "The validator rejects the file", not "the file is
  rejected by the validator."
- **Second person for the reader**, and only for the reader. "You will
  configure", not "students will configure."
- **Define acronyms on first use**, then use the short form: "CI (continuous
  integration)" and thereafter "CI".
- **Precise nouns.** Not "the server" when you mean "the staging server", not
  "the file" when you mean `lefthook.yml`.
- **Code stays exact.** Commands, paths, filenames, and flags are copied, not
  paraphrased. A wrong flag costs a student an hour.

## Tone calibration

The page sounds like a knowledgeable colleague who respects the reader's
intelligence. Direct, not formal. Unhurried. It states an opinion and says what
the opinion rests on.

**Good.** This is the instructor's own prose, from the CS 362 lecture on
testing fundamentals. It is the target register:

> Tests that behave unpredictably, sometimes passing and sometimes failing
> without any changes to the code or test, are referred to as **flaky tests**.
> These tests can erode developers' confidence in the test suite and waste
> valuable time as they try to diagnose the cause of the failures. [...] That
> said, some degree of test flakiness may be unavoidable in specific scenarios.
> For example, a test that relies on a network service might fail due to
> uncontrollable factors like network instability. In such cases, the impact of
> flakiness can be minimized by automatically rerunning any failing tests.

Four things happen there in six sentences: the term is defined, the cost is
named and it is a human cost rather than a technical one, the limit of the
advice is admitted, and a mitigation is given. Nothing is asserted that is not
also explained.

**Too formal.** Test flakiness constitutes a significant impediment to suite
reliability and should be mitigated through appropriate remediation strategies.

**Too casual.** Flaky tests are super annoying and everyone just reruns them
until they go green.

**Too compressed, the failure this file targets.** A flaky test is not a test.
Delete it.

The fourth is the one to watch for. It is the shortest, it sounds the most like
craft, and it is the least useful of the four: it has removed the cost, the
limit, and the mitigation, so a reader who disagrees has nothing to argue with
and a reader who agrees has learned nothing to do.

## What this file does not cover

- Section skeletons, required headings, word bands, and badge vocabulary: the
  three skills under `.claude/skills/`.
- Grading language, rubric tables, and outcome tags: `cs46x-assignments` and
  the validators it names.
- Chat voice: a maintainer's own `CLAUDE.md`, unchanged by this file.
