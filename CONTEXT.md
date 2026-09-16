# Vocabulary

The handbook's terms live on one page, `src/content/docs/about/glossary.mdx`
(published at `/about/glossary/`). Use its word for each concept in prose,
issue titles, commit messages, and PR bodies. Its "Not:" lists are what
`scripts/check-prose.mjs` rejects under the content paths; the script's
`glossaryDrift()` keeps the two equal, so edit the page and the script
together.
