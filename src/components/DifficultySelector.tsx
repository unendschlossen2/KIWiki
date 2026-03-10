import React from 'react';
import { useStore } from '@nanostores/react';
import { difficultyStore, type Difficulty } from './difficultyStore';

const DifficultySelector = () => {
    const currentDifficulty = useStore(difficultyStore);

    const levels: { id: Difficulty; label: string; }[] = [
        { id: 'easy', label: 'Einfach' },
        { id: 'medium', label: 'Mittel' },
        { id: 'hard', label: 'Experte' }
    ];

    const colorMap: Record<Difficulty, { active: string; ring: string }> = {
        easy: { active: 'bg-emerald-600 text-white shadow-emerald-200', ring: 'ring-emerald-200' },
        medium: { active: 'bg-blue-600 text-white shadow-blue-200', ring: 'ring-blue-200' },
        hard: { active: 'bg-purple-600 text-white shadow-purple-200', ring: 'ring-purple-200' },
    };

    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {levels.map((level) => {
                const isActive = currentDifficulty === level.id;
                const colors = colorMap[level.id];

                return (
                    <button
                        key={level.id}
                        onClick={() => difficultyStore.set(level.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                            isActive
                                ? `${colors.active} shadow-sm`
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                        }`}
                    >
                        {level.label}
                    </button>
                );
            })}
        </div>
    );
};

export default DifficultySelector;