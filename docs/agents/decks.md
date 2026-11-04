# Slide decks

Read this before editing a deck under `src/decks/` or the route under `src/pages/decks/`.

- Each deck is one `.astro` file, one `<section>` per slide, served as reveal.js at `/decks/<file name>/` by the `[slug].astro` route.
- Slides are built from the components in `src/components/deck/`, each documenting its props at the top; `sample.astro` uses every one. `src/styles/deck.css` themes them on the handbook palette.
- Decks are reveal.js on a native Astro route inside the one `astro build`, not Marp, Slidev, or an Astro slide package (#465).
- The auditorium rules (#465): a light background always, whatever the viewer's color scheme; body text at least 32px on the 1920x1080 slide (`--deck-text-min`); one idea per slide, so a slide that needs more is two slides.
- No speaker notes: a fact the room needs goes on its slide (#510). Reveal's speaker view stays, for the next slide and the clock (#528).
- Decks are unlinked, `noindex`, and out of the sitemap. They reach the class through announcements, and no page links one (#549).
- A link on a slide shows its page's name, never its URL; a QR slide keeps its printed URL as the fallback (#521).
- The dash, date, and prose checks scan the decks. Slide text follows the Person, Claims, Concrete sentences, Sentences and words, and The floor sections of `docs/agents/voice.md`; its paragraph and page rules don't apply to a slide.
- The fall week 1 seating map is `<SeatingMap>`, drawn at build time from the room in `src/lib/seating.mjs`.
- A slide that restates a handbook fact reads it from its page. `<GradeGrid>` and `<TermSessions>` parse the grade grid and the schedule through `src/lib/grade-grid.mjs` and `src/lib/schedule-lines.mjs`, the readers `validate-outcomes.mjs` and `validate-activities.mjs` use. A deck that places an item in its week finds the schedule line with `weekWhere` there, by where the line links (`linkHrefs`), as `fall-week-3.astro` does.
