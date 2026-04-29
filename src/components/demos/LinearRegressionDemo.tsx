import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoWrapper from '../layout/DemoWrapper';
import MathField from '../ui/Math';

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
  id: number;
}

const LinearRegressionDemo: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 100, y: 300, label: 1, id: 1 },
    { x: 200, y: 250, label: 1, id: 2 },
    { x: 400, y: 150, label: 1, id: 3 },
    { x: 500, y: 100, label: 1, id: 4 },
  ]);
  const [w, setW] = useState(0);
  const [b, setB] = useState(0.125);
  const [learningRate, setLearningRate] = useState(0.01);
  const [iterations, setIterations] = useState(0);
  const [history, setHistory] = useState<{w: number, b: number}[]>([]);
  const containerRef = useRef<SVGSVGElement>(null);

  const normalize = (p: Point) => ({
    x: p.x / 600,
    y: (400 - p.y) / 400
  });

  const denormalizeY = (y: number) => 400 - (y * 400);

  const calculateMSE = () => {
    if (points.length === 0) return 0;
    const error = points.reduce((acc, p) => {
      const { x, y } = normalize(p);
      const prediction = w * x + b;
      return acc + Math.pow(prediction - y, 2);
    }, 0);
    return (error / points.length).toFixed(4);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    const label = e.shiftKey ? 0 : 1; // Default Red (1), Shift Blue (0)
    setPoints([...points, { x, y, label, id: Date.now() }]);
  };

  const invertPoint = (id: number) => {
    setPoints(points.map(p => p.id === id ? { ...p, label: p.label === 0 ? 1 : 0 } : p));
  };

  const stepGradientDescent = () => {
    if (points.length === 0) return;
    let dw = 0;
    let db = 0;
    const n = points.length;
    points.forEach(p => {
      const { x, y } = normalize(p);
      const prediction = w * x + b;
      const diff = prediction - y;
      dw += diff * x;
      db += diff;
    });
    setHistory(prev => [{w, b}, ...prev].slice(0, 5));
    setW(prevW => prevW - (dw / n) * learningRate * 10);
    setB(prevB => prevB - (db / n) * learningRate * 10);
    setIterations(prev => prev + 1);
  };

  const reset = () => {
    setPoints([]);
    setW(0);
    setB(0.125);
    setIterations(0);
    setHistory([]);
  };

  const lineY1 = denormalizeY(w * 0 + b);
  const lineY2 = denormalizeY(w * 1 + b);

  const controls = (
    <>
      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Lernrate
          <span className="text-blue-600 dark:text-blue-400 font-mono">{learningRate}</span>
        </label>
        <input 
          type="range" min="0.001" max="0.1" step="0.001" 
          value={learningRate} 
          onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Fehler (MSE)</div>
        <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
          {calculateMSE()}
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-medium">
          Iterationen: {iterations}
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Konzept</div>
        <div className="text-[11px] text-slate-500 leading-relaxed italic">
          Die <strong className="text-indigo-500">Lernrate</strong> bestimmt die Schrittweite. 
          Ist sie zu klein, dauert das Lernen ewig. Ist sie zu groß, "hüpft" die Gerade über das Ziel hinaus.
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <button 
          onClick={stepGradientDescent}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          Lernschritt
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
      title="Interaktive Lineare Regression"
      controls={controls}
      tooltip={<><strong>Gradient Descent live:</strong> Klicke in das Feld, um Datenpunkte zu setzen. Das Modell versucht, die Gerade so zu legen, dass der quadratische Fehler (MSE) minimal wird.</>}
    >
      <div className="w-full max-w-[400px] mb-6 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-center items-center shadow-inner">
        <div className="scale-90 origin-center">
          <MathField math={`\\hat{y} = ${w.toFixed(2)}x + ${(b * 400).toFixed(0)}`} />
        </div>
      </div>

      <div className="w-full relative group">
        <svg 
          ref={containerRef}
          viewBox="0 0 600 400" 
          className="w-full aspect-[3/2] bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-crosshair shadow-inner"
          onClick={handleCanvasClick}
        >
          {[...Array(11)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 60} y1="0" x2={i * 60} y2="400" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            </React.Fragment>
          ))}

          {/* Historical Lines */}
          {history.map((h, i) => (
            <line
              key={i}
              x1="0" y1={denormalizeY(h.w * 0 + h.b)}
              x2="600" y2={denormalizeY(h.w * 1 + h.b)}
              stroke="currentColor"
              className="text-indigo-400/20 dark:text-indigo-500/10"
              strokeWidth="2"
            />
          ))}

          <motion.line 
            animate={{ x1: 0, y1: lineY1, x2: 600, y2: lineY2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            stroke="#6366f1" 
            strokeWidth="4" 
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />

          <AnimatePresence>
            {points.map((p) => (
              <motion.circle
                key={p.id}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 6, opacity: 1 }}
                cx={p.x}
                cy={p.y}
                fill={p.label === 1 ? "#ef4444" : "#3b82f6"}
                className="drop-shadow-md stroke-white dark:stroke-slate-900 cursor-pointer"
                strokeWidth="2"
                whileHover={{ scale: 1.5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  invertPoint(p.id);
                }}
              />
            ))}
          </AnimatePresence>
        </svg>
      </div>
    </DemoWrapper>
  );
};

export default LinearRegressionDemo;
