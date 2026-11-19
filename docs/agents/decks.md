# Slide decks

Read this before editing a deck under `src/decks/` or the route under `src/pages/decks/`.

- Each deck is one `.astro` file, one `<section>` per slide, served as reveal.js at `/decks/<file name>/` by the `[slug].astro` route.
- Slides are built from the components in `src/components/deck/`, each documenting its props at the top; `sample.astro` uses every one. `src/styles/deck.css` themes them on the handbook palette.
- Decks are reveal.js on a native Astro route inside the one `astro build`, not Marp, Slidev, or an Astro slide package (#465).
- The auditorium rules (#465): a light background always, whatever the viewer's color scheme; body text at least 32px on the 1920x1080 slide (`--deck-text-min`); one idea per slide, so a slide that needs more is two slides.
- No speaker notes: a fact the room needs goes on its slide (#510). Reveal's speaker view stays, for the next slide and the clock (#528).
- Decks are unlinked, `noindex`, and out of the sitemap. They reach the class through announcements, and no page links one (#549).
- A link on a slide shows its page's name, never its URL; a QR slide keeps its printed URL as the fallback (#521).
- The dash, date, and prose checks scan the decks. Slide text follows the Person, Claims, Concrete sentences, Sentences and words, Examples of project work, and The floor sections of `docs/agents/voice.md`, and the heading rule under its Structure; its paragraph and page rules don't apply to a slide.
- The fall week 1 seating map is `<SeatingMap>`, drawn at build time from the room in `src/lib/seating.mjs`.
- A slide that restates a handbook fact reads it from its page. `<GradeGrid>` and `<TermSessions>` parse the grade grid and the schedule through `src/lib/grade-grid.mjs` and `src/lib/schedule-lines.mjs`, the readers `validate-outcomes.mjs` and `validate-activities.mjs` use. A deck that places an item in its week finds the schedule line with `weekWhere` there, by where the line links (`linkHrefs`), as `fall-week-3.astro` does.
- A workshop's due line says "one PDF per team", and the deck fails the build when the workshop page no longer says "One PDF per team per workshop" (#702).
- Read the fact, not the sentence. A page sentence lifted onto a slide ("most projects draw from two of them", "from the four rules") points at context the slide doesn't have. Read counts, names, weeks, and the submission from the page, and write the slide's own sentence around them (#704).
- An agenda lists the session's parts as bullets, nested where a part has parts, and never says who presents or what the instruction team does (#704).
- Students get the slides in advance. A workshop deck explains each step on its own slide, once, then shows one slide that summarizes every step, which stays on the screen while teams work. No slide describes the room or what stays on the screen (#704).
- No list on a slide has one bullet: one item is a sentence, or it joins the list next to it (#704).
- The wrap repeats nothing. No slide checks the work against the outcome slide, and the due slide nests the workshop's submission under the workshop's line (#704).
- A caption or lead says only what its slide shows. A slide never points at something it doesn't show (a group, a rule, an earlier slide), and every pill, chip, or color on it is labeled (#704).
- A deck's examples don't stop at its running example. Where a method plays out differently from one project to another (a research result, a tool only the partner's staff use, code with no screen, a game, an app in beta or on a store, an app still in user research, an open-source contribution), show the cases that differ most, named as voice.md's Examples of project work says. Size them to what teams reach by spring: a few test users, a beta or a store listing, user research, seldom many users (#704).
- A mistakes table's "instead of" is something a team would plausibly write, and its fix depends on no schedule fact (#704).
