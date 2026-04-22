import { getCollection } from 'astro:content';
import { resolvePath } from '../../utils/path';

export async function GET() {
  const articles = await getCollection('articles');

  const index = articles.map(article => ({
    slug: article.id,
    url: resolvePath(`/articles/${article.id}`),
    title: article.data.title,
    description: article.data.description || "",
    category: article.data.category,
    tags: article.data.tags || [],
    aliases: article.data.aliases || [],
    difficulties: article.data.difficulties || ['easy', 'medium', 'hard']
  }));

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
