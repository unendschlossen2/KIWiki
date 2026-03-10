import { persistentAtom } from '@nanostores/persistent';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const difficultyStore = persistentAtom<Difficulty>('kiwiki-difficulty', 'easy');
