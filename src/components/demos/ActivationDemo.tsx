import React, { useState, useMemo } from 'react';

// This is a standalone interactive demo component that you would embed in your MDX files.
export default function App() {
    const [weight, setWeight] = useState(1);
    const [bias, setBias] = useState(0);
    const [activation, setActivation] = useState('linear');

    // Math functions
    const tanh = (z: number) => Math.tanh(z);
    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
    const relu = (z: number) => Math.max(0, z);

    // Generate graph points based on current slider values
    const pathData = useMemo(() => {
        let path = '';
        for (let x = -5; x <= 5; x += 0.1) {
            const z = weight * x + bias;
            let y = z; // default linear

            if (activation === 'tanh') y = tanh(z);
            if (activation === 'sigmoid') y = sigmoid(z);
            if (activation === 'relu') y = relu(z);

            // Map math coordinates (-5 to 5) to SVG coordinates (0 to 400)
            // Center is 200, scale is 40 pixels per math unit
            const svgX = 200 + (x * 40);
            const svgY = 200 - (y * 40);

            if (x === -5) {
                path += `M ${svgX} ${svgY} `;
            } else {
                path += `L ${svgX} ${svgY} `;
            }
        }
        return path;
    }, [weight, bias, activation]);

    return (
        <div className="not-prose max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden font-sans my-8">
            {/* Demo Header */}
            <div className="bg-slate-800 dark:bg-slate-900 text-white px-6 py-4 border-b border-slate-700 dark:border-slate-600 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Interactive Demo: The Neuron</h3>
                    <p className="text-slate-400 text-sm">Adjust weights and biases to see how the activation function transforms the output.</p>
                </div>
                <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* Left Side: Controls */}
                <div className="w-full md:w-1/3 p-6 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Weight Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Weight (w)</label>
                                <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">{weight.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="-3" max="3" step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(parseFloat(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Controls the steepness of the line.</p>
                        </div>

                        {/* Bias Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Bias (b)</label>
                                <span className="text-sm font-mono bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">{bias.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="-3" max="3" step="0.1"
                                value={bias}
                                onChange={(e) => setBias(parseFloat(e.target.value))}
                                className="w-full accent-purple-600"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Shifts the function left or right.</p>
                        </div>

                        {/* Activation Toggle */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Activation Function</label>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => setActivation('linear')}
                                    className={`px-3 py-2 text-sm rounded-md border text-left transition-colors ${activation === 'linear' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                >
                                    Linear (None)
                                </button>
                                <button
                                    onClick={() => setActivation('sigmoid')}
                                    className={`px-3 py-2 text-sm rounded-md border text-left transition-colors ${activation === 'sigmoid' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                >
                                    Sigmoid (S-Curve)
                                </button>
                                <button
                                    onClick={() => setActivation('relu')}
                                    className={`px-3 py-2 text-sm rounded-md border text-left transition-colors ${activation === 'relu' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                >
                                    ReLU (Rectified Linear)
                                </button>
                                <button
                                    onClick={() => setActivation('tanh')}
                                    className={`px-3 py-2 text-sm rounded-md border text-left transition-colors ${activation === 'tanh' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                >
                                    Tanh (Hyperbolic Tangent)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Graph & Math */}
                <div className="w-full md:w-2/3 p-6 flex flex-col items-center justify-center relative">

                    {/* Math Equation Display */}
                    <div className="absolute top-6 left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm z-10">
                        <span className="font-mono text-lg text-slate-800 dark:text-slate-100">
                            y = <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activation === 'linear' ? '' : activation === 'sigmoid' ? 'σ(' : 'max(0, '}</span>
                            <span className="text-blue-600 dark:text-blue-400">{weight.toFixed(1)}</span>x + <span className="text-purple-600 dark:text-purple-400">{bias.toFixed(1)}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activation === 'linear' ? '' : ')'}</span>
                        </span>
                    </div>

                    {/* SVG Graph */}
                    <svg width="400" height="400" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-inner">
                        {/* Grid lines */}
                        {Array.from({ length: 11 }).map((_, i) => (
                            <g key={i}>
                                <line x1={0} y1={i * 40} x2={400} y2={i * 40} stroke="var(--border-color)" strokeWidth="1" />
                                <line x1={i * 40} y1={0} x2={i * 40} y2={400} stroke="var(--border-color)" strokeWidth="1" />
                            </g>
                        ))}
                        {/* X and Y Axes */}
                        <line x1={200} y1={0} x2={200} y2={400} stroke="var(--text-muted)" strokeWidth="2" />
                        <line x1={0} y1={200} x2={400} y2={200} stroke="var(--text-muted)" strokeWidth="2" />

                        {/* Axis Labels */}
                        <text x="380" y="215" fontSize="12" fill="var(--text-secondary)" fontFamily="monospace">x</text>
                        <text x="210" y="20" fontSize="12" fill="var(--text-secondary)" fontFamily="monospace">y</text>

                        {/* The Function Line */}
                        <path d={pathData} fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Origin Dot */}
                        <circle cx="200" cy="200" r="4" fill="var(--text-secondary)" />
                    </svg>

                    {/* Live Code Snippet */}
                    <div className="mt-6 w-full max-w-[400px]">
                        <div className="bg-slate-900 rounded-lg p-4 shadow-md font-mono text-sm text-slate-300 overflow-x-auto">
                            <span className="text-pink-400">def</span> <span className="text-blue-400">forward</span>(x):<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># 1. Calculate linear combination</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;z = ({weight.toFixed(1)} * x) + {bias.toFixed(1)}<br />
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># 2. Apply activation</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;y = <span className="text-emerald-400">{activation === 'linear' ? 'z' : activation === 'sigmoid' ? '1 / (1 + math.exp(-z))' : 'max(0, z)'}</span><br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> y
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}