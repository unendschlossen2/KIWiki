import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articlesDir = path.join(__dirname, '../src/content/articles');
const outputFile = path.join(__dirname, '../ARTICLE_INDEX.json');

function getAllMdxFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllMdxFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.mdx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function generateIndex() {
  const files = getAllMdxFiles(articlesDir);
  const index = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const { data } = matter(content);

    // Ignore draft/template files starting with _
    if (path.basename(file).startsWith('_')) continue;

    // Calculate relative path for URL purposes
    const relativePath = path.relative(articlesDir, file);
    const slug = relativePath.replace(/\\/g, '/').replace(/\.mdx$/, '').toLowerCase();

    index.push({
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      category: data.category || 'Allgemein',
      tags: data.tags || [],
      aliases: data.aliases || [],
      difficulties: data.difficulties || ['easy', 'medium', 'hard'],
      filePath: path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/')
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
  console.log(`✅ AI_ARTICLE_INDEX.json generated successfully with ${index.length} articles.`);
}

generateIndex();
