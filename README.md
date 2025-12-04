# CS Capstone Handbook

```sh
bun install
bun run dev
bun run build
```

## Instructor Checklist

- Create projects sheet with TAs and Project Partner Emails
- Finalize team assignments (students) sheet and add calculated columns with assigned TA, project partner email, and cohort/check-in information
- Create Teams channel for TAs and instructors
- Create TA Meeting Notes document
- Update Qualtrics surveys
- Update Sylabus statements

## To Do

- get all assignments/rubrics in html/markdown instead of Canvas
- improve assignment descriptions by comparing different project types
- create good examples for all assignments based on previous years' projects
- stretch: create bad examples for all assignments based on previous years' projects
- consider splitting rubrics (e.g. requirements update) to make it easier to grade
- add back different ways to conduct retrospectives (4Ls, Start-Stop-Continue, iceberg/sky, etc.)
- more material offered during lecture time: case studies from successful companies, advice for starting a company, career advice, anything that would add value to the course
- change wording to talk about students, project partners, and instructors instead of using pronouns such as "you", "your", "we", "us"
- improve project partner guidelines
- add project to showcase and improve layout
- add guides
- improve research activities
- improve FOSS activities
- add recommended activities based on project category or type
- see commented lines for more activity ideas
- revise activities so that it complements/helps with the project instead of reading like assignments
- automate link checking with GH Actions (run prod build and run `linkinator` on it or run post deploy on prod deployment)

## Link Checking

Internal links are checked at build time.

To check the production build for broken links (incl. external ones), run:

```bash
npx linkinator https://capstone.alexulbrich.com --recurse
```
