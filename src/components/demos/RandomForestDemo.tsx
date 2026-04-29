import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoWrapper from '../layout/DemoWrapper';

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
  id: number;
}

interface TreeNode {
  type: 'split' | 'leaf';
  splitDim?: 'x' | 'y';
  splitVal?: number;
  label?: 0 | 1;
  left?: TreeNode;
  right?: TreeNode;
}

const RandomForestDemo: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 50, y: 50, label: 0, id: 1 },
    { x: 100, y: 80, label: 0, id: 2 },
    { x: 500, y: 300, label: 1, id: 3 },
    { x: 550, y: 350, label: 1, id: 4 },
    { x: 100, y: 300, label: 0, id: 5 },
    { x: 500, y: 80, label: 1, id: 6 },
  ]);
  const [numTrees, setNumTrees] = useState(5);
  const [maxDepth, setMaxDepth] = useState(3);
  const [hoverProb, setHoverProb] = useState<number | null>(null);
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
      return { type: 'leaf', label: count0 >= count1 ? 0 : 1 };
    }
    return {
      type: 'split',
      splitDim: split.dim,
      splitVal: split.val,
      left: buildTree(subset.filter(p => p[split.dim] <= split.val), depth + 1),
      right: buildTree(subset.filter(p => p[split.dim] > split.val), depth + 1),
    };
  };

  const forest = useMemo(() => {
    if (points.length < 2) return [];
    return Array.from({ length: numTrees }).map(() => {
      const sample = Array.from({ length: points.length }).map(() => points[Math.floor(Math.random() * points.length)]);
      return buildTree(sample, 0);
    });
  }, [points, numTrees, maxDepth]);

  const predict = (tree: TreeNode, x: number, y: number): 0 | 1 => {
    if (tree.type === 'leaf') return tree.label!;
    const val = tree.splitDim === 'x' ? x : y;
    return predict(val <= tree.splitVal! ? tree.left! : tree.right!, x, y);
  };

  const forestPredict = (x: number, y: number) => {
    if (forest.length === 0) return 0.5;
    const votes = forest.map(tree => predict(tree, x, y));
    return votes.reduce((a: number, b) => a + b, 0) / forest.length;
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    const label = e.shiftKey ? 0 : 1; // Default Red (1), Shift Blue (0)
    setPoints([...points, { x, y, label, id: Date.now() }]);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    setHoverProb(forestPredict(x, y));
  };

  const controls = (
    <>
      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Anzahl Bäume
          <span className="text-orange-600 dark:text-orange-400 font-mono">{numTrees}</span>
        </label>
        <input
          type="range" min="1" max="20" step="1"
          value={numTrees}
          onChange={(e) => setNumTrees(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Baumtiefe
          <span className="text-orange-600 dark:text-orange-400 font-mono">{maxDepth}</span>
        </label>
        <input
          type="range" min="1" max="5" step="1"
          value={maxDepth}
          onChange={(e) => setMaxDepth(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ensemble Voting</h5>
        {hoverProb !== null ? (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-blue-500 font-bold">Klasse 0: {((1 - hoverProb) * 100).toFixed(0)}%</span>
              <span className="text-red-500 font-bold">Klasse 1: {(hoverProb * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(1 - hoverProb) * 100}%` }} />
              <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${hoverProb * 100}%` }} />
            </div>
            <p className="text-[9px] text-slate-400 italic text-center">Live-Abstimmung an Cursor-Position</p>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-[10px] text-slate-400 italic">Bewege die Maus über den Wald</p>
          </div>
        )}
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
      title="Random Forest: Schwarm-Klassifikation"
      controls={controls}
      tooltip={<><strong>Ensemble Learning:</strong> Jeder Baum wird auf einer zufälligen Bootstrap-Stichprobe trainiert. Die Heatmap zeigt das gemittelte Wahrscheinlichkeitsfeld des gesamten Waldes.</>}
    >
      <div className="w-full relative group rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900">
        <svg
          ref={containerRef}
          viewBox="0 0 600 400"
          className="w-full aspect-[3/2] relative z-10 cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverProb(null)}
        >
          {/* Heatmap Grid */}
          {Array.from({ length: 30 }).map((_, i) =>
            Array.from({ length: 20 }).map((_, j) => {
              const x = i * 20 + 10;
              const y = j * 20 + 10;
              const prob = forestPredict(x, y);
              return (
                <rect
                  key={`${i}-${j}`}
                  x={i * 20} y={j * 20} width="20" height="20"
                  fill={prob > 0.5 ? '#ef4444' : '#3b82f6'}
                  fillOpacity={Math.abs(prob - 0.5) * 0.5}
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {[...Array(11)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 60} y1="0" x2={i * 60} y2="400" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/50" strokeWidth="1" />
              <line x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/50" strokeWidth="1" />
            </React.Fragment>
          ))}

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

export default RandomForestDemo;
