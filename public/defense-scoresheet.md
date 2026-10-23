<!-- Staff use. Print one sheet per student. Score live during the defense. -->

# Defense Scoresheet

**Student:** ______________________ **Team:** ______________________

**Term:** ______________ **Assessor:** ______________________ **Date:** ______________

**Artifact/PR under discussion:** ______________________ **Repo record checked:** yes / no / NDA live **RFC, decision record, and sprint notes at hand:** yes / no

**Speaking position:** ____ of ____ (order drawn at random) **Individual follow-up needed:** yes / no

Score each criterion 0 to 20. The anchors below are the rubric's bands, word for word: high (17-20) = Exceeds, middle (5-16) = Meets, low (1-4) = Does Not Meet, 0 = unexcused no-show or no meaningful attempt; excused absences are rescheduled per the absence policy and not scored here. "I don't know, but here is how I would find out" scores; bluffing does not.

Logistics: 6 minutes per student, plus about 10 minutes of setup and wrap for the session. **Draw the speaking order at random in the room and do not publish it in advance**, and give each student a different artifact and a different "what breaks if X" question: whoever goes last has otherwise heard several rounds of the same questions. This session is run by a TA or instructor who is not the team's regular TA, and the regular TA does not attend. When two assessors are present, split the students between you. If one student dominates, redirect: questions go to the named student, and only their answer scores. Enter scores and notes in the gradebook after the session (the sheet is the live instrument; the gradebook is the record).

If a score comes out borderline, or a student's part of the session ran short, tick the follow-up box below and arrange a 5-minute one-to-one in the same or the next cycle. Tell the student it is routine.

**The reviewer-side half of criterion 5 is checkable.** In fall and winter it is the RFC peer review, where the author's reply to the comment, or the revision the author committed to, counts as what changed; in spring it is code review, and the team's sprint notes name the change each student asked for or what they checked before approving. Both are graded records. "I left some comments" is not an answer, and neither is anything that named no line and requested no change.

**Score the decision, not the luck.** A student who delegated a hard-to-reverse change (schema, auth, deployment, data migration) with no checks scores low on criterion 1 even if nothing broke. A student who stopped and validated at the right point scores high even if some reversible feature code has bugs. Sophisticated tooling is not itself worth points: a student with a weaker model who gated tightly and validated more has done the harder work, and the anchors are written so that reads as strength.

## 1. Ownership and delegation (SO2, SO4): ____ / 20

- High (17-20): Presents work they demonstrably own end to end (authored or drove it, responded to review, merged it); claims match the repo record when spot-checked. Explains what was handed to AI tools, the checks that made that reasonable (tests, CI, review gates, staging, rollback), and the specific points where they stopped to validate, each with a reason tied to what was hard to reverse (schema, authentication, deployment, data migration).
- Middle (5-16): Claims match the repo record and some delegation reasoning is present, but the checks are named only in general terms ("we had tests"), no specific point where they stopped to validate is named, or the reasons given for the delegation do not match the RFC, the decision record, or the sprint notes.
- Low (1-4): Cannot say what they authored, reviewed, or merged in the work presented, describes delegating a hard-to-reverse change with no checks and no validation, or makes claims about what they authored, reviewed, or merged that contradict the repo record.

Notes: __________________________________________________________________

## 2. Judgment: why this approach, what was rejected, what was hard to reverse (SO1): ____ / 20

- High (17-20): Explains why this approach was chosen, names the credible alternatives that were rejected with the actual reasons, and identifies which parts of the decision were hard to reverse.
- Middle (5-16): Explains the chosen approach, but names alternatives without the reason each was rejected, gives alternatives or reasons that do not match the RFC, the decision record, or the sprint notes, or cannot say which parts were hard to reverse.
- Low (1-4): Cannot explain why the work was done this way or name any alternative that was considered.

Notes: __________________________________________________________________

## 3. Technical depth: "what breaks if X" (SO6): ____ / 20

- High (17-20): Answers "what breaks if X changes" questions with correct, specific reasoning about the system's behavior and limits, including where they chose to verify the system's behavior themselves rather than rely on generated output.
- Middle (5-16): Answers are mostly correct but do not name the specific behavior or limit that breaks, or reasoning falters on follow-up questions.
- Low (1-4): Answers are incorrect, evasive, or reveal no working understanding of the system's behavior and limits.

Notes: __________________________________________________________________

## 4. Role, team accountability, and work distribution (SO5): ____ / 20

- High (17-20): Articulates what their named role (PM, AI Coordinator, Quality Owner) or comparable ownership area required this term, with concrete examples; names a decision they chaired to a conclusion this term that matches the sprint-note record, or, where their turn to chair is still ahead, the decision the charter's rotation schedules them to chair and when; and explains how the team's decisions actually got made and how work was distributed.
- Middle (5-16): Describes the role and team process in general terms, with few concrete examples of what the role required in practice or of how work was distributed.
- Low (1-4): Cannot articulate what their role or ownership area required, how the team makes decisions, or who did what.

Notes: __________________________________________________________________

## 5. Communication, both directions (SO3): ____ / 20

- High (17-20): Answers the question asked, at a level of detail the assessor does not have to correct; at the edge of their knowledge, says "I don't know, but here is how I would find out" (that scores; bluffing does not). Names a specific thing they told someone whose work they reviewed, and what changed in that work because of it; in fall and winter, where the reviewed RFC is not revised yet, the author's response to the comment (the reply, or the revision the author committed to) counts as what changed.
- Middle (5-16): Answers, but the assessor has to ask for a more concrete or a shorter answer, or hesitates at the edge of their knowledge without saying how they would find out. Names a real review comment but cannot say what changed, or describes their reviewing only in general terms.
- Low (1-4): Does not answer the question asked, or bluffs instead of saying what they do not know. Cannot name anything they told a reviewee, or offers feedback that named no line and requested no change.

Notes: __________________________________________________________________

---

**Total: ____ / 100**

Overall notes: ___________________________________________________________

__________________________________________________________________________
