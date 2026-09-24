# Contributing

How work moves through this repository, for a person. `AGENTS.md` holds the
rules that bind an agent on every turn; this file is the map of the process
those rules sit in. `README.md` covers install and running the site.

The handbook is student-facing documentation and where all graded work is
authored, except the two Canvas-owned assignments named in `AGENTS.md`. Most changes are prose and tables, not code, and the review reads
them that way: see `docs/agents/code-review.md`.

## The process

```
pick up          branch             commit                push               pull request          merge
--------         ------             ------                ----               ------------          -----
GitHub issue     fetch, then        lefthook:             lefthook:          build and audit       squash
ready-for-*      branch from        prose, not main,      branch name,       required (ruleset)    one PR,
p0/p1/p2         origin/main        validators, biome,    validators, build  review loop           one issue
claim it         type/slug          commit message                           recorded in the PR
```

1. **Pick up an issue.** The queue is `ready-for-agent` or `ready-for-human`,
   sorted `p0-now`, `p1-next`, `p2-later`. Assign yourself before the first
   edit. The issue is the spec: its Acceptance list is what the review checks
   against. File new work through the Task form under `.github/ISSUE_TEMPLATE/`.
   Labels are explained in `docs/agents/triage-labels.md`; the tracker
   mechanics in `docs/agents/issue-tracker.md`.
2. **Branch from a fresh `origin/main`.** `git fetch origin main` first.
   Name it `<type>/<slug>`: the commit type and a few lowercase words. Lead
   the slug with the issue number when the work has an issue, as in
   `fix/192-handoff-week`; without one, `fix/handoff-week` passes too. The
   desktop app names a session's worktree branch `claude/<slug>-<hash>` before
   any hook runs, so rename it before the first push:
   `git branch -m <type>/<slug>`.
   `scripts/check-branch-name.mjs` is the rule.
3. **Commit by name.** Stage paths, never `git add -A`. The subject is
   Conventional Commits with a lowercase imperative:
   `docs(assignments): state the sprint-note due day once`. No em dash, no
   emoji, no session link. `scripts/check-commit-message.mjs` is the rule.
4. **Push and open a pull request.** The template asks for the closing issue,
   what changed from the reader's side, what ran locally, whether Canvas needs
   a re-import, the review loop, and the docs touched.
5. **Run the review loop.** `mattpocock-skills:code-review`, with the brief and
   the end condition in `docs/agents/code-review.md`. Record the passes and the
   declines in the PR body.
6. **Merge.** Squash. The `main` ruleset requires a pull request with green
   `build` and `audit` checks and blocks force pushes and deletion. No approving
   review is required by GitHub, so the review loop is the review. During the
   fall 2026 split (#62) the instructor merges; after that, the agent merges
   once the loop passes (#63).

## The gates

One rule, enforced at the earliest point that can see the violation. The
first column is what stops you locally; the last is what stops the merge.

| Rule | Local (lefthook) | Claude Code hook | CI |
| --- | --- | --- | --- |
| Conventional subject, lowercase imperative; no em dash, emoji, or session link in the message | `commit-msg` | `guard-git.mjs` reads the `-m` text first | `build`: every commit the PR adds |
| No em dash, emoji, or glossary-rejected synonym in tracked text; no voice tell on handbook pages, and no banned word or percentage in a heading in rubric CSVs, syllabi, or `public/` Markdown | `pre-commit`, staged files | `after-edit.mjs` on the edited file | `build`: `npm run check:prose` |
| Terms and weeks only in handbook content, syllabi, and the runbook | `pre-commit`, on matching paths | `after-edit.mjs` | `build`: `validate-dates` |
| Outcome coverage, per-term weights sum, each page renders its own rubric CSVs, assignment page shape | `pre-commit` on assignment and CSV paths; `pre-push` | | `build`: `validate-outcomes` |
| Activity tiers, badges, the standalone rule, schedule links by week, no grading language in activities or guides | `pre-commit` on activity, assignment, guide, schedule paths; `pre-push` | | `build`: `validate-activities` |
| Every download in `public/` has an owning page | `pre-commit`; `pre-push` | | `build`: `validate-downloads` |
| Every `<Cite>` resolves to a registry entry with claims and locators, every entry is cited, References sits above Additional Readings | `pre-commit` on page and registry paths; `pre-push` | | `build`: `validate-sources` |
| External links on the built site resolve | | | `links`: weekly and on dispatch, opens or updates one issue |
| Every internal link and anchor resolves | `pre-push`: `npm run build` | | `build`: the Astro build with the links validator |
| The Canvas paste kit builds with no warning: no stale override, no page element it cannot convert | `pre-push`: `npm run canvas:export -- --strict` | | `build`: the same, after the build |
| Never commit anything under `data/` | `pre-commit` | `guard-edits.mjs` refuses the write | `build`: tracked-files guard |
| Branch is `<type>/<slug>`, issue number recommended | `pre-push` | | `build`: the PR's head branch |
| Stage by name; never commit on `main` | `pre-commit` branch check | `guard-git.mjs` | ruleset: pull request required |
| No force push at `main`, `reset --hard`, `clean -f`, `branch -D` | | `guard-git.mjs` | ruleset: force push and deletion blocked |
| `package-lock.json` and `CLAUDE.md` are not hand-edited | | `guard-edits.mjs` | |
| Biome clean on scripts, hooks, components, config | `pre-commit`, staged files | `after-edit.mjs` | `build`: `npm run check` |
| PR title is a Conventional subject; no em dash, emoji, or session link in PR or issue text | | `guard-gh.mjs` refuses the command (inline `--title` and `--body`) | `pr-text`: the PR title and body, re-run on every edit |
| Dependencies audit clean and signed | | | `audit` |

Skipping locally: `LEFTHOOK=0 git commit` or `--no-verify`. The Claude Code
hooks and CI catch what was skipped, so skipping moves the failure rather than
removing it. `npm install` installs the hooks through the `prepare` script.

The ruleset that blocks a merge:

```bash
gh api repos/adulbrich/cs-capstone-handbook/rulesets --jq '.[] | {id, name, enforcement}'
```

## The Canvas mirror

A rubric **is** the CSV under `canvas/assignments/` (`AGENTS.md`, hard rule 4):
edit it there and the handbook page re-renders from it. A change to a weight, a
due week, or a syllabus statement still changes the syllabi under
`canvas/syllabus/` and the Canvas readme in the same PR. Either way the PR says a re-import is needed. The re-import lists live in
`canvas/assignments/assignment-readme.md`; the term-setup issue template is
where the re-import gets scheduled.

## Where things are recorded

In the issue, the pull request body, or a design record under
`docs/decisions/`, never a journal file: `AGENTS.md`, "Where decisions are
recorded".
