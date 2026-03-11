# KIWiki — Full Project Review Prompt

You are reviewing **KIWiki**, an educational wiki about Artificial Intelligence built for Jade University of Applied Sciences (JadeHS). Your job is to perform a thorough analysis of the codebase and produce a detailed report covering bugs, architectural issues, code quality, performance, accessibility, and actionable improvements.

---

## Project Overview

KIWiki is a statically-generated wiki built with **Astro 5**, **React 19**, **Tailwind CSS 4**, and **MDX**. It is deployed to GitHub Pages at the base path `/KIWiki`. Articles are written in `.mdx` files inside `src/content/articles/`, organized by category subdirectories.

### Key Features to Review

1. **Difficulty System** — Articles use `:::beginner`, `:::medium`, `:::advanced` directives (via `remark-directive`) to conditionally show content based on the user's selected difficulty. Visibility is handled entirely via CSS (`data-difficulty` attribute on `<html>`, set via an inline script and persisted in `localStorage`). The `DifficultySelector` React component in the navbar lets users switch levels. Review for: race conditions with View Transitions, correct CSS specificity, edge cases where content could flash or duplicate.

2. **Automated Cross-Referencing** — A custom Remark plugin (`src/plugins/remark-cross-reference.ts`) scans all articles at build time and automatically links keywords (titles + aliases from frontmatter) to their corresponding articles. It avoids self-linking and skips headings, links, and code blocks. Review for: performance with many articles, regex edge cases, potential for broken links, handling of special characters in titles.

3. **Command Palette Search** — A React-based search modal (`src/components/SearchModal.tsx`) powered by `fuse.js`. The search index is generated at build time via an API endpoint (`src/pages/api/search.json.ts`). Opened via `Ctrl+K` or a navbar button. Review for: accessibility (focus trapping, ARIA attributes, keyboard navigation), index freshness, edge cases with empty collections.

4. **View Transitions** — Astro's `<ViewTransitions />` is used for smooth client-side navigation. This interacts with React component hydration, localStorage persistence, and inline scripts. Review for: memory leaks from orphaned event listeners, script re-execution behavior, component remounting issues.

5. **Content Schema & Configuration** — Articles use a Zod schema defined in `src/content/config.ts` with fields like `title`, `description`, `category`, `difficulty`, and `aliases`. Category icons are mapped in `src/config/categories.ts`. A shared `slugifyCategory` utility lives in `src/utils/slugify.ts`. Review for: schema completeness, validation gaps, unused fields.

6. **Layout & Styling** — The main layout (`src/layouts/Layout.astro`) includes a sticky navbar, collapsible sidebar (`src/components/Sidebar.astro`), a table of contents (`src/components/TableOfContents.tsx`), and a footer. Styling uses Tailwind CSS 4 with `@tailwindcss/typography` and custom CSS variables for theming. Review for: responsive design issues, CSS specificity conflicts, unused styles, accessibility.

7. **Interactive Components** — Includes `ActivationDemo.tsx` (an interactive neuron visualization), `InfoBox.tsx`, and `DifficultyContent.tsx`. These are auto-imported into MDX via a custom Remark plugin in `astro.config.mjs`. Review for: hydration issues, component API consistency, error boundaries.

---

## Directory Structure

```
src/
├── components/        # React (.tsx) and Astro (.astro) components
├── config/            # Category icons, KaTeX macros
├── content/
│   ├── articles/      # MDX articles organized by category subdirs
│   └── config.ts      # Zod content schema
├── layouts/           # Layout.astro (main layout)
├── pages/
│   ├── api/           # search.json.ts endpoint
│   ├── articles/      # Dynamic article routes
│   ├── category/      # Category listing pages
│   ├── 404.astro      # Not found page
│   ├── index.astro    # Landing page
│   └── ueber.mdx      # About page
├── plugins/           # remark-cross-reference.ts
├── styles/            # global.css
└── utils/             # slugify.ts
public/
├── assets/            # Logo (logo.png)
└── favicon.png
astro.config.mjs       # Astro config with all Remark/Rehype plugins
```

---

## What to Analyze

### 🔴 Critical (Bugs & Breakage)
- **Build errors**: Does the project build cleanly with `npm run build`? Are there TypeScript errors?
- **Broken routes**: Do all dynamic routes (`[...slug].astro`, `[category].astro`) resolve correctly?
- **Data integrity**: Does the search index include all articles? Does the cross-referencing plugin handle edge cases (empty content, missing frontmatter, special characters)?
- **Hydration mismatches**: Do React components SSR correctly and hydrate without errors?
- **View Transitions bugs**: Does state (difficulty, search modal, scroll position) persist correctly across navigations?

### 🟡 Important (Code Quality & Architecture)
- **Dead code**: Are there unused imports, components, utilities, or config entries?
- **Duplicated logic**: Is any logic copy-pasted across files that should be shared?
- **Error handling**: Are there unhandled promise rejections, missing try/catches, or silent failures?
- **Type safety**: Are there `any` types that should be properly typed? Missing interfaces?
- **Dependency audit**: Are all `package.json` dependencies actually used? Are any outdated or have known vulnerabilities?
- **Configuration consistency**: Is the `base: '/KIWiki'` path hardcoded in places where it should use Astro's `import.meta.env.BASE_URL`?

### 🟢 Improvements (UX, Performance, DX)
- **Accessibility (a11y)**: Proper ARIA labels, focus management, color contrast, screen reader support, keyboard navigation throughout.
- **Performance**: Unnecessary re-renders in React components, large bundle sizes, unoptimized images, missing lazy loading.
- **SEO**: Meta tags, Open Graph, structured data, canonical URLs, sitemap generation.
- **Mobile responsiveness**: Test all layouts at 320px, 768px, and 1024px breakpoints.
- **Developer experience**: Is the project easy to understand for a new contributor? Are there missing README instructions, unclear naming conventions, or undocumented features?
- **Content authoring DX**: Is it easy for a non-developer to add a new article? What could go wrong?

### 🔵 Bonus
- **Security**: XSS vectors in search, cross-referencing, or user-controlled content.
- **Internationalization**: The site is in German — are there any hardcoded strings that should be in a config?
- **Testing**: Are there any tests? What tests should exist?
- **CI/CD**: Is the GitHub Pages deployment pipeline robust?

---

## Output Format

Produce a structured report with the following sections:

1. **Executive Summary** — 3-5 sentence overview of project health.
2. **Critical Issues** — Bugs that break functionality. Include file paths, line numbers, and suggested fixes.
3. **Code Quality Issues** — Architectural problems, dead code, type safety gaps. Prioritized by impact.
4. **Improvements** — UX, performance, accessibility, and DX suggestions. Categorized by effort (quick wins vs. larger refactors).
5. **Positive Observations** — What's done well and should be preserved.
6. **Recommended Next Steps** — Top 5 prioritized action items.

For each issue, use this format:
```
**[SEVERITY] Title**
📁 File(s): `path/to/file.ts`
📝 Description: What's wrong and why it matters.
✅ Suggested Fix: Concrete code change or approach.
```

---

## Important Context

- The project uses Tailwind CSS **v4** (not v3). The `@plugin` and `@custom-variant` directives in `global.css` are valid Tailwind v4 syntax — do NOT flag them as errors.
- `@nanostores/persistent` and `nanostores` are listed in `package.json` but may no longer be actively used after the difficulty system was refactored to use direct `localStorage`. Verify and flag if they should be removed.
- The `DifficultyContent.tsx` React component may be orphaned (replaced by `DifficultyContentWrapper.astro`). Verify.
- The `difficultyStore.ts` nanostore may also be orphaned. Verify.
- The cross-referencing plugin uses `gray-matter` to parse frontmatter at build time, independent of Astro's content layer. This is intentional but could potentially cause inconsistencies.
- KaTeX is loaded via CDN (`katex.min.css`). Math rendering uses `remark-math` + `rehype-katex` with custom macros from `src/config/katex-macros.js`.
- The site is deployed to GitHub Pages with base path `/KIWiki`. All internal links must use this prefix.
