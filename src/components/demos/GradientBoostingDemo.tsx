import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import DemoWrapper from '../design/DemoWrapper';

interface Point {
  x: number;
  y: number;
}

const GradientBoostingDemo: React.FC = () => {
  // Generate stable noisy sine data
  const data: Point[] = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const x = (i / 40) * 600;
      const cleanY = 200 + Math.sin(x * 0.01) * 100;
      const noise = (Math.random() - 0.5) * 40;
      return { x, y: cleanY + noise };
    });
  }, []);

  const [iterations, setIterations] = useState(0);
  const [learningRate, setLearningRate] = useState(0.3);

  // State for the ensemble predictions at each data point
  const [predictions, setPredictions] = useState<number[]>(() => {
    const mean = data.reduce((acc, p) => acc + p.y, 0) / data.length;
    return data.map(() => mean);
  });

  // History of models (each model is a list of its predictions at data points)
  const [models, setModels] = useState<number[][]>([]);

  const residuals = useMemo(() => {
    return data.map((p, i) => p.y - predictions[i]);
  }, [data, predictions]);

  const mse = useMemo(() => {
    return (residuals.reduce((acc, r) => acc + r * r, 0) / data.length).toFixed(0);
  }, [residuals, data.length]);

  const step = () => {
    // 1. Train a "weak learner" (Decision Tree) on residuals
    // For simplicity in a 1D demo, we'll find the best split in X
    let bestSplit = { x: 300, leftVal: 0, rightVal: 0, error: Infinity };

    // Try multiple split points
    for (let s = 50; s < 550; s += 20) {
      const leftIndices = data.map((p, i) => p.x < s ? i : -1).filter(i => i !== -1);
      const rightIndices = data.map((p, i) => p.x >= s ? i : -1).filter(i => i !== -1);

      if (leftIndices.length === 0 || rightIndices.length === 0) continue;

      const leftMean = leftIndices.reduce((acc, idx) => acc + residuals[idx], 0) / leftIndices.length;
      const rightMean = rightIndices.reduce((acc, idx) => acc + residuals[idx], 0) / rightIndices.length;

      const error = leftIndices.reduce((acc, idx) => acc + Math.pow(residuals[idx] - leftMean, 2), 0) +
        rightIndices.reduce((acc, idx) => acc + Math.pow(residuals[idx] - rightMean, 2), 0);

      if (error < bestSplit.error) {
        bestSplit = { x: s, leftVal: leftMean, rightVal: rightMean, error };
      }
    }

    // 2. Add the predictions of this tree to our ensemble
    const newTreePredictions = data.map(p => (p.x < bestSplit.x ? bestSplit.leftVal : bestSplit.rightVal) * learningRate);

    setPredictions(prev => prev.map((p, i) => p + newTreePredictions[i]));
    setModels([...models, newTreePredictions]);
    setIterations(prev => prev + 1);
  };

  const reset = () => {
    const mean = data.reduce((acc, p) => acc + p.y, 0) / data.length;
    setPredictions(data.map(() => mean));
    setModels([]);
    setIterations(0);
  };

  const controls = (
    <>
      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Lernrate (η)
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">{learningRate}</span>
        </label>
        <input
          type="range" min="0.1" max="1" step="0.1"
          value={learningRate}
          onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Metriken</div>
        <div className="flex items-end gap-2">
          <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 leading-none">{mse}</div>
          <div className="text-[10px] text-slate-500 pb-1">MSE</div>
        </div>
        <div className="text-[10px] text-slate-500 font-medium">
          Iterationen: <span className="font-mono text-indigo-500">{iterations}</span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Legende</div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="w-3 h-0.5 bg-indigo-500" /> Ensemble-Vorhersage
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="w-3 h-2 bg-red-400/50" /> Residuen (Fehler)
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={step}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          Baum hinzufügen
        </button>
        <button
          onClick={reset}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
        >
          Reset
        </button>
      </div>
    </>
  );

  return (
    <DemoWrapper
      title="Gradient Boosting Visualizer"
      controls={controls}
      tooltip={<><strong>Sequentielles Lernen:</strong> Jeder neue Baum wird darauf trainiert, die blauen/roten Balken (Residuen) des vorherigen Zustands zu minimieren.</>}
    >
      <div className="w-full space-y-4">
        {/* Main Plot */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-inner">
          <svg viewBox="0 0 600 400" className="w-full aspect-[3/2]">
            {/* Grid */}
            {[...Array(6)].map((_, i) => (
              <line key={i} x1="0" y1={i * 80} x2="600" y2={i * 80} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
            ))}

            {/* Data Points */}
            {data.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-slate-400/50" />
            ))}

            {/* Ensemble Prediction Line */}
            <path
              d={`M ${data.map((p, i) => `${p.x},${predictions[i]}`).join(' L ')}`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          </svg>
        </div>

        {/* Residuals Plot */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden h-32 shadow-inner">
          <div className="absolute top-2 left-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Residuen (Aktueller Fehler)</div>
          <svg viewBox="0 0 600 100" className="w-full h-full">
            <line x1="0" y1="50" x2="600" y2="50" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            {residuals.map((r, i) => (
              <motion.rect
                key={i}
                initial={false}
                animate={{
                  y: r > 0 ? 50 - Math.abs(r) / 4 : 50,
                  height: Math.abs(r) / 4
                }}
                x={data[i].x - 2}
                width="4"
                fill={r > 0 ? "#ef4444" : "#3b82f6"}
                fillOpacity="0.5"
                className="transition-colors duration-500"
              />
            ))}
          </svg>
        </div>
      </div>
    </DemoWrapper>
  );
};

export default GradientBoostingDemo;
