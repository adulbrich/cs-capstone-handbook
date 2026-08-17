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

## Instructor Checklist

- Create projects sheet with TAs and Project Partner Emails
- Finalize team assignments (students) sheet and add calculated columns with assigned TA, project partner email, and cohort/check-in information
- Create Teams channel for TAs and instructors
- Create TA Meeting Notes document
- Update Qualtrics surveys
- Update Syllabus statements
- Import rubric TSVs into Canvas (browser extension; sources in `canvas/assignments/`)
- Install git hooks once per clone: `npx lefthook install`

## Course Revision (branch `revision-fall-2026`)

The full Fall 2026 course revision lives on the `revision-fall-2026` branch. See `IDEAS.md` (assessment and design rationale) and `IMPLEMENTED.md` (change log). Done there, among others: assignments and rubrics moved into the handbook as source of truth, GH Actions CI with link and outcome validation (internal link validation is now actually enabled), activities tiered into workshop/recommended/library with each graded assignment routed to the activities that prepare it, missing-work zero policy, retrospective format variety, video demos in the sprint cadence. A second pass added assessment for critical thinking, AI literacy, leadership, and collaboration: see `docs/superpowers/specs/2026-08-17-four-skills-assessment-design.md`.

## To Do

- make an "instructor tools" client side only page where I can upload the peer review and project partner surveys and gradebook and run scripts to process them and output the results in a format that can be easily imported into Canvas (port R scripts); include a repo-checkpoint mode (team repo list -> docs/CI/PR-per-student view) and NDA-team tracking
- fix known R script bugs until the port lands: peer-eval correction is emailed but not posted to the gradebook; s2026 partner survey maps one Requirements answer to 3 instead of 3.5; team-size cap at 6 including self breaks larger teams; Q7 individual-concern extraction is stubbed
- create good examples for all assignments based on previous years' projects
- stretch: create bad examples for all assignments based on previous years' projects
- more material offered during lecture time: case studies from successful companies, advice for starting a company, career advice, workshops on spec-writing for AI agents, reviewing AI diffs, and testing as the safety net
- improve project partner guidelines
- add projects to showcase and improve layout
- add recommended activities based on project category or type (partially covered by the Shipping guide)
- run CATME-style peer evaluation every term once tooling supports it (parked; see IDEAS.md)

## Link Checking

Internal link checking is currently **off**: `starlightLinksValidator()` is
installed but commented out in `astro.config.mjs`. Uncomment it to have the
build fail on broken internal links.

To check the production build for broken links (incl. external ones), run:

```bash
npx linkinator https://capstone.alexulbrich.com --recurse
```
