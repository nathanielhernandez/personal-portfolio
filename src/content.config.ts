import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(48),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      stack: z.array(z.string()),
      cover: image(),
      coverAlt: z.string(),
      featured: z.boolean().optional(),
    }),
});

const nows = defineCollection({
  loader: glob({ base: './src/content/nows', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
  }),
});

export const collections = { nows, projects };
