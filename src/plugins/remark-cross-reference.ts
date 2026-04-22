import { visitParents, SKIP } from "unist-util-visit-parents";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.resolve(process.cwd(), "src/content/articles");
const BASE_URL = "/KIWiki/articles";

function slugify(text: string): string {
  return text
    .replace(/\\/g, "/") // Normalize backslashes to forward slashes
    .split("/")
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[äöüÄÖÜß]/g, (c) =>
          (({ ä: "ae", ö: "oe", ü: "ue", Ä: "ae", Ö: "oe", Ü: "ue", ß: "ss" } as Record<string, string>)[c] ?? c)
        )
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .join("/");
}

function buildDictionary() {
  const dict: { keyword: string; url: string }[] = [];

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith(".md") || file.endsWith(".mdx")) {
        if (file.startsWith("_")) continue;

        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const { data } = matter(content);

          const relPath = path.relative(CONTENT_DIR, fullPath);
          const slug = slugify(relPath.replace(/\.mdx?$/, ""));
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
  dict.sort((a, b) => b.keyword.length - a.keyword.length);

  return dict.map((entry) => {
    const escapedKeyword = entry.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<=^|[^a-zA-Z0-9äöüÄÖÜß])(${escapedKeyword})(?=[^a-zA-Z0-9äöüÄÖÜß]|$)`, "iu");
    return { ...entry, regex };
  });
}

export function remarkCrossReference() {
  return (tree: any, file: any) => {
    const dict = buildDictionary();
    if (dict.length === 0) return;

    let currentUrl = "";
    if (file.path) {
      const relPath = path.relative(CONTENT_DIR, file.path);
      const slug = slugify(relPath.replace(/\.mdx?$/, ""));
      currentUrl = `${BASE_URL}/${slug}`;
    }

    const ignoredParents = new Set([
      "link",
      "linkReference",
      "heading",
      "inlineCode",
      "code",
      "html",
    ]);

    visitParents(tree, "text", (node, ancestors) => {
      if (ancestors.some((ancestor: any) => ignoredParents.has(ancestor.type))) {
        return;
      }

      const parent = ancestors[ancestors.length - 1] as any;
      if (!parent || !parent.children) return;

      const text = String(node.value);
      const matches: { start: number; end: number; entry: any }[] = [];
      const occupiedRanges: [number, number][] = [];

      for (const entry of dict) {
        if (entry.url === currentUrl) continue;

        const regex = new RegExp(entry.regex.source, entry.regex.flags + "g");
        let match;
        while ((match = regex.exec(text)) !== null) {
          const indexOffset = match.index;
          const matchLength = match[0].length;
          const matchEnd = indexOffset + matchLength;

          const isOverlapping = occupiedRanges.some(([start, end]) =>
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
        matches.sort((a, b) => a.start - b.start);
        const newNodes = [];
        let lastIndex = 0;

        for (const match of matches) {
          if (match.start > lastIndex) {
            newNodes.push({ type: "text", value: text.slice(lastIndex, match.start) });
          }

          newNodes.push({
            type: "link",
            url: encodeURI(match.entry.url),
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

        if (lastIndex < text.length) {
          newNodes.push({ type: "text", value: text.slice(lastIndex) });
        }

        const parentIndex = parent.children.indexOf(node);
        if (parentIndex !== -1) {
          parent.children.splice(parentIndex, 1, ...newNodes);
          return [SKIP, parentIndex + newNodes.length];
        }
      }
    });
  };
}
