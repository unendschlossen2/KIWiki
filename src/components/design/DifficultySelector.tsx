import { useStore } from "@nanostores/react";
import { difficultyStore } from "./difficultyStore";
import { DIFFICULTY_LABELS, DIFFICULTIES, type Difficulty } from "../../config/difficulty";

const DifficultySelector = () => {
  // We still use the store so React re-renders if needed,
  // but we'll let CSS handle the "active" visual state via data-level.
  useStore(difficultyStore);

  return (
    <div className="difficulty-selector flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 shadow-sm">
      {DIFFICULTIES.map((level) => (
        <button
          key={level}
          data-level={level}
          onClick={() => {
            difficultyStore.set(level);
          }}
          className="diff-btn px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
        >
          {DIFFICULTY_LABELS[level]}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector;