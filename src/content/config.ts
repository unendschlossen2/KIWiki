import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(''),
    category: z.string().optional().default('Allgemein'),
    tags: z.array(z.string()).optional().default([]),
    aliases: z.array(z.string()).optional().default([]),
    difficulties: z.array(z.enum(['easy', 'medium', 'hard'])).optional().default(['easy', 'medium', 'hard']),
  }),
});

export const collections = {
  articles,
};
