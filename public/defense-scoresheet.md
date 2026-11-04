<!-- Staff use. Print one per student. Score live during the defense. -->

# Defense Scoresheet

**Student:** ______________________ **Team:** ______________________

**Term:** ______________ **Assessor:** ______________________ **Date:** ______________

**Artifact or part picked:** ______________________ **Sprint asked about:** ____ **Repo record checked:** yes / no / NDA live

**Individual follow-up needed:** yes / no **Total: ____ / 100**

Tick an item when the student says it and neither a follow-up question nor the record undoes it. Any red flag: Does Not Meet, 4. Otherwise, every item ticked: Exceeds, 20; otherwise Meets: 16 points with one item missing, 12 with two, 8 with more. Missing, 0: Unexcused no-show, or no meaningful attempt to present or answer; an absence reported to the student's TA before the session is rescheduled and not scored here. The questions, items, and red flags below are the rubric's, word for word.

Logistics: 6 minutes per student, plus about 10 minutes of setup and wrap for the session; a video call is fine, with every student's camera on. **Draw the speaking order at random at the start of the session and do not publish it in advance**, pick each student's artifact from the two or three they bring, a different artifact or part per student and the most recent where you can, give each a different "what breaks if X" question, and pick a sprint from this term at random for each student's Role question. This session is run by a TA or instructor who is not the team's regular TA, and the regular TA does not attend. When two assessors are present, split the students between you. If one student dominates, redirect: questions go to the named student, and only their answer scores. Enter scores and notes in the gradebook after the session (the sheet is the live instrument; the gradebook is the record).

If a score comes out borderline, or a student's part of the session ran short, tick the follow-up box and arrange a 5-minute one-to-one in the same defense week, or in week 9 after a week 7 session. Tell the student it is routine.

**Score the decision, not the luck.** An unchecked hard-to-reverse change is a red flag even if nothing broke, unless the student can say what check it needed. Naming a delegation that went wrong and the check it lacked never lowers a score. Sophisticated tooling is not itself worth points: a student with a weaker model who gated tightly and validated more has done the harder work.

## 1. Ownership and delegation (SO2, SO4): ____ / 20

Asks: walk me through it; what did you hand to AI tools, what did you keep, and how did you know the result was right? Follow-up: where did you stop to check it yourself, and did anything go wrong?

Exceeds, all four, none undone by a follow-up question or the record, and no red flag:

- [ ] **Owns it:** authored or drove the work and can say where it stands, matching the repo record
- [ ] **AI account:** says what was and was not handed to AI tools
- [ ] **Specific checks:** names the checks on the work and on anything delegated (tests, CI, review gates, staging, rollback, a held-out evaluation), not just "we had tests"
- [ ] **A stop, or a lesson:** names a point where they stopped to validate something hard to reverse (a schema, authentication, a deployment, a data migration, a data split, a save-file format) and why there, or a delegation that went wrong, the check it lacked, and the check now in their sprint notes or repo record

Red flags, any one is Does Not Meet:

- [ ] **No authorship:** cannot say what they authored or drove in the work presented
- [ ] **No AI account:** gives no account at all of what was handed to AI tools
- [ ] **Unexamined:** describes an unchecked hard-to-reverse change and cannot say what check it needed
- [ ] **Contradicted:** makes claims the repo record contradicts

Band: Exceeds 20 / Meets 16, 12, or 8 / Does Not Meet 4 / Missing 0

Notes: __________________________________________________________________

## 2. Judgment: why this approach, what was rejected, what was hard to reverse (SO1): ____ / 20

Asks: why this way, what else was on the table, and what is hard to reverse? Follow-up: knowing what you know now, what would you change? Where the partner or a teammate made the call: would you have decided the same way?

Exceeds, all four, none undone by a follow-up question or the record, and no red flag:

- [ ] **Why this way:** explains why this approach was chosen, whoever made the decision
- [ ] **Two alternatives:** names at least two (doing nothing counts), each with the reason it was rejected, consistent with the team's recorded decisions (an ADR or RFC) or the sprint notes where they cover it
- [ ] **Hard to reverse:** says which parts of the decision are, or why none are
- [ ] **What they would change:** says what they would change now, or why they would not, including for a decision someone else made

Red flags, any one is Does Not Meet:

- [ ] **No alternative:** names no alternative at all

Band: Exceeds 20 / Meets 16, 12, or 8 / Does Not Meet 4 / Missing 0

Notes: __________________________________________________________________

## 3. Technical depth: "what breaks if X" (SO6): ____ / 20

Asks: what breaks in the work you presented if X changes, with X picked by the assessor and different for each student? Follow-ups: what if Y changes too, and how do you know?

Exceeds, all three, none undone by a follow-up question or the record, and no red flag:

- [ ] **Correct and specific:** a correct answer that names the behavior or limit that breaks
- [ ] **Holds on a second what-if:** the reasoning holds when Y changes too
- [ ] **Verified it themselves:** says where they verified the system's behavior themselves

Red flags, any one is Does Not Meet:

- [ ] **Wrong or evasive:** an incorrect or evasive answer to X (saying what they don't know is not evasive)
- [ ] **No model of the system:** cannot say at all what the system does when X changes

Band: Exceeds 20 / Meets 16, 12, or 8 / Does Not Meet 4 / Missing 0

Notes: __________________________________________________________________

## 4. Role, team accountability, and work distribution (SO5): ____ / 20

Asks: what did your role ask of you this term, which decision did you drive to a conclusion, and how did your team decide and split the work? Follow-up, for a sprint from this term that the assessor picks at random: what did you own in that sprint?

Exceeds, all four, none undone by a follow-up question or the record, and no red flag:

- [ ] **What the role required:** says what their role (PM, AI Coordinator, Quality Owner) or ownership area required this term, with a concrete example
- [ ] **A decision chaired:** names a decision they chaired to a conclusion this term that matches the sprint notes (deciding to wait or re-plan counts), or, if their turn is still ahead, when the charter's rotation has them chair
- [ ] **How the team works:** explains how the team made decisions and split the work
- [ ] **The random sprint:** says what they owned in the sprint the assessor picks, or why nothing, matching that sprint's Done or In progress list (blocked work recorded there counts)

Red flags, any one is Does Not Meet:

- [ ] **Role unknown:** cannot say what their role or ownership area required
- [ ] **Who did what:** cannot say at all who did what

Band: Exceeds 20 / Meets 16, 12, or 8 / Does Not Meet 4 / Missing 0

Notes: __________________________________________________________________

## 5. Communication, both directions (SO3): ____ / 20

Asks: what is the most useful thing you told someone whose work you reviewed, your partner, or your mentor, and what changed? Every other answer in the session counts here too.

Exceeds, all three, none undone by a follow-up question or the record, and no red flag:

- [ ] **Answers what is asked:** including, at the edge of their knowledge, what they don't know and how they would find out
- [ ] **Right level of detail:** answers at a level the assessor does not have to correct or ask to shorten
- [ ] **Something told, and what changed:** names a specific thing they told a reviewee, the partner, or the mentor and what changed because of it (an author's reply or committed revision counts), or what they checked in a review and why it needed no change

Red flags, any one is Does Not Meet:

- [ ] **Bluffs:** claims to know what they do not, instead of saying so
- [ ] **Non-answers:** repeatedly does not answer the question asked
- [ ] **Nothing specific:** names nothing specific at all from a review or from talking with the partner or mentor

Band: Exceeds 20 / Meets 16, 12, or 8 / Does Not Meet 4 / Missing 0

Notes: __________________________________________________________________

---

Overall notes: ___________________________________________________________

__________________________________________________________________________
