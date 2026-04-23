import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import DemoWrapper from '../design/DemoWrapper';

// ─── Helpers ───────────────────────────────────────────────────────────
const sigmoid = (x: number) => 1 / (1 + Math.exp(-Math.max(-12, Math.min(12, x))));

interface NeuronPos { x: number; y: number; layer: number; idx: number; }

// ─── Hand-crafted weights for pedagogical correctness ──────────────────
// These weights are designed so that:
// - "Risky" preset yields output < 0.5 (denied)
// - "Rich & Safe" preset yields output > 0.5 (approved)
// The network learns intuitive credit-risk features.

const FIXED_WEIGHTS: number[][][] = [
  // Layer 0: Input (5) -> Hidden 1 (8)
  // Each input i connects to hidden neuron j with weight[i][j]
  [
    [8, 0, 0, 0, 0, 4, -4, 3],   // Input 0: Ersparnisse
    [0, 8, 0, 0, 0, 4, -4, 3],   // Input 1: Einkommen
    [0, 0, 8, 0, 0, 4, -4, 3],   // Input 2: Kreditscore
    [0, 0, 0, 4, 0, 2, -2, 1],   // Input 3: Alter
    [0, 0, 0, 0, 8, 4, -4, 3],   // Input 4: Sicherheiten
  ],
  // Layer 1: Hidden 1 (8) -> Hidden 2 (6)
  [
    [4, 0, 0, 2, 2, 0],   // H1_0: Ersparnis-Detektor
    [4, 0, 0, 2, 2, 0],   // H1_1: Einkommens-Detektor
    [0, 4, 0, 2, 2, 0],   // H1_2: Kreditscore-Detektor
    [0, 0, 0, 0, 2, 0],   // H1_3: Alters-Detektor
    [0, 4, 0, 2, 2, 0],   // H1_4: Sicherheiten-Detektor
    [0, 0, 4, 0, 2, 3],   // H1_5: Gesamt-Güte
    [0, 0, 0, -6, -4, -3],// H1_6: Risiko-Detektor (negativ!)
    [0, 0, 4, 0, 2, 3],   // H1_7: Ausgewogenheits-Mixer
  ],
  // Layer 2: Hidden 2 (6) -> Output (1)
  [
    [2],   // H2_0: Vermögens-Aggregator
    [2],   // H2_1: Kreditwürdigkeit
    [2],   // H2_2: Gesamt-Score A
    [2],   // H2_3: Konservativer Score
    [2],   // H2_4: Risiko-abwägend
    [2],   // H2_5: Final-Mixer
  ]
];

const FIXED_BIASES: number[][] = [
  // Hidden 1 biases
  [-4, -4, -4, -2, -4, -8, 6, -5],
  // Hidden 2 biases
  [-3, -3, -3, -1, -2, -2],
  // Output bias
  [-4]
];

// ─── Component ─────────────────────────────────────────────────────────
const NeuralNetworkDemo: React.FC = () => {
  const LAYERS = [5, 8, 6, 1];
  const LAYER_LABELS = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
  const NEURON_LABELS = [
    ['Ersparnisse', 'Einkommen', 'Kreditscore', 'Alter', 'Sicherheiten'],
    ['Ersparnis-Det.', 'Einkommens-Det.', 'Kreditscore-Det.', 'Alters-Det.', 'Sicherheiten-Det.', 'Gesamt-Güte', 'Risiko-Det.', 'Balance-Mixer'],
    ['Vermögens-Agg.', 'Kreditwürdigkeit', 'Gesamt-Score A', 'Konservativ', 'Risiko-abwägend', 'Final-Mixer'],
    ['Kredit-Entscheidung']
  ];

  // Preset scenarios — guaranteed to produce sensible results
  const PRESETS = [
    { name: '🎯 Ausgewogen', values: [0.5, 0.5, 0.7, 0.4, 0.5] },
    { name: '💰 Reich & Sicher', values: [0.9, 0.9, 0.95, 0.5, 0.9] },
    { name: '⚠️ Riskant', values: [0.1, 0.2, 0.3, 0.3, 0.1] },
    { name: '👴 Senior', values: [0.7, 0.3, 0.8, 0.9, 0.5] },
    { name: '📈 Aufsteiger', values: [0.2, 0.8, 0.6, 0.2, 0.3] },
  ];

  // State
  const [inputs, setInputs] = useState<number[]>([0.6, 0.4, 0.8, 0.3, 0.5]);
  const [hoveredNeuron, setHoveredNeuron] = useState<string | null>(null);
  const [selectedNeuron, setSelectedNeuron] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState(-1);
  const [showWeights, setShowWeights] = useState(false);
  const [showMath, setShowMath] = useState(true);
  const animRef = useRef<any>(null);

  const inputLabels = [
    { label: 'Ersparnisse', icon: '💰', max: 100000, unit: '€', desc: 'Gesamtes Vermögen des Antragstellers' },
    { label: 'Einkommen', icon: '💼', max: 10000, unit: '€/Monat', desc: 'Netto-Einkommen pro Monat' },
    { label: 'Kreditscore', icon: '📊', max: 100, unit: '%', desc: 'Historische Kreditwürdigkeit' },
    { label: 'Alter', icon: '🎂', max: 100, unit: 'Jahre', desc: 'Lebensalter des Antragstellers' },
    { label: 'Sicherheiten', icon: '🏠', max: 100, unit: '%', desc: 'Wert der hinterlegten Sicherheiten' },
  ];

  // Use fixed weights (deterministic, pedagogically sound)
  const weights = FIXED_WEIGHTS;
  const biases = FIXED_BIASES;

  // Forward pass with detailed tracking
  const { activations, preActivations } = useMemo(() => {
    const a: number[][] = [inputs];
    const z: number[][] = [];
    for (let l = 0; l < weights.length; l++) {
      const prev = a[a.length - 1];
      const next: number[] = [];
      const zLayer: number[] = [];
      for (let j = 0; j < LAYERS[l + 1]; j++) {
        let sum = biases[l][j];
        for (let i = 0; i < prev.length; i++) sum += prev[i] * weights[l][i][j];
        zLayer.push(sum);
        next.push(sigmoid(sum));
      }
      z.push(zLayer);
      a.push(next);
    }
    return { activations: a, preActivations: z };
  }, [inputs, weights, biases]);

  const outputVal = activations[LAYERS.length - 1][0];
  const isApproved = outputVal > 0.5;

  // Layout
  const W = 720, H = 480;
  const xPad = 90, yPad = 50;
  const layerSpacing = (W - xPad * 2) / (LAYERS.length - 1);

  const neuronPositions = useMemo(() => {
    const positions: NeuronPos[][] = [];
    for (let l = 0; l < LAYERS.length; l++) {
      const size = LAYERS[l];
      const totalH = H - yPad * 2;
      const gap = totalH / (size + 1);
      const layer: NeuronPos[] = [];
      for (let n = 0; n < size; n++) {
        layer.push({ x: xPad + l * layerSpacing, y: yPad + gap * (n + 1), layer: l, idx: n });
      }
      positions.push(layer);
    }
    return positions;
  }, [layerSpacing]);

  const getActivationColor = (val: number) => {
    const h = 240 - val * 120;
    return `hsl(${h}, 85%, ${45 + (1 - val) * 20}%)`;
  };

  const getWeightStyle = (w: number) => {
    const absW = Math.min(Math.abs(w), 8);
    const opacity = 0.08 + (absW / 8) * 0.7;
    const width = 0.4 + (absW / 8) * 2.8;
    const color = w > 0 ? `rgba(99,102,241,${opacity})` : `rgba(239,68,68,${opacity})`;
    return { color, width };
  };

  const playForwardAnim = useCallback(() => {
    if (animRef.current) clearInterval(animRef.current);
    setAnimPhase(0);
    let phase = 0;
    animRef.current = setInterval(() => {
      phase++;
      if (phase >= LAYERS.length) {
        clearInterval(animRef.current);
        animRef.current = null;
        setAnimPhase(-1);
      } else {
        setAnimPhase(phase);
      }
    }, 600);
  }, []);

  const updateInput = (idx: number, val: number) => {
    const newInputs = [...inputs];
    newInputs[idx] = val;
    setInputs(newInputs);
  };

  const loadPreset = (values: number[]) => {
    setInputs(values);
    setAnimPhase(-1);
  };

  const reset = () => {
    setInputs([0.6, 0.4, 0.8, 0.3, 0.5]);
    setAnimPhase(-1);
    setSelectedNeuron(null);
  };

  // Get calculation details for selected neuron
  const getNeuronMath = (layerIdx: number, neuronIdx: number) => {
    if (layerIdx === 0) {
      return {
        title: `Input: ${inputLabels[neuronIdx].label}`,
        formula: `${inputLabels[neuronIdx].label} = ${(inputs[neuronIdx] * inputLabels[neuronIdx].max).toLocaleString('de-DE')} ${inputLabels[neuronIdx].unit}`,
        description: inputLabels[neuronIdx].desc,
        value: inputs[neuronIdx],
        steps: [
          `Rohwert: ${(inputs[neuronIdx] * inputLabels[neuronIdx].max).toLocaleString('de-DE')} ${inputLabels[neuronIdx].unit}`,
          `Normalisiert: ${inputs[neuronIdx].toFixed(3)} (Bereich 0–1)`
        ]
      };
    }

    const prevLayer = activations[layerIdx - 1];
    const z = preActivations[layerIdx - 1][neuronIdx];
    const bias = biases[layerIdx - 1][neuronIdx];
    const act = activations[layerIdx][neuronIdx];

    const steps: string[] = [];
    let calc = `z = ${bias.toFixed(2)}`;

    prevLayer.forEach((inp, i) => {
      const w = weights[layerIdx - 1][i][neuronIdx];
      calc += ` + (${inp.toFixed(3)} × ${w.toFixed(1)})`;
      steps.push(`Eingabe ${i + 1}: ${inp.toFixed(3)} × ${w.toFixed(1)} = ${(inp * w).toFixed(3)}`);
    });

    calc += ` = ${z.toFixed(3)}`;
    steps.push(`Summe (pre-activation): z = ${z.toFixed(3)}`);
    steps.push(`Aktivierung: σ(${z.toFixed(3)}) = ${act.toFixed(3)}`);

    return {
      title: `${LAYER_LABELS[layerIdx]} – Neuron ${neuronIdx + 1}`,
      formula: 'z = bias + Σ(inputᵢ × weightᵢ)',
      description: NEURON_LABELS[layerIdx]?.[neuronIdx] || 'Verarbeitungsneuron',
      value: act,
      steps: [calc, ...steps]
    };
  };

  // ─── Controls ──────────────────────────────────────────────
  const controls = (
    <div className="space-y-4">
      {/* Presets */}
      <div className="p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Szenarien</div>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(preset.values)}
              className="text-left px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Kundenprofil</div>
        {inputLabels.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <label className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
              <span>{item.icon} {item.label}</span>
              <span className="font-mono text-indigo-600">{(inputs[idx] * item.max).toLocaleString('de-DE')} {item.unit}</span>
            </label>
            <input type="range" min="0" max="1" step="0.01" value={inputs[idx]}
              onChange={e => updateInput(idx, parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-1" />
          </div>
        ))}
      </div>

      {/* Toggles */}
      <div className="p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Anzeige</div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showWeights} onChange={e => setShowWeights(e.target.checked)} className="accent-indigo-600" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Gewichte anzeigen</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showMath} onChange={e => setShowMath(e.target.checked)} className="accent-indigo-600" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Mathe-Panel anzeigen</span>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={playForwardAnim}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm">
          ▶ Forward Pass animieren
        </button>
        <button onClick={reset}
          className="w-full py-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">
          Zurücksetzen
        </button>
      </div>
    </div>
  );

  const selectedMath = selectedNeuron ? getNeuronMath(parseInt(selectedNeuron.split('-')[0]), parseInt(selectedNeuron.split('-')[1])) : null;

  return (
    <DemoWrapper title="Multivariater Kredit-Check" controls={controls}>
      <div className="w-full flex flex-col gap-6">
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 border border-slate-200 dark:border-slate-700/50">
          <p className="italic mb-1">Dieses Netz verarbeitet <strong>5 Dimensionen</strong> gleichzeitig. Klicke auf ein Neuron, um seine Berechnung zu sehen. Die Gewichte sind so gewählt, dass gute Profile (hohe Werte) genehmigt und riskante Profile abgelehnt werden.</p>
          <div className="flex gap-4 text-[10px] mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Positive Gewichte</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Negative Gewichte</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Schwache Verbindung</span>
          </div>
        </div>

        <div className="w-full relative rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900 p-2 min-h-[480px] flex items-center justify-center">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
            {/* Connections */}
            {weights.map((layer, lIdx) =>
              layer.map((node, nIdx) =>
                node.map((wVal, nextIdx) => {
                  const from = neuronPositions[lIdx][nIdx];
                  const to = neuronPositions[lIdx + 1][nextIdx];
                  const style = getWeightStyle(wVal);
                  const isVisible = animPhase === -1 || lIdx + 1 <= animPhase;
                  const highlight = hoveredNeuron === `${lIdx}-${nIdx}` || hoveredNeuron === `${lIdx + 1}-${nextIdx}` || selectedNeuron === `${lIdx}-${nIdx}` || selectedNeuron === `${lIdx + 1}-${nextIdx}`;

                  return (
                    <g key={`c-${lIdx}-${nIdx}-${nextIdx}`}>
                      <line
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={highlight ? (wVal > 0 ? '#6366f1' : '#ef4444') : style.color}
                        strokeWidth={highlight ? style.width + 1.5 : style.width}
                        opacity={isVisible ? 1 : 0.04}
                        style={{ transition: 'all 0.4s ease' }}
                      />
                      {showWeights && isVisible && (
                        <text
                          x={(from.x + to.x) / 2}
                          y={(from.y + to.y) / 2}
                          textAnchor="middle"
                          fill={wVal > 0 ? '#6366f1' : '#ef4444'}
                          fontSize="7"
                          opacity={highlight ? 1 : 0.5}
                          style={{ pointerEvents: 'none' }}
                        >
                          {wVal.toFixed(0)}
                        </text>
                      )}
                    </g>
                  );
                })
              )
            )}

            {/* Neurons */}
            {neuronPositions.map((layer, lIdx) =>
              layer.map((pos, nIdx) => {
                const act = activations[lIdx]?.[nIdx] ?? 0.5;
                const isVisible = animPhase === -1 || lIdx <= animPhase;
                const nKey = `${lIdx}-${nIdx}`;
                const r = lIdx === 0 || lIdx === LAYERS.length - 1 ? 16 : 12;
                const isSelected = selectedNeuron === nKey;

                return (
                  <g
                    key={nKey}
                    onMouseEnter={() => setHoveredNeuron(nKey)}
                    onMouseLeave={() => setHoveredNeuron(null)}
                    onClick={() => setSelectedNeuron(isSelected ? null : nKey)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selection ring */}
                    {isSelected && (
                      <circle cx={pos.x} cy={pos.y} r={r + 8} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" opacity="0.8">
                        <animateTransform attributeName="transform" type="rotate" from={`0 ${pos.x} ${pos.y}`} to={`360 ${pos.x} ${pos.y}`} dur="8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={pos.x} cy={pos.y} r={r + 4} fill="none" stroke={getActivationColor(act)} strokeWidth="1.5" opacity={isVisible ? 0.4 : 0} />
                    <circle cx={pos.x} cy={pos.y} r={r} fill={isVisible ? getActivationColor(act) : '#e2e8f0'} stroke={isSelected ? '#f59e0b' : 'rgba(255,255,255,0.3)'} strokeWidth={isSelected ? 2 : 1} opacity={isVisible ? 1 : 0.15} style={{ transition: 'all 0.4s ease' }} />
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="800" fontSize={r < 14 ? "7" : "8"} opacity={isVisible ? 1 : 0} style={{ pointerEvents: 'none' }}>
                      {act.toFixed(2)}
                    </text>
                    {/* Neuron label below */}
                    <text x={pos.x} y={pos.y + r + 14} textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="600" opacity={isVisible ? 0.8 : 0} style={{ pointerEvents: 'none' }}>
                      {NEURON_LABELS[lIdx]?.[nIdx] || `N${nIdx}`}
                    </text>
                  </g>
                );
              })
            )}

            {/* Layer Labels */}
            {LAYER_LABELS.map((label, lIdx) => (
              <text key={lIdx} x={neuronPositions[lIdx][0].x} y={H - 8} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="800" style={{ textTransform: 'uppercase' }}>
                {label}
              </text>
            ))}
          </svg>
        </div>

        {/* Math Panel */}
        {showMath && selectedMath && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border-2 border-amber-200 dark:border-amber-800/30 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-amber-900 dark:text-amber-300 uppercase tracking-tight">🔍 Berechnungs-Details</h4>
              <button onClick={() => setSelectedNeuron(null)} className="text-[10px] text-amber-600 hover:text-amber-800 font-bold">SCHLIESSEN</button>
            </div>
            <div className="text-xs text-amber-800 dark:text-amber-200 font-medium">{selectedMath.description}</div>
            <div className="font-mono text-xs bg-white/60 dark:bg-slate-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800/20 space-y-1">
              {selectedMath.steps.map((step, i) => (
                <div key={i} className={i === 0 ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}>
                  {step}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Aktivierung:</span>
              <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${selectedMath.value * 100}%` }} />
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">{(selectedMath.value * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Result */}
        <div className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-500 ${isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shadow-lg ${isApproved ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {isApproved ? '✓' : '✕'}
          </div>
          <div className="flex-1">
            <h4 className="font-black uppercase text-sm">{isApproved ? 'Kredit genehmigt' : 'Kredit abgelehnt'}</h4>
            <p className="text-[11px] opacity-80">Vertrauens-Score: <span className="font-mono font-bold">{(outputVal * 100).toFixed(1)}%</span> (Schwelle: 50%)</p>
          </div>
          <div className="w-24 h-2 bg-white/50 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 ${isApproved ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${outputVal * 100}%` }} />
          </div>
        </div>
      </div>
    </DemoWrapper>
  );
};

export default NeuralNetworkDemo;