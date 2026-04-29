import { useStore } from "@nanostores/react";
import { themeStore } from "../../stores/themeStore";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const theme = useStore(themeStore);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Sync to document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    themeStore.set(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return (
      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/50 shadow-sm" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-transparent dark:border-slate-700/50 shadow-sm hover:shadow group"
      aria-label="Design umschalten"
      title={theme === 'light' ? 'Dunkles Design aktivieren' : 'Helles Design aktivieren'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 fill-slate-600 dark:fill-slate-300" />
      ) : (
        <Sun className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 fill-slate-300" />
      )}
    </button>
  );
};


export default ThemeToggle;
