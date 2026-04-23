import React, { useState, useEffect, useRef } from 'react';
import MathField from '../design/Math';
import InfoTooltip from '../design/InfoTooltip';

const KERNELS = {
    'Kantenerkennung': [
        [-1, -1, -1],
        [-1,  8, -1],
        [-1, -1, -1]
    ],
    'Schärfen': [
        [ 0, -1,  0],
        [-1,  5, -1],
        [ 0, -1,  0]
    ],
    'Prägung': [
        [-2, -1,  0],
        [-1,  1,  1],
        [ 0,  1,  2]
    ],
    'Identität': [
        [ 0,  0,  0],
        [ 0,  1,  0],
        [ 0,  0,  0]
    ]
};

// 7x7 Input Image (Simple "X" or "Circle" shape)
const INITIAL_IMAGE = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
];

export default function CNNDemo() {
    const [kernelType, setKernelType] = useState('Kantenerkennung');
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const kernel = KERNELS[kernelType as keyof typeof KERNELS];
    const image = INITIAL_IMAGE;
    
    // Calculate output size: (Input - Kernel + 2*Padding) / Stride + 1
    // Here: (7 - 3 + 0) / 1 + 1 = 5
    const outputSize = 5;
    
    const currentY = Math.floor(step / outputSize);
    const currentX = step % outputSize;

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setStep((s) => (s + 1) % (outputSize * outputSize));
            }, 600);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const calculateCellValue = (y: number, x: number) => {
        let sum = 0;
        for (let ky = 0; ky < 3; ky++) {
            for (let kx = 0; kx < 3; kx++) {
                sum += image[y + ky][x + kx] * kernel[ky][kx];
            }
        }
        return sum;
    };

    const getPixelColor = (val: number, isBinary = true) => {
        if (isBinary) return val === 1 ? 'bg-slate-800 dark:bg-blue-400' : 'bg-white dark:bg-slate-700';
        // For output: map values to gray/blue intensity
        const intensity = Math.min(Math.max((val + 2) / 10, 0), 1);
        return `rgba(14, 165, 233, ${intensity})`; // Using sky-500
    };

    return (
        <div className="not-prose max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 font-sans my-8 overflow-hidden">
            <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-lg m-0 flex items-center">
                    Interaktive Faltung (Convolution)
                    <InfoTooltip position="bottom" content="Sieh wie ein 3x3 Filter über das Bild gleitet und Merkmale extrahiert." />
                </h3>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                        {isPlaying ? 'Pause' : 'Abspielen'}
                    </button>
                    <button 
                        onClick={() => setStep(0)}
                        className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 dark:bg-slate-900/30">
                
                {/* 1. Input Image */}
                <div className="md:col-span-4 flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Eingabe (7x7)</span>
                    <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-600 p-px rounded shadow-sm relative overflow-hidden">
                        {image.map((row, y) => row.map((val, x) => {
                            const isActive = y >= currentY && y < currentY + 3 && x >= currentX && x < currentX + 3;
                            return (
                                <div 
                                    key={`${y}-${x}`} 
                                    className={`w-6 h-6 md:w-8 md:h-8 transition-colors duration-200 ${getPixelColor(val)} ${isActive ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}`}
                                />
                            );
                        }))}
                    </div>
                </div>

                {/* 2. Kernel / Math */}
                <div className="md:col-span-4 flex flex-col items-center space-y-6">
                    <div>
                        <select 
                            value={kernelType} 
                            onChange={(e) => setKernelType(e.target.value)}
                            className="w-full text-xs p-2 rounded border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 font-bold mb-4"
                        >
                            {Object.keys(KERNELS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        
                        <div className="grid grid-cols-3 gap-1 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 shadow-inner">
                            {kernel.map((row, y) => row.map((val, x) => (
                                <div key={`k-${y}-${x}`} className="w-8 h-8 flex items-center justify-center text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {val}
                                </div>
                            )))}
                        </div>
                    </div>

                    <div className="text-center bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm w-full">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Berechnung</div>
                        <div className="text-[10px] font-mono text-slate-600 dark:text-slate-300">
                           {calculateCellValue(currentY, currentX).toFixed(1)}
                        </div>
                    </div>
                </div>

                {/* 3. Output Feature Map */}
                <div className="md:col-span-4 flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Feature Map (5x5)</span>
                    <div className="grid grid-cols-5 gap-px bg-slate-200 dark:bg-slate-600 p-px rounded shadow-sm">
                        {Array.from({ length: 5 }).map((_, y) => Array.from({ length: 5 }).map((_, x) => {
                            const index = y * 5 + x;
                            const isComputed = index <= step;
                            const isCurrent = index === step;
                            const val = calculateCellValue(y, x);
                            
                            return (
                                <div 
                                    key={`out-${y}-${x}`} 
                                    style={{ backgroundColor: isComputed ? getPixelColor(val, false) : undefined }}
                                    className={`w-8 h-8 md:w-11 md:h-11 border border-white/10 dark:border-slate-800 flex items-center justify-center ${!isComputed ? 'bg-slate-100 dark:bg-slate-800' : ''} ${isCurrent ? 'ring-2 ring-blue-500 z-10' : ''}`}
                                >
                                    {isComputed && <span className="text-[8px] font-bold opacity-30 select-none">{val}</span>}
                                </div>
                            );
                        }))}
                    </div>
                </div>

            </div>

            {/* Explanation Footer */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    <strong>Was passiert hier?</strong> Der <span className="text-indigo-500 font-bold">Filter</span> multipliziert seine Werte mit den Pixeln im blauen Rahmen. Die Summe landet in der <span className="text-blue-500 font-bold">Feature Map</span>. Ein hohes Ergebnis bedeutet: Das Merkmal wurde an dieser Stelle gefunden.
                </div>
            </div>
        </div>
    );
}
