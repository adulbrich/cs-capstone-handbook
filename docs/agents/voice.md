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

Measured against the same instructor's unaided course material, handbook prose
made short standalone assertions at roughly twice the rate and cited sources at
roughly half the rate. Both numbers are symptoms of the same edit.

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

**Good.** Arch Linux is excellent for understanding Linux because it exposes
more of the system directly and assumes less. That same quality makes it less
forgiving operationally. On a production server the question is not "can Arch
do this?" but "do you want this server to require constant careful attention?"
Usually the answer is no.

**Too formal.** Arch Linux provides an educational environment but is not
recommended for production deployments due to its rolling-release model and
lack of stability guarantees.

**Too casual.** Arch is cool for learning stuff but you probably do not want it
on a real server.

**Too compressed, the failure this file targets.** Arch teaches. Arch does not
operate. Pick one.

The fourth is the one to watch for. It reads like craft and it is the least
useful of the four, because it has removed the mechanism that makes the claim
checkable.

## What this file does not cover

- Section skeletons, required headings, word bands, and badge vocabulary: the
  three skills under `.claude/skills/`.
- Grading language, rubric tables, and outcome tags: `cs46x-assignments` and
  the validators it names.
- Chat voice: a maintainer's own `CLAUDE.md`, unchanged by this file.
