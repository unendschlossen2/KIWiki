import { performance } from 'perf_hooks';

// Mock helpers
function getCategoryDisplay(category) {
  return category || "Uncategorized";
}
function slugifyCategory(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

// Generate mock data
const N = 10000; // articles
const M = 100;   // categories
const mockCategories = Array.from({ length: M }, (_, i) => `Category ${i}`);

const articles = Array.from({ length: N }, (_, i) => ({
  id: `article-${i}.md`,
  data: {
    category: mockCategories[Math.floor(Math.random() * M)],
  }
}));

// Approach 1: Current O(N*M) Approach
function runCurrentApproach() {
  const categories = [
    ...new Set(articles.map((a) => getCategoryDisplay(a.data.category))),
  ];

  return categories.map((category) => ({
    params: { category: slugifyCategory(category) },
    props: {
      category,
      articles: articles.filter(
        (a) => getCategoryDisplay(a.data.category) === category,
      ),
    },
  }));
}

// Approach 2: Optimized O(N) Approach
function runOptimizedApproach() {
  const categoryMap = new Map();

  for (const article of articles) {
    const category = getCategoryDisplay(article.data.category);
    let categoryArticles = categoryMap.get(category);
    if (!categoryArticles) {
      categoryArticles = [];
      categoryMap.set(category, categoryArticles);
    }
    categoryArticles.push(article);
  }

  const paths = [];
  for (const [category, categoryArticles] of categoryMap) {
    paths.push({
      params: { category: slugifyCategory(category) },
      props: {
        category,
        articles: categoryArticles,
      },
    });
  }

  return paths;
}

// Warmup
for (let i = 0; i < 10; i++) {
  runCurrentApproach();
  runOptimizedApproach();
}

// Benchmark
const iterations = 100;

console.log(`Benchmarking with N=${N} articles and M=${M} categories over ${iterations} iterations...`);

let start = performance.now();
for (let i = 0; i < iterations; i++) {
  runCurrentApproach();
}
const timeCurrent = performance.now() - start;
console.log(`Current O(N*M) approach: ${timeCurrent.toFixed(2)} ms`);

start = performance.now();
for (let i = 0; i < iterations; i++) {
  runOptimizedApproach();
}
const timeOptimized = performance.now() - start;
console.log(`Optimized O(N) approach: ${timeOptimized.toFixed(2)} ms`);

console.log(`Speedup: ${(timeCurrent / timeOptimized).toFixed(2)}x`);
