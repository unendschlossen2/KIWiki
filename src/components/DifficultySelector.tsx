import React from 'react';
import { useStore } from '@nanostores/react';
import { difficultyStore, type Difficulty } from './difficultyStore';

const DifficultySelector = () => {
    const currentDifficulty = useStore(difficultyStore);

    const levels: { id: Difficulty; label: string; color: string; description: string }[] = [
        { id: 'easy', label: 'Einfach', color: 'emerald', description: 'Grundlagen & Konzepte' },
        { id: 'medium', label: 'Mittel', color: 'blue', description: 'Details & Zusammenhänge' },
        { id: 'hard', label: 'Experte', color: 'purple', description: 'Technik & Mathematik' }
    ];

    return (
        <div className="not-prose my-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-2 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2">
                {levels.map((level) => {
                    const isActive = currentDifficulty === level.id;
                    const colorClass = isActive
                        ? (level.id === 'easy' ? 'bg-emerald-600 text-white' :
                            level.id === 'medium' ? 'bg-blue-600 text-white' :
                                'bg-purple-600 text-white')
                        : 'bg-white text-slate-600 hover:bg-slate-50';

                    return (
                        <button
                            key={level.id}
                            onClick={() => difficultyStore.set(level.id)}
                            className={`flex-1 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent flex flex-col items-center gap-1 ${colorClass} ${isActive ? 'shadow-md scale-[1.02]' : 'hover:border-slate-200'}`}
                        >
                            <span className="text-sm font-bold tracking-wide uppercase">{level.label}</span>
                            <span className={`text-[10px] opacity-80 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                {level.description}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 px-4 py-2 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-500 font-medium italic">
                    {currentDifficulty === 'easy' && "Erklärt das Wichtigste für den Einstieg."}
                    {currentDifficulty === 'medium' && "Tiefergehende Erklärungen."}
                    {currentDifficulty === 'hard' && "Vollständige Details inklusive Fachbegriffe."}
                </p>
            </div>
        </div>
    );
};

export default DifficultySelector;