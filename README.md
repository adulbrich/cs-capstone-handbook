# CS Capstone Handbook

```sh
bun install
bun run dev
bun run build
```

## To Do

- review grade distribution (25% pp, 25% peers, 50% class)
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
