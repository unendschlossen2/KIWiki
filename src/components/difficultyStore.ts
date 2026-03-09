import { atom } from 'nanostores';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const difficultyStore = atom<Difficulty>('easy');
