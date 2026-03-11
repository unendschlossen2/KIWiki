import { useState } from "react";

type Difficulty = "easy" | "medium" | "hard";

const STORAGE_KEY = "kiwiki-difficulty";

function readDifficulty(): Difficulty {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const d = stored.replace(/"/g, "");
      if (d === "easy" || d === "medium" || d === "hard") return d;
    }
  } catch {}
  return "easy";
}

function writeDifficulty(d: Difficulty) {
  try {
    localStorage.setItem(STORAGE_KEY, d);
  } catch {}
  document.documentElement.setAttribute("data-difficulty", d);
}

const DifficultySelector = () => {
  const [, setTick] = useState(0); // just to force re-render on click

  const levels: { id: Difficulty; label: string }[] = [
    { id: "easy", label: "Einfach" },
    { id: "medium", label: "Mittel" },
    { id: "hard", label: "Experte" },
  ];

  return (
    <div className="difficulty-selector flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 shadow-sm">
      {levels.map((level) => (
        <button
          key={level.id}
          data-level={level.id}
          onClick={() => {
            writeDifficulty(level.id);
            setTick((t) => t + 1); // trigger re-render so React is aware
          }}
          className="diff-btn px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide uppercase transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700"
        >
          {level.label}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector;