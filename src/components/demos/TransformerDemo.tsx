import React, { useState, useMemo, useCallback } from 'react';
import MathField from '../design/Math';
import InfoTooltip from '../design/InfoTooltip';

/* ─── Preset sentences ─── */
const SENTENCES = [
  ['Die', 'Katze', 'saß', 'auf', 'der', 'Matte'],
  ['Attention', 'is', 'all', 'you', 'need'],
  ['Der', 'Hund', 'jagte', 'die', 'Katze'],
  ['Das', 'Modell', 'lernt', 'Sprache', 'verstehen'],
];

/* ─── Deterministic pseudo-random Q/K generator ─── */
function hashPair(a: number, b: number, seed: number): number {
  let h = (a * 2654435761 + b * 40503 + seed * 16777619) >>> 0;
  h = ((h ^ (h >> 16)) * 0x45d9f3b) >>> 0;
  h = ((h ^ (h >> 16)) * 0x45d9f3b) >>> 0;
  return (h >>> 0) / 0x100000000;
}

function computeAttention(tokens: string[], temperature: number): number[][] {
  const n = tokens.length;
  const scores: number[][] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      // base affinity: self has highest, neighbours have decent, others random
      let s = hashPair(i, j, 42) * 2 - 1;
      if (i === j) s += 1.5;
      if (Math.abs(i - j) === 1) s += 0.6;
      row.push(s / temperature);
    }
    scores.push(row);
  }

  // softmax per row
  return scores.map(row => {
    const max = Math.max(...row);
    const exps = row.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  });
}

/* ─── Color helpers ─── */
function weightToColor(w: number): string {
  // 0 → dark slate, 1 → vivid blue
  const r = Math.round(30 + (1 - w) * 20);
  const g = Math.round(41 + w * 120);
  const b = Math.round(59 + w * 196);
  return `rgb(${r},${g},${b})`;
}

function weightToTextColor(w: number): string {
  return w > 0.4 ? '#fff' : 'rgb(148,163,184)';
}

/* ─── Main component ─── */
export default function TransformerDemo() {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [temperature, setTemperature] = useState(1.0);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);

  const tokens = SENTENCES[sentenceIdx];
  const n = tokens.length;

  const attention = useMemo(
    () => computeAttention(tokens, temperature),
    [tokens, temperature],
  );

  const handleTokenClick = useCallback(
    (i: number) => setSelectedToken(prev => (prev === i ? null : i)),
    [],
  );

  /* ── Dimensions ── */
  const cellSize = n > 5 ? 56 : 64;
  const labelW = 80;
  const labelH = 32;
  const matrixW = cellSize * n;
  const matrixH = cellSize * n;
  const svgW = labelW + matrixW + 10;
  const svgH = labelH + matrixH + 25;

  /* ── Arc constants ── */
  const arcTokenGap = 56;
  const arcSvgW = Math.max(n * arcTokenGap + 40, 240);
  const arcSvgH = 140;

  return (
    <div className="not-prose max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 font-sans my-8">
      {/* Header */}
      <div className="bg-slate-800 dark:bg-slate-900 text-white px-6 py-4 rounded-t-xl border-b border-slate-700 dark:border-slate-600 flex justify-between items-center z-20 relative">
        <div className="flex items-center">
          <h3 className="flex items-center font-bold text-lg" data-toc-skip>
            Interaktive Demo: Self-Attention
            <InfoTooltip position="bottom" content={<><strong>Der Effekt:</strong> Wenn das Wort „sie“ 80% Aufmerksamkeit auf „Katze“ richtet, mischt der Transformer 80% der Bedeutung von „Katze“ in das Wort „sie“. Die Werte (<MathField math="y" />-Achse zu <MathField math="x" />-Achse) zeigen also konkret, woraus das Modell Kontext zieht.</>} />
          </h3>
        </div>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* ── Left panel: controls ── */}
        <div className="w-full md:w-1/3 p-6 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between md:rounded-bl-xl">
          <div className="space-y-6">
            {/* Sentence selector */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">
                Satz auswählen
              </label>
              <div className="flex flex-col space-y-2">
                {SENTENCES.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSentenceIdx(idx);
                      setSelectedToken(null);
                    }}
                    className={`px-3 py-2 text-sm rounded-md border text-left transition-colors ${sentenceIdx === idx
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                  >
                    {s.join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                  Temperatur
                  <InfoTooltip content={<><strong>Praktische Folge:</strong> Niedrig = Das Modell ist "sicher" und zieht Bedeutung fast 100% aus wenigen Wörtern. Hoch = Unsicherer, Bedeutungen vieler Wörter werden diffus gemischt.</>} />
                </label>
                <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                  {temperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 p-6 flex flex-col items-center justify-center space-y-6 relative rounded-b-xl md:rounded-bl-none">
          {/* Math Equation Display */}
          <div className="w-full max-w-[460px] bg-white dark:bg-slate-800 px-6 py-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hidden md:flex items-center justify-center">
            <MathField math={`A = \\softmax\\left(\\frac{QK^T}{\\sqrt{d_k} \\cdot ${temperature.toFixed(1)}}\\right)`} />
          </div>



          {/* ── Attention Heatmap ── */}
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-inner"
          >
            {/* Column labels (Keys) */}
            {tokens.map((tok, j) => (
              <text
                key={`col-${j}`}
                x={labelW + j * cellSize + cellSize / 2}
                y={labelH - 8}
                textAnchor="middle"
                fontSize="12"
                fontWeight={selectedToken === j ? 700 : 400}
                fill={selectedToken === j ? '#3b82f6' : 'var(--text-secondary, #94a3b8)'}
                fontFamily="ui-monospace, monospace"
                style={{ cursor: 'pointer' }}
                onClick={() => handleTokenClick(j)}
              >
                {tok}
              </text>
            ))}

            {/* Row labels (Queries) + cells */}
            {tokens.map((tok, i) => (
              <g key={`row-${i}`}>
                <text
                  x={labelW - 8}
                  y={labelH + i * cellSize + cellSize / 2 + 4}
                  textAnchor="end"
                  fontSize="12"
                  fontWeight={selectedToken === i ? 700 : 400}
                  fill={selectedToken === i ? '#3b82f6' : 'var(--text-secondary, #94a3b8)'}
                  fontFamily="ui-monospace, monospace"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTokenClick(i)}
                >
                  {tok}
                </text>

                {tokens.map((_, j) => {
                  const w = attention[i][j];
                  const x = labelW + j * cellSize;
                  const y = labelH + i * cellSize;
                  const highlight =
                    selectedToken !== null &&
                    (i === selectedToken || j === selectedToken);
                  return (
                    <g key={`cell-${i}-${j}`}>
                      <rect
                        x={x}
                        y={y}
                        width={cellSize}
                        height={cellSize}
                        fill={weightToColor(w)}
                        stroke={highlight ? '#3b82f6' : 'rgba(100,116,139,0.25)'}
                        strokeWidth={highlight ? 2 : 0.5}
                        rx={4}
                        style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                        onClick={() => handleTokenClick(i)}
                      />
                      <text
                        x={x + cellSize / 2}
                        y={y + cellSize / 2 + 4}
                        textAnchor="middle"
                        fontSize="11"
                        fill={weightToTextColor(w)}
                        fontFamily="ui-monospace, monospace"
                      >
                        {(w * 100).toFixed(0)}%
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}

            {/* Axis labels */}
            <text
              x={labelW + matrixW / 2}
              y={svgH - 8}
              textAnchor="middle"
              fontSize="11"
              fill="var(--text-secondary, #94a3b8)"
              fontFamily="serif"
              fontStyle="italic"
            >
              Keys (K)
            </text>
            <text
              x={12}
              y={labelH + matrixH / 2}
              textAnchor="middle"
              fontSize="11"
              fill="var(--text-secondary, #94a3b8)"
              fontFamily="serif"
              fontStyle="italic"
              transform={`rotate(-90, 12, ${labelH + matrixH / 2})`}
            >
              Queries (Q)
            </text>
          </svg>

          {/* ── Attention Arcs (shown when a token is selected) ── */}
          {selectedToken !== null && (
            <div className="w-full flex flex-col items-center mt-4 border-t border-slate-100 dark:border-slate-700/50 pt-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                So viel Bedeutung nimmt das Token <span className="font-bold text-blue-500">"{tokens[selectedToken]}"</span> aus den anderen Tokens auf:
              </p>
              <svg
                width={arcSvgW}
                height={arcSvgH}
                viewBox={`0 0 ${arcSvgW} ${arcSvgH}`}
                className="overflow-visible"
              >
                {/* Token labels and percentages */}
                {tokens.map((tok, j) => {
                  const x = (arcSvgW - (n - 1) * arcTokenGap) / 2 + j * arcTokenGap;
                  const wordY = arcSvgH - 30;
                  const percentY = arcSvgH - 10;
                  const w = selectedToken !== null ? attention[selectedToken][j] : 0;

                  return (
                    <g key={`tok-${j}`}>
                      <text
                        x={x}
                        y={wordY}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight={j === selectedToken ? 700 : 400}
                        fill={j === selectedToken ? '#3b82f6' : 'var(--text-secondary, #94a3b8)'}
                        fontFamily="ui-monospace, monospace"
                      >
                        {tok}
                      </text>
                      {selectedToken !== null && (
                        <text
                          x={x}
                          y={percentY}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight={j === selectedToken ? 600 : 400}
                          fill={j === selectedToken ? '#3b82f6' : 'var(--text-secondary, #94a3b8)'}
                          fontFamily="ui-monospace, monospace"
                          opacity={w > 0.05 ? 1 : 0.6}
                        >
                          {(w * 100).toFixed(0)}%
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Arcs */}
                {tokens.map((_, j) => {
                  if (j === selectedToken) return null;
                  const w = attention[selectedToken][j];
                  const xi =
                    (arcSvgW - (n - 1) * arcTokenGap) / 2 +
                    selectedToken * arcTokenGap;
                  const xj =
                    (arcSvgW - (n - 1) * arcTokenGap) / 2 + j * arcTokenGap;
                  const midX = (xi + xj) / 2;
                  const dist = Math.abs(xi - xj);
                  // Scaled distance to prevent arcs from "shooting up" too high
                  const cpY = arcSvgH - 40 - Math.min(dist * 0.4, 60);
                  return (
                    <g key={`arc-${j}`}>
                      <path
                        d={`M ${xi} ${arcSvgH - 38} Q ${midX} ${cpY} ${xj} ${arcSvgH - 38}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={1 + w * 5}
                        opacity={0.25 + w * 0.75}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}


          {/* ── Live code snippet ── */}
          <div className="w-full max-w-[460px]">
            <div className="bg-slate-900 rounded-lg p-4 shadow-md font-mono text-sm text-slate-300 overflow-x-auto">
              <span className="text-slate-500"># So berechnet der Transformer Attention</span>
              <br />
              <span className="text-pink-400">import</span> torch
              <br />
              <br />
              <span className="text-pink-400">def</span>{' '}
              <span className="text-blue-400">attention</span>(Q, K, V, temp=
              <span className="text-emerald-400">{temperature.toFixed(1)}</span>):
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;d_k = Q.size(-1)
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;scores = Q @ K.T / (d_k ** 0.5 * temp)
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;weights = torch.softmax(scores, dim=-1)
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> weights @ V
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
