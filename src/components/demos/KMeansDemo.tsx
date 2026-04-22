import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoWrapper from '../design/DemoWrapper';

interface Point {
  x: number;
  y: number;
  id: number;
  cluster: number | null;
}

interface Centroid {
  x: number;
  y: number;
  color: string;
}

const KMeansDemo: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 100, y: 100, cluster: null, id: 1 },
    { x: 120, y: 150, cluster: null, id: 2 },
    { x: 150, y: 110, cluster: null, id: 3 },
    { x: 450, y: 300, cluster: null, id: 4 },
    { x: 480, y: 350, cluster: null, id: 5 },
    { x: 500, y: 310, cluster: null, id: 6 },
    { x: 100, y: 300, cluster: null, id: 7 },
    { x: 130, y: 320, cluster: null, id: 8 },
    { x: 110, y: 350, cluster: null, id: 9 },
  ]);

  const [centroids, setCentroids] = useState<Centroid[]>([
    { x: 100, y: 200, color: "#3b82f6" },
    { x: 300, y: 200, color: "#ef4444" },
    { x: 500, y: 200, color: "#10b981" },
  ]);

  const [stepType, setStepType] = useState<'assign' | 'update'>('assign');
  const [iterations, setIterations] = useState(0);
  const containerRef = useRef<SVGSVGElement>(null);

  const runStep = () => {
    if (stepType === 'assign') {
      // Assign points to nearest centroid
      const newPoints = points.map(p => {
        let minDist = Infinity;
        let closestIdx = 0;
        centroids.forEach((c, idx) => {
          const d = Math.sqrt(Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2));
          if (d < minDist) {
            minDist = d;
            closestIdx = idx;
          }
        });
        return { ...p, cluster: closestIdx };
      });
      setPoints(newPoints);
      setStepType('update');
    } else {
      // Update centroids to mean of assigned points
      const newCentroids = centroids.map((c, idx) => {
        const assignedPoints = points.filter(p => p.cluster === idx);
        if (assignedPoints.length === 0) return c;
        const avgX = assignedPoints.reduce((acc, p) => acc + p.x, 0) / assignedPoints.length;
        const avgY = assignedPoints.reduce((acc, p) => acc + p.y, 0) / assignedPoints.length;
        return { ...c, x: avgX, y: avgY };
      });
      setCentroids(newCentroids);
      setStepType('assign');
      setIterations(prev => prev + 1);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    setPoints([...points, { x, y, cluster: null, id: Date.now() }]);
  };

  const reset = () => {
    setPoints(points.map(p => ({ ...p, cluster: null })));
    setCentroids([
      { x: Math.random() * 600, y: Math.random() * 400, color: "#3b82f6" },
      { x: Math.random() * 600, y: Math.random() * 400, color: "#ef4444" },
      { x: Math.random() * 600, y: Math.random() * 400, color: "#10b981" },
    ]);
    setStepType('assign');
    setIterations(0);
  };

  const controls = (
    <>
      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Status</div>
          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Nächster Schritt: 
            <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px]">
              {stepType === 'assign' ? "PUNKTE ZUWEISEN" : "ZENTROIDEN UPDATEN"}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          Iterationen: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{iterations}</span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Legende</div>
        {centroids.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
            Cluster {i + 1}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <button 
          onClick={runStep}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          Schritt ausführen
        </button>
        <button 
          onClick={reset}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
        >
          Reset / Neue Zentroiden
        </button>
      </div>
    </>
  );

  return (
    <DemoWrapper 
      title="K-Means: Das Wandern der Zentroiden"
      controls={controls}
      tooltip={<><strong>Iterative Optimization:</strong> Abwechselnd werden Punkte ihrem nächsten Zentrum zugewiesen und dann die Zentren in die Mitte ihrer Gruppe verschoben.</>}
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

          {/* Links to Centroids (during assign step) */}
          {stepType === 'update' && points.map(p => p.cluster !== null && (
            <motion.line
              key={`link-${p.id}`}
              x1={p.x} y1={p.y} x2={centroids[p.cluster].x} y2={centroids[p.cluster].y}
              stroke={centroids[p.cluster].color}
              strokeWidth="1"
              opacity="0.2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
            />
          ))}

          {/* Points */}
          <AnimatePresence>
            {points.map((p) => (
              <motion.circle
                key={p.id}
                initial={{ r: 0 }}
                animate={{ r: 6 }}
                cx={p.x}
                cy={p.y}
                fill={p.cluster !== null ? centroids[p.cluster].color : "#94a3b8"}
                className="drop-shadow-md stroke-white dark:stroke-slate-900"
                strokeWidth="2"
              />
            ))}
          </AnimatePresence>

          {/* Centroids */}
          {centroids.map((c, i) => (
            <motion.g 
              key={`centroid-${i}`}
              animate={{ x: c.x, y: c.y }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
            >
              <circle r="12" fill={c.color} opacity="0.2" />
              <path 
                d="M -8 0 L 8 0 M 0 -8 L 0 8" 
                stroke={c.color} 
                strokeWidth="3" 
                strokeLinecap="round"
              />
            </motion.g>
          ))}
        </svg>
      </div>
    </DemoWrapper>
  );
};

export default KMeansDemo;
