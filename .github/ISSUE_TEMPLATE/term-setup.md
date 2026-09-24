---
name: Term setup
about: Per-term instructor checklist
title: "Term setup: [TERM]"
labels: type:chore
---

## Rosters and staffing

- [ ] Create the projects sheet with TAs and project partner emails
- [ ] Finalize the team assignments sheet, with calculated columns for assigned TA, project partner email, and TA check-in time
- [ ] Add TAs to Canvas
- [ ] Create the Teams channel for TAs and instructors
- [ ] Create the TA meeting notes document
- [ ] Flag NDA teams in the tracking sheet (where the partner rules out read access, their repo checkpoints run as live walkthroughs)

## Canvas and surveys

- [ ] Verify the handbook's week numbers against the registrar's academic calendar for the term: holidays, and the fact that fall runs eleven instructional weeks with the partial first week as week 0 (the Term Calendar section of `STAFF-RUNBOOK.md` holds the last verified answer as weeks and holidays; redo it every year because the registrar page refuses scripted fetches and the dates move)
- [ ] Fall only: confirm the week-by-week schedule in `src/content/docs/introduction/schedule.mdx` still holds for the year (a holiday that removes a Friday lecture, a workshop moved to another week)
- [ ] Update the syllabus statements, then re-paste the syllabus HTML from `canvas/syllabus/` into Canvas after any edit to it
- [ ] Set the Canvas grading standard by hand to the cut points on `src/content/docs/learning-objectives/grading.mdx`; the syllabi mirror the same table
- [ ] Re-import every rubric CSV named in the re-import lists of `canvas/assignments/assignment-readme.md` (Canvas Rubrics page, Import; sources in `canvas/assignments/`)
- [ ] Work through the Week 0 Checklist in `STAFF-RUNBOOK.md`: every Canvas entry and group (one entry per workshop and per sprint, never a column), Term Startup, the Extra Credit group, and the paste kit
- [ ] Fall and spring: confirm the co-instructor has set up Resume and Intent (fall) or the Career and Individual Retrospective (spring) in Canvas, with the resume meetings; nothing to import from this repo (`STAFF-RUNBOOK.md`, Resume and Intent, Career Retrospective)
- [ ] Update the Qualtrics surveys (peer evaluation, project partner evaluation)
- [ ] Announce each team's TA in week 1; each team agrees its check-in time with its TA (TA Check-ins in `src/content/docs/assignments/introduction.mdx`)
- [ ] Schedule the defense calibration hour before week 7 (`STAFF-RUNBOOK.md`, Defense Logistics)
- [ ] Fall and winter: turn on Canvas peer review for the RFC Draft + Peer Review entry, which assigns each student two drafts at the start of week 5 (`STAFF-RUNBOOK.md`, RFC)

## Repository

- [ ] Bump the version in `package.json` (format: `YYYY.TT.N`, e.g. `2026.FA.0`)
- [ ] Install git hooks in each clone: `npx lefthook install`
- [ ] Fall only: re-read `src/content/docs/activities/career.mdx` (job-market framing and external links date fastest)
- [ ] Confirm `npm run validate:activities` is green and the tier counts still look right
- [ ] Confirm `npm run build` and `npm run validate:outcomes` are green on `main`
