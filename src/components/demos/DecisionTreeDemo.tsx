import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoWrapper from '../design/DemoWrapper';

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
  id: number;
}

interface TreeNode {
  id: string;
  type: 'split' | 'leaf';
  splitDim?: 'x' | 'y';
  splitVal?: number;
  label?: 0 | 1;
  left?: TreeNode;
  right?: TreeNode;
  depth: number;
}

const DecisionTreeDemo: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 50, y: 50, label: 0, id: 1 },
    { x: 100, y: 80, label: 0, id: 2 },
    { x: 500, y: 300, label: 1, id: 3 },
    { x: 550, y: 350, label: 1, id: 4 },
    { x: 100, y: 300, label: 0, id: 5 },
    { x: 500, y: 80, label: 1, id: 6 },
  ]);
  const [maxDepth, setMaxDepth] = useState(2);
  const containerRef = useRef<SVGSVGElement>(null);

  const calculateGini = (subset: Point[]) => {
    if (subset.length === 0) return 0;
    const count0 = subset.filter(p => p.label === 0).length;
    const count1 = subset.length - count0;
    const p0 = count0 / subset.length;
    const p1 = count1 / subset.length;
    return 1 - (p0 * p0 + p1 * p1);
  };

  const findBestSplit = (subset: Point[]): { dim: 'x' | 'y', val: number, gain: number } | null => {
    if (subset.length <= 1) return null;
    const baseGini = calculateGini(subset);
    let bestSplit: { dim: 'x' | 'y', val: number, gain: number } | null = null;
    let maxGain = -1;

    ['x', 'y'].forEach(dim => {
      const values = subset.map(p => p[dim as 'x' | 'y']).sort((a, b) => a - b);
      for (let i = 0; i < values.length - 1; i++) {
        const splitVal = (values[i] + values[i + 1]) / 2;
        const left = subset.filter(p => p[dim as 'x' | 'y'] <= splitVal);
        const right = subset.filter(p => p[dim as 'x' | 'y'] > splitVal);
        if (left.length === 0 || right.length === 0) continue;
        const giniLeft = calculateGini(left);
        const giniRight = calculateGini(right);
        const weightedGini = (left.length / subset.length) * giniLeft + (right.length / subset.length) * giniRight;
        const gain = baseGini - weightedGini;
        if (gain > maxGain) {
          maxGain = gain;
          bestSplit = { dim: dim as 'x' | 'y', val: splitVal, gain };
        }
      }
    });
    return bestSplit;
  };

  const buildTree = (subset: Point[], depth: number): TreeNode => {
    const split = depth < maxDepth ? findBestSplit(subset) : null;
    if (!split || split.gain <= 0) {
      const count0 = subset.filter(p => p.label === 0).length;
      const count1 = subset.length - count0;
      return { id: Math.random().toString(), type: 'leaf', label: count0 >= count1 ? 0 : 1, depth };
    }
    const leftPoints = subset.filter(p => p[split.dim] <= split.val);
    const rightPoints = subset.filter(p => p[split.dim] > split.val);
    return {
      id: Math.random().toString(),
      type: 'split',
      splitDim: split.dim,
      splitVal: split.val,
      left: buildTree(leftPoints, depth + 1),
      right: buildTree(rightPoints, depth + 1),
      depth
    };
  };

  const tree = useMemo(() => buildTree(points, 0), [points, maxDepth]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    const label = e.shiftKey ? 0 : 1; // Default Red (1), Shift Blue (0)
    setPoints([...points, { x, y, label, id: Date.now() }]);
  };

  const TreeViz: React.FC<{ node: TreeNode, x: number, y: number, spread: number, level: number }> = ({ node, x, y, spread, level }) => {
    const vSpace = 20;
    return (
      <g>
        {node.type === 'split' && (
          <>
            <line x1={x} y1={y} x2={x - spread} y2={y + vSpace} stroke="#cbd5e1" strokeWidth="1" />
            <line x1={x} y1={y} x2={x + spread} y2={y + vSpace} stroke="#cbd5e1" strokeWidth="1" />
            <TreeViz node={node.left!} x={x - spread} y={y + vSpace} spread={spread * 0.48} level={level + 1} />
            <TreeViz node={node.right!} x={x + spread} y={y + vSpace} spread={spread * 0.48} level={level + 1} />
          </>
        )}
        <circle
          cx={x} cy={y} r="6" // Smaller radius
          fill={node.type === 'leaf' ? (node.label === 0 ? "#3b82f6" : "#ef4444") : "#ffffff"}
          stroke={node.type === 'split' ? "#94a3b8" : "none"}
          strokeWidth="1"
        />
        {node.type === 'split' && (
          <text x={x} y={y + 1.5} textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#64748b" pointerEvents="none">
            {node.splitDim?.toUpperCase()}
          </text>
        )}
      </g>
    );
  };

  const renderSplits = (node: TreeNode, xRange: [number, number], yRange: [number, number]) => {
    if (node.type === 'leaf') return null;
    const { splitDim, splitVal, left, right } = node;
    const isX = splitDim === 'x';
    return (
      <React.Fragment key={node.id}>
        <line
          x1={isX ? splitVal : xRange[0]}
          y1={isX ? yRange[0] : splitVal}
          x2={isX ? splitVal : xRange[1]}
          y2={isX ? yRange[1] : splitVal}
          stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3"
          strokeOpacity="0.6"
        />
        {isX ? (
          <>{renderSplits(left!, [xRange[0], splitVal!], yRange)}{renderSplits(right!, [splitVal!, xRange[1]], yRange)}</>
        ) : (
          <>{renderSplits(left!, xRange, [yRange[0], splitVal!])}{renderSplits(right!, xRange, [splitVal!, yRange[1]])}</>
        )}
      </React.Fragment>
    );
  };

  const controls = (
    <>
      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Maximale Tiefe
          <span className="text-emerald-600 dark:text-emerald-400 font-mono">{maxDepth}</span>
        </label>
        <input
          type="range" min="1" max="5" step="1"
          value={maxDepth}
          onChange={(e) => setMaxDepth(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center overflow-hidden h-48">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-4 self-start tracking-widest">Baum-Struktur</h5>
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <TreeViz node={tree} x={100} y={10} spread={65} level={0} />
        </svg>
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> <span>Klasse 0 (Klick)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" /> <span>Klasse 1 (Shift+Klick)</span>
          </div>
        </div>
        <button
          onClick={() => setPoints([])}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
        >
          Zurücksetzen
        </button>
      </div>
    </>
  );

  return (
    <DemoWrapper
      title="Entscheidungsbaum-Visualisierung"
      controls={controls}
      tooltip={<><strong>Recursive Partitioning:</strong> Der Baum teilt den Raum so auf, dass in jedem Bereich möglichst viele Punkte der gleichen Klasse liegen. Der Gini-Index misst dabei die Reinheit.</>}
    >
      <div className="w-full relative group">
        <svg
          ref={containerRef}
          viewBox="0 0 600 400"
          className="w-full aspect-[3/2] bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-crosshair shadow-inner"
          onClick={handleCanvasClick}
          onContextMenu={(e) => e.preventDefault()}
        >
          {[...Array(11)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 60} y1="0" x2={i * 60} y2="400" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            </React.Fragment>
          ))}

          {renderSplits(tree, [0, 600], [0, 400])}

          <AnimatePresence>
            {points.map((p) => (
              <motion.circle
                key={p.id}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 6, opacity: 1 }}
                cx={p.x}
                cy={p.y}
                fill={p.label === 0 ? "#3b82f6" : "#ef4444"}
                className="drop-shadow-md stroke-white dark:stroke-slate-900 cursor-pointer"
                strokeWidth="2"
                whileHover={{ scale: 1.5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPoints(points.map(pt => pt.id === p.id ? { ...pt, label: pt.label === 0 ? 1 : 0 as any } : pt));
                }}
              />
            ))}
          </AnimatePresence>
        </svg>
      </div>
    </DemoWrapper>
  );
};

export default DecisionTreeDemo;
