# CS Capstone Handbook

The handbook for Oregon State University's on-campus three-term computer
science capstone, CS 461, 462, and 463, for students, project partners, and
mentors.

Built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build). Pages are MDX under
`src/content/docs/`.

## Getting Started

Requires Node 24 or later. `.nvmrc` pins 24, matching Vercel's default
runtime.

```sh
nvm use
npm install
npm run dev
```

`npm install` also installs the lefthook git hooks. Use `npm ci` instead when
you want the exact tree from `package-lock.json` and no lockfile changes,
which is what CI runs.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | `astro check`, then the static site in `dist/` |
| `npm run preview` | Serves `dist/` |
| `npm run canvas:export` | Writes the Canvas paste kit to `canvas-export/`, after a build |
| `npm test` | Unit tests for the instructor tools |
| `npm run format` | Biome format and lint fixes for the code |

The validators, and the full list to run before a content change is done, are
in [AGENTS.md](AGENTS.md#validation).

## Repository Layout

| Path | Holds |
| --- | --- |
| `src/content/docs/` | The handbook pages: assignments, activities, guides, learning objectives, and the audience pages |
| `canvas/` | One rubric CSV per rubric, imported into Canvas, and the three syllabi |
| `public/` | Templates and scoresheets students download |
| `src/pages/tools/` | Instructor tools for the surveys; they run in the browser and upload nothing |
| `src/decks/` | Slide decks, served at `/decks/<file name>/` |
| `scripts/` | The validators and checks, the Canvas export, the email letter scripts, and other maintenance scripts |
| `data/` | Rosters, grades, and survey exports. Gitignored; never commit anything here |

[AGENTS.md](AGENTS.md) has the full map.

## Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md): the process from issue to merge, and the
  gate that stops each rule.
- [AGENTS.md](AGENTS.md): the rules every change keeps. Read it before a
  content change.
- [docs/agents/voice.md](docs/agents/voice.md): how handbook pages are
  written.
- [docs/decisions/](docs/decisions/): design records for the rules the
  handbook lives by.
- Open work is in the
  [issue tracker](https://github.com/adulbrich/cs-capstone-handbook/issues).

## Running a Term

At the start of every term, open a Term setup issue from
`.github/ISSUE_TEMPLATE/term-setup.md` and work its checklist, so each term's
setup has its own completion record.

## Link Checking

`npm run build` fails on a broken internal link or anchor, through
`starlight-links-validator`. External links are
checked weekly by `.github/workflows/links.yml`, which runs lychee over the
built site and opens or updates one "Broken external links" issue when a link
fails. To run it now:

```sh
gh workflow run links.yml
```

## License

[CC BY-SA 4.0](LICENSE).
