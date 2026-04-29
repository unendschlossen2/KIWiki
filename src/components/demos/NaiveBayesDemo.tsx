import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import DemoWrapper from '../layout/DemoWrapper';

interface WordProb {
  word: string;
  spamProb: number;
  hamProb: number;
}

const NaiveBayesDemo: React.FC = () => {
  const dictionary: WordProb[] = [
    { word: "Lotto", spamProb: 0.8, hamProb: 0.05 },
    { word: "Gewinn", spamProb: 0.7, hamProb: 0.1 },
    { word: "Meeting", spamProb: 0.05, hamProb: 0.6 },
    { word: "Kaffee", spamProb: 0.1, hamProb: 0.5 },
    { word: "Gratis", spamProb: 0.9, hamProb: 0.1 },
    { word: "Bericht", spamProb: 0.1, hamProb: 0.7 },
    { word: "Dringend", spamProb: 0.6, hamProb: 0.2 },
    { word: "Hallo", spamProb: 0.4, hamProb: 0.4 },
  ];

  const [text, setText] = useState("Hallo Meeting Bericht Kaffee");
  const [priorSpam, setPriorSpam] = useState(0.5);

  const analysis = useMemo(() => {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    let logSpam = Math.log(priorSpam);
    let logHam = Math.log(1 - priorSpam);

    const foundWords: WordProb[] = [];

    words.forEach(w => {
      const match = dictionary.find(d => d.word.toLowerCase() === w);
      if (match) {
        logSpam += Math.log(match.spamProb);
        logHam += Math.log(match.hamProb);
        foundWords.push(match);
      }
    });

    const probSpam = Math.exp(logSpam) / (Math.exp(logSpam) + Math.exp(logHam));
    return { probSpam, foundWords };
  }, [text, priorSpam]);

  const controls = (
    <>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            E-Mail Text eingeben
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            placeholder="Schreibe hier etwas..."
          />
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Prior (Spam-Anteil)
            <span className="text-blue-600 dark:text-blue-400 font-mono">{(priorSpam * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range" min="0.1" max="0.9" step="0.1"
            value={priorSpam}
            onChange={(e) => setPriorSpam(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
          <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">Vorhersage</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analysis.probSpam > 0.5 ? "🚨 SPAM" : "✉️ HAM"}
          </div>
          <div className="text-[10px] text-blue-400 mt-1">
            Wahrscheinlichkeit: {(analysis.probSpam * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </>
  );

  return (
    <DemoWrapper
      title="Naive Bayes Spam-Filter"
      controls={controls}
      tooltip={<><strong>Bayesian Inference:</strong> Das Modell berechnet die Gesamtwahrscheinlichkeit, indem es die Einzelwahrscheinlichkeiten aller bekannten Wörter multipliziert.</>}
    >
      <div className="w-full space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h5 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Wörterbuch</h5>
            <div className="space-y-2">
              {dictionary.map(d => (
                <div key={d.word} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{d.word}</span>
                  <div className="flex gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600">S: {(d.spamProb * 100).toFixed(0)}%</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600">H: {(d.hamProb * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
            <h5 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Analyse</h5>
            {analysis.foundWords.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-48 pr-2">
                {analysis.foundWords.map((w, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      <span>"{w.word}"</span>
                      <span className={w.spamProb > w.hamProb ? "text-red-500" : "text-green-500"}>
                        {w.spamProb > w.hamProb ? "Spam-Indiz" : "Ham-Indiz"}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-red-500" style={{ width: `${(w.spamProb / (w.spamProb + w.hamProb)) * 100}%` }} />
                      <div className="h-full bg-green-500" style={{ width: `${(w.hamProb / (w.spamProb + w.hamProb)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-slate-400 italic text-xs">
                Keine bekannten Wörter gefunden.
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h5 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest text-center">Wahrscheinlichkeits-Score</h5>
          <div className="relative h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 w-full opacity-30" />
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] z-10"
              initial={{ left: "50%" }}
              animate={{ left: `${analysis.probSpam * 100}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-400/50" /> {/* 50% Marker */}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Ham (Sicher)</span>
            <span>Spam (Alarm)</span>
          </div>
        </div>
      </div>
    </DemoWrapper>
  );
};

export default NaiveBayesDemo;
