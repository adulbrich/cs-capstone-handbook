# Tools

Read this before editing `src/pages/tools/`, `src/lib/tools/`, or the tools' wording in `src/data/`.

- The tools at `/tools/` are Svelte pages for everyone in the course, students and instructors. They read files in the browser and never upload them.
- They sit outside the docs collection, so they are out of the sitemap and search (`noindex`). The About group of the sidebar links the `/tools/` index, after the Glossary. A handbook page links a tool where the tool is how the reader does what the page asks, and the tool's path goes in the link validator's `exclude` in `astro.config.mjs`; the Surveys section of `STAFF-RUNBOOK.md` links the survey tools.
- An instructor tool may name Canvas, since it reads Canvas files and no tool is exported to Canvas. A tool students use words their work as the handbook pages do: "submit", "your submission" (hard rule 7).
- Their logic lives in pure modules under `src/lib/tools/`, which `npm test` runs on invented fixtures, never on `data/`. Their wording lives in `src/data/`.
- The Peer Evaluations page's `PeerCriteria` component reads the survey's rating matrix from there too (`ratingMatrix` in `src/lib/tools/peer-survey-qsf.mjs`), so a change to the matrix also changes that handbook page.
