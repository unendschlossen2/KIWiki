export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Einsteiger",
  medium: "Fortgeschritten",
  hard: "Experte",
};

export const DIFFICULTY_SHORT: Record<Difficulty, string> = {
  easy: "E",
  medium: "M",
  hard: "X",
};
