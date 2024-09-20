# CS Capstone Handbook

## To Do

- add activities
- finish summative assignments for CS 462 / 463
- rewrite plausible for proxying
- automate link checking with GH Actions (run prod build and run `linkinator` on it or run post deploy on prod deployment)
- add general email address: eecs_capstone_staff@engr.oregonstate.edu
- add online CS email?
- add EE email?
- add multi-disciplinary email?

## Link Checking

Internal links are checked at build time.

To check the production build for broken links (incl. external ones), run:

```bash
npx linkinator https://capstone.alexulbrich.com --recurse
```
