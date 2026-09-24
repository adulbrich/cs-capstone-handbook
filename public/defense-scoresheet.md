<!-- Staff use. Print one sheet per student. Score live during the defense. -->

# Defense Scoresheet

**Student:** ______________________ **Team:** ______________________

**Term:** ______________ **Assessor:** ______________________ **Date:** ______________

**Artifact/PR under discussion:** ______________________ **Repo record checked:** yes / no / NDA live

**Speaking position:** ____ of ____ (order drawn at random) **Individual follow-up needed:** yes / no

Score each criterion 0 to 20. The anchors below are the rubric's bands, word for word: high (17-20) = Exceeds, middle (5-16) = Meets, low (1-4) = Does Not Meet, 0 = unexcused no-show or no meaningful attempt; excused absences are rescheduled per the absence policy and not scored here. "I don't know, but here is how I would find out" scores; bluffing does not.

Logistics: 6 minutes per student, plus about 10 minutes of setup and wrap for the session. **Draw the speaking order at random in the room and do not publish it in advance**, and give each student a different artifact and a different "what breaks if X" question: whoever goes last has otherwise heard several rounds of the same questions. This session is run by a TA or instructor who is not the team's regular TA, and the regular TA does not attend. When two assessors are present, split the students between you. If one student dominates, redirect: questions go to the named student, and only their answer scores. Enter scores and notes in the gradebook after the session (the sheet is the live instrument; the gradebook is the record).

If a score comes out borderline, or a student's part of the session ran short, tick the follow-up box below and arrange a 5-minute one-to-one in the same or the next cycle. Tell the student it is routine.

**The reviewer-side half of criterion 5 is checkable.** In fall and winter it is the RFC peer review; in spring it is code review, and the team's sprint notes name the one change each student asked for. Both are graded records. "I left some comments" is not an answer, and neither is anything that named no line and requested no change.

**Score the decision, not the luck.** A student who delegated a hard-to-reverse change (schema, auth, deployment, data migration) with no checks scores low on criterion 1 even if nothing broke. A student who stopped and validated at the right point scores high even if some reversible feature code has bugs. Sophisticated tooling is not itself worth points: a student with a weaker model who gated tightly and validated more has done the harder work, and the anchors are written so that reads as strength.

## 1. Ownership and delegation (SO2, SO4): ____ / 20

- High (17-20): Presents work they demonstrably own end to end (authored or drove it, responded to review, merged it); claims match the repo record when spot-checked. Explains what was handed to AI tools, the checks that made that reasonable (tests, CI, review gates, staging, rollback), and the specific points where they stopped to validate, with a defensible reason for choosing those points.
- Middle (5-16): Ownership is credible and some delegation reasoning is present, but the account of the checks or of where they validated is thin, generic, or partly reconstructed after the fact.
- Low (1-4): Cannot credibly demonstrate ownership of the work presented, or describes delegating a hard-to-reverse change with no checks and no validation, or claims contradict the repo record.

Notes: __________________________________________________________________

## 2. Judgment: why this approach, what was rejected, what was hard to reverse (SO1): ____ / 20

- High (17-20): Explains why this approach was chosen, names the credible alternatives that were rejected with the actual reasons, and identifies which parts of the decision were hard to reverse.
- Middle (5-16): Explains the chosen approach but alternatives are thin, generic, or clearly reconstructed after the fact, or shows no sense of which parts were hard to reverse.
- Low (1-4): Cannot explain why the work was done this way or name any alternative that was considered.

Notes: __________________________________________________________________

## 3. Technical depth: "what breaks if X" (SO6): ____ / 20

- High (17-20): Answers "what breaks if X changes" questions with correct, specific reasoning about the system's behavior and limits, including where they chose to verify the system's behavior themselves rather than rely on generated output.
- Middle (5-16): Answers are mostly correct but stay at a surface level, or reasoning falters on follow-up questions.
- Low (1-4): Answers are incorrect, evasive, or reveal no working understanding of the system's behavior and limits.

Notes: __________________________________________________________________

## 4. Role, team accountability, and work distribution (SO5): ____ / 20

- High (17-20): Articulates what their named role (PM, AI Coordinator, Quality Owner) or comparable ownership area required this term, with concrete examples; names a decision they chaired to a conclusion that matches the sprint-note record; and explains how the team's decisions actually got made and how work was distributed.
- Middle (5-16): Describes the role and team process in general terms, with few concrete examples of what the role required in practice or of how work was distributed.
- Low (1-4): Cannot articulate what their role or ownership area required, how the team makes decisions, or who did what.

Notes: __________________________________________________________________

## 5. Communication, both directions (SO3): ____ / 20

- High (17-20): Clear and candid at the right level of detail for the audience; handles not-knowing gracefully ("I don't know, but here is how I would find out" scores; bluffing does not). Names a specific thing they told someone whose work they reviewed, and what changed in that work because of it.
- Middle (5-16): Generally clear but occasionally too vague or too deep for the audience, or hesitant when reaching the edge of their knowledge. Names a real review comment but cannot say what changed, or describes their reviewing only in general terms.
- Low (1-4): Unclear, evasive, or bluffs instead of acknowledging what they do not know. Cannot name anything they told a reviewee, or offers feedback that named no line and requested no change.

Notes: __________________________________________________________________

---

**Total: ____ / 100**

Overall notes: ___________________________________________________________

__________________________________________________________________________
