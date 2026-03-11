import { visitParents, SKIP } from "unist-util-visit-parents";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

let dictionaryCache: { keyword: string; url: string; regex: RegExp }[] | null = null;
const CONTENT_DIR = path.resolve(process.cwd(), "src/content/articles");
const BASE_URL = "/KIWiki/articles";

function buildDictionary() {
  if (dictionaryCache) return dictionaryCache;
  const dict: { keyword: string; url: string }[] = [];

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith(".md") || file.endsWith(".mdx")) {
        // Skip template or internal files starting with _
        if (file.startsWith("_")) continue;

        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const { data } = matter(content);

          // Compute slug based on relative path
          const relPath = path.relative(CONTENT_DIR, fullPath);
          const slug = relPath.replace(/\\/g, "/").replace(/\.mdx?$/, "");
          const url = `${BASE_URL}/${slug}`;

          if (data.title) {
            dict.push({ keyword: data.title, url });
          }
          if (Array.isArray(data.aliases)) {
            data.aliases.forEach((alias) => {
              if (typeof alias === "string") {
                dict.push({ keyword: alias, url });
              }
            });
          }
        } catch (e) {
          console.error(`Error parsing frontmatter for ${fullPath}:`, e);
        }
      }
    }
  }

  walkDir(CONTENT_DIR);

  // Sort by keyword length descending (longest first)
  dict.sort((a, b) => b.keyword.length - a.keyword.length);

  // Precompile regexes for each keyword
  dictionaryCache = dict.map((entry) => {
    // Escape regex special chars
    const escapedKeyword = entry.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match word boundaries considering German umlauts
    const regex = new RegExp(`(^|[^a-zA-ZäöüÄÖÜß])(${escapedKeyword})([^a-zA-ZäöüÄÖÜß]|$)`, "iu");
    return { ...entry, regex };
  });

  return dictionaryCache;
}

export function remarkCrossReference() {
  return (tree: any, file: any) => {
    // Only process pages inside the articles directory (or let it run anywhere, it just links to articles)
    const dict = buildDictionary();
    if (dict.length === 0) return;

    // Determine current URL to prevent self-linking
    let currentUrl = "";
    if (file.path) {
      const relPath = path.relative(CONTENT_DIR, file.path);
      const slug = relPath.replace(/\\/g, "/").replace(/\.mdx?$/, "");
      currentUrl = `${BASE_URL}/${slug}`;
    }

    const ignoredParents = new Set([
      "link",
      "linkReference",
      "heading",
      "inlineCode",
      "code",
      "html",
      "mdxJsxFlowElement",
      "mdxJsxTextElement",
    ]);

    visitParents(tree, "text", (node, ancestors) => {
      // Check if any ancestor is in the ignored list
      if (ancestors.some((ancestor: typeof node) => ignoredParents.has(ancestor.type))) {
        return;
      }

      const parent = ancestors[ancestors.length - 1] as any;
      if (!parent || !parent.children) return;

      const text = String(node.value);

      let matchInfo = null;
      for (const entry of dict) {
        // Prevent an article from linking to itself
        if (entry.url === currentUrl) continue;

        // Find match using the precompiled regex
        const match = entry.regex.exec(text);
        if (match) {
          // match[1] is the prefix boundary, match[2] is the exact word, match[3] is the suffix
          const indexOffset = match.index + match[1].length;
          const matchLength = match[2].length;
          
          matchInfo = {
            entry,
            index: indexOffset,
            length: matchLength,
          };
          break; // Since dict is sorted by length, longest match is taken
        }
      }

      if (matchInfo) {
        const { entry, index, length } = matchInfo;

        const beforeText = text.slice(0, index);
        const matchText = text.slice(index, index + length);
        const afterText = text.slice(index + length);

        const newNodes = [];
        if (beforeText) newNodes.push({ type: "text", value: beforeText });

        newNodes.push({
          type: "link",
          url: entry.url,
          title: null,
          children: [{ type: "text", value: matchText }],
        });

        if (afterText) newNodes.push({ type: "text", value: afterText });

        // Replace this node in the parent
        const parentIndex = parent.children.indexOf(node);
        if (parentIndex !== -1) {
          parent.children.splice(parentIndex, 1, ...newNodes);
          
          return [SKIP, parentIndex + newNodes.length];
        }
      }
    });
  };
}
