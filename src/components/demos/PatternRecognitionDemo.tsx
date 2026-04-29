import React, { useState, useMemo, useCallback } from 'react';
import DemoWrapper from '../layout/DemoWrapper';

const sigmoid = (x: number) => 1 / (1 + Math.exp(-Math.max(-12, Math.min(12, x))));

const PATTERNS = [
  { name: '➖ Horizontal', grid: [1, 1, 1, 0, 0, 0, 0, 0, 0], desc: 'Obere Reihe aktiv' },
  { name: '➖ Horizontal (Mitte)', grid: [0, 0, 0, 1, 1, 1, 0, 0, 0], desc: 'Mittlere Reihe aktiv' },
  { name: '➖ Horizontal (Unten)', grid: [0, 0, 0, 0, 0, 0, 1, 1, 1], desc: 'Untere Reihe aktiv' },
  { name: '┃ Vertikal (Links)', grid: [1, 0, 0, 1, 0, 0, 1, 0, 0], desc: 'Linke Spalte aktiv' },
  { name: '┃ Vertikal (Mitte)', grid: [0, 1, 0, 0, 1, 0, 0, 1, 0], desc: 'Mittlere Spalte aktiv' },
  { name: '┃ Vertikal (Rechts)', grid: [0, 0, 1, 0, 0, 1, 0, 0, 1], desc: 'Rechte Spalte aktiv' },
  { name: '➕ Kreuz', grid: [0, 1, 0, 1, 1, 1, 0, 1, 0], desc: 'Kreuz-Muster' },
  { name: '✕ Diagonal', grid: [1, 0, 1, 0, 1, 0, 1, 0, 1], desc: 'X-Muster (Diagonale)' },
  { name: '⬤ Punkt', grid: [0, 0, 0, 0, 1, 0, 0, 0, 0], desc: 'Nur Mitte aktiv' },
  { name: '⬛ Voll', grid: [1, 1, 1, 1, 1, 1, 1, 1, 1], desc: 'Alle Pixel aktiv' },
];

const HIDDEN_LABELS = [
  'Reihe 1 Detektor',
  'Reihe 2 Detektor',
  'Reihe 3 Detektor',
  'Spalte 1 Detektor',
  'Spalte 2 Detektor',
  'Spalte 3 Detektor',
  'Kreuz-Detektor A',
  'Kreuz-Detektor B'
];

const OUTPUT_LABELS = ['Horizontal', 'Vertikal', 'Kreuz/Punkt'];

const PatternRecognitionDemo: React.FC = () => {
  const [grid, setGrid] = useState<number[]>(new Array(9).fill(0));
  const [hoveredConnection, setHoveredConnection] = useState<{ from: string, to: string } | null>(null);
  const [selectedHidden, setSelectedHidden] = useState<number | null>(null);
  const [showNetwork, setShowNetwork] = useState(true);
  const [animStep, setAnimStep] = useState(-1);

  const togglePixel = (idx: number) => {
    const newGrid = [...grid];
    newGrid[idx] = newGrid[idx] === 1 ? 0 : 1;
    setGrid(newGrid);
    setAnimStep(-1);
  };

  const clearGrid = () => {
    setGrid(new Array(9).fill(0));
    setAnimStep(-1);
  };

  const loadPattern = (patternGrid: number[]) => {
    setGrid(patternGrid);
    setAnimStep(-1);
  };

  const runAnimation = useCallback(() => {
    setAnimStep(0);
    setTimeout(() => setAnimStep(1), 400);
    setTimeout(() => setAnimStep(2), 800);
    setTimeout(() => setAnimStep(-1), 1400);
  }, []);

  // Enhanced NN Architecture: 9 Inputs -> 8 Hidden -> 3 Outputs
  // H0-H2: Row Detectors (need 3 pixels in row)
  // H3-H5: Col Detectors (need 3 pixels in col)
  // H6-H7: Cross/Point Detectors (center + arms)
  const weights = useMemo(() => {
    return [
      // Input (9) -> Hidden (8)
      [
        [6, 0, 0, 0, 0, 0, 0, 0], // P0 -> Row1
        [6, 0, 0, 0, 0, 0, 0, 2], // P1 -> Row1, Cross
        [6, 0, 0, 0, 0, 0, 0, 0], // P2 -> Row1
        [0, 6, 0, 0, 0, 0, 0, 2], // P3 -> Row2, Cross
        [0, 0, 0, 0, 0, 0, 8, 4], // P4 -> Cross-A (center), Cross-B
        [0, 6, 0, 0, 0, 0, 0, 2], // P5 -> Row2, Cross
        [0, 0, 6, 0, 0, 0, 0, 0], // P6 -> Row3
        [0, 0, 6, 0, 0, 0, 0, 2], // P7 -> Row3, Cross
        [0, 0, 6, 0, 0, 0, 0, 0], // P8 -> Row3
      ],
      // Hidden (8) -> Output (3: Horiz, Vert, Cross/Point)
      [
        [10, 0, 0],  // H0 (Row 1) -> Horizontal
        [10, 0, 0],  // H1 (Row 2) -> Horizontal
        [10, 0, 0],  // H2 (Row 3) -> Horizontal
        [0, 10, 0],  // H3 (Col 1) -> Vertical
        [0, 10, 0],  // H4 (Col 2) -> Vertical
        [0, 10, 0],  // H5 (Col 3) -> Vertical
        [0, 0, 10],  // H6 (Cross A) -> Cross
        [0, 0, 10],  // H7 (Cross B) -> Cross
      ]
    ];
  }, []);

  const biases = [
    [-14, -14, -14, -14, -14, -14, -6, -6],
    [-6, -6, -8]
  ];

  const { h, o, zHidden, zOutput } = useMemo(() => {
    const zh: number[] = [];
    const hLayer: number[] = [];
    for (let j = 0; j < 8; j++) {
      let sum = biases[0][j];
      for (let i = 0; i < 9; i++) sum += grid[i] * weights[0][i][j];
      zh.push(sum);
      hLayer.push(sigmoid(sum));
    }
    const zo: number[] = [];
    const oLayer: number[] = [];
    for (let j = 0; j < 3; j++) {
      let sum = biases[1][j];
      for (let i = 0; i < 8; i++) sum += hLayer[i] * weights[1][i][j];
      zo.push(sum);
      oLayer.push(sigmoid(sum));
    }
    return { h: hLayer, o: oLayer, zHidden: zh, zOutput: zo };
  }, [grid, weights]);

  const results = [
    { label: 'Horizontale Linie', val: o[0], icon: '➖' },
    { label: 'Vertikale Linie', val: o[1], icon: '┃' },
    { label: 'Kreuz / Punkt', val: o[2], icon: '➕' },
  ];

  const bestMatch = results.reduce((prev, curr) => curr.val > prev.val ? curr : prev, results[0]);

  // Grid positions for network visualization
  const inputPositions = useMemo(() => {
    const pos = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        pos.push({ x: 60 + col * 50, y: 80 + row * 50 });
      }
    }
    return pos;
  }, []);

  const hiddenPositions = useMemo(() => {
    return HIDDEN_LABELS.map((_, i) => ({ x: 280, y: 60 + i * 45 }));
  }, []);

  const outputPositions = useMemo(() => [
    { x: 460, y: 120 },
    { x: 460, y: 200 },
    { x: 460, y: 280 }
  ], []);

  const getWeightColor = (w: number) => w > 0 ? '#6366f1' : '#ef4444';
  const getWeightOpacity = (w: number) => Math.min(0.05 + Math.abs(w) / 12, 0.9);
  const getWeightWidth = (w: number) => Math.max(0.5, Math.abs(w) / 3);

  const isConnHighlighted = (fromType: string, fromIdx: number, toType: string, toIdx: number) => {
    if (!hoveredConnection) return false;
    return hoveredConnection.from === `${fromType}-${fromIdx}` && hoveredConnection.to === `${toType}-${toIdx}`;
  };

  const controls = (
    <div className="space-y-6">
      {/* Pattern Presets */}
      <div className="p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Muster-Vorlagen</div>
        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
          {PATTERNS.map((pattern, idx) => (
            <button
              key={idx}
              onClick={() => loadPattern(pattern.grid)}
              className="text-left px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center justify-between"
            >
              <span>{pattern.name}</span>
              <span className="text-[9px] text-slate-400">{pattern.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Grid */}
      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-4 text-center">Zeichne ein Muster</div>
        <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
          {grid.map((val, i) => (
            <button
              key={i}
              onClick={() => togglePixel(i)}
              className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${val === 1
                  ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={clearGrid} className="flex-1 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-colors border border-slate-200 dark:border-slate-700 rounded-lg">
            Löschen
          </button>
          <button onClick={runAnimation} className="flex-1 py-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border border-indigo-200 dark:border-indigo-800 rounded-lg">
            ▶ Animieren
          </button>
        </div>
      </div>

      {/* Detection Results */}
      <div className="space-y-3">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Erkennungsergebnis</div>
        {results.map((res, i) => (
          <div key={i} className={`p-3 rounded-xl border transition-all ${res.val > 0.5 ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="text-lg">{res.icon}</span> {res.label}
              </span>
              <span className={`text-xs font-mono font-bold ${res.val > 0.5 ? 'text-indigo-600' : 'text-slate-400'}`}>{(res.val * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${res.val > 0.5 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                style={{ width: `${res.val * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Toggles */}
      <div className="p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showNetwork} onChange={e => setShowNetwork(e.target.checked)} className="accent-indigo-600" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Netzwerk-Visualisierung anzeigen</span>
        </label>
      </div>
    </div>
  );

  return (
    <DemoWrapper title="Mustererkennung (Feature-Detektoren)" controls={controls}>
      <div className="flex flex-col gap-6 items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2 max-w-lg px-4">
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Hierarchische Feature-Erkennung</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Das Netzwerk lernt <strong>Feature-Detektoren</strong>: Die erste Schicht erkennt einfache Muster (Reihen, Spalten),
            die zweite Schicht kombiniert diese zu komplexeren Klassifikationen. Klicke auf ein Hidden-Neuron, um zu sehen,
            welche Input-Pixel es bevorzugt.
          </p>
        </div>

        {/* Network Visualization */}
        {showNetwork && (
          <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-4 overflow-x-auto">
            <svg viewBox="0 0 520 380" className="w-full" style={{ minWidth: '400px' }}>
              {/* Input -> Hidden Connections */}
              {inputPositions.map((inp, i) =>
                hiddenPositions.map((hid, j) => {
                  const w = weights[0][i][j];
                  const isHighlighted = isConnHighlighted('input', i, 'hidden', j) || selectedHidden === j;
                  const isAnimVisible = animStep === -1 || animStep >= 1;
                  return (
                    <line
                      key={`ih-${i}-${j}`}
                      x1={inp.x} y1={inp.y}
                      x2={hid.x} y2={hid.y}
                      stroke={getWeightColor(w)}
                      strokeWidth={isHighlighted ? getWeightWidth(w) + 1 : getWeightWidth(w)}
                      opacity={isAnimVisible ? (isHighlighted ? getWeightOpacity(w) + 0.3 : getWeightOpacity(w) * 0.6) : 0.05}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  );
                })
              )}

              {/* Hidden -> Output Connections */}
              {hiddenPositions.map((hid, i) =>
                outputPositions.map((out, j) => {
                  const w = weights[1][i][j];
                  const isHighlighted = isConnHighlighted('hidden', i, 'output', j) || selectedHidden === i;
                  const isAnimVisible = animStep === -1 || animStep >= 2;
                  return (
                    <line
                      key={`ho-${i}-${j}`}
                      x1={hid.x} y1={hid.y}
                      x2={out.x} y2={out.y}
                      stroke={getWeightColor(w)}
                      strokeWidth={isHighlighted ? getWeightWidth(w) + 1.5 : getWeightWidth(w)}
                      opacity={isAnimVisible ? (isHighlighted ? 0.9 : 0.5) : 0.05}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  );
                })
              )}

              {/* Input Neurons */}
              {inputPositions.map((pos, i) => (
                <g key={`input-${i}`}>
                  <rect
                    x={pos.x - 18} y={pos.y - 18}
                    width={36} height={36}
                    rx={8}
                    fill={grid[i] === 1 ? '#4f46e5' : '#f1f5f9'}
                    stroke={grid[i] === 1 ? '#6366f1' : '#cbd5e1'}
                    strokeWidth={2}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fill={grid[i] === 1 ? 'white' : '#94a3b8'} fontSize="10" fontWeight="700">
                    {grid[i]}
                  </text>
                  <text x={pos.x} y={pos.y + 28} textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="600">
                    P{i}
                  </text>
                </g>
              ))}

              {/* Hidden Neurons */}
              {hiddenPositions.map((pos, i) => {
                const isSelected = selectedHidden === i;
                return (
                  <g
                    key={`hidden-${i}`}
                    onMouseEnter={() => setHoveredConnection({ from: 'hidden', to: `all-${i}` })}
                    onMouseLeave={() => setHoveredConnection(null)}
                    onClick={() => setSelectedHidden(isSelected ? null : i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={isSelected ? 22 : 18}
                      fill={h[i] > 0.5 ? '#6366f1' : '#e2e8f0'}
                      stroke={isSelected ? '#f59e0b' : h[i] > 0.5 ? '#4f46e5' : '#cbd5e1'}
                      strokeWidth={isSelected ? 3 : 2}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fill={h[i] > 0.5 ? 'white' : '#64748b'} fontSize="8" fontWeight="800">
                      {h[i].toFixed(2)}
                    </text>
                    <text x={pos.x} y={pos.y + 32} textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="600" style={{ pointerEvents: 'none' }}>
                      {HIDDEN_LABELS[i]}
                    </text>
                    {/* Activation ring */}
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={24}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="1"
                      opacity={h[i] > 0.5 ? h[i] * 0.5 : 0}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  </g>
                );
              })}

              {/* Output Neurons */}
              {outputPositions.map((pos, i) => (
                <g key={`output-${i}`}>
                  <rect
                    x={pos.x - 28} y={pos.y - 20}
                    width={56} height={40}
                    rx={12}
                    fill={o[i] > 0.5 ? '#4f46e5' : '#f1f5f9'}
                    stroke={o[i] > 0.5 ? '#6366f1' : '#cbd5e1'}
                    strokeWidth={2}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  <text x={pos.x} y={pos.y - 2} textAnchor="middle" fill={o[i] > 0.5 ? 'white' : '#64748b'} fontSize="9" fontWeight="800">
                    {OUTPUT_LABELS[i]}
                  </text>
                  <text x={pos.x} y={pos.y + 10} textAnchor="middle" fill={o[i] > 0.5 ? 'rgba(255,255,255,0.8)' : '#94a3b8'} fontSize="8" fontWeight="700">
                    {(o[i] * 100).toFixed(0)}%
                  </text>
                </g>
              ))}

              {/* Layer Labels */}
              <text x={60} y={30} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="800" style={{ textTransform: 'uppercase' }}>Input (9 Pixel)</text>
              <text x={280} y={30} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="800" style={{ textTransform: 'uppercase' }}>Hidden (8 Detektoren)</text>
              <text x={460} y={30} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="800" style={{ textTransform: 'uppercase' }}>Output (3 Klassen)</text>
            </svg>
          </div>
        )}

        {/* Selected Hidden Neuron Details */}
        {selectedHidden !== null && (
          <div className="w-full max-w-lg p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border-2 border-amber-200 dark:border-amber-800/30 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-amber-900 dark:text-amber-300 uppercase tracking-tight">
                🔍 {HIDDEN_LABELS[selectedHidden]}
              </h4>
              <button onClick={() => setSelectedHidden(null)} className="text-[10px] text-amber-600 hover:text-amber-800 font-bold">SCHLIESSEN</button>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Dieser Detektor feuert, wenn seine bevorzugten Pixel aktiv sind. Gewichte zeigen, welche Pixel wichtig sind.
            </p>

            {/* Weight visualization for this hidden neuron */}
            <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
              {Array.from({ length: 9 }).map((_, i) => {
                const w = weights[0][i][selectedHidden];
                const isActive = grid[i] === 1;
                const intensity = Math.min(Math.abs(w) / 6, 1);
                return (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: w > 0 ? `rgba(99,102,241,${isActive ? 0.3 + intensity * 0.7 : intensity * 0.3})` : `rgba(239,68,68,${isActive ? 0.3 + intensity * 0.7 : intensity * 0.3})`,
                      borderColor: isActive ? (w > 0 ? '#6366f1' : '#ef4444') : '#e2e8f0'
                    }}
                  >
                    {w.toFixed(0)}
                  </div>
                );
              })}
            </div>

            <div className="font-mono text-xs bg-white/60 dark:bg-slate-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800/20">
              <div className="text-slate-500 mb-1">Berechnung:</div>
              <div className="text-indigo-700 dark:text-indigo-300 font-bold">
                z = {biases[0][selectedHidden].toFixed(1)} + Σ(inputs × weights) = {zHidden[selectedHidden].toFixed(2)}
              </div>
              <div className="text-slate-600 dark:text-slate-400 mt-1">
                σ({zHidden[selectedHidden].toFixed(2)}) = <span className="font-bold text-amber-700 dark:text-amber-400">{h[selectedHidden].toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Result Box */}
        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 text-center max-w-md mx-4">
          <div className="text-4xl mb-2">
            {bestMatch.val > 0.5 ? bestMatch.icon : '❓'}
          </div>
          <p className="text-sm text-indigo-900 dark:text-indigo-300 font-bold mb-1">
            {bestMatch.val > 0.5 ? bestMatch.label : 'Kein klares Muster erkannt'}
          </p>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-400 italic">
            {bestMatch.val > 0.5
              ? `Ich bin mir zu ${(bestMatch.val * 100).toFixed(0)}% sicher, dass dies ${bestMatch.label} ist.`
              : 'Zeichne eine vollständige Linie (3 Pixel in Reihe/Spalte) oder ein Kreuz, damit ich es erkennen kann.'}
          </p>
        </div>
      </div>
    </DemoWrapper>
  );
};

export default PatternRecognitionDemo;