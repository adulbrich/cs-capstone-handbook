# Letter scripts

Staff-run scripts that turn a CSV into one email draft per recipient. They send
nothing: each run writes an `.eml` per letter and an `index.html` that previews
every letter, with an **Open in mail** link (a `mailto:`) per letter. You read the
page, then send each draft from your own mailbox, so replies reach a person.

Node 20 or later, no dependencies. Run them from the repository root, with the
input CSVs in `data/` and the drafts written there too: `data/` holds rosters and
partner contacts, and it is never committed (AGENTS.md, hard rule 1).

## The scripts

| Script | Reads | One letter per |
| --- | --- | --- |
| `confirm-projects.mjs` | the capstone app's staff project export | proposer, plus one per student-proposed project to its mentor |
| `team-contacts.mjs` | the Canvas group roster and the partner sheet | team, To every student on it |
| `partner-onboarding.mjs` | the partner sheet, and the roster if given | partner or mentor, listing their teams |
| `lib.mjs` | | (shared: CSV reading, escaping, `.eml`, `mailto:`, preview page) |

The wording of each letter sits in functions at the top of its script, under
"the letter text: edit here". Change it there; the rendering code below does not
need to change. Every script signs off from the instructors by default; pass
`--signature "Best,\nName"` to change it.

### Inputs

- **Project export**: on the capstone app, `/admin/projects`, filter to the program,
  then **Export CSV**. Save it as `data/projects.csv`.
- **Roster**: the Canvas group export, with `name`, `login_id` (the email) and
  `group_name` (the team). Save it as `data/roster.csv`.
- **Partner sheet**: one row per team, with `Canvas Group Name`, `Team Size`,
  `Student Proposer`, `Project Partner / Mentor Email`, `Project Partner / Mentor
  Name`, `Additional Contact Details` and `Notes`. Save it as `data/partners.csv`.

The scripts read CSV as Canvas, Sheets and Excel save it (quoted cells, a BOM,
Windows line endings); a tab-separated file is detected and read too. A missing
required column stops the run and names the column.

### confirm-projects.mjs

Asks each proposer to confirm their published projects and the number of teams on
each, before placement.

```bash
node scripts/email/confirm-projects.mjs --csv data/projects.csv --reply-by "Tuesday, 12 PM" --program CS46X --exclude-program ECE44X-CORVALLIS
```

- Keeps published projects that are open to applicants and not soft deleted.
- `--program` keeps projects in that course id; `--exclude-program` (repeatable)
  drops any project also listed in that program.
- Partner letters group projects by proposer email, To the proposer only.
- Student-proposed projects get one letter each, To the mentor with the student
  Cc'd, so no student sees another's address. A student project with no mentor
  is skipped.
- `--reply-by` is required, so a past deadline cannot go out by default.

### team-contacts.mjs

Tells each team who their project partner or mentor is, once teams are placed.

```bash
node scripts/email/team-contacts.mjs --roster data/roster.csv --partners data/partners.csv --cc co-instructor@oregonstate.edu
```

- Joins the roster to the sheet on the group name, ignoring case and extra spaces.
- A non-empty `Student Proposer` makes the contact a mentor, and the letter says so.
- A team of `--split-at` students or more (default 6) is told it will split.
  The count comes from the roster, not the sheet's `Team Size`.
- Teams that share a partner address are listed to each other.
- `Additional Contact Details` goes into the email; `Grader` and `Notes` show on
  the preview page only.

### partner-onboarding.mjs

Welcomes each partner and mentor: their teams, the introduction email to expect,
an hour a week of meetings, splitting a large team into two scopes, aligning
several teams, the term schedule, their part in grading, and maintenance after
the course.

```bash
node scripts/email/partner-onboarding.mjs --partners data/partners.csv --roster data/roster.csv --cc co-instructor@oregonstate.edu
```

- No student names: the letter leaves the university (FERPA), so each team
  shows its size and whether it is student proposed, nothing more.
- Sheet rows that share any partner address make one letter, To every address
  on them, so a partner with three teams gets one email listing all three.
- The greeting uses the first name (the first word of the sheet's name, past a
  title such as "Dr.") only when the letter has one address and one name;
  otherwise it opens with "Hello," and the page says why.
- A letter whose teams are all student proposed is a mentor letter. A partner
  who also mentors a student project gets the partner letter with that team
  marked, and is told they stand in as the partner for its evaluation.
- With `--roster`, sizes come from the roster, a team with no students is left
  out of every letter, and a roster team missing from the sheet is flagged.
  Without it, sizes come from the sheet's `Team Size`.

## Sending

1. Open the `index.html` the run prints and read every letter and the "Check
   before sending" list: skipped rows, teams missing from either file, size
   mismatches.
2. Open one draft first. Classic Outlook opens an `.eml` as an editable draft
   because of its `X-Unsent` header; new Outlook and Apple Mail may open it as
   received mail. If so, use the **Open in mail** link instead.
3. Bold paragraph labels exist only in the `.eml`: a `mailto:` link carries
   plain text. The page also flags a link long enough that Outlook may cut the
   body; use the `.eml` for that letter.

A rerun replaces the previous run's drafts in that folder, so a letter dropped
since cannot be sent by mistake.

`scripts/send-emails-macos.vba` is the older route, which sends from an Excel
sheet through Outlook without a preview.

## Adding a letter

Copy the shape of `team-contacts.mjs`: read the inputs with `readTable(path,
requiredHeaders)`; build each letter's `text` and `html` (escape values with
`esc`, then `linkify` for URLs and addresses, and `boldLead` for a "Label:"
paragraph); and hand the list to `writeLetters`. A letter is `{ to, cc, subject,
text, html, stem, title, tags?, note? }`, documented on `writeLetters` in
`lib.mjs`. Anything staff should see but the recipient should not goes in `note`.
Keep its default `--out` under `data/`.
