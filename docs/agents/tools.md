# Tools

Read this before editing `src/pages/tools/`, `src/lib/tools/`, or the tools' wording in `src/data/`.

- The tools at `/tools/` are Svelte pages for everyone in the course, students and instructors (#634). They read files in the browser and never upload them.
- They sit outside the docs collection, so they are out of the sitemap and search (`noindex`). The About group of the sidebar links the `/tools/` index, after the Glossary. A handbook page links a tool where the tool is how the reader does what the page asks, the submission PDF builder only from Submitting Your Work, Team Charter, Workshop Activities, Repo Checkpoints, and RFC (#634), and the tool's path goes in the link validator's `exclude` in `astro.config.mjs`; the Surveys section of `STAFF-RUNBOOK.md` links the survey tools, and its Defense Logistics links the defense scoresheets.
- An instructor tool may name Canvas, since it reads Canvas files and no tool is exported to Canvas. A tool students use words their work as the handbook pages do: "submit", "your submission" (hard rule 7, #634).
- Their logic lives in pure modules under `src/lib/tools/`, which `npm test` runs on invented fixtures, never on `data/`. Their wording lives in `src/data/`.
- The Peer Evaluations page's `PeerCriteria` component reads the survey's rating matrix from there too (`ratingMatrix` in `src/lib/tools/peer-survey-qsf.mjs`), so a change to the matrix also changes that handbook page.
- The defense scoresheets print the defense rubric from its CSV, reading each Exceeds and Does Not Meet description as its preamble and a `(n) Label: text` list (`liveSheet` in `src/lib/tools/defense-sheets.mjs`), and the session length from the defense page's sentence on it. An edit to either changes the printed sheets, and one the sheets cannot read fails the build.
- The defense page links `public/defense-live-sheet-example.pdf`, an invented student's live sheet printed from `/tools/defense-scoresheets/example/` by `npm run defense:example` through a local Chrome. Its title carries a fingerprint of the rubric, and `npm test` fails when it no longer matches, so a defense rubric edit reprints and commits the PDF in the same change.
