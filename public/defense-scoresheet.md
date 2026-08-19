<!-- Staff use. Print one sheet per student. Score live during the defense. -->

# Defense Scoresheet

**Student:** ______________________ **Team:** ______________________

**Term:** ______________ **Assessor:** ______________________ **Date:** ______________

**Artifact/PR under discussion:** ______________________ **Repo record checked:** yes / no / NDA live

**Speaking position:** ____ of ____ (order drawn at random) **Individual follow-up needed:** yes / no

Score each criterion 0 to 20. Anchors: high (17-20) = Exceeds, middle (10-16) = Meets, low (1-9) = Does Not Meet, 0 = unexcused no-show or no meaningful attempt. "I don't know, but here is how I would find out" scores; bluffing does not.

Logistics: 6 minutes per student, plus about 10 minutes of setup and wrap for the session. **Draw the speaking order at random in the room and do not publish it in advance**, and give each student a different artifact and a different "what breaks if X" question: whoever goes last has otherwise heard several rounds of the same questions. When two assessors are present, split the students between you. If one student dominates, redirect: questions go to the named student, and only their answer scores. Enter scores and notes into Canvas after the session (the sheet is the live instrument; Canvas is the record).

If a score comes out borderline, or a student's part of the session ran short, tick the follow-up box below and arrange a 5-minute one-to-one in the same or the next cycle. Tell the student it is routine.

**The reviewer-side half of criterion 5 is checkable.** In fall and winter it is the RFC cross-team review; in spring it is code review, and the team's sprint notes name the one change each student asked for. Both are graded records. "I left some comments" is not an answer, and neither is anything that named no line and requested no change.

**Score the decision, not the luck.** A student who delegated a hard-to-reverse change (schema, auth, deployment, data migration) with no safety net scores low on criterion 1 even if nothing broke. A student who stopped and validated at the right point scores high even if some reversible feature code has bugs. Sophisticated tooling is not itself worth points: a student with a weaker model who gated tightly and validated more has done the harder work, and the anchors are written so that reads as strength.

## 1. Ownership and Delegation (SO2, SO4): ____ / 20

- High: presents work they demonstrably own end to end, account matches the repo record without prompting; explains what they handed to AI tools, the safety net that made that reasonable (tests, CI, review gates, staging, rollback), and the specific points where they stopped to validate, with a defensible reason for choosing those points.
- Middle: ownership is credible and some delegation reasoning is present, but the account of the net or of where they validated is thin, generic, or reconstructed after the fact.
- Low: presents team or AI output they cannot trace; or describes delegating a hard-to-reverse change with no net and no validation; or the repo record contradicts the account.

Notes: __________________________________________________________________

## 2. Judgment (SO1): ____ / 20

- High: explains why this approach won, names credible alternatives that were rejected with reasons, and identifies which parts of the decision were hard to reverse.
- Middle: justifies the approach taken but alternatives are vague, strawmanned, or unexamined, or shows no sense of which parts were one-way doors.
- Low: cannot explain why it was done this way; "the AI suggested it" or "it was the first thing that worked" is the whole answer.

Notes: __________________________________________________________________

## 3. Technical Depth (SO6): ____ / 20

- High: answers "what breaks if X changes" with correct, specific reasoning about the system's behavior and limits.
- Middle: reasons correctly at a high level but falters on specifics, edge cases, or failure modes.
- Low: answers are generic, incorrect, or evaporate under one follow-up question.

Notes: __________________________________________________________________

## 4. Role and Team Accountability (SO5): ____ / 20

- High: articulates what their named role (PM, AI Coordinator, Quality Owner) or comparable ownership area required this term, names a decision they chaired to a conclusion (check it against the sprint-note record), and explains how the team's decisions actually got made and how work was distributed.
- Middle: describes the role's duties but gives little evidence of carrying them out, or describes decisions and work distribution vaguely.
- Low: cannot say what the role or ownership area involved, or how any team decision was reached, or who did what.

Notes: __________________________________________________________________

## 5. Communication, Both Directions (SO3): ____ / 20

- High: clear, honest, right level of detail for the audience; handles not-knowing gracefully. Names a specific thing they told someone whose work they reviewed, and what changed in that work because of it.
- Middle: understandable but rambling, over-detailed, or too thin; some hedging in place of directness. Names a real review comment but cannot say what changed, or describes their reviewing only in general terms.
- Low: unclear or evasive; bluffs rather than admitting uncertainty. Cannot name anything they told a reviewee, or offers feedback that named no line and requested no change.

Notes: __________________________________________________________________

---

**Total: ____ / 100**

Overall notes: ___________________________________________________________

__________________________________________________________________________
