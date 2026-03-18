import { visitParents, SKIP } from "unist-util-visit-parents";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

let dictionaryCache: { keyword: string; url: string; regex: RegExp; regexGlobal: RegExp }[] | null = null;
let dictionaryCachePromise: Promise<{ keyword: string; url: string; regex: RegExp; regexGlobal: RegExp }[]> | null = null;
const CONTENT_DIR = path.resolve(process.cwd(), "src/content/articles");
const BASE_URL = "/KIWiki/articles";

async function buildDictionary() {
  if (dictionaryCachePromise) return dictionaryCachePromise;

  dictionaryCachePromise = (async () => {
    const dict: { keyword: string; url: string }[] = [];

    async function walkDir(dir: string) {
      if (!fs.existsSync(dir)) return;

      const entries = await fsp.readdir(dir, { withFileTypes: true });
      const promises = entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await walkDir(fullPath);
        } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
          // Skip template or internal files starting with _
          if (entry.name.startsWith("_")) return;

          try {
            const content = await fsp.readFile(fullPath, "utf8");
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
      });

      await Promise.all(promises);
    }

    await walkDir(CONTENT_DIR);

    // Sort by keyword length descending (longest first)
    dict.sort((a, b) => b.keyword.length - a.keyword.length);

    console.log(`[CrossReference] Built dictionary with ${dict.length} entries.`);

    // Precompile regexes for each keyword
    dictionaryCache = dict.map((entry) => {
      // Escape regex special chars
      const escapedKeyword = entry.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Match word boundaries considering German umlauts and numbers
      // Using lookarounds for better multi-match support
      const source = `(?<=^|[^a-zA-Z0-9äöüÄÖÜß])(${escapedKeyword})(?=[^a-zA-Z0-9äöüÄÖÜß]|$)`;
      const regex = new RegExp(source, "iu");
      const regexGlobal = new RegExp(source, "giu");
      return { ...entry, regex, regexGlobal };
    });

    return dictionaryCache;
  })();

  return dictionaryCachePromise;
}

export function remarkCrossReference() {
  return async (tree: any, file: any) => {
    // Only process pages inside the articles directory (or let it run anywhere, it just links to articles)
    const dict = await buildDictionary();
    if (dict.length === 0) return;

    // Determine current URL to prevent self-linking
    let currentUrl = "";
    let filePath = file.path;
    if (!filePath && file.history && file.history.length > 0) {
      filePath = file.history[file.history.length - 1];
    }

    if (filePath) {
      const relPath = path.relative(CONTENT_DIR, filePath);
      const slug = relPath.replace(/\\/g, "/").replace(/\.mdx?$/, "");
      currentUrl = `${BASE_URL}/${slug}`;
    }

    const ignoredParents = new Set(["link", "linkReference", "heading", "inlineCode", "code", "html"]);

    visitParents(tree, "text", (node, ancestors) => {
      // Check if any ancestor is in the ignored list
      if (ancestors.some((ancestor: any) => ignoredParents.has(ancestor.type))) {
        return;
      }

      const parent = ancestors[ancestors.length - 1] as any;
      if (!parent || !parent.children) return;

      const text = String(node.value);
      const matches: { start: number; end: number; entry: (typeof dict)[0] }[] = [];
      const occupiedRanges: [number, number][] = [];

      // Find all matches for all dictionary entries
      for (const entry of dict) {
        if (entry.url === currentUrl) continue;

        // Use a loop to find all occurrences of this regex in the text
        // We use the precompiled global regex from the dictionary cache.
        const regex = entry.regexGlobal;
        regex.lastIndex = 0; // Reset stateful global regex before use
        let match;
        while ((match = regex.exec(text)) !== null) {
          // match[0] is the keyword now because we used lookarounds
          const indexOffset = match.index;
          const matchLength = match[0].length;
          const matchEnd = indexOffset + matchLength;

          // Check for overlap with already found matches
          const isOverlapping = occupiedRanges.some(
            ([start, end]) =>
              (indexOffset >= start && indexOffset < end) ||
              (matchEnd > start && matchEnd <= end) ||
              (indexOffset <= start && matchEnd >= end)
          );

          if (!isOverlapping) {
            matches.push({ start: indexOffset, end: matchEnd, entry });
            occupiedRanges.push([indexOffset, matchEnd]);
          }
        }
      }

      if (matches.length > 0) {
        // Sort matches by start index
        matches.sort((a, b) => a.start - b.start);

        const newNodes = [];
        let lastIndex = 0;

        for (const match of matches) {
          // Add text before the match
          if (match.start > lastIndex) {
            newNodes.push({ type: "text", value: text.slice(lastIndex, match.start) });
          }

          // Add the link node
          newNodes.push({
            type: "link",
            url: match.entry.url,
            title: null,
            data: {
              hProperties: {
                className: ["cross-reference"],
              },
            },
            children: [{ type: "text", value: text.slice(match.start, match.end) }],
          });

          lastIndex = match.end;
        }

        // Add remaining text
        if (lastIndex < text.length) {
          newNodes.push({ type: "text", value: text.slice(lastIndex) });
        }

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

