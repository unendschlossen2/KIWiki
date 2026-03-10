/**
 * Centralized KaTeX macros for the entire wiki.
 * Add new macros here and they will be available in every MDX file.
 *
 * Usage in MDX:  $\loss$  →  renders as  ℒ
 */
export const katexMacros = {
  '\\R': '\\mathbb{R}',
  '\\N': '\\mathbb{N}',
  '\\loss': '\\mathcal{L}',
  '\\grad': '\\nabla',
  '\\sigmoid': '\\sigma',
  '\\softmax': '\\text{softmax}',
  '\\relu': '\\text{ReLU}',
  '\\argmax': '\\operatorname{argmax}',
  '\\argmin': '\\operatorname{argmin}',
  '\\xvec': '\\mathbf{x}',
  '\\wvec': '\\mathbf{w}',
  '\\bvec': '\\mathbf{b}',
};
