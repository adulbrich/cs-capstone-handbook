# Slide decks

Read this before editing a deck under `src/decks/` or the route under `src/pages/decks/`.

- Each deck is one `.astro` file, one `<section>` per slide, served as reveal.js at `/decks/<file name>/` by the `[slug].astro` route.
- Slides are built from the components in `src/components/deck/`, each documenting its props at the top; `sample.astro` uses every one. `src/styles/deck.css` themes them on the handbook palette.
- The auditorium rules, why reveal.js, and the `noindex` while the decks are unlinked are in `docs/decisions/2026-10-07-slide-decks.md`.
- The dash, date, and prose checks scan the decks, and slide text follows `docs/agents/voice.md`.
- The fall week 1 seating map is `<SeatingMap>`, drawn at build time from the room in `src/lib/seating.mjs`.
- A slide that restates a handbook fact reads it from its page. `<GradeGrid>` and `<TermSessions>` parse the grade grid and the schedule through `src/lib/grade-grid.mjs` and `src/lib/schedule-lines.mjs`, the readers `validate-outcomes.mjs` and `validate-activities.mjs` use. A deck that places an item in its week finds the schedule line with `weekWhere` there, by where the line links (`linkHrefs`), as `fall-week-3.astro` does.
