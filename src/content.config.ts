import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

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
};
