import React from 'react';
import katex from 'katex';
import { katexMacros } from '../../config/katex-macros.js';

interface MathProps {
  math: string;
  block?: boolean;
}

const Math: React.FC<MathProps> = ({ math, block = false }) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        macros: katexMacros,
      });
    } catch (e) {
      console.error('KaTeX error:', e);
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={block ? 'block my-4 overflow-x-auto' : 'inline-block'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Math;
