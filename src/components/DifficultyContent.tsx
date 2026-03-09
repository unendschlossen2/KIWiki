import React from 'react';
import { useStore } from '@nanostores/react';
import { difficultyStore, type Difficulty } from './difficultyStore';

interface Props {
    level: Difficulty | Difficulty[];
    children: React.ReactNode;
}

const DifficultyContent: React.FC<Props> = ({ level, children }) => {
    const currentDifficulty = useStore(difficultyStore);

    const levelsToShow = Array.isArray(level) ? level : [level];

    // Non-additive check: current level must be explicitly listed in the 'level' prop
    const shouldShow = levelsToShow.includes(currentDifficulty);

    if (!shouldShow) return null;

    return (
        <div className={`difficulty-section section-${currentDifficulty} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            {children}
        </div>
    );
};

export default DifficultyContent;
