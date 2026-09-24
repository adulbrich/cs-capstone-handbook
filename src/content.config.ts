import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";

// The sources registry: one YAML file per cited source, named by its id
// (`src/data/sources/edmondson-1999.yaml` is `<Cite id="edmondson-1999" />`).
// One file per source rather than one list, because guide PRs add sources in
// parallel and a single file would conflict on every merge. This schema fails
// the build on a malformed entry; scripts/validate-sources.mjs mirrors it for
// pre-commit, where `astro:content` cannot run, and adds the cross-file rules
// (every Cite resolves, every entry is cited, no two entries cite the same,
// References is placed). Change both together.
const SOURCE_KINDS = [
  "peer-reviewed",
  "research-book",
  "preprint",
  "industry-report",
  "standard",
  "documentation",
  "essay",
] as const;

// A string with at least one non-space character. `.min(1)` alone passes "  ".
const NOT_BLANK = /\S/;
const text = () => z.string().regex(NOT_BLANK, "must not be blank");

// Percent of the term grade: a number when it is the same in every term, a
// per-term map when it varies. Strict, so a misspelled term fails here rather
// than silently declaring nothing.
const termWeight = () =>
  z.union([
    z.number(),
    z
      .object({
        fall: z.number().optional(),
        spring: z.number().optional(),
        winter: z.number().optional(),
      })
      .strict(),
  ]);
const weekList = () => z.array(z.number().int().min(1).max(11)).min(1);
const SUBMISSIONS = [
  "pdf",
  "video",
  "url",
  "image",
  "survey",
  "text",
  "none",
] as const;

const sources = defineCollection({
  loader: glob({ base: "./src/data/sources", pattern: "*.yaml" }),
  schema: z
    .object({
      // "Family, Initials", in the source's own author order.
      authors: z.array(text()).min(1),
      // Every claim the handbook makes from this source, with the section,
      // page, figure, or table where the source supports it.
      claims: z
        .array(z.object({ claim: text(), locator: text() }).strict())
        .min(1),
      // A bare DOI ("10.2307/2666999"); Cite prefixes https://doi.org/.
      doi: z
        .string()
        .regex(/^10\.\S+$/, "a bare DOI starting 10., not a URL")
        .optional(),
      kind: z.enum(SOURCE_KINDS),
      // Tells apart two sources that would cite the same: "1999a", "1999b".
      suffix: z
        .string()
        .regex(/^[a-z]$/, "one lowercase letter")
        .optional(),
      title: text(),
      url: z.url({ protocol: /^https?$/ }),
      venue: text(),
      // How the claims were checked. A claim verified from the abstract alone
      // must be stated in the abstract.
      verified: z.enum(["full-text", "abstract"]),
      year: z.number().int(),
    })
    .strict(),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Assignment metadata: drives the learning-outcome traceability
        // matrix and the coverage check in scripts/validate-outcomes.mjs
        assignment: z
          .object({
            // The Canvas entries this page owns (the Canvas entry model
            // record in docs/decisions/). Each Canvas assignment
            // has its own due date, late window, grade and submission,
            // so entries are never bundled: a family expands to one
            // entry per week listed. src/lib/canvas-entries.mjs expands
            // it for the page table; validate-outcomes.mjs checks it.
            canvas: z
              .array(
                z
                  .object({
                    // Canvas assignment group; weights live on groups.
                    group: text(),
                    // Exact Canvas name; "{n}" numbers a family 1, 2, ...
                    name: text(),
                    // Week the Canvas peer reviews are due, when the
                    // entry uses Canvas's own peer review.
                    peer_review_week: z.number().int().optional(),
                    points: z.number().positive(),
                    // Canvas rubric, relative to canvas/assignments/.
                    rubric: text(),
                    submission: z.union([
                      z.enum(SUBMISSIONS),
                      z.array(z.enum(SUBMISSIONS)).min(1),
                    ]),
                    // One title per week listed, per term, filling
                    // "{title}" in the name: "Workshop {n}: {title}".
                    titles: z
                      .object({
                        fall: z.array(text()).optional(),
                        spring: z.array(text()).optional(),
                        winter: z.array(text()).optional(),
                      })
                      .strict()
                      .optional(),
                    // One entry per week listed, per term.
                    weeks: z
                      .object({
                        fall: weekList().optional(),
                        spring: weekList().optional(),
                        winter: weekList().optional(),
                      })
                      .strict(),
                    // Percent of the term grade for the whole family,
                    // split evenly across its entries that term.
                    weight: termWeight(),
                  })
                  .strict()
              )
              .min(1),
            level: z.enum(["individual", "team"]),
            // outcome ID (SO1-SO6, L07-L10) -> number of rubric items
            // in this assignment that evidence it
            outcomes: z.record(z.string(), z.number()).optional(),
            terms: z.array(z.enum(["fall", "winter", "spring"])),
            // Percent of the term grade. A number when the page is
            // worth the same in every term it runs; a per-term map
            // when it varies (Sprint Notes, Workshop Activities).
            // validate-outcomes.mjs reconciles this against the
            // Team Deliverables tables in assignments/introduction.mdx.
            // The map is strict so a misspelled term fails here
            // rather than silently declaring nothing.
            weight: termWeight(),
          })
          .optional(),
        pageActions: z.boolean().optional().default(true),
      }),
    }),
  }),
  sources,
};
