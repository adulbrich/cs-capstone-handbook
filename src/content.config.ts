import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({ 
		loader: docsLoader(), 
		schema: docsSchema({
      		extend: z.object({
       			pageActions: z.boolean().optional().default(true),
				// Assignment metadata: drives the learning-outcome traceability
				// matrix and the coverage check in scripts/validate-outcomes.ts
				assignment: z
					.object({
						level: z.enum(['individual', 'team']),
						terms: z.array(z.enum(['fall', 'winter', 'spring'])),
						// percent of the term grade (per term where it runs)
						weight: z.number(),
						// outcome ID (SO1-SO6, L07-L10) -> number of rubric items
						// in this assignment that evidence it
						outcomes: z.record(z.string(), z.number()).optional(),
					})
					.optional(),
      		}),
    	}),
	}),
};