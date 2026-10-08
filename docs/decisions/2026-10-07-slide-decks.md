# Design: Slide Decks Are Astro Pages

Date: 2026-10-07
Branch: `feat/465-reveal-decks`
Status: implemented in #465, part of #51. The Workshop 1 deck (#466) and the week 0 and week 1 decks (#467) build on it.
Companion documents: `AGENTS.md` (the `src/decks/` row), `src/pages/decks/[slug].astro`, `src/styles/deck.css`, `src/components/deck/`, `src/decks/sample.astro`.

## 1. Why

The only deck in the repository was a Marp draft in the root `decks/`: outside the build, written in Markdown that cannot use the handbook's components, and restating by hand facts such as the grade split that handbook pages own. Decks built from the handbook's own source can render those components and fall under the same dash, date, and prose checks as the pages.

## 2. The rules

1. **reveal.js on a native Astro route, inside the one `astro build`.** One `.astro` file per deck under `src/decks/`, one `<section>` per slide, served at `/decks/<file name>/`. Rejected:
   - Marp CLI: a second build step that writes generated HTML into scanned directories, and themes that are CSS only, so a slide cannot use a component.
   - Slidev: a second Vite toolchain with Vue and UnoCSS, about 75 dependencies.
   - The Astro slide packages: each is peer-pinned to Astro 5 or 6, and the handbook runs Astro 7. No Starlight slide plugin exists.
2. **Light background always.** Projectors wash out dark slides, so a deck ignores the viewer's color scheme.
3. **Body text at least 32px on the 1920x1080 slide.** The decks are projected in a 250-seat auditorium. reveal's slide is fixed at 1920x1080 with no margin, so at that viewport one CSS pixel is one projected pixel and the floor is measured as written.
4. **One idea per slide.** A slide that needs more is two slides.
5. **Speaker notes in reveal's speaker view**, with a cue and a target time per slide (`<Notes time="m:ss">`).
6. **Unlinked and `noindex` while no page links a deck**, and out of the sitemap, as the instructor tools are.

## 3. How it works

The route globs `src/decks/*.astro` in `getStaticPaths` and renders each inside `.reveal > .slides`. `deck.css` replaces every reveal theme: it imports the Tailwind palette and the handbook's `palette.css`, which `global.css` also imports, so the docs and the decks share one set of colors. Slide components wrap `Slide`, so a new kind of slide is one file in `src/components/deck/`. The fall week 1 seating map, once a standalone page in the root `decks/` shown in an iframe, is now `<SeatingMap>`, a deck component drawn at build time from the room in `src/lib/seating.mjs` (#479).

## 4. What it left open

- No page links a deck yet. Linking one ends rule 6 and needs `exclude: ['/decks/**']` in `starlight-links-validator` only if the validator rejects the link.
- `check-prose` applies the banned words to `src/decks/`, not to fixed text inside `src/components/deck/`.
