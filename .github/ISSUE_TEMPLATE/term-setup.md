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

- [ ] Verify the handbook's week numbers against the registrar's academic calendar for the term: holidays, and whether fall runs eleven instructional weeks (`IMPLEMENTED.md`, open item 5; the calendar check table in issue #21)
- [ ] Update the syllabus statements, then re-paste the syllabus HTML from `canvas/syllabus/` into Canvas after any edit to it
- [ ] Set the Canvas grading standard by hand to the 11 cut points on `src/content/docs/learning-objectives/grading.mdx` (A 93, A- 90, B+ 87, B 83, B- 80, C+ 77, C 73, C- 70, D+ 67, D 60); the syllabi mirror the same table
- [ ] Re-import every rubric TSV named in the re-import lists of `canvas/assignments/assignment-readme.md` (browser extension; sources in `canvas/assignments/`)
- [ ] Create the Workshop Activities column for the term (complete/incomplete per item)
- [ ] Update the Qualtrics surveys (peer evaluation, project partner evaluation)
- [ ] Publish cohort assignments and the check-in grid in Canvas (week 1), with the sprint-week alignment stated in the Cohort Check-ins section of `src/content/docs/assignments/introduction.mdx`
- [ ] Schedule the defense calibration hour before week 7 (`STAFF-RUNBOOK.md`, Defense Logistics)
- [ ] Publish RFC cross-team review pairings in Canvas (start of week 5; fall and winter only)

## Repository

- [ ] Bump the version in `package.json` (format: `YYYY.TT.N`, e.g. `2026.FA.0`)
- [ ] Install git hooks in each clone: `npx lefthook install`
- [ ] Fall only: re-read `src/content/docs/activities/career.mdx` (job-market framing and external links date fastest; the page carries a dated review marker at the top, so update it)
- [ ] Confirm `npm run validate:activities` is green and the tier counts still look right
- [ ] Confirm `npm run build` and `npm run validate:outcomes` are green on `main`
