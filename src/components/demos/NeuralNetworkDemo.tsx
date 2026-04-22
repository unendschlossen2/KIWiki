import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoWrapper from '../design/DemoWrapper';

const NeuralNetworkDemo: React.FC = () => {
  const layers = [2, 4, 4, 1]; // Input, Hidden 1, Hidden 2, Output
  const [weights, setWeights] = useState<number[][][]>([]);
  const [activations, setActivations] = useState<number[][]>([]);
  const [iterations, setIterations] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  // Initialize weights randomly
  useEffect(() => {
    const initialWeights = [];
    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights = [];
      for (let j = 0; j < layers[i]; j++) {
        const nodeWeights = [];
        for (let k = 0; k < layers[i+1]; k++) {
          nodeWeights.push((Math.random() - 0.5) * 2);
        }
        layerWeights.push(nodeWeights);
      }
      initialWeights.push(layerWeights);
    }
    setWeights(initialWeights);
    
    const initialActivations = layers.map(size => Array(size).fill(0.5));
    setActivations(initialActivations);
  }, []);

  const step = () => {
    // Simulate "training" by randomly perturbing weights in a meaningful way
    // and pulsing activations
    setWeights(prev => prev.map(layer => 
      layer.map(node => 
        node.map(w => w + (Math.random() - 0.5) * 0.1)
      )
    ));
    
    setActivations(prev => prev.map(layer => 
      layer.map(() => Math.random())
    ));
    
    setIterations(prev => prev + 1);
  };

  useEffect(() => {
    let interval: any;
    if (isTraining) {
      interval = setInterval(step, 100);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  const controls = (
    <>
      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Training Status</div>
        <div className="text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
          Epochen: {iterations}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTraining ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-[10px] text-slate-500 font-medium uppercase">{isTraining ? "Training läuft..." : "Bereit"}</span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Legende</div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="w-3 h-0.5 bg-indigo-500" /> Starke Verbindung (Positiv)
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="w-3 h-0.5 bg-red-400" /> Starke Verbindung (Negativ)
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <button 
          onClick={() => setIsTraining(!isTraining)}
          className={`w-full py-3 ${isTraining ? 'bg-red-500 hover:bg-red-400' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl font-bold transition-all shadow-lg active:scale-95`}
        >
          {isTraining ? "Training Stoppen" : "Gewichte trainieren"}
        </button>
        <button 
          onClick={() => {
            setIterations(0);
            setIsTraining(false);
          }}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
        >
          Reset
        </button>
      </div>
    </>
  );

  const getWeightColor = (w: number) => {
    if (w > 0) return `rgba(99, 102, 241, ${Math.min(Math.abs(w), 1)})`; // Indigo
    return `rgba(239, 68, 68, ${Math.min(Math.abs(w), 1)})`; // Red
  };

  return (
    <DemoWrapper 
      title="Neuronales Netz Visualizer"
      controls={controls}
      tooltip={<><strong>Backpropagation:</strong> Das Netz lernt, indem es die Gewichte (Linien) so anpasst, dass der Fehler minimiert wird. Dicke Linien stehen für einflussreiche Verbindungen.</>}
    >
      <div className="w-full relative group rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900 p-8 h-[400px] flex items-center justify-center">
        <svg viewBox="0 0 600 400" className="w-full h-full overflow-visible">
          {/* Weights (Lines) */}
          {weights.length > 0 && weights.map((layer, lIdx) => 
            layer.map((node, nIdx) => 
              node.map((wVal, nextNIdx) => {
                const x1 = 100 + lIdx * 133;
                const y1 = 200 - (layers[lIdx] - 1) * 35 + nIdx * 70;
                const x2 = 100 + (lIdx + 1) * 133;
                const y2 = 200 - (layers[lIdx + 1] - 1) * 35 + nextNIdx * 70;
                return (
                  <motion.line
                    key={`w-${lIdx}-${nIdx}-${nextNIdx}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={getWeightColor(wVal)}
                    strokeWidth={1 + Math.abs(wVal) * 3}
                    initial={false}
                  />
                );
              })
            )
          )}

          {/* Neurons (Circles) */}
          {layers.map((size, lIdx) => 
            Array.from({ length: size }).map((_, nIdx) => {
              const x = 100 + lIdx * 133;
              const y = 200 - (size - 1) * 35 + nIdx * 70;
              const activation = activations[lIdx] ? activations[lIdx][nIdx] : 0.5;
              return (
                <g key={`n-${lIdx}-${nIdx}`}>
                  <motion.circle
                    cx={x} cy={y} r="18"
                    fill={isTraining ? "#fff" : "#fff"}
                    className="stroke-slate-200 dark:stroke-slate-700 shadow-lg"
                    strokeWidth="4"
                  />
                  <motion.circle
                    animate={{ r: isTraining ? 4 + activation * 10 : 8 }}
                    cx={x} cy={y}
                    fill="#6366f1"
                    className="opacity-80"
                  />
                </g>
              );
            })
          )}

          {/* Labels */}
          <text x="100" y="380" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest">Input</text>
          <text x="233" y="380" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest">Hidden 1</text>
          <text x="366" y="380" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest">Hidden 2</text>
          <text x="500" y="380" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest">Output</text>
        </svg>
      </div>
    </DemoWrapper>
  );
};

export default NeuralNetworkDemo;
