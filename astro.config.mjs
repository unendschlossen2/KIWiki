// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { katexMacros } from './src/config/katex-macros.js';

import { remarkCrossReference } from './src/plugins/remark-cross-reference.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const comp = (/** @type {string} */ name) => path.resolve(__dirname, 'src/components', name).replace(/\\/g, '/');


/** @param {Record<string, string>} components */
function remarkComponentAutoImport(components) {
  /** @param {any} tree */
  return (tree) => {
    const imports = Object.entries(components).map(([name, path]) => ({
      type: 'mdxjsEsm',
      value: `import ${name} from "${path}";`,
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ImportDeclaration',
              specifiers: [
                {
                  type: 'ImportDefaultSpecifier',
                  local: { type: 'Identifier', name: name }
                }
              ],
              source: { type: 'Literal', value: path }
            }
          ]
        }
      }
    }));
    tree.children.unshift(...imports);
  };
}

function remarkDirectiveTransformer() {
  /** @param {any} tree */
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const name = node.name.toLowerCase();

        const levelMap = /** @type {const} */ ({
          beginner: 'easy',
          easy: 'easy',
          intermediate: 'medium',
          medium: 'medium',
          advanced: 'hard',
          hard: 'hard',
        });

        if (name in levelMap) {
          const level = levelMap[/** @type {keyof typeof levelMap} */ (name)];

          // Transform to MDX JSX node to ensure it's treated as a component
          node.type = 'mdxJsxFlowElement';
          node.name = 'DifficultyContent';
          node.attributes = [
            { type: 'mdxJsxAttribute', name: 'level', value: level }
          ];
          // Children remain the same
        }
      }
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://unendschlossen2.github.io',
  base: '/KIWiki',
  integrations: [
    react(),
    mdx({
      remarkPlugins: [
        remarkCrossReference,
        remarkDirective,
        remarkDirectiveTransformer,
        [remarkComponentAutoImport, {
          DifficultyContent: comp('DifficultyContentWrapper.astro'),
          InfoBox: comp('InfoBox.tsx'),
          DifficultySelector: comp('DifficultySelector.tsx'),
          ActivationDemo: comp('ActivationDemo.tsx'),
          TableOfContents: comp('TableOfContents.tsx'),
        }],
        remarkMath
      ],
      rehypePlugins: [[rehypeKatex, { macros: katexMacros }]],
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});