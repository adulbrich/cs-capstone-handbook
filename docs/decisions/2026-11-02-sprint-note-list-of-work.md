# Design: One List of Work in the Sprint Note

Date: 2026-11-02
Branch: `docs/627-sprint-note-list-of-work`
Status: implemented in #627, from Sprint Notes 5, the first winter note. Supersedes the "contribution-line ownership record" of `2026-08-17-four-skills-assessment-design.md` (§3.3, §3.5, §5): the ownership record is now the owners and reviewers in the sprint note's list of work, and the chaired-decision record is the previous note's decision reported under Top risk and decisions.
Companion documents: `assignments/sprint-notes.mdx`, `canvas/assignments/sprint-note/sprint-note-rubric.csv`, `canvas/assignments/individual-contribution/individual-contribution-rubric.csv`, `public/sprint-note-template.md`, `STAFF-RUNBOOK.md` (Check-in Format, Sprint Note Checks, Individual Contribution Modifier), the `cs46x-assignments` skill.

## 1. Why

The sprint note listed every finished piece of work twice: under What got done, which passed on one link to the board, the issue list, or the pull requests, and again in a per-student contribution line, under a different link rule. The team list was the least evidenced item on the rubric, and the duplication cost every team time each sprint. Four more gaps:

- The review part required every cited review to name a change asked or a check made. On a three-line fix, or a change an AI reviewer already cleaned up, the true review is an approval, so the rule rewarded invented comments.
- The chaired decision was asked for on the page and in the charter, and the defense's Role criterion is checked against it, but no rubric item graded it.
- Nothing asked what happened to the previous note's decision; only the TA's check-in agenda did.
- The judgment layer could not fail, and the individual contribution's Partial band ran from 1 to 99, so four TAs scored the same thin sprint differently.

## 2. The rule

**One list of work.** Item 2 is What got done, and who: one entry per piece of work the team finished this sprint, as a table row or under its own subheading. Each entry links the pull request, issue, or document where it is written up (NDA teams give IDs), names its owner, and names who reviewed and accepted it. Each student marks their most consequential entry and writes its How we checked it sentence. Two lines close the list: the students who own no entry, and the reviews that took judgment on work still open. A board card or a commit list is not a write-up. The note has four items; the rubric keeps five Pass/Fail criteria, two of which (What got done, Ownership and review) grade the list.

**Reviews.** A routine approval, a bare "LGTM" included, is the reviewer's name. A review that took judgment names the change asked for or what was checked, and where an AI reviewer ran, what the student checked that the tool could not. No per-sprint minimum: the spring defense's reviewer-side question is the floor.

**The other items link what they claim.** The top risk is the first-ranked entry in `docs/risks.md`, however small, linked at the sprint's last commit; there is no "no risk" answer, since the repo checkpoints already require a ranked register. A note may say no decision is needed, and it reports the previous note's decision with who chaired it, which makes the chaired-decision record graded. The judgment layer names a plan change with its link, or says the plan holds and why.

**Individual contribution.** Four fixed bands replace Partial's range: Full 100, In review 70 (once per piece), Thin 40, Zero 0.

**NDA work.** At the check-in, screen shared, the TA opens one owned entry per student, each student's reviewer notes, and the demo artifact, and marks each in the record. An ID the TA did not open there does not check out.

## 3. What did not change

- Outcome coverage. Sprint Notes is `level: team` and neither CSV carries an outcome tag. The defense's Communication criterion [SO3] still reads the review notes in spring, and its Role criterion reads the ownership and chaired-decision records.
- The defense rubric CSV, the peer and partner survey instruments, the sprint note weights, and the Canvas entry model.
- Fall entries already imported keep their rubrics; the change starts at Sprint Notes 5, so no team changes format mid-term.

## 4. How it is enforced

`validate-outcomes.mjs` reconciles both CSVs with the page (each entry's top bands total 100). The rubric text is the rule; `STAFF-RUNBOOK.md`'s Sprint Note Checks are the clicks that produce each pass or fail. No validator reads the template or the runbook.
