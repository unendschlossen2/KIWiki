import { getCollection } from 'astro:content';

async function check() {
  const articles = await getCollection('articles');
  articles.forEach(a => {
    console.log(`ID: "${a.id}"`);
  });
}
// This won't run easily without a full astro environment.
