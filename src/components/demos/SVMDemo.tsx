import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoWrapper from '../layout/DemoWrapper';

interface Point {
  x: number;
  y: number;
  label: 1 | -1;
  id: number;
}

const SVMDemo: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 150, y: 150, label: -1, id: 1 },
    { x: 200, y: 100, label: -1, id: 2 },
    { x: 400, y: 300, label: 1, id: 3 },
    { x: 450, y: 250, label: 1, id: 4 },
  ]);
  
  const [w, setW] = useState({ x: 0.01, y: 0.01 });
  const [b, setB] = useState(0);
  const [C, setC] = useState(1.0);
  const containerRef = useRef<SVGSVGElement>(null);

  // Training loop using Gradient Descent on Hinge Loss
  useEffect(() => {
    if (points.length < 2) return;

    let currentW = { ...w };
    let currentB = b;
    const lr = 0.001;
    const iterations = 500;

    for (let i = 0; i < iterations; i++) {
      let dw = { x: currentW.x, y: currentW.y }; // Regularization part (1/2 |w|^2)
      let db = 0;

      points.forEach(p => {
        // Normalize coordinates to -1 to 1 for stability
        const nx = (p.x - 300) / 300;
        const ny = (p.y - 200) / 200;
        
        const condition = p.label * (currentW.x * nx + currentW.y * ny + currentB);
        
        if (condition < 1) {
          dw.x -= C * p.label * nx;
          dw.y -= C * p.label * ny;
          db -= C * p.label;
        }
      });

      currentW.x -= lr * dw.x;
      currentW.y -= lr * dw.y;
      currentB -= lr * db;
    }

    setW(currentW);
    setB(currentB);
  }, [points, C]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    const label = e.shiftKey ? -1 : 1; 
    setPoints([...points, { x, y, label, id: Date.now() }]);
  };

  const invertPoint = (id: number) => {
    setPoints(points.map(p => p.id === id ? { ...p, label: p.label === 1 ? -1 : 1 } : p));
  };

  // Calculate line points for SVG
  const getLineData = (offset: number = 0) => {
    // Equation: w.x * nx + w.y * ny + b = offset
    // nx = (x-300)/300, ny = (y-200)/200
    // w.x * (x-300)/300 + w.y * (y-200)/200 + b = offset
    
    const { x: wx, y: wy } = w;
    if (Math.abs(wy) < 0.0001) return null;

    const f = (x: number) => {
      const nx = (x - 300) / 300;
      const ny = (offset - b - wx * nx) / wy;
      return ny * 200 + 200;
    };

    return { x1: 0, y1: f(0), x2: 600, y2: f(600) };
  };

  const boundary = getLineData(0);
  const marginPlus = getLineData(1);
  const marginMinus = getLineData(-1);

  const isSupportVector = (p: Point) => {
    const nx = (p.x - 300) / 300;
    const ny = (p.y - 200) / 200;
    const val = p.label * (w.x * nx + w.y * ny + b);
    return Math.abs(val - 1) < 0.05;
  };

  const controls = (
    <>
      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Härte (C)
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">{C.toFixed(1)}</span>
        </label>
        <input 
          type="range" min="0.1" max="10" step="0.1" 
          value={C} 
          onChange={(e) => setC(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <p className="mt-2 text-[9px] text-slate-400 italic leading-relaxed">
          Höheres C erzwingt einen kleineren Margin bei weniger Fehlern.
        </p>
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
          Tipp: Punkte direkt an den Linien sind die <strong>Support Vektoren</strong>.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <button 
          onClick={() => setPoints([])}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
        >
          Reset
        </button>
      </div>
    </>
  );

  return (
    <DemoWrapper 
      title="SVM: Margin-Maximierung"
      controls={controls}
      tooltip={<><strong>Optimal Hyperplane:</strong> Die SVM sucht die Linie, die den größten freien Raum (Margin) zwischen den Klassen lässt. Nur die Punkte am Rand beeinflussen das Ergebnis.</>}
    >
      <div className="w-full relative group rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900">
        <svg 
          ref={containerRef}
          viewBox="0 0 600 400" 
          className="w-full aspect-[3/2] relative z-10 cursor-crosshair"
          onClick={handleCanvasClick}
        >
          {/* Grid lines */}
          {[...Array(11)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 60} y1="0" x2={i * 60} y2="400" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            </React.Fragment>
          ))}

          {/* Margins */}
          {marginPlus && (
            <motion.line 
              animate={{ x1: marginPlus.x1, y1: marginPlus.y1, x2: marginPlus.x2, y2: marginPlus.y2 }}
              stroke="#6366f1" strokeWidth="1" strokeDasharray="5 5" opacity="0.4" 
            />
          )}
          {marginMinus && (
            <motion.line 
              animate={{ x1: marginMinus.x1, y1: marginMinus.y1, x2: marginMinus.x2, y2: marginMinus.y2 }}
              stroke="#6366f1" strokeWidth="1" strokeDasharray="5 5" opacity="0.4" 
            />
          )}

          {/* Boundary */}
          {boundary && (
            <motion.line 
              animate={{ x1: boundary.x1, y1: boundary.y1, x2: boundary.x2, y2: boundary.y2 }}
              stroke="#6366f1" strokeWidth="3" 
              className="drop-shadow-sm"
            />
          )}

          {/* Points */}
          <AnimatePresence>
            {points.map((p) => {
              const isSV = isSupportVector(p);
              return (
                <g key={p.id}>
                  {isSV && (
                    <motion.circle 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 0.3, scale: 1 }}
                      cx={p.x} cy={p.y} r="12" 
                      fill="none" stroke={p.label === -1 ? "#3b82f6" : "#ef4444"} strokeWidth="2"
                    />
                  )}
                  <motion.circle
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 6, opacity: 1 }}
                    cx={p.x}
                    cy={p.y}
                    fill={p.label === -1 ? "#3b82f6" : "#ef4444"}
                    className="drop-shadow-md stroke-white dark:stroke-slate-900 cursor-pointer"
                    strokeWidth="2"
                    whileHover={{ scale: 1.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      invertPoint(p.id);
                    }}
                  />
                </g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>
    </DemoWrapper>
  );
};

export default SVMDemo;
