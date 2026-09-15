# CS Capstone Handbook

Requires Node 24+, matching Vercel's default runtime (`.nvmrc` pins the
version; run `nvm use`).

```sh
npm install
npm run dev
npm run build
```

Use `npm ci` instead of `npm install` when you want the exact tree from
`package-lock.json` and no lockfile changes, which is what CI runs.

## Term Setup

Open a **Term setup** issue at the start of every term
(`.github/ISSUE_TEMPLATE/term-setup.md`) and work the checklist there: rosters
and staffing, Canvas and survey setup, and the repository chores. Keeping it as
an issue rather than a README list means each term's setup has its own
completion record.

## Working in This Repository

`AGENTS.md` carries the project invariants: what must never be committed, why
CI uses `npm ci`, how the outcome validator decides coverage, and which four
places grade weights have to agree in. Read it before making content changes,
and point any per-tool instruction file (`CLAUDE.md` and friends) at it rather
than duplicating it.

## Course Revision

The fall 2026 course revision was built on the `revision-fall-2026` branch and merged as a stack of pull requests (#62). What it changed, in short: assignments and rubrics moved into the handbook as the source of truth; CI with link and outcome validation; activities tiered into workshop, recommended, and library, with each graded assignment routed to the activities that prepare it; a missing-work zero policy; per-student demos in the sprint cadence; and assessment of critical thinking, AI literacy, leadership, and collaboration. Design records live in `docs/decisions/`. The open work is the issue tracker: the post-merge review cycle is #61, and the rules for how decisions get recorded are in `AGENTS.md`.

## To Do

- make an "instructor tools" client side only page where I can upload the peer review and project partner surveys and gradebook and run scripts to process them and output the results in a format that can be easily imported into Canvas (port R scripts); include a repo-checkpoint mode (team repo list -> docs/CI/PR-per-student view) and NDA-team tracking
- fix the two remaining R script bugs until the port lands (#52): team-size cap at 6 including self breaks larger teams; Q7 individual-concern extraction is stubbed. The peer-eval correction now posts to the gradebook and the s2026 partner survey maps the Requirements answer to 3.5; both fixed on the branch.
- create good examples for all assignments based on previous years' projects
- stretch: create bad examples for all assignments based on previous years' projects
- more material offered during lecture time: case studies from successful companies, advice for starting a company, career advice, workshops on spec-writing for AI agents, reviewing AI diffs, and testing as the safety net
- improve project partner guidelines
- add projects to showcase and improve layout
- run CATME-style peer evaluation every term once tooling supports it (parked)

## Link Checking

Internal link checking is **on**: `starlightLinksValidator()` runs as part of
`npm run build`, so the build fails on any broken internal link, anchors
included.

To check the production build for external links as well, run:

```bash
npx linkinator https://capstone.alexulbrich.com --recurse
```
