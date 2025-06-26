# CS Capstone Handbook

```sh
bun install
bun run dev
bun run build
```

## To Do

- more material offered during lecture time: case studies from successful companies, advice for starting a company, career advice, anything that would add value to the course
- change wording to talk about students, project partners, and instructors instead of using pronouns such as "you", "your", "we", "us"
- improve project partner guidelines
- add project to showcase and improve layout
- add guides
- improve research activities
- improve FOSS activities
- add recommended activities based on project category or type
- see commented lines for more activity ideas
- revise assignments
- automate link checking with GH Actions (run prod build and run `linkinator` on it or run post deploy on prod deployment)

## Link Checking

Internal links are checked at build time.

To check the production build for broken links (incl. external ones), run:

```bash
npx linkinator https://capstone.alexulbrich.com --recurse
```
