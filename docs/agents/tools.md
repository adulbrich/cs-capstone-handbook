# Instructor tools

Read this before editing `src/pages/tools/`, `src/lib/tools/`, or the tools' wording in `src/data/`.

- The instructor tools at `/tools/` are Svelte pages that read Canvas and Qualtrics files in the browser and never upload them.
- They sit outside the docs collection, so they are not in the sidebar, the sitemap, or search (`noindex`), and they may name Canvas. No handbook page links them; the Surveys section of `STAFF-RUNBOOK.md` does.
- Their logic lives in pure modules under `src/lib/tools/`, which `npm test` runs on invented fixtures, never on `data/`. Their wording lives in `src/data/`.
- The Peer Evaluations page's `PeerCriteria` component reads the survey's rating matrix from there too (`ratingMatrix` in `src/lib/tools/peer-survey-qsf.mjs`), so a change to the matrix also changes that handbook page.
