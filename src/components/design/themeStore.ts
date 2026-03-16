import { atom } from 'nanostores';

export type Theme = 'light' | 'dark';

export const themeStore = atom<Theme>('light');

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('kiwiki-theme') as Theme;
  if (saved) {
    themeStore.set(saved);
  }
}

themeStore.subscribe((theme) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('kiwiki-theme', theme);
  }
});
