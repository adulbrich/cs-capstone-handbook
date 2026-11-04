<!-- Staff use. Print one per student. Score live during the defense. -->

# Defense Scoresheet

**Student:** ______________________ **Team:** ______________________

**Term:** ______________ **Assessor:** ______________________ **Date:** ______________

**Artifact picked:** ______________________ **Sprint asked about:** ____ **Repo record checked:** yes / no / NDA live

**Speaking position:** ____ of ____ (drawn at random at the start of the session) **Individual follow-up needed:** yes / no

Tick an item only when it holds up under a follow-up question. Every item ticked: Exceeds, 17 to 20. Any red flag: Does Not Meet, 1 to 4. Otherwise Meets: 14 points with one item missing, 10 with two, 6 with more. Missing, 0: Unexcused no-show, or no meaningful attempt to present or answer; an absence reported to the student's TA before the session is rescheduled and not scored here. The questions, items, and red flags below are the rubric's, word for word.

Logistics: 6 minutes per student, plus about 10 minutes of setup and wrap for the session; a video call is fine, with every student's camera on. **Draw the speaking order at random at the start of the session and do not publish it in advance**, pick each student's artifact from the two or three they bring, a different one per student, and give each a different "what breaks if X" question and a different sprint for the Role question. This session is run by a TA or instructor who is not the team's regular TA, and the regular TA does not attend. When two assessors are present, split the students between you. If one student dominates, redirect: questions go to the named student, and only their answer scores. Enter scores and notes in the gradebook after the session (the sheet is the live instrument; the gradebook is the record).

If a score comes out borderline, or a student's part of the session ran short, tick the follow-up box and arrange a 5-minute one-to-one in the same defense week or the term's next one. Tell the student it is routine.

**Score the decision, not the luck.** An unchecked hard-to-reverse change is a red flag even if nothing broke, unless the student can say what check it needed. Naming a delegation that went wrong never lowers a score. Sophisticated tooling is not itself worth points: a student with a weaker model who gated tightly and validated more has done the harder work.

## 1. Ownership and delegation (SO2, SO4): ____ / 20

Asks: walk me through it; what did you hand to AI tools, and how did you know the result was right? Follow-up: where did you stop to check it yourself, and did anything go wrong?

Exceeds, all four, each holding up under a follow-up question:

- [ ] owns the work, having authored or driven it, and can say where it stands, matching the repo record
- [ ] says what was and was not handed to AI tools
- [ ] names the specific checks that made that reasonable (tests, CI, review gates, staging, rollback), not just "we had tests"
- [ ] names a point where they stopped to validate something hard to reverse (a schema, authentication, a deployment, a data migration, a data split, a save-file format) and why there, or a delegation that went wrong, the check it lacked, and the check now in their sprint notes or repo record

Red flags, any one is Does Not Meet:

- [ ] cannot say what they authored or drove in the work presented
- [ ] gives no account of what was handed to AI tools
- [ ] describes an unchecked hard-to-reverse change and cannot say what check it needed
- [ ] makes claims the repo record contradicts

Band: Exceeds 17-20 / Meets 14, 10, or 6 / Does Not Meet 1-4 / Missing 0

Notes: __________________________________________________________________

## 2. Judgment: why this approach, what was rejected, what was hard to reverse (SO1): ____ / 20

Asks: why this way, and what else was on the table? Follow-up: knowing what you know now, what would you change? Where the partner or a teammate made the call: would you have decided the same way?

Exceeds, all four, each holding up under a follow-up question:

- [ ] explains why this approach was chosen, whoever made the decision
- [ ] names at least two alternatives (doing nothing counts), each with the reason it was rejected, consistent with the RFC, the decisions the team recorded, or the sprint notes where they cover it
- [ ] says which parts of the decision are hard to reverse
- [ ] says what they would do differently now, or what they would have weighed differently in a decision someone else made

Red flags, any one is Does Not Meet:

- [ ] cannot say why the work was done this way
- [ ] names no alternative at all

Band: Exceeds 17-20 / Meets 14, 10, or 6 / Does Not Meet 1-4 / Missing 0

Notes: __________________________________________________________________

## 3. Technical depth: "what breaks if X" (SO6): ____ / 20

Asks: what breaks if X changes, with X picked by the assessor and different for each student? Follow-up: how do you know?

Exceeds, all three, each holding up under a follow-up question:

- [ ] a correct answer that names the specific behavior or limit that breaks
- [ ] reasoning that holds on a second "what if"
- [ ] names where they verified the system's behavior themselves rather than relying on generated output

Red flags, any one is Does Not Meet:

- [ ] an incorrect or evasive answer
- [ ] cannot say what the system does when X changes

Band: Exceeds 17-20 / Meets 14, 10, or 6 / Does Not Meet 1-4 / Missing 0

Notes: __________________________________________________________________

## 4. Role, team accountability, and work distribution (SO5): ____ / 20

Asks: what did your role ask of you this term, and which decision did you drive to a conclusion? Follow-up, for a sprint the assessor picks at random: what did you own in that sprint?

Exceeds, all four, each holding up under a follow-up question:

- [ ] says what their role (PM, AI Coordinator, Quality Owner) or ownership area required this term, with a concrete example
- [ ] names a decision they chaired to a conclusion this term that matches the sprint notes, or, if their turn is still ahead, the decision the charter's rotation schedules them to chair
- [ ] explains how the team made decisions and split the work
- [ ] says what they owned in the sprint the assessor picks, matching that sprint's Done or In progress list

Red flags, any one is Does Not Meet:

- [ ] cannot say what their role or ownership area required
- [ ] cannot say who did what

Band: Exceeds 17-20 / Meets 14, 10, or 6 / Does Not Meet 1-4 / Missing 0

Notes: __________________________________________________________________

## 5. Communication, both directions (SO3): ____ / 20

Asks: what is the most useful thing you told someone whose work or decision depended on you, a teammate whose work you reviewed or your partner, and what changed? Every other answer in the session counts here too.

Exceeds, all three, each holding up under a follow-up question:

- [ ] answers the question asked, and at the edge of their knowledge says what they don't know and how they would find out
- [ ] at a level of detail the assessor does not have to correct or ask to shorten
- [ ] names a specific thing they told a reviewee or the partner and what changed because of it (an RFC author's reply or committed revision counts), or, in spring, what they checked in a review and why it needed no change

Red flags, any one is Does Not Meet:

- [ ] bluffs instead of saying what they do not know
- [ ] names nothing specific they told a reviewee or the partner

Band: Exceeds 17-20 / Meets 14, 10, or 6 / Does Not Meet 1-4 / Missing 0

Notes: __________________________________________________________________

---

**Total: ____ / 100**

Overall notes: ___________________________________________________________

__________________________________________________________________________
