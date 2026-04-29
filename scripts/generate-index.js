import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articlesDir = path.join(__dirname, '../src/content/articles');
const outputFile = path.join(__dirname, '../src/data/ARTICLE_INDEX.json');

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

export function generateSearchIndex() {
    try {
        const files = getAllMdxFiles(articlesDir);
        const index = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            const { data } = matter(content);
            if (path.basename(file).startsWith('_')) continue;

            const relativePath = path.relative(articlesDir, file);
            // Clean slug generation logic to match the app's slugify logic
            const slug = relativePath
                .replace(/\\/g, '/')
                .replace(/\.mdx$/, '')
                .replace(/\s+/g, '-')
                .toLowerCase();

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
        console.log(`[SearchIndex] ✅ ARTICLE_INDEX.json updated (${index.length} articles)`);
    } catch (e) {
        console.error('[SearchIndex] ❌ Error generating index:', e);
    }
}

/**
 * Astro Integration to automatically update the search index
 */
export default function searchIndexIntegration() {
    return {
        name: 'search-index-integration',
        hooks: {
            'astro:config:setup': ({ updateConfig }) => {
                // Run once on setup
                generateSearchIndex();

                // Add a Vite plugin to watch for changes in the articles directory
                updateConfig({
                    vite: {
                        plugins: [{
                            name: 'search-index-watcher',
                            handleHotUpdate({ file }) {
                                if (file.replace(/\\/g, '/').includes('src/content/articles')) {
                                    generateSearchIndex();
                                }
                            }
                        }]
                    }
                });
            },
            'astro:build:start': () => {
                generateSearchIndex();
            }
        }
    };
}

// Run if called directly
if (process.argv[1] === __filename) {
    generateSearchIndex();
}
