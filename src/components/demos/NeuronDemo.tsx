import React, { useState } from 'react';
import MathField from '../ui/Math';
import InfoTooltip from '../ui/InfoTooltip';

export default function NeuronDemo() {
    const [x1, setX1] = useState(0.8);
    const [x2, setX2] = useState(-0.5);
    const [x3, setX3] = useState(0.2);
    
    const [w1, setW1] = useState(0.6);
    const [w2, setW2] = useState(1.2);
    const [w3, setW3] = useState(-0.8);
    
    const [bias, setBias] = useState(-0.2);
    const [activation, setActivation] = useState('sigmoid');

    const z = x1 * w1 + x2 * w2 + x3 * w3 + bias;
    
    const getActivation = (val: number) => {
        if (activation === 'sigmoid') return 1 / (1 + Math.exp(-val));
        if (activation === 'relu') return Math.max(0, val);
        if (activation === 'tanh') return Math.tanh(val);
        return val;
    };

    const y = getActivation(z);

    const getStrengthColor = (val: number) => {
        const opacity = Math.min(Math.abs(val), 1);
        if (val > 0) return `rgba(14, 165, 233, ${opacity})`; // sky-500
        return `rgba(239, 68, 68, ${opacity})`; // red-500
    };

    return (
        <div className="not-prose max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 font-sans my-8 overflow-hidden">
            <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-lg m-0 flex items-center">
                    Interaktive Anatomie eines Neurons
                    <InfoTooltip position="bottom" content="Hier siehst du, wie mehrere Eingaben (x) mit Gewichten (w) verrechnet und durch den Bias (b) verschoben werden." />
                </h3>
                <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Left: Controls */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 space-y-6">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Eingaben & Gewichte</h4>
                        <div className="space-y-4">
                            {[
                                { id: 1, x: x1, setX: setX1, w: w1, setW: setW1, label: 'Sensor A' },
                                { id: 2, x: x2, setX: setX2, w: w2, setW: setW2, label: 'Sensor B' },
                                { id: 3, x: x3, setX: setX3, w: w3, setW: setW3, label: 'Sensor C' }
                            ].map((item) => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500">{item.label}</span>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">x={item.x.toFixed(1)}</span>
                                            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">w={item.w.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="range" min="-1" max="1" step="0.1" value={item.x} onChange={e => item.setX(parseFloat(e.target.value))} className="accent-blue-500 h-1.5" />
                                        <input type="range" min="-2" max="2" step="0.1" value={item.w} onChange={e => item.setW(parseFloat(e.target.value))} className="accent-indigo-500 h-1.5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Einstellungen</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500">Bias (b)</label>
                                <input type="range" min="-2" max="2" step="0.1" value={bias} onChange={e => setBias(parseFloat(e.target.value))} className="w-full accent-purple-500 h-1.5" />
                                <div className="text-center font-mono text-xs text-purple-600">{bias.toFixed(1)}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500">Aktivierung</label>
                                <select 
                                    value={activation} 
                                    onChange={e => setActivation(e.target.value)}
                                    className="w-full text-xs p-1 rounded border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                >
                                    <option value="sigmoid">Sigmoid</option>
                                    <option value="relu">ReLU</option>
                                    <option value="tanh">Tanh</option>
                                    <option value="linear">Linear</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Visualization */}
                <div className="p-6 flex flex-col items-center justify-center bg-white dark:bg-slate-800 relative">
                    <svg width="320" height="280" viewBox="0 0 320 280">
                        {/* Lines from inputs to neuron */}
                        <line x1="40" y1="60" x2="160" y2="140" stroke={getStrengthColor(w1)} strokeWidth={Math.abs(w1) * 3 + 1} strokeDasharray={w1 < 0 ? "4,2" : "0"} />
                        <line x1="40" y1="140" x2="160" y2="140" stroke={getStrengthColor(w2)} strokeWidth={Math.abs(w2) * 3 + 1} strokeDasharray={w2 < 0 ? "4,2" : "0"} />
                        <line x1="40" y1="220" x2="160" y2="140" stroke={getStrengthColor(w3)} strokeWidth={Math.abs(w3) * 3 + 1} strokeDasharray={w3 < 0 ? "4,2" : "0"} />

                        {/* Input Circles */}
                        <circle cx="40" cy="60" r="18" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                        <text x="40" y="64" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">x₁</text>
                        
                        <circle cx="40" cy="140" r="18" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                        <text x="40" y="144" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">x₂</text>
                        
                        <circle cx="40" cy="220" r="18" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                        <text x="40" y="224" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">x₃</text>

                        {/* The Neuron */}
                        <circle cx="160" cy="140" r="45" fill="white" stroke="#6366f1" strokeWidth="3" className="drop-shadow-md" />
                        <text x="160" y="135" textAnchor="middle" fontSize="14" fontWeight="black" fill="#1e293b">Σ</text>
                        <text x="160" y="155" textAnchor="middle" fontSize="10" fill="#94a3b8">Activation</text>

                        {/* Bias Input */}
                        <path d="M 160 50 L 160 95" stroke="#a855f7" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrow)" />
                        <text x="160" y="40" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#a855f7">Bias (b)</text>

                        {/* Output Line */}
                        <line x1="205" y1="140" x2="280" y2="140" stroke="#0ea5e9" strokeWidth="4" />
                        <circle cx="280" cy="140" r="18" fill="#0ea5e9" />
                        <text x="280" y="144" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">y</text>

                        {/* Defs for arrow */}
                        <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                            </marker>
                        </defs>
                    </svg>

                    <div className="mt-4 w-full space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-100 dark:border-slate-700">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Summe (z)</div>
                            <div className="font-mono text-sm dark:text-slate-200">
                                ({x1.toFixed(1)}·{w1.toFixed(1)}) + ({x2.toFixed(1)}·{w2.toFixed(1)}) + ({x3.toFixed(1)}·{w3.toFixed(1)}) + {bias.toFixed(1)} = <span className="font-bold text-indigo-600">{z.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-900/50">
                            <div className="text-[10px] uppercase font-bold text-blue-400 mb-1">Aktivierung (y)</div>
                            <div className="font-mono text-sm dark:text-blue-200">
                                {activation}({z.toFixed(2)}) = <span className="font-bold text-blue-600">{y.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
