import { getCollection } from "astro:content";

export async function GET() {
  const articles = await getCollection("articles");
  
  // Filter out internal templates/tests
  const publicArticles = articles.filter(a => !a.id.startsWith("_"));

  const searchIndex = publicArticles.map((article) => ({
    title: article.data.title,
    description: article.data.description || "",
    category: article.data.category,
    aliases: article.data.aliases || [],
    slug: article.id.replace(/\.mdx?$/, ""),
    difficulties: article.data.difficulties || [],
  }));

  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Optional: cache control to optimize requests
      "Cache-Control": "public, max-age=3600",
    },
  });
}
