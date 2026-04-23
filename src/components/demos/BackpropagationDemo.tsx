import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import DemoWrapper from '../design/DemoWrapper';

// ─── Math helpers ──────────────────────────────────────────────────────
const sigmoid = (x: number) => 1 / (1 + Math.exp(-Math.max(-12, Math.min(12, x))));
const sigmoidDeriv = (a: number) => a * (1 - a);
const randW = () => (Math.random() - 0.5) * 2.5;

// XOR-like dataset
const DATASET = [
  { input: [0, 0], target: 0 },
  { input: [0, 1], target: 1 },
  { input: [1, 0], target: 1 },
  { input: [1, 1], target: 0 },
];

const LAYERS = [2, 3, 1];
const LAYER_LABELS = ['Input', 'Hidden', 'Output'];

export default function BackpropagationDemo() {
  // Network state
  const [epoch, setEpoch] = useState(0);
  const [lr, setLr] = useState(1.5);
  const [weightsState, setWeightsState] = useState<number[][][]>(() => initWeights());
  const [biasesState, setBiasesState] = useState<number[][]>(() => initBiases());
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'forward' | 'loss' | 'backward' | 'update'>('idle');
  const [isAutoTraining, setIsAutoTraining] = useState(false);
  const [gradients, setGradients] = useState<number[][][]>([]);
  const intervalRef = useRef<any>(null);

  function initWeights() {
    const w: number[][][] = [];
    for (let l = 0; l < LAYERS.length - 1; l++) {
      const lw: number[][] = [];
      for (let i = 0; i < LAYERS[l]; i++) {
        const nw: number[] = [];
        for (let j = 0; j < LAYERS[l + 1]; j++) nw.push(randW());
        lw.push(nw);
      }
      w.push(lw);
    }
    return w;
  }
  function initBiases() {
    const b: number[][] = [];
    for (let l = 1; l < LAYERS.length; l++) {
      b.push(Array.from({ length: LAYERS[l] }, () => (Math.random() - 0.5) * 0.5));
    }
    return b;
  }

  // Forward pass (for a single sample)
  const forwardPass = useCallback((inp: number[], w: number[][][], b: number[][]) => {
    const acts: number[][] = [inp];
    const zs: number[][] = [];
    for (let l = 0; l < w.length; l++) {
      const prev = acts[acts.length - 1];
      const z: number[] = [];
      const a: number[] = [];
      for (let j = 0; j < LAYERS[l + 1]; j++) {
        let sum = b[l][j];
        for (let i = 0; i < prev.length; i++) sum += prev[i] * w[l][i][j];
        z.push(sum);
        a.push(sigmoid(sum));
      }
      zs.push(z);
      acts.push(a);
    }
    return { acts, zs };
  }, []);

  // Backward pass
  const backwardPass = useCallback((acts: number[][], target: number, w: number[][][]) => {
    const deltas: number[][] = [];
    const grads: number[][][] = [];

    // Output layer delta
    const outputAct = acts[acts.length - 1][0];
    const outputDelta = (outputAct - target) * sigmoidDeriv(outputAct);
    deltas[w.length - 1] = [outputDelta];

    // Hidden layers
    for (let l = w.length - 2; l >= 0; l--) {
      const nextDeltas = deltas[l + 1];
      const layerDeltas: number[] = [];
      for (let i = 0; i < LAYERS[l + 1]; i++) {
        let errSum = 0;
        for (let j = 0; j < LAYERS[l + 2]; j++) {
          errSum += w[l + 1][i][j] * nextDeltas[j];
        }
        layerDeltas.push(errSum * sigmoidDeriv(acts[l + 1][i]));
      }
      deltas[l] = layerDeltas;
    }

    // Compute gradients for each weight
    for (let l = 0; l < w.length; l++) {
      const layerGrads: number[][] = [];
      for (let i = 0; i < LAYERS[l]; i++) {
        const nodeGrads: number[] = [];
        for (let j = 0; j < LAYERS[l + 1]; j++) {
          nodeGrads.push(deltas[l][j] * acts[l][i]);
        }
        layerGrads.push(nodeGrads);
      }
      grads.push(layerGrads);
    }

    return { deltas, grads };
  }, []);

  // Current sample visualization data
  const currentSample = DATASET[sampleIdx];
  const { acts: currentActs } = forwardPass(currentSample.input, weightsState, biasesState);
  const currentLoss = 0.5 * Math.pow(currentActs[LAYERS.length - 1][0] - currentSample.target, 2);

  // Full epoch loss
  const fullLoss = useMemo(() => {
    let total = 0;
    for (const sample of DATASET) {
      const { acts } = forwardPass(sample.input, weightsState, biasesState);
      const pred = acts[LAYERS.length - 1][0];
      total += 0.5 * (pred - sample.target) ** 2;
    }
    return total / DATASET.length;
  }, [weightsState, biasesState, forwardPass]);

  // Single training step (one full epoch)
  const trainEpoch = useCallback(() => {
    const newW = weightsState.map(l => l.map(n => [...n]));
    const newB = biasesState.map(l => [...l]);
    let allGrads: number[][][] = weightsState.map(l => l.map(n => n.map(() => 0)));

    for (const sample of DATASET) {
      const { acts } = forwardPass(sample.input, newW, newB);
      const { grads } = backwardPass(acts, sample.target, newW);

      for (let l = 0; l < newW.length; l++) {
        for (let i = 0; i < newW[l].length; i++) {
          for (let j = 0; j < newW[l][i].length; j++) {
            allGrads[l][i][j] += grads[l][i][j];
            newW[l][i][j] -= lr * grads[l][i][j] / DATASET.length;
          }
        }
        // Also update biases
        const { acts: bActs } = forwardPass(sample.input, weightsState, biasesState);
        const { deltas } = backwardPass(bActs, sample.target, weightsState);
        for (let j = 0; j < newB[l].length; j++) {
          newB[l][j] -= lr * deltas[l][j] / DATASET.length;
        }
      }
    }

    // Average gradients for visualization
    allGrads = allGrads.map(l => l.map(n => n.map(g => g / DATASET.length)));
    setGradients(allGrads);
    setWeightsState(newW);
    setBiasesState(newB);
    setEpoch(e => e + 1);

    // Compute new loss
    let totalLoss = 0;
    for (const sample of DATASET) {
      const { acts } = forwardPass(sample.input, newW, newB);
      totalLoss += 0.5 * (acts[LAYERS.length - 1][0] - sample.target) ** 2;
    }
    setLossHistory(prev => [...prev.slice(-60), totalLoss / DATASET.length]);
  }, [weightsState, biasesState, lr, forwardPass, backwardPass]);

  // Animated step
  const animatedStep = useCallback(() => {
    setPhase('forward');
    setTimeout(() => setPhase('loss'), 350);
    setTimeout(() => setPhase('backward'), 700);
    setTimeout(() => {
      trainEpoch();
      setPhase('update');
    }, 1050);
    setTimeout(() => setPhase('idle'), 1400);
  }, [trainEpoch]);

  // Auto training
  useEffect(() => {
    if (isAutoTraining) {
      intervalRef.current = setInterval(() => {
        trainEpoch();
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoTraining, trainEpoch]);

  const reset = () => {
    setWeightsState(initWeights());
    setBiasesState(initBiases());
    setEpoch(0);
    setLossHistory([]);
    setGradients([]);
    setPhase('idle');
    setIsAutoTraining(false);
    setSampleIdx(0);
  };

  // Layout
  const W_SVG = 520, H_SVG = 300;
  const xPad = 80, yPad = 40;
  const layerSpacing = (W_SVG - xPad * 2) / (LAYERS.length - 1);

  const neuronPositions = useMemo(() => {
    const positions: { x: number; y: number }[][] = [];
    for (let l = 0; l < LAYERS.length; l++) {
      const size = LAYERS[l];
      const totalH = H_SVG - yPad * 2;
      const gap = totalH / (size + 1);
      const layer: { x: number; y: number }[] = [];
      for (let n = 0; n < size; n++) {
        layer.push({ x: xPad + l * layerSpacing, y: yPad + gap * (n + 1) });
      }
      positions.push(layer);
    }
    return positions;
  }, []);

  const getActivationColor = (val: number) => {
    const h = 240 - val * 120;
    return `hsl(${h}, 80%, ${50 + (1 - val) * 15}%)`;
  };

  const getGradientColor = (g: number) => {
    const absG = Math.min(Math.abs(g), 1);
    return g > 0
      ? `rgba(239, 68, 68, ${0.3 + absG * 0.7})` // red = increase
      : `rgba(34, 197, 94, ${0.3 + absG * 0.7})`; // green = decrease
  };

  const isBackward = phase === 'backward' || phase === 'update';

  // ─── Controls ──────────────────────────────────────────────
  const controls = (
    <>
      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Training</div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">Epoche</span>
          <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-lg">{epoch}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">Ø Loss</span>
          <span className={`font-mono font-bold text-sm ${fullLoss < 0.05 ? 'text-emerald-500' : fullLoss < 0.15 ? 'text-amber-500' : 'text-red-500'}`}>
            {fullLoss.toFixed(4)}
          </span>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold ${
          phase === 'idle' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' :
          phase === 'forward' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' :
          phase === 'loss' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
          phase === 'backward' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            phase !== 'idle' ? 'animate-pulse' : ''
          } ${
            phase === 'forward' ? 'bg-indigo-500' :
            phase === 'loss' ? 'bg-amber-500' :
            phase === 'backward' ? 'bg-red-500' :
            phase === 'update' ? 'bg-emerald-500' :
            'bg-slate-300'
          }`} />
          {phase === 'idle' ? 'Bereit' :
           phase === 'forward' ? '→ Forward Pass' :
           phase === 'loss' ? '⚠ Loss berechnen' :
           phase === 'backward' ? '← Backpropagation' :
           '✓ Gewichte aktualisiert'}
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Lernrate (η)</div>
        <input type="range" min="0.1" max="5" step="0.1" value={lr}
          onChange={e => setLr(parseFloat(e.target.value))}
          className="w-full accent-indigo-600 h-1.5" />
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-slate-400">0.1</span>
          <span className="text-indigo-600 font-bold">{lr.toFixed(1)}</span>
          <span className="text-red-400">5.0</span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Datensatz (XOR)</div>
        <div className="grid grid-cols-2 gap-1.5">
          {DATASET.map((s, i) => (
            <button key={i} onClick={() => setSampleIdx(i)}
              className={`text-[10px] font-mono py-1.5 px-2 rounded-lg border transition-all ${
                i === sampleIdx
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}>
              [{s.input.join(',')}]→{s.target}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={animatedStep} disabled={isAutoTraining}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm">
          Schritt lernen
        </button>
        <button onClick={() => setIsAutoTraining(!isAutoTraining)}
          className={`w-full py-2.5 ${isAutoTraining ? 'bg-red-500 hover:bg-red-400' : 'bg-emerald-600 hover:bg-emerald-500'} text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider active:scale-95`}>
          {isAutoTraining ? '■ Stoppen' : '▶ Auto-Training'}
        </button>
        <button onClick={reset}
          className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
          Reset
        </button>
      </div>
    </>
  );

  // ─── SVG Render ────────────────────────────────────────────
  return (
    <DemoWrapper
      title="Backpropagation — Fehler fließt zurück"
      controls={controls}
      tooltip={<><strong>Backpropagation:</strong> Beobachte, wie der Fehler (Loss) vom Output rückwärts durch das Netz fließt. <span style={{color:'#ef4444'}}>Rote</span> Linien zeigen Gewichte, die verkleinert werden. <span style={{color:'#22c55e'}}>Grüne</span> zeigen Gewichte, die vergrößert werden.</>}
    >
      <div className="w-full flex flex-col gap-4">
        {/* Network visualization */}
        <div className="w-full relative rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900 p-4 min-h-[320px] flex items-center justify-center">
          <svg viewBox={`0 0 ${W_SVG} ${H_SVG}`} className="w-full h-full max-h-[300px]" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arrowBack" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* Connections */}
            {weightsState.map((layer, lIdx) =>
              layer.map((node, nIdx) =>
                node.map((wVal, nextIdx) => {
                  const from = neuronPositions[lIdx][nIdx];
                  const to = neuronPositions[lIdx + 1][nextIdx];
                  const absW = Math.min(Math.abs(wVal), 2);
                  const opacity = 0.15 + (absW / 2) * 0.7;
                  const width = 0.5 + (absW / 2) * 3;
                  const strokeColor = isBackward && gradients[lIdx]?.[nIdx]?.[nextIdx] !== undefined
                    ? getGradientColor(gradients[lIdx][nIdx][nextIdx])
                    : wVal > 0
                      ? `rgba(99,102,241,${opacity})`
                      : `rgba(239,68,68,${opacity})`;

                  return (
                    <line key={`c-${lIdx}-${nIdx}-${nextIdx}`}
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={strokeColor}
                      strokeWidth={isBackward ? width + 1 : width}
                      style={{ transition: 'all 0.35s ease' }}
                    />
                  );
                })
              )
            )}

            {/* Backward flow arrows */}
            {isBackward && neuronPositions.slice(1).map((layer, lIdx) =>
              layer.map((pos, nIdx) => {
                const from = pos;
                const toPrev = neuronPositions[lIdx];
                return toPrev.map((prevPos, pIdx) => (
                  <line key={`arrow-${lIdx}-${nIdx}-${pIdx}`}
                    x1={from.x - 8} y1={from.y}
                    x2={prevPos.x + 20} y2={prevPos.y}
                    stroke="rgba(239,68,68,0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                    markerEnd="url(#arrowBack)"
                    className="animate-pulse"
                  />
                ));
              })
            )}

            {/* Neurons */}
            {neuronPositions.map((layer, lIdx) =>
              layer.map((pos, nIdx) => {
                const act = currentActs[lIdx]?.[nIdx] ?? 0.5;
                const r = 16;

                return (
                  <g key={`n-${lIdx}-${nIdx}`}>
                    <circle cx={pos.x} cy={pos.y} r={r + 4}
                      fill="none" stroke={getActivationColor(act)} strokeWidth="1.5" opacity="0.25"
                      style={{ transition: 'all 0.3s' }}
                    />
                    <circle cx={pos.x} cy={pos.y} r={r}
                      fill={getActivationColor(act)}
                      stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"
                      style={{ transition: 'all 0.3s' }}
                    />
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontWeight="800" fontSize="9"
                      style={{ pointerEvents: 'none' }}>
                      {act.toFixed(2)}
                    </text>
                  </g>
                );
              })
            )}

            {/* Labels */}
            {LAYER_LABELS.map((label, lIdx) => (
              <text key={`label-${lIdx}`}
                x={neuronPositions[lIdx][0].x} y={H_SVG - 8}
                textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700"
                style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >{label}</text>
            ))}

            {/* Target / prediction */}
            <g>
              <text x={W_SVG - 30} y={neuronPositions[LAYERS.length - 1][0].y - 28}
                textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">
                Ziel: {currentSample.target}
              </text>
              <text x={W_SVG - 30} y={neuronPositions[LAYERS.length - 1][0].y + 34}
                textAnchor="middle" fontSize="9" fontWeight="700"
                fill={currentLoss < 0.05 ? '#22c55e' : currentLoss < 0.15 ? '#f59e0b' : '#ef4444'}>
                Loss: {currentLoss.toFixed(3)}
              </text>
            </g>

            {/* Phase indicator arrow */}
            {phase === 'forward' && (
              <g className="animate-pulse">
                <line x1="60" y1="20" x2={W_SVG - 100} y2="20" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowBack)" />
                <text x={(W_SVG - 40) / 2} y="15" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="700">
                  Forward →
                </text>
              </g>
            )}
            {phase === 'backward' && (
              <g className="animate-pulse">
                <line x1={W_SVG - 100} y1="20" x2="60" y2="20" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowBack)" />
                <text x={(W_SVG - 40) / 2} y="15" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">
                  ← Backward
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Loss chart */}
        {lossHistory.length > 1 && (
          <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Lernverlauf (Loss über Epochen)</div>
            <svg viewBox="0 0 500 80" className="w-full h-16" preserveAspectRatio="none">
              {/* Grid */}
              <line x1="0" y1="0" x2="500" y2="0" stroke="#e2e8f0" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="500" y2="40" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4,3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#e2e8f0" strokeWidth="0.5" />

              {/* Line */}
              <path
                fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round"
                d={lossHistory.map((l, i) => {
                  const xPos = (i / Math.max(lossHistory.length - 1, 1)) * 500;
                  const currentMax = Math.max(...lossHistory);
                  const displayMax = Math.max(currentMax * 1.1, 0.1);
                  const yPos = 75 - (l / displayMax) * 70;
                  return `${i === 0 ? 'M' : 'L'} ${xPos} ${yPos}`;
                }).join(' ')}
                style={{ transition: 'd 0.3s ease' }}
              />
              
              {/* Area fill */}
              <path
                fill="url(#lossGrad)" opacity="0.15"
                d={lossHistory.length > 0 ? (
                  `M 0 80 ` + lossHistory.map((l, i) => {
                    const xPos = (i / Math.max(lossHistory.length - 1, 1)) * 500;
                    const currentMax = Math.max(...lossHistory);
                    const displayMax = Math.max(currentMax * 1.1, 0.1);
                    const yPos = 75 - (l / displayMax) * 70;
                    return `L ${xPos} ${yPos}`;
                  }).join(' ') + ` L 500 80 Z`
                ) : ''}
                style={{ transition: 'd 0.3s ease' }}
              />
              <defs>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* XOR predictions table */}
        <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">Vorhersagen (XOR Problem)</div>
          <div className="grid grid-cols-4 gap-2">
            {DATASET.map((sample, i) => {
              const { acts } = forwardPass(sample.input, weightsState, biasesState);
              const pred = acts[LAYERS.length - 1][0];
              const correct = Math.abs(pred - sample.target) < 0.3;
              return (
                <div key={i} className={`p-2 rounded-lg border text-center ${
                  correct ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">[{sample.input.join(',')}]</div>
                  <div className={`text-sm font-black font-mono ${correct ? 'text-emerald-600' : 'text-red-500'}`}>
                    {pred.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-slate-400">Ziel: {sample.target}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DemoWrapper>
  );
}
