import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import DemoWrapper from '../design/DemoWrapper';

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
  id: number;
}

const KNNDemo: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 100, y: 100, label: 0, id: 1 },
    { x: 150, y: 200, label: 0, id: 2 },
    { x: 120, y: 150, label: 0, id: 3 },
    { x: 450, y: 300, label: 1, id: 4 },
    { x: 500, y: 250, label: 1, id: 5 },
    { x: 480, y: 350, label: 1, id: 6 },
    { x: 300, y: 200, label: 0, id: 7 },
    { x: 320, y: 250, label: 1, id: 8 },
  ]);
  
  const [k, setK] = useState(3);
  const [cursor, setCursor] = useState({ x: 300, y: 200 });
  const containerRef = useRef<SVGSVGElement>(null);

  const nearestNeighbors = useMemo(() => {
    return [...points]
      .map(p => ({
        ...p,
        dist: Math.sqrt(Math.pow(p.x - cursor.x, 2) + Math.pow(p.y - cursor.y, 2))
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k);
  }, [points, cursor, k]);

  const prediction = useMemo(() => {
    const votes0 = nearestNeighbors.filter(n => n.label === 0).length;
    const votes1 = nearestNeighbors.length - votes0;
    return votes1 > votes0 ? 1 : 0;
  }, [nearestNeighbors]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    setCursor({ x, y });
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    const label = e.shiftKey ? 0 : 1;
    setPoints([...points, { x, y, label, id: Date.now() }]);
  };

  const controls = (
    <>
      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Anzahl Nachbarn (k)
          <span className="text-purple-600 dark:text-purple-400 font-mono">{k}</span>
        </label>
        <input 
          type="range" min="1" max="9" step="2" 
          value={k} 
          onChange={(e) => setK(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <p className="mt-2 text-[9px] text-slate-400 italic">
          Nutze ein ungerades k für eindeutige Votings.
        </p>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-[10px] text-slate-400 uppercase font-bold mb-3 tracking-widest">Voting am Cursor</div>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
          {nearestNeighbors.map((n, i) => (
            <div key={i} className={`flex-1 ${n.label === 0 ? 'bg-blue-500' : 'bg-red-500'}`} />
          ))}
        </div>
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-blue-500">{nearestNeighbors.filter(n => n.label === 0).length} Stimmen</span>
          <span className="text-red-500">{nearestNeighbors.filter(n => n.label === 1).length} Stimmen</span>
        </div>
      </div>

      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/50">
        <div className="text-[10px] text-purple-500 font-bold uppercase tracking-widest mb-1">Resultat</div>
        <div className={`text-xl font-bold ${prediction === 0 ? 'text-blue-600' : 'text-red-600'}`}>
          Klasse {prediction} {prediction === 0 ? "(Blau)" : "(Rot)"}
        </div>
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
      title="k-NN: Räumliches Voting"
      controls={controls}
      tooltip={<><strong>Lazy Learning:</strong> Der violette Kreis sucht die k-nächsten Nachbarn. Die Mehrheitsfarbe bestimmt die Klassifikation an dieser Stelle.</>}
    >
      <div className="w-full relative group rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900">
        <svg 
          ref={containerRef}
          viewBox="0 0 600 400" 
          className="w-full aspect-[3/2] relative z-10 cursor-none"
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
        >
          {/* Grid lines */}
          {[...Array(11)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 60} y1="0" x2={i * 60} y2="400" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            </React.Fragment>
          ))}

          {/* Links to neighbors */}
          {nearestNeighbors.map((n, i) => (
            <motion.line
              key={`link-${n.id}`}
              initial={false}
              animate={{ x1: cursor.x, y1: cursor.y, x2: n.x, y2: n.y }}
              stroke={n.label === 0 ? "#3b82f6" : "#ef4444"}
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.3"
            />
          ))}

          {/* Points */}
          {points.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={nearestNeighbors.find(n => n.id === p.id) ? 8 : 6}
              fill={p.label === 0 ? "#3b82f6" : "#ef4444"}
              className={`drop-shadow-md stroke-white dark:stroke-slate-900 transition-all duration-300 ${nearestNeighbors.find(n => n.id === p.id) ? 'stroke-[3px]' : 'stroke-[2px]'}`}
            />
          ))}

          {/* Search Cursor */}
          <motion.circle
            animate={{ cx: cursor.x, cy: cursor.y }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            r="10"
            fill="none"
            stroke="#9333ea"
            strokeWidth="3"
            className="drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]"
          />
        </svg>
      </div>
    </DemoWrapper>
  );
};

export default KNNDemo;
