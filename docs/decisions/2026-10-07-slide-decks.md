# Design: Slide Decks Are Astro Pages

Date: 2026-10-07
Branch: `feat/465-reveal-decks`
Status: implemented in #465, part of #51. The Workshop 1 deck (#466) and the week 0 and week 1 decks (#467) build on it. #510 changed rule 5: decks no longer carry speaker notes. #521 added rule 7. #549 settled rule 6: no page links a deck. #528 restored the speaker view in rule 5.
Companion documents: `docs/agents/decks.md`, `src/pages/decks/[slug].astro`, `src/styles/deck.css`, `src/components/deck/`, `src/decks/sample.astro`.

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
5. **No speaker notes; slides explain themselves. The speaker view stays available.** Notes hid facts from the room: the AI tool behind a demo, the citation behind a map, whose commits a repository history shows. A fact the room needs goes on its slide. The first decks carried a `<Notes>` component with a cue and a target time per slide, and a pacing timer in the route; #510 removed the component, the speaker-view plugin, and the timer. #528 restored reveal's notes plugin for the view itself: pressing `S` opens a second window with the current slide, the next slide, and a clock, which the presenter uses with or without notes. The decks still carry no notes, so its notes pane stays empty.
6. **Unlinked and `noindex`**, and out of the sitemap, as the instructor tools are. A deck is session material that reaches the class through announcements, so the schedule tells students to check announcements for each session's slides rather than linking the deck from its week (#549).
7. **A link shows its page's name, never its URL.** The slides are shared with the class at the start of each session, so a link is clicked, not typed; the first decks printed URLs "as the room would type them", which put long project-page addresses on slides nobody needed to read. `<TermSessions>` keeps the schedule's links for the same reason. A QR slide keeps its printed URL, the fallback for anyone who cannot scan.

## 3. How it works

The route globs `src/decks/*.astro` in `getStaticPaths` and renders each inside `.reveal > .slides`. `deck.css` replaces every reveal theme: it imports the Tailwind palette and the handbook's `palette.css`, which `global.css` also imports, so the docs and the decks share one set of colors. Slide components wrap `Slide`, so a new kind of slide is one file in `src/components/deck/`. The fall week 1 seating map, once a standalone page in the root `decks/` shown in an iframe, is now `<SeatingMap>`, a deck component drawn at build time from the room in `src/lib/seating.mjs` (#479).

## 4. What it left open

- `check-prose` applies the banned words to `src/decks/`, not to fixed text inside `src/components/deck/`.
