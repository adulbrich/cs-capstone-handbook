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
// (every Cite resolves, every entry is cited, References is placed).
const SOURCE_KINDS = [
  "peer-reviewed",
  "research-book",
  "preprint",
  "industry-report",
  "standard",
  "documentation",
  "essay",
] as const;

const sources = defineCollection({
  loader: glob({ base: "./src/data/sources", pattern: "*.yaml" }),
  schema: z
    .object({
      // "Family, Initials", in the source's own author order.
      authors: z.array(z.string().min(1)).min(1),
      // Every claim the handbook makes from this source, with the section,
      // page, figure, or table where the source supports it.
      claims: z
        .array(
          z
            .object({
              claim: z.string().min(1),
              locator: z.string().min(1),
            })
            .strict()
        )
        .min(1),
      doi: z.string().min(1).optional(),
      kind: z.enum(SOURCE_KINDS),
      title: z.string().min(1),
      url: z.url(),
      venue: z.string().min(1),
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
            weight: z.union([
              z.number(),
              z
                .object({
                  fall: z.number().optional(),
                  spring: z.number().optional(),
                  winter: z.number().optional(),
                })
                .strict(),
            ]),
          })
          .optional(),
        pageActions: z.boolean().optional().default(true),
      }),
    }),
  }),
  sources,
};
