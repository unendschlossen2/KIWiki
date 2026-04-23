import React, { useState } from 'react';
import InfoTooltip from '../design/InfoTooltip';

const WORD_VECTORS = [
    { word: 'König', x: 2, y: 8, color: '#f59e0b' },
    { word: 'Königin', x: 8, y: 8, color: '#f59e0b' },
    { word: 'Mann', x: 2, y: 2, color: '#3b82f6' },
    { word: 'Frau', x: 8, y: 2, color: '#ec4899' },
    { word: 'Hund', x: 12, y: 4, color: '#10b981' },
    { word: 'Katze', x: 13, y: 5, color: '#10b981' },
    { word: 'Apfel', x: 15, y: 15, color: '#ef4444' },
    { word: 'Banane', x: 16, y: 14, color: '#ef4444' }
];

export default function EmbeddingDemo() {
    const [showAnalogy, setShowAnalogy] = useState(false);
    
    // Scale coordinates (0-20) to SVG (0-400)
    const scale = (val: number) => val * 20;

    return (
        <div className="not-prose max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 font-sans my-8 overflow-hidden">
            <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-lg m-0 flex items-center">
                    Bedeutung im Raum (Word Embeddings)
                    <InfoTooltip position="bottom" content="Wörter werden als Vektoren (Punkte) in einem Raum dargestellt. Ähnliche Wörter liegen nah beieinander." />
                </h3>
                <button 
                    onClick={() => setShowAnalogy(!showAnalogy)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${showAnalogy ? 'bg-amber-500 text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                    {showAnalogy ? 'Analogie aktiv' : 'Analogie zeigen'}
                </button>
            </div>

            <div className="p-8 flex flex-col md:flex-row gap-8 items-center bg-slate-50 dark:bg-slate-900/30">
                
                {/* SVG Plot Area */}
                <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-700">
                    <svg width="400" height="400" viewBox="0 0 400 400" className="overflow-visible">
                        {/* Grid */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <React.Fragment key={i}>
                                <line x1={0} y1={i * 100} x2={400} y2={i * 100} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                                <line x1={i * 100} y1={0} x2={i * 100} y2={400} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                            </React.Fragment>
                        ))}

                        {/* Analogy Lines */}
                        {showAnalogy && (
                            <g>
                                {/* King -> Queen */}
                                <path 
                                    d={`M ${scale(2)} ${400 - scale(8)} L ${scale(8)} ${400 - scale(8)}`} 
                                    stroke="#f59e0b" strokeWidth="3" strokeDasharray="5,5" markerEnd="url(#arrow-amber)" 
                                    className="animate-[dash_2s_linear_infinite]"
                                />
                                {/* Man -> Woman */}
                                <path 
                                    d={`M ${scale(2)} ${400 - scale(2)} L ${scale(8)} ${400 - scale(2)}`} 
                                    stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,5" markerEnd="url(#arrow-blue)" 
                                    className="animate-[dash_2s_linear_infinite]"
                                />
                            </g>
                        )}

                        {/* Word Points */}
                        {WORD_VECTORS.map((v) => (
                            <g key={v.word} className="transition-all duration-500">
                                <circle 
                                    cx={scale(v.x)} 
                                    cy={400 - scale(v.y)} 
                                    r="6" 
                                    fill={v.color} 
                                    className="drop-shadow-sm"
                                />
                                <text 
                                    x={scale(v.x) + 10} 
                                    y={400 - scale(v.y) + 4} 
                                    fontSize="12" 
                                    fontWeight="bold"
                                    className="fill-slate-600 dark:fill-slate-300 pointer-events-none select-none"
                                >
                                    {v.word}
                                </text>
                            </g>
                        ))}

                        {/* Arrows for Analogy */}
                        <defs>
                            <marker id="arrow-amber" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                            </marker>
                            <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                            </marker>
                        </defs>
                    </svg>
                    
                    {/* Axis Labels */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-[10px] font-black uppercase text-slate-400">Dimension 1</div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 -rotate-90 text-[10px] font-black uppercase text-slate-400">Dimension 2</div>
                </div>

                {/* Legend & Explanation */}
                <div className="flex-1 space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Semantische Cluster</h4>
                        <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Früchte (Cluster 1)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Tiere (Cluster 2)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Menschen (Cluster 3)
                            </li>
                        </ul>
                    </div>

                    {showAnalogy && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">Vektor-Mathematik</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                                Das Modell erkennt: Der "Vektor-Schritt" von Mann zu Frau ist fast identisch mit dem von König zu Königin. 
                                <br/><br/>
                                <strong>König - Mann + Frau = Königin</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes dash {
                    to { stroke-dashoffset: -20; }
                }
            `}} />
        </div>
    );
}
