import { remarkCrossReference } from './src/plugins/remark-cross-reference.ts';

// Create a large mock AST
function createMockTree(numNodes: number) {
  const children = [];
  for (let i = 0; i < numNodes; i++) {
    children.push({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'This is a test paragraph containing some keywords like React, TypeScript, and Performance Optimization. It has enough text to simulate a real paragraph in a Markdown file. We repeat this many times.',
        }
      ]
    });
  }
  return {
    type: 'root',
    children
  };
}

const tree = createMockTree(30000); // 30,000 paragraphs

// Run the plugin
const plugin = remarkCrossReference();

// Run it multiple times to warm up JIT and get a stable average
const times = [];
for (let i = 0; i < 5; i++) {
  // Clone the tree since remark plugins mutate it
  const treeClone = JSON.parse(JSON.stringify(tree));

  const start = performance.now();
  // @ts-ignore
  plugin(treeClone, { path: '/fake/path.md' });
  const end = performance.now();

  times.push(end - start);
}

const avg = times.reduce((a, b) => a + b, 0) / times.length;
console.log(`Average execution time over 5 runs: ${avg.toFixed(2)} ms`);
