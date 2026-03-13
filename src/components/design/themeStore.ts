import { atom } from 'nanostores';

export type Theme = 'light' | 'dark';

export const themeStore = atom<Theme>('light');

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('kiwiki-theme') as Theme;
  if (saved) {
    themeStore.set(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    themeStore.set('dark');
  }
}

themeStore.subscribe((theme) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('kiwiki-theme', theme);
  }
});
