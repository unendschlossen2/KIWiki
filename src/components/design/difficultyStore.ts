import { persistentAtom } from '@nanostores/persistent';

import { type Difficulty } from '../../config/difficulty';

export const difficultyStore = persistentAtom<Difficulty>('kiwiki-difficulty', 'easy');
