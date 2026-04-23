import React, { useState, useEffect, useMemo } from 'react';
import InfoTooltip from '../design/InfoTooltip';

export default function GradientDescentDemo() {
    const [x, setX] = useState(-7);
    const [lr, setLr] = useState(0.1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [history, setHistory] = useState<number[]>([]);

    // Function to minimize: f(x) = 0.1 * x^2 + cos(x)
    // Derivative: f'(x) = 0.2 * x - sin(x)
    const f = (val: number) => 0.1 * (val ** 2) + Math.cos(val);
    const df = (val: number) => 0.2 * val - Math.sin(val);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                const grad = df(x);
                if (Math.abs(grad) < 0.01) {
                    setIsPlaying(false);
                } else {
                    const nextX = x - lr * grad;
                    setX(nextX);
                    setHistory(prev => [...prev.slice(-20), x]);
                }
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, x, lr]);

    const handleStep = () => {
        const grad = df(x);
        setX(x - lr * grad);
        setHistory(prev => [...prev.slice(-20), x]);
    };

    const reset = () => {
        setX(-7);
        setHistory([]);
        setIsPlaying(false);
    };

    // Plotting data
    const points = useMemo(() => {
        let p = [];
        for (let i = -10; i <= 10; i += 0.2) {
            p.push({ x: i, y: f(i) });
        }
        return p;
    }, []);

    // SVG coordinates mapping
    const toSvgX = (val: number) => 200 + val * 20;
    const toSvgY = (val: number) => 300 - val * 30;

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' ');

    const currentGrad = df(x);
    // Tangent line: y = f(x) + f'(x)(t - x)
    const tangentP1 = { x: x - 2, y: f(x) + currentGrad * (-2) };
    const tangentP2 = { x: x + 2, y: f(x) + currentGrad * (2) };

    return (
        <div className="not-prose max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 font-sans my-8 overflow-hidden">
            <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-lg m-0 flex items-center">
                    Gradientenabstieg Visualisierung
                    <InfoTooltip position="bottom" content="Sieh wie der Algorithmus schrittweise das Minimum einer Funktion sucht." />
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                        {isPlaying ? 'Stop' : 'Auto-Abstieg'}
                    </button>
                    <button onClick={handleStep} className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                        Einzelschritt
                    </button>
                    <button onClick={reset} className="bg-red-900/50 hover:bg-red-900 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                        Reset
                    </button>
                </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900/30 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Controls Area */}
                <div className="md:col-span-1 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Lernrate (η)</label>
                        <input 
                            type="range" min="0.01" max="1.5" step="0.01" 
                            value={lr} onChange={e => setLr(parseFloat(e.target.value))}
                            className="w-full accent-blue-600 h-1.5"
                        />
                        <div className="flex justify-between mt-2 font-mono text-[10px]">
                            <span className="text-slate-400">Vorsichtig</span>
                            <span className="text-blue-600 font-bold">{lr.toFixed(2)}</span>
                            <span className="text-red-400">Riskant</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Status</div>
                        <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Position x:</span>
                                <span className="text-blue-600 font-bold">{x.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Gradient:</span>
                                <span className="text-indigo-600 font-bold">{currentGrad.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plot Area */}
                <div className="md:col-span-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    <svg width="100%" height="350" viewBox="0 0 400 350" className="overflow-visible">
                        {/* X-Axis */}
                        <line x1="0" y1="300" x2="400" y2="300" stroke="#cbd5e1" strokeWidth="1" />
                        
                        {/* Function Curve */}
                        <path d={pathData} fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                        
                        {/* Tangent Line */}
                        <line 
                            x1={toSvgX(tangentP1.x)} y1={toSvgY(tangentP1.y)} 
                            x2={toSvgX(tangentP2.x)} y2={toSvgY(tangentP2.y)} 
                            stroke="#818cf8" strokeWidth="1" strokeDasharray="4,2" 
                        />

                        {/* History trail */}
                        {history.map((hx, i) => (
                            <circle key={i} cx={toSvgX(hx)} cy={toSvgY(f(hx))} r="2" fill="#3b82f6" opacity={i / history.length * 0.5} />
                        ))}

                        {/* The "Ball" (current position) */}
                        <circle 
                            cx={toSvgX(x)} 
                            cy={toSvgY(f(x))} 
                            r="8" 
                            fill="#2563eb" 
                            className="drop-shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-200"
                        />
                    </svg>

                    {/* Gradient Arrow */}
                    <div 
                        className={`absolute bottom-4 right-4 p-3 rounded-lg border flex items-center gap-3 transition-colors ${Math.abs(currentGrad) < 0.1 ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}
                    >
                        <div className={`w-3 h-3 rounded-full ${Math.abs(currentGrad) < 0.1 ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`}></div>
                        <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {Math.abs(currentGrad) < 0.1 ? 'Optimum erreicht' : currentGrad > 0 ? 'Nach links wandern' : 'Nach rechts wandern'}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 italic">
                <strong>Experimentiere:</strong> Stelle eine hohe Lernrate ein und beobachte, wie der Ball "über das Ziel hinausschießt" (Oszillation). Eine kleine Lernrate hingegen nähert sich sehr stabil, aber langsam dem Minimum.
            </div>
        </div>
    );
}
