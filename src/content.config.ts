import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articlesCollection = defineCollection({
  // Use the glob loader for MDX/Markdown files in the articles directory
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    /** The section grouping for this article */
    category: z.string().default('Allgemein'),
    /** List of tags for this article */
    tags: z.array(z.string()).optional().default([]),
    /** Which difficulty levels this article is visible for. Defaults to all. */
    difficulties: z
      .array(z.enum(['easy', 'medium', 'hard']))
      .optional()
      .default(['easy', 'medium', 'hard']),
  }),
});

export const collections = {
  articles: articlesCollection,
};
