---
name: Term setup
about: Per-term instructor checklist
title: "Term setup: [TERM]"
labels: type:chore
---

## Rosters and staffing

- [ ] Create the projects sheet with TAs and project partner emails
- [ ] Finalize the team assignments sheet, with calculated columns for assigned TA, project partner email, and cohort/check-in slot
- [ ] Add TAs to Canvas
- [ ] Create the Teams channel for TAs and instructors
- [ ] Create the TA meeting notes document
- [ ] Flag NDA teams in the tracking sheet (their repo checkpoints run as live walkthroughs, not async review)

## Canvas and surveys

- [ ] Update the syllabus statements
- [ ] Import rubric TSVs into Canvas (browser extension; sources in `canvas/assignments/`)
- [ ] Create the Workshop Activities column for the term (complete/incomplete per item)
- [ ] Update the Qualtrics surveys (peer evaluation, project partner evaluation)
- [ ] Publish cohort assignments and the check-in schedule in Canvas (week 1)
- [ ] Publish RFC cross-team review pairings in Canvas (start of week 5; fall and winter only)

## Repository

- [ ] Bump the version in `package.json` (format: `YYYY.TT.N`, e.g. `2026.FA.0`)
- [ ] Install git hooks in each clone: `npx lefthook install`
- [ ] Fall only: re-read `src/content/docs/activities/career.mdx` (job-market framing and external links date fastest; the page carries a dated review marker at the top, so update it)
- [ ] Confirm `npm run validate:activities` is green and the tier counts still look right
- [ ] Confirm `npm run build` and `npm run validate:outcomes` are green on `main`
