import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import DemoWrapper from '../layout/DemoWrapper';

interface Point {
  x: number;
  y: number;
  id: number;
}

const PCADemo: React.FC = () => {
  // Generate a correlated point cloud
  const points: Point[] = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const u = (i / 30) * 400 - 200;
      const v = (Math.random() - 0.5) * 60;
      // Rotate cloud by 30 degrees
      const angle = 30 * (Math.PI / 180);
      return {
        x: 300 + u * Math.cos(angle) - v * Math.sin(angle),
        y: 200 + u * Math.sin(angle) + v * Math.cos(angle),
        id: i
      };
    });
  }, []);

  const [angleDeg, setAngleDeg] = useState(0);
  const containerRef = useRef<SVGSVGElement>(null);

  const angleRad = (angleDeg * Math.PI) / 180;
  const dir = { x: Math.cos(angleRad), y: Math.sin(angleRad) };

  const projections = useMemo(() => {
    return points.map(p => {
      // Vector from center
      const dx = p.x - 300;
      const dy = p.y - 200;
      // Scalar projection
      const dot = dx * dir.x + dy * dir.y;
      return {
        x: 300 + dot * dir.x,
        y: 200 + dot * dir.y,
        dist: dot
      };
    });
  }, [points, dir]);

  const variance = useMemo(() => {
    const mean = projections.reduce((acc, p) => acc + p.dist, 0) / projections.length;
    return projections.reduce((acc, p) => acc + Math.pow(p.dist - mean, 2), 0) / 1000;
  }, [projections]);

  const controls = (
    <>
      <div>
        <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Achsen-Winkel
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">{angleDeg}°</span>
        </label>
        <input 
          type="range" min="0" max="180" step="1" 
          value={angleDeg} 
          onChange={(e) => setAngleDeg(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Erklärte Varianz</div>
        <div className="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center px-1">
          <motion.div 
            className="h-4 bg-indigo-500 rounded-md shadow-sm shadow-indigo-500/20"
            initial={false}
            animate={{ width: `${Math.min(variance / 2.5, 100)}%` }}
          />
        </div>
        <p className="text-[9px] text-slate-400 italic">
          Je länger der Balken, desto mehr Information bleibt bei dieser Projektion erhalten.
        </p>
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
        <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1">Ziel</div>
        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 leading-relaxed">
          Finde den Winkel, bei dem die Punkte am weitesten auf der Achse verteilt sind.
        </p>
      </div>
    </>
  );

  return (
    <DemoWrapper 
      title="PCA: Information durch Projektion"
      controls={controls}
      tooltip={<><strong>Dimension Reduction:</strong> Wir projizieren 2D-Punkte auf eine 1D-Linie. Die PCA findet die Linie, auf der die Punkte am meisten "Platz" haben (maximale Varianz).</>}
    >
      <div className="w-full relative group rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900">
        <svg 
          ref={containerRef}
          viewBox="0 0 600 400" 
          className="w-full aspect-[3/2] relative z-10"
        >
          {/* Grid lines */}
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 120} y1="0" x2={i * 120} y2="400" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1={i * 80} x2="600" y2={i * 80} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
            </React.Fragment>
          ))}

          {/* Projection Lines */}
          {points.map((p, i) => (
            <line
              key={`proj-${i}`}
              x1={p.x} y1={p.y} x2={projections[i].x} y2={projections[i].y}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.5"
            />
          ))}

          {/* Principal Axis */}
          <line 
            x1={300 - dir.x * 300} y1={200 - dir.y * 300}
            x2={300 + dir.x * 300} y2={200 + dir.y * 300}
            stroke="#6366f1"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* Original Points */}
          {points.map((p, i) => (
            <circle
              key={`orig-${i}`}
              cx={p.x} cy={p.y} r="3"
              fill="#94a3b8"
              opacity="0.6"
            />
          ))}

          {/* Projected Points */}
          {projections.map((p, i) => (
            <motion.circle
              key={`proj-dot-${i}`}
              cx={p.x} cy={p.y} r="4"
              fill="#6366f1"
              className="drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]"
            />
          ))}
        </svg>
      </div>
    </DemoWrapper>
  );
};

export default PCADemo;
