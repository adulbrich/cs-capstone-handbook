# CS Capstone Handbook

## To Do

- improve research activities
- improve FOSS activities
- add recommended activities based on project category or type
- see commented lines for more activity ideas
- finish summative assignments for CS 462 / 463
- automate link checking with GH Actions (run prod build and run `linkinator` on it or run post deploy on prod deployment)

## Link Checking

Internal links are checked at build time.

To check the production build for broken links (incl. external ones), run:

```bash
npx linkinator https://capstone.alexulbrich.com --recurse
```
