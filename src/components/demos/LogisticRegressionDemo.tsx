import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoWrapper from '../design/DemoWrapper';
import MathField from '../design/Math';

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
  id: number;
}

const LogisticRegressionDemo: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 100, y: 100, label: 0, id: 1 },
    { x: 150, y: 150, label: 0, id: 2 },
    { x: 450, y: 300, label: 1, id: 3 },
    { x: 500, y: 350, label: 1, id: 4 },
  ]);
  const [w1, setW1] = useState(0.01);
  const [w2, setW2] = useState(0.01);
  const [b, setB] = useState(-5);
  const [learningRate, setLearningRate] = useState(0.1);
  const [iterations, setIterations] = useState(0);
  const containerRef = useRef<SVGSVGElement>(null);

  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

  const predict = (x: number, y: number) => {
    const nx = x / 60;
    const ny = y / 40;
    return sigmoid(w1 * nx + w2 * ny + b);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    const label = e.shiftKey ? 0 : 1; // Default Red (1), Shift Blue (0)
    setPoints([...points, { x, y, label, id: Date.now() }]);
  };

  const train = () => {
    if (points.length === 0) return;
    let dw1 = 0;
    let dw2 = 0;
    let db = 0;
    const n = points.length;
    points.forEach(p => {
      const nx = p.x / 60;
      const ny = p.y / 40;
      const prediction = predict(p.x, p.y);
      const error = prediction - p.label;
      dw1 += error * nx;
      dw2 += error * ny;
      db += error;
    });
    setW1(prev => prev - (dw1 / n) * learningRate);
    setW2(prev => prev - (dw2 / n) * learningRate);
    setB(prev => prev - (db / n) * learningRate);
    setIterations(prev => prev + 1);
  };

  const reset = () => {
    setPoints([]);
    setW1(0.01);
    setW2(0.01);
    setB(-5);
    setIterations(0);
  };

  const getLinePoints = () => {
    if (Math.abs(w1) < 0.0001 && Math.abs(w2) < 0.0001) return { x1: -100, y1: -100, x2: -100, y2: -100 };
    if (Math.abs(w2) > Math.abs(w1)) {
      const ny0 = (-w1 * 0 - b) / w2;
      const ny1 = (-w1 * 10 - b) / w2;
      return { x1: 0, y1: ny0 * 40, x2: 600, y2: ny1 * 40 };
    } else {
      const nx0 = (-w2 * 0 - b) / w1;
      const nx1 = (-w2 * 10 - b) / w1;
      return { x1: nx0 * 60, y1: 0, x2: nx1 * 60, y2: 400 };
    }
  };

  const boundary = getLinePoints();

  const controls = (
    <>
      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Lernrate
          <span className="text-purple-600 dark:text-purple-400 font-mono">{learningRate}</span>
        </label>
        <input 
          type="range" min="0.01" max="1" step="0.01" 
          value={learningRate} 
          onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">Status</div>
        <div className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
          Iterationen: {iterations}
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="text-[10px] text-slate-500 font-medium space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Klasse 0
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Shift+Klick</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Klasse 1
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Klick</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
          Tipp: Klicke auf Punkte, um ihre Farbe zu invertieren.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <button 
          onClick={train}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95"
        >
          Schritt trainieren
        </button>
        <button 
          onClick={reset}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
        >
          Zurücksetzen
        </button>
      </div>
    </>
  );

  return (
    <DemoWrapper 
      title="Interaktive Logistische Regression"
      controls={controls}
      tooltip={<><strong>Binäre Klassifikation:</strong> Das Modell lernt eine Trennlinie zwischen zwei Klassen. Das Hintergrundfeld zeigt die Wahrscheinlichkeit: Blau für Klasse 0, Rot für Klasse 1.</>}
    >
      <div className="w-full max-w-[450px] mb-6 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-center items-center shadow-inner overflow-hidden">
        <div className="scale-90 origin-center">
          <MathField math={`P(y=1) = \\sigma(${w1.toFixed(1)}x_1 + ${w2.toFixed(1)}x_2 + ${b.toFixed(1)})`} />
        </div>
      </div>

      <div className="w-full relative group rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-500"
          style={{
            background: `linear-gradient(${Math.atan2(w2, w1) * (180/Math.PI) + 90}deg, #3b82f6, #ef4444)`
          }}
        />
        
        <svg 
          ref={containerRef}
          viewBox="0 0 600 400" 
          className="w-full aspect-[3/2] relative z-10 cursor-crosshair"
          onClick={handleCanvasClick}
        >
          {[...Array(11)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 60} y1="0" x2={i * 60} y2="400" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            </React.Fragment>
          ))}

          <motion.line 
            animate={{ x1: boundary.x1, y1: boundary.y1, x2: boundary.x2, y2: boundary.y2 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            stroke="#9333ea" 
            strokeWidth="3" 
            strokeDasharray="8 4"
            className="drop-shadow-[0_0_8px_rgba(147,51,234,0.3)]"
          />

          <AnimatePresence>
            {points.map((p) => (
              <motion.circle
                key={p.id}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 7, opacity: 1 }}
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

export default LogisticRegressionDemo;
